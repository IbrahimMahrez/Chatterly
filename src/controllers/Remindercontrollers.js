const asyncWrapper = require('../middlewares/catchAsync');
const { Reminder } = require('../models/Reminder');

const listReminders = asyncWrapper(async (req, res) => {
  const reminders = await Reminder.find({ user: req.user._id }).sort({ completed: 1, dueAt: 1 });
  res.json(reminders);
});

const createReminder = asyncWrapper(async (req, res) => {
  const { title, dueAt } = req.body;
  const date = new Date(dueAt);
  if (!title?.trim() || Number.isNaN(date.getTime())) {
    return res.status(400).json({ message: 'A title and valid reminder time are required.' });
  }
  if (date <= new Date()) {
    return res.status(400).json({ message: 'Choose a reminder time in the future.' });
  }
  const reminder = await Reminder.create({ user: req.user._id, title: title.trim(), dueAt: date });
  res.status(201).json(reminder);
});

const completeReminder = asyncWrapper(async (req, res) => {
  const reminder = await Reminder.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { completed: Boolean(req.body.completed) },
    { new: true }
  );
  if (!reminder) return res.status(404).json({ message: 'Reminder not found.' });
  res.json(reminder);
});

const deleteReminder = asyncWrapper(async (req, res) => {
  const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!reminder) return res.status(404).json({ message: 'Reminder not found.' });
  res.status(204).end();
});

module.exports = { listReminders, createReminder, completeReminder, deleteReminder };
