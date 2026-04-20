# 💬 Chatterly - Full Stack Social Media Backend + Real-Time Chat

Chatterly is a **modern backend system** built using Node.js, Express, MongoDB, and Socket.IO.  
It simulates a real social media platform with real-time chat, authentication, posts, comments, likes, follows, notifications, file uploads, and **payment processing**.

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

## 💳 Payment System (Paymob)
- Create payment intentions via Paymob API
- Unified Checkout experience
- JWT-protected payment endpoint
- Supports EGP currency
- Test & Live mode support

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
- Paymob API
- dotenv
- helmet
- cors

---

# 📁 Project Structure
src/
│
├── config/          # Database configuration
├── controllers/     # Business logic
├── middlewares/     # Auth, error handling
├── models/          # MongoDB schemas
├── routes/          # API routes
├── socket/          # Socket.IO setup
├── utils/           # Helper functions
└── server.js        # Entry point

---

# ⚙️ Installation

## 1. Clone the repository
```bash
git clone https://github.com/IbrahimMahrez/Chatterly
```

## 2. Install dependencies
```bash
npm install
```

## 3. Create .env file
```env
PORT=7000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Paymob
PAYMOB_SECRET_KEY=your_paymob_secret_key
PAYMOB_PUBLIC_KEY=your_paymob_public_key
PAYMOB_INTEGRATION_ID=your_integration_id
REDIRECT_URL=https://your-domain.com/success
WEBHOOK_URL=https://your-domain.com/webhook
```

## 4. Run the server
```bash
npm run dev
```

---

# 📡 API Endpoints

## 🔐 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |

## 👤 Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/:id | Get user profile |
| PUT | /users/:id | Update user profile |
| DELETE | /users/:id | Delete user account |
| POST | /users/follow/:id | Follow / Unfollow user |
| GET | /users/feed | Get user feed |

## 📝 Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /posts | Get all posts |
| POST | /posts | Create post |
| PUT | /posts/:id | Update post |
| DELETE | /posts/:id | Delete post |
| POST | /posts/:id/like | Like / Unlike post |

## 💬 Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /posts/:postId/comments | Add comment |
| GET | /posts/:postId/comments | Get comments |
| DELETE | /comments/:id | Delete comment |

## 💳 Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /payment/intention | Create payment intention (JWT required) |

**Request Body:**
```json
{
  "amount": 100,
  "first_name": "Ibrahim",
  "last_name": "Mohamed",
  "email": "user@gmail.com",
  "phone_number": "01000000000"
}
```

**Response:**
```json
{
  "message": "Payment intention created successfully",
  "payment_url": "https://accept.paymob.com/unifiedcheckout/?publicKey=...&clientSecret=...",
  "data": { ... }
}
```

## 📸 Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /upload | Upload image |

---

# ⚡ Socket.IO Events

**Connect to server**
```js
const socket = io("http://localhost:7000");
```

**Join room**
```js
socket.emit("join_room", roomId);
```

**Send message**
```js
socket.emit("send_message", { roomId, sender, message });
```

**Receive message**
```js
socket.on("receive_message", (data) => {
  console.log(data);
});
```

---

# 🔥 Future Improvements
- Group chats
- Message persistence in MongoDB
- Seen / delivered messages
- Online users system
- Typing indicator
- React frontend (full UI)
- Admin dashboard
- Webhook payment verification

---

# 🧠 What I Learned from this Project
- REST API design
- Authentication & authorization
- MongoDB schema design
- Real-time communication with Socket.IO
- File upload handling
- Payment gateway integration (Paymob)
- Backend architecture structuring

---

# 👨‍💻 Author
**Ibrahim Mohamed**
