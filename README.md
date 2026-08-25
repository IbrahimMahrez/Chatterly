# Chatterly

A full-stack social platform built with React, Node.js, Express, MongoDB, and Socket.IO. Chatterly combines social posting, real-time communication, personal productivity, and small goal-driven communities in one responsive Arabic-friendly experience.

## Highlights

- Responsive UI for desktop, tablet, and small mobile screens, including RTL/Arabic layouts.
- Secure authentication with JWT, hashed passwords, and password-reset emails.
- Posts, comments, likes, profiles, follow/unfollow, stories, and notifications.
- Real-time room and direct messaging with Socket.IO, typing state, reactions, attachments, and voice messages.
- Saved messages and full-text message search.
- AI assistance for chat, post ideas, reply suggestions, and conversation summaries.
- Personal reminders with completion tracking and scheduled in-app/email delivery.
- **Daily Pulse:** short-lived private AI sessions or temporary group conversations matched by mood, topic, and privacy preference.
- **Interest Circles:** small groups of 3–8 people that work toward a shared goal for a defined period, with daily check-ins and a members-only discussion room.
- Admin dashboard and basic platform analytics.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, Lucide |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB with Mongoose |
| Security | JWT, bcrypt, Helmet, CORS |
| Integrations | Nodemailer, Multer, Paymob, OpenAI-compatible AI API |

## Project structure

```text
client/                 React + Vite frontend
  src/pages/            Application pages
  src/components/       Shared UI components
  src/api/              HTTP API clients
src/
  controllers/          Request handlers
  models/               Mongoose models
  routes/               Express routes
  Socket/               Socket.IO events
  services/             Background schedulers
server.js               Backend entry point
```

## Getting started

### 1. Install dependencies

```bash
npm install
cd client
npm install
```

### 2. Configure environment variables

Create a root `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password

# Optional AI features
AI_API_KEY=your_api_key
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini

# Optional Paymob integration
PAYMOB_SECRET_KEY=your_paymob_secret_key
PAYMOB_PUBLIC_KEY=your_paymob_public_key
PAYMOB_INTEGRATION_ID=your_integration_id
REDIRECT_URL=http://localhost:5173
WEBHOOK_URL=https://your-domain.example/webhook
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Run the application

In one terminal, start the backend:

```bash
npm run dev
```

In another terminal, start the frontend:

```bash
cd client
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

## Main API routes

All routes marked as protected require an `Authorization: Bearer <token>` header.

| Area | Endpoint | Notes |
| --- | --- | --- |
| Auth | `/auth/register`, `/auth/login` | Authentication |
| Posts | `/posts` | Posts, likes, and feed operations |
| Users | `/users` | Profiles, follows, discovery |
| Messages | `/messages/saved`, `/messages/search` | Saved messages and search |
| Notifications | `/notifications` | Notification inbox |
| Reminders | `/reminders` | Protected CRUD endpoints |
| AI | `/ai/chat`, `/ai/suggest-post`, `/ai/summarize-conversation`, `/ai/suggest-replies` | Protected AI tools |
| Daily Pulse | `/pulse/join`, `/pulse/:id` | Protected temporary pulse rooms |
| Interest Circles | `/circles` | Create/list circles; join and daily check-in routes |

## Real-time events

Common Socket.IO events include:

- `register_user` — register a connected user for presence.
- `join_room` / `send_message` / `receive_message` — standard chat rooms.
- `join_pulse` / `send_pulse_message` / `pulse_message` — temporary Pulse rooms.
- `typing_start` / `typing_stop` — typing indicators.
- `toggle_reaction` / `message_reactions` — message reactions.

Circle chat rooms use `circle_<circleId>` and are available only to active circle members.

## Mobile experience

The interface is optimized for RTL Arabic and responsive use. On phones, navigation stays at the bottom, notifications open in a compact popup above it, and chat/pulse views reserve safe spacing around mobile controls.

## Author

Ibrahim Mohamed
