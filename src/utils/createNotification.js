const { Notification } = require('../models/Notification');

const createNotification = async ({ recipient, sender, type, post }) => {

    // Do not create a notification for the user who triggered it.
    if (recipient.toString() === sender.toString()) return;

    await Notification.create({
        recipient,
        sender,
        type,
        post
    });
};

module.exports = createNotification;
