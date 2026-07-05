# Connectify 

A full-stack real-time video conferencing application built with the MERN stack, WebRTC and Socket.io — supporting peer-to-peer video/audio calls, screen sharing, real-time chat and AI-powered meeting summaries.

**Live Demo:** [connectify-frontend-464t.onrender.com](https://connectify-frontend-464t.onrender.com)

---

## 🚀 Features

- **Peer-to-Peer Video & Audio Calls** — Direct WebRTC connections between participants with camera and microphone controls
- **Screen Sharing** — Share your screen with live mic audio combined into the stream *(desktop/laptop browsers only — mobile browsers restrict `getDisplayMedia` by design, same limitation as Google Meet's web version)*
- **Real-Time Chat** — In-call messaging with unread message badge notifications
- **AI Meeting Summaries** — Post-call summary and action item extraction from chat history via Google Gemini 2.0 Flash API
- **Meeting History** — Authenticated users can view all their past meetings with AI-generated summaries
- **Persistent Meeting Chat** — Messages persist until the last participant leaves the meeting, after which each authenticated participant's chat transcript is stored with their meeting history for AI summary and action item generation
- **STUN/TURN Server Support** — NAT traversal via STUN for direct connections, TURN relay fallback for users behind strict corporate firewalls or CGNAT mobile networks
- **JWT Authentication with Token Versioning** — 7-day session tokens with version-based invalidation so new logins expire previous sessions
- **Guest Access** — Join meetings without an account; history and summaries available to registered users only
- **Mobile Responsive** — Optimised layout for phones and tablets

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Material UI, Socket.io-client |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB Atlas, Mongoose |
| Real-Time | WebRTC (RTCPeerConnection), Socket.io (signaling) |
| AI | Google Gemini 2.0 Flash API |
| Auth | JWT (jsonwebtoken), bcrypt |
| NAT Traversal | STUN (Google), TURN (Turnix.io) |
| Deployment | Render (frontend static site + backend web service) |

---

## 🏗️ Architecture

```
Client A ──────────────────────────────── Client B
   │          Socket.io (signaling)          │
   │  ──── Offer / Answer / ICE ────>        │
   │  <─── Answer / ICE ────────────         │
   │                                         │
   │◄──────── WebRTC P2P (video/audio) ─────►│
   │          (via TURN if P2P fails)         │
   │                                         │
   └──── Socket.io Server (Node.js) ─────────┘
              │
              └── MongoDB Atlas (users, meetings, messages)
                       │
                       └── Gemini API (post-call summaries)
```

**Signaling** is handled by a Socket.io server — peers exchange SDP offers/answers and ICE candidates through it. Once the connection is established, audio/video flows **directly peer-to-peer** without touching the server.

---

## ⚙️ Key Technical Decisions

**`addTrack` / `replaceTrack` over deprecated `addStream`**
Migrated from the deprecated `addStream` API to `addTrack` + `replaceTrack` for reliable cross-browser track management and dynamic track swapping (camera toggle, screen share restore) without full renegotiation.

**Token versioning on JWT**
Each login increments a `tokenVersion` field on the user document. The middleware verifies the token's version matches the DB — logging in from a new device immediately invalidates all previous sessions.

**Backend-issued TURN credentials**
The Turnix API token lives only in the backend `.env` — the frontend never sees it. The backend generates short-lived relay credentials and returns only those to the client, keeping the secret off the browser bundle entirely.

---

## ⚠️ Known Limitations & Engineering Tradeoffs

These are conscious scope decisions, not oversights :

- **Mesh architecture scalability** — the P2P mesh topology works smoothly for small groups (4–5 participants). Beyond that, each peer uploads a separate stream to every other participant, causing bandwidth and CPU strain. Production-scale group calls use an SFU (Selective Forwarding Unit) to solve this — a deliberate out-of-scope decision for this project.

- **Screen share audio toggling during share** — mic state changes made while screen sharing don't persist after the share ends. The stream reverts to pre-screen-share state. A proper fix requires a media state machine tracking all toggle events independently of the active stream — deliberately deferred to ship.

- **Screen sharing on mobile** — `getDisplayMedia` is restricted by mobile browsers by design (same limitation as Google Meet's web version). Native mobile apps use platform-specific capture APIs which is a separate implementation.

- **Partial permission grants** — joining with only camera OR only microphone (not both) may cause unexpected behaviour for other participants. Full permissions recommended.

- **TURN bandwidth (free tier)** — Turnix free tier provides 10 GB/month relay traffic. Sufficient for demos; a production deployment would use a paid TURN provider.

---

## 🚀 Running Locally

**Prerequisites:** Node.js, MongoDB Atlas URI

```bash
# Clone the repo
git clone https://github.com/jeffrin-samuel/Connectify.git

# Backend
cd Connectify/backend
npm install
# create .env (see below)
npm run dev

# Frontend (new terminal)
cd Connectify/frontend
npm install
# create .env (see below)
npm run dev
```

**`backend/.env`**
```
PORT=8000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
TURNIX_API_TOKEN=your_turnix_api_token
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env`**
```
VITE_BACKEND_URL=http://localhost:8000
```

---

## 📁 Project Structure

```
Connectify/
├── backend/
│   ├── middleware/
│   │   └── auth.js                 # JWT authenticate middleware
│   └── src/
│       ├── controllers/
│       │   ├── meetingController.js # AI summary, meeting history
│       │   ├── socketManager.js     # Socket.io signaling server
│       │   └── userController.js    # login, register
│       ├── models/
│       │   ├── meetingModel.js
│       │   └── userModels.js
│       ├── routes/
│       │   ├── meetingRoutes.js
│       │   ├── turnRoutes.js        # TURN credential generation
│       │   └── usersRoutes.js
│       └── app.js
└── frontend/
    ├── public/
    │   └── favicon.png
    └── src/
        ├── contexts/
        │   ├── AuthContext.jsx      # login, register, token management
        │   └── MeetContext.jsx      # meeting history API
        ├── pages/
        │   ├── Authentication.jsx
        │   ├── History.jsx
        │   ├── Home.jsx
        │   ├── LandingPage.jsx
        │   ├── NotFound.jsx
        │   └── VideoMeet.jsx        # WebRTC core
        ├── styles/
        │   ├── LandingPage.css
        │   ├── MeetHistory.css
        │   └── VideoMeet.css
        ├── utils/
        │   └── apiClient.js         # Axios instance with JWT interceptors
        ├── App.jsx
        └── main.jsx
```

---

## 📖 About This Project

This full-stack project was developed for personal learning and demonstration purposes. Building it involved deep dives into WebRTC internals (ICE, NAT traversal, STUN/TURN), real-time signaling architecture and JWT security patterns .

---

## 🤝 Connect With Me

- **GitHub:** [jeffrin-samuel](https://github.com/jeffrin-samuel)
- **LinkedIn:** [Jeffrin Samuel](https://www.linkedin.com/in/jeffrin-samuel-236452210/)
- **Email:** jeffrinsamuel2006@gmail.com