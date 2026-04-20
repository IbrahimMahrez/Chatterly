const { Notification } = require('../models/Notification');

const createNotification = async ({ recipient, sender, type, post }) => {

    // 🚨 مهم: متعملش notification لنفسك
    if (recipient.toString() === sender.toString()) return;

    await Notification.create({
        recipient,
        sender,
        type,
        post
    });
};

module.exports = createNotification;