const { Server } = require('socket.io');
const { Message } = require('../models/Message');

function initSocket(server) {

    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.on('connection', (socket) => {

        console.log('User connected:', socket.id);

        socket.on('join_room', async (roomId) => {
            socket.join(roomId);
            const messages = await Message.find({ roomId })
                .sort({ createdAt: -1 })
                .limit(100)
                .lean();
            socket.emit('message_history', messages.reverse());
        });

        socket.on('send_message', async (data) => {
            if (!data.roomId || !data.sender || !data.message?.trim()) return;

            const savedMessage = await Message.create({
                roomId: data.roomId,
                sender: data.sender,
                senderName: data.senderName || 'مستخدم',
                message: data.message.trim(),
            });
            io.to(data.roomId).emit('receive_message', {
                _id: savedMessage._id,
                roomId: savedMessage.roomId,
                sender: savedMessage.sender,
                senderName: savedMessage.senderName,
                message: savedMessage.message,
                timestamp: savedMessage.createdAt,
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

    });

    return io;
}

module.exports = initSocket;