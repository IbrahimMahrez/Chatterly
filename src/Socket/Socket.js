const { Server } = require('socket.io');
const { Message } = require('../models/Message');
const { User } = require('../models/User');
const { PulseSession } = require('../models/PulseSession');
const { Circle } = require('../models/Circle');

function initSocket(server) {

    const userSockets = new Map();
    const allowedReactions = new Set(['👍', '❤️', '😂', '🔥', '😮']);

    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.on('connection', (socket) => {

        console.log('User connected:', socket.id);

        socket.on('register_user', async (userId) => {
            if (!userId) return;
            const normalizedUserId = String(userId);
            socket.data.userId = normalizedUserId;
            const sockets = userSockets.get(normalizedUserId) || new Set();
            const wasOffline = sockets.size === 0;
            sockets.add(socket.id);
            userSockets.set(normalizedUserId, sockets);
            socket.emit('online_users', [...userSockets.keys()]);
            if (wasOffline) io.emit('presence_update', { userId: normalizedUserId, online: true });
        });

        socket.on('join_room', async (roomId) => {
            if (String(roomId).startsWith('pulse_')) {
                if (!socket.data.userId) return;
                const pulseId = String(roomId).slice('pulse_'.length);
                const session = await PulseSession.findOne({ _id: pulseId, members: socket.data.userId, closed: false, expiresAt: { $gt: new Date() } });
                if (!session) return socket.emit('pulse_error', { message: 'This daily pulse is unavailable.' });
            }
            if (String(roomId).startsWith('circle_')) {
                if (!socket.data.userId) return;
                const circleId = String(roomId).slice('circle_'.length);
                const circle = await Circle.findOne({ _id: circleId, members: socket.data.userId, endsAt: { $gt: new Date() } });
                if (!circle) return socket.emit('message_history', []);
            }
            socket.join(roomId);
            const messages = await Message.find({ roomId })
                .sort({ createdAt: -1 })
                .limit(100)
                .lean();
            socket.emit('message_history', messages.reverse());
        });

        // Pulse has its own events so its temporary group chat cannot conflict
        // with the regular messages page.
        socket.on('join_pulse', async (roomId) => {
            if (!socket.data.userId || !String(roomId).startsWith('pulse_')) return;
            const pulseId = String(roomId).slice('pulse_'.length);
            const session = await PulseSession.findOne({ _id: pulseId, members: socket.data.userId, closed: false, expiresAt: { $gt: new Date() } });
            if (!session) return socket.emit('pulse_error', { message: 'This daily pulse is unavailable.' });
            socket.join(roomId);
            const messages = await Message.find({ roomId }).sort({ createdAt: -1 }).limit(100).lean();
            socket.emit('pulse_history', messages.reverse());
        });

        socket.on('typing_start', ({ roomId }) => {
            if (roomId && socket.data.userId) socket.to(roomId).emit('typing_start', { roomId, userId: socket.data.userId });
        });

        socket.on('typing_stop', ({ roomId }) => {
            if (roomId && socket.data.userId) socket.to(roomId).emit('typing_stop', { roomId, userId: socket.data.userId });
        });

        socket.on('send_message', async (data) => {
            if (!data.roomId || !data.sender || (!data.message?.trim() && !data.audioUrl && !data.attachmentUrl)) return;
            if (String(data.roomId).startsWith('pulse_') && (!socket.data.userId || String(data.sender) !== socket.data.userId || !socket.rooms.has(data.roomId))) return;
            if (String(data.roomId).startsWith('circle_')) {
                if (!socket.data.userId || String(data.sender) !== socket.data.userId || !socket.rooms.has(data.roomId)) return;
                const circleId = String(data.roomId).slice('circle_'.length);
                const circle = await Circle.exists({ _id: circleId, members: socket.data.userId, endsAt: { $gt: new Date() } });
                if (!circle) return;
            }

            const savedMessage = await Message.create({
                roomId: data.roomId,
                sender: data.sender,
                senderName: data.senderName || 'مستخدم',
                message: data.message?.trim() || (data.audioUrl ? 'Voice message' : 'Attachment'),
                audioUrl: data.audioUrl || '',
                audioDuration: Number(data.audioDuration) || 0,
                attachmentUrl: data.attachmentUrl || '',
                attachmentName: String(data.attachmentName || '').slice(0, 255),
                attachmentType: String(data.attachmentType || '').slice(0, 120),
                attachmentSize: Number(data.attachmentSize) || 0,
            });
            io.to(data.roomId).emit('receive_message', {
                _id: savedMessage._id,
                roomId: savedMessage.roomId,
                sender: savedMessage.sender,
                senderName: savedMessage.senderName,
                message: savedMessage.message,
                audioUrl: savedMessage.audioUrl,
                audioDuration: savedMessage.audioDuration,
                attachmentUrl: savedMessage.attachmentUrl,
                attachmentName: savedMessage.attachmentName,
                attachmentType: savedMessage.attachmentType,
                attachmentSize: savedMessage.attachmentSize,
                timestamp: savedMessage.createdAt,
            });
        });

        socket.on('send_pulse_message', async (data) => {
            if (!data?.roomId || !data?.message?.trim() || !socket.data.userId || !socket.rooms.has(data.roomId)) return;
            const pulseId = String(data.roomId).slice('pulse_'.length);
            const session = await PulseSession.findOne({ _id: pulseId, members: socket.data.userId, closed: false, expiresAt: { $gt: new Date() } });
            if (!session) return socket.emit('pulse_error', { message: 'This daily pulse is unavailable.' });
            const savedMessage = await Message.create({ roomId: data.roomId, sender: socket.data.userId, senderName: String(data.senderName || 'Pulse member').slice(0, 80), message: data.message.trim().slice(0, 2000) });
            io.to(data.roomId).emit('pulse_message', { _id: savedMessage._id, sender: savedMessage.sender, senderName: savedMessage.senderName, message: savedMessage.message, timestamp: savedMessage.createdAt });
        });

        socket.on('toggle_reaction', async ({ messageId, emoji }) => {
            if (!socket.data.userId || !messageId || !allowedReactions.has(emoji)) return;
            const message = await Message.findById(messageId);
            if (!message || !socket.rooms.has(message.roomId)) return;

            const userId = socket.data.userId;
            let reaction = message.reactions.find((item) => item.emoji === emoji);
            if (!reaction) {
                message.reactions.push({ emoji, users: [userId] });
            } else {
                const alreadyReacted = reaction.users.some((id) => String(id) === userId);
                reaction.users = alreadyReacted
                    ? reaction.users.filter((id) => String(id) !== userId)
                    : [...reaction.users, userId];
                if (!reaction.users.length) message.reactions = message.reactions.filter((item) => item.emoji !== emoji);
            }
            await message.save();
            io.to(message.roomId).emit('message_reactions', { messageId: String(message._id), reactions: message.reactions });
        });

        socket.on('disconnect', async () => {
            const userId = socket.data.userId;
            if (userId) {
                const sockets = userSockets.get(userId);
                sockets?.delete(socket.id);
                if (!sockets?.size) {
                    userSockets.delete(userId);
                    const lastSeen = new Date();
                    await User.findByIdAndUpdate(userId, { lastSeen });
                    io.emit('presence_update', { userId, online: false, lastSeen });
                }
            }
            console.log('User disconnected');
        });

    });

    return io;
}

module.exports = initSocket;
