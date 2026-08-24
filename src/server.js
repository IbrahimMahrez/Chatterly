const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const initSocket = require('./socket/socket');

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
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use(express.static(path.join(__dirname, '../images')));
app.set('view engine', 'ejs');

// Routes
app.use('/auth', require('./routes/Auth'));
app.use('/users', require('./routes/Users'));
app.use('/posts', require('./routes/Posts'));
app.use('/comments', require('./routes/Comments'));
app.use('/password', require('./routes/Password'));
app.use('/upload', require('./routes/upload'));
app.use('/notifications', require('./routes/Notifications'));
app.use('/stories', require('./routes/Stories'));
app.use('/admin', require('./routes/Admin'));
app.use('/ai', require('./routes/AI'));

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

// START SERVER ONCE
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
