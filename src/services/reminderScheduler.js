const nodemailer = require('nodemailer');
const { Reminder } = require('../models/Reminder');
const { Notification } = require('../models/Notification');
const { PulseSession } = require('../models/PulseSession');

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const sendReminderEmail = async (user, reminder) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 587, secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false' },
  });
  await transporter.sendMail({
    from: `"Chatterly" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Reminder: ${reminder.title}`,
    html: `<div style="font-family:Arial,sans-serif;padding:24px;color:#172033"><h1 style="color:#7c5cfc">Chatterly</h1><p>Your reminder is due now:</p><p style="font-size:18px;font-weight:700">${escapeHtml(reminder.title)}</p></div>`,
  });
};

const deliverDueReminders = async () => {
  const reminders = await Reminder.find({ dueAt: { $lte: new Date() }, completed: false, deliveredAt: null }).populate('user', 'email username');
  for (const reminder of reminders) {
    // Claim first so a second scheduler tick cannot deliver the same reminder twice.
    const claimed = await Reminder.findOneAndUpdate({ _id: reminder._id, deliveredAt: null }, { deliveredAt: new Date() }, { new: true });
    if (!claimed) continue;
    await Notification.create({ recipient: reminder.user._id, sender: reminder.user._id, type: 'reminder', message: reminder.title });
    try { await sendReminderEmail(reminder.user, reminder); } catch (error) { console.error('Reminder email failed:', error.message); }
  }
};

const closeExpiredPulses = () => PulseSession.updateMany(
  { closed: false, expiresAt: { $lte: new Date() } },
  { closed: true }
);

const startReminderScheduler = () => {
  const tick = async () => {
    try { await Promise.all([deliverDueReminders(), closeExpiredPulses()]); }
    catch (error) { console.error('Scheduler failed:', error.message); }
  };
  tick();
  return setInterval(tick, 60 * 1000);
};

module.exports = { startReminderScheduler };
