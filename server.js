const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const initSocket = require('./src/Socket/Socket');
const { startReminderScheduler } = require('./src/services/reminderScheduler');

// Load env
dotenv.config();

// Connect DB
connectDB();

// Create app FIRST
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// static files
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, '../images')));
app.set('view engine', 'ejs');

// Routes
app.use('/auth', require('./src/routes/Auth'));
app.use('/users', require('./src/routes/Users'));
app.use('/posts', require('./src/routes/Posts'));
app.use('/comments', require('./src/routes/Comments'));
app.use('/password', require('./src/routes/Password'));
app.use('/upload', require('./src/routes/upload'));
app.use('/notifications', require('./src/routes/Notifications'));
app.use('/stories', require('./src/routes/Stories'));
app.use('/admin', require('./src/routes/Admin'));
app.use('/ai', require('./src/routes/AI'));
app.use('/messages', require('./src/routes/Messages'));
app.use('/reminders', require('./src/routes/Reminders'));
app.use('/pulse', require('./src/routes/Pulse'));
app.use('/circles', require('./src/routes/Circles'));

// global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// CREATE SERVER ONCE
const server = http.createServer(app);

// INIT SOCKET
initSocket(server);
startReminderScheduler();

// START SERVER ONCE
server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

