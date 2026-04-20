# 💬 Chatterly - Full Stack Social Media Backend + Real-Time Chat

Chatterly is a **modern backend system** built using Node.js, Express, MongoDB, and Socket.IO.  
It simulates a real social media platform with real-time chat, authentication, posts, comments, likes, follows, notifications, and file uploads.

This project is designed for learning and portfolio purposes and demonstrates **real-world backend architecture**.

---

# 🚀 Features

## 🔐 Authentication System
- User registration & login
- JWT authentication
- Password hashing using bcrypt
- Forgot / Reset password via email (Nodemailer)

---

## 👤 User System
- Get user profile
- Update user profile
- Delete user account
- Upload profile picture
- Follow / Unfollow system
- User feed based on following

---

## 📝 Posts System
- Create posts
- Get all posts (pagination supported)
- Update posts
- Delete posts
- Like / Unlike posts

---

## 💬 Comments System
- Add comments to posts
- Get comments per post
- Delete comments
- Like / Unlike comments

---

## 🔔 Notifications System
- Follow notifications
- Like notifications

---

## 📸 File Upload System
- Image upload using Multer
- Profile picture support
- File storage system

---

## ⚡ Real-Time Chat (Socket.IO)
- Real-time messaging between users
- Join chat rooms
- Send & receive messages instantly
- Room-based chat system

---

# 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication
- bcrypt
- Multer
- Nodemailer
- dotenv
- helmet
- cors

---

# 📁 Project Structure


src/
│
├── config/ # Database configuration
├── controllers/ # Business logic
├── middlewares/ # Auth, error handling
├── models/ # MongoDB schemas
├── routes/ # API routes
├── socket/ # Socket.IO setup
├── utils/ # Helper functions
└── server.js # Entry point


---

# ⚙️ Installation

## 1. Clone the repository
```bash
git clone https://github.com/your-username/chatterly.git
2. Install dependencies
npm install
3. Create .env file
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
4. Run the server
npm run dev
📡 API Endpoints
🔐 Auth
POST /auth/register
POST /auth/login
👤 Users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id

POST   /users/follow/:id
GET    /users/feed
📝 Posts
GET    /posts
POST   /posts
PUT    /posts/:id
DELETE /posts/:id

POST   /posts/:id/like
💬 Comments
POST   /posts/:postId/comments
GET    /posts/:postId/comments
DELETE /comments/:id
📸 Upload
POST /upload
⚡ Socket.IO Events
Connect to server
const socket = io("http://localhost:5000");
Join room
socket.emit("join_room", roomId);
Send message
socket.emit("send_message", {
  roomId,
  sender,
  message
});
Receive message
socket.on("receive_message", (data) => {
  console.log(data);
});
🔥 Future Improvements
Group chats
Message persistence in MongoDB
Seen / delivered messages
Online users system
Typing indicator
React frontend (full UI)
Admin dashboard
🧠 What I Learned from this Project
REST API design
Authentication & authorization
MongoDB schema design
Real-time communication with Socket.IO
File upload handling
Backend architecture structuring
👨‍💻 Author

Ibrahim Mohamed
