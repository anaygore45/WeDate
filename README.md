<p align="center">
  <img src="client/public/favicon.svg" alt="WeDate Logo" width="64" height="64" />
</p>

<h1 align="center">WeDate</h1>

<p align="center">
  <strong>AI-Powered Dating Web Application for Verified Student Communities</strong>
</p>

<p align="center">
  <em>Discover genuine connections through shared interests, hobbies, and goals — powered by explainable AI recommendations.</em>
</p>

---

## Overview

WeDate is a full-stack MERN dating and social connection platform that helps eligible students discover people with shared interests, hobbies, and relationship goals. Users create profiles, explore potential matches through a swipe-based discovery interface, form mutual matches, and communicate privately in real time.

The platform features a content-based AI recommendation engine that ranks discovery profiles using Jaccard similarity, TF-IDF cosine similarity, and explicit goal compatibility mapping — all running locally in the Node.js backend with zero external AI dependencies.

### Key Features

- 🔐 **Secure Authentication** — JWT-based auth, bcrypt password hashing, email verification, password reset
- 🎓 **Student Verification** — Configurable email domain restriction for verified student communities
- 👤 **Rich Profiles** — Photos, bio, interests, hobbies, relationship goals, languages, academic info
- 💡 **AI Smart Discovery** — Content-based recommendation engine with explainable match reasons
- ✨ **Gemini Connection Assistant** — Real generative AI (Google Gemini 2.5 Flash) for grounded connection insights, mutual-match conversation starters, and voice-preserving bio coaching
- 💕 **Swipe & Match** — Like/Pass discovery with mutual matching and confetti celebrations
- 💬 **Real-Time Chat** — Socket.IO powered messaging with typing indicators, read receipts, image sharing
- 🔔 **Live Notifications** — Real-time notification delivery for matches, likes, and messages
- 🛡️ **Safety Features** — Block users, report profiles, privacy controls, profile visibility toggle
- 📱 **Responsive Design** — Desktop navigation + mobile bottom bar, editorial lifestyle aesthetic
- 🧪 **Tested** — Automated unit and integration test suites covering algorithms, security, and AI privacy

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 6, React Router 6, Axios, Socket.IO Client, Lucide React |
| **Backend** | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, Socket.IO 4, Zod |
| **Generative AI** | Google Gemini (`@google/genai` SDK, `gemini-2.5-flash`) |
| **Classical AI** | Jaccard Similarity, TF-IDF + Cosine Similarity, Goal Compatibility Matrix |
| **Database** | MongoDB (with mongodb-memory-server fallback for development) |
| **Media** | Cloudinary SDK (with local filesystem fallback) |
| **Email** | Nodemailer (with dev console transport fallback) |
| **Security** | Helmet, CORS, Rate Limiting, Input Validation |
| **Testing** | Jest, Supertest, mongodb-memory-server |

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- MongoDB (optional — auto-falls back to in-memory database for development)

### 1. Clone & Install

```bash
git clone <repository-url>
cd WeDate
npm install
npm run install:all
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings. Minimum required for development:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_secure_jwt_secret_here
ALLOWED_EMAIL_DOMAIN=campus.edu
```

> **Note:** If `MONGODB_URI` is not set or MongoDB is not running locally, the app automatically uses an in-memory database — perfect for development. Data resets on restart.

### 3. Seed Demo Data

```bash
npm run seed
```

Creates 12 fictional student profiles, 2 mutual matches with chat messages, and sample notifications.

### 4. Start Development Server

```bash
npm run dev
```

This launches both the backend (port 5000) and frontend (port 5173) concurrently.

### 5. Open the App

Navigate to **http://localhost:5173**

**Demo Login:**
- Email: `aarav.sharma@campus.edu`
- Password: `WeDatePass123!`

All 12 demo accounts share the password `WeDatePass123!`.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both server and client in development mode |
| `npm run dev:server` | Start only the backend (port 5000) |
| `npm run dev:client` | Start only the frontend (port 5173) |
| `npm run build:client` | Build the React frontend for production |
| `npm run test` | Run all server tests |
| `npm run seed` | Seed the database with demo profiles |
| `npm run evaluate:ai` | Run AI recommendation evaluation metrics |
| `npm run install:all` | Install dependencies for both server and client |

---

## Project Structure

```
WeDate/
├── package.json                    # Monorepo root with concurrently
├── .env.example                    # Environment configuration template
├── .gitignore
├── README.md
│
├── client/                         # React Frontend (Vite)
│   ├── index.html                  # Entry HTML with Google Fonts
│   ├── vite.config.js              # Vite config with API proxy
│   ├── public/favicon.svg          # WeDate heart logo
│   └── src/
│       ├── main.jsx                # React entry point
│       ├── App.jsx                 # Router, providers, route guards
│       ├── contexts/               # AuthContext, SocketContext
│       ├── services/               # API client (Axios), Socket.IO client
│       ├── components/
│       │   ├── common/             # Button, Modal, ChipSelect
│       │   ├── layout/             # Navbar, Footer
│       │   ├── discovery/          # ProfileCard, WhyThisProfile, FilterModal
│       │   ├── chat/               # ChatWindow, ConversationList, MessageBubble
│       │   └── safety/             # ReportModal, SafetyDisclaimer
│       ├── pages/                  # 15 page components
│       └── styles/index.css        # Design system & responsive CSS
│
├── server/                         # Node.js Backend (Express)
│   ├── package.json                # ESM, type:module
│   └── src/
│       ├── server.js               # HTTP server + Socket.IO init
│       ├── app.js                  # Express app configuration
│       ├── config/                 # DB, JWT, Cloudinary, Email, AI Config
│       ├── middleware/             # Auth, Error Handler, Rate Limiter, Upload
│       ├── models/                 # 9 Mongoose models
│       ├── services/               # Business logic layer (8 services)
│       ├── controllers/            # Request handlers (9 controllers)
│       ├── routes/                 # API route definitions (9 route files)
│       └── sockets/                # Socket.IO event handlers
│   ├── scripts/                    # Seed data, AI evaluation
│   └── tests/                     # Jest test suites
│
└── docs/                           # Technical documentation
    ├── architecture.md
    ├── api.md
    ├── database.md
    ├── security.md
    ├── ai-recommendation-system.md
    ├── ai-evaluation.md
    └── user-guide.md
```

---

## AI Recommendation System

WeDate's Smart Discovery engine uses classical content-based recommendation techniques:

| Component | Method | Weight |
|-----------|--------|--------|
| **Interests** | Jaccard Similarity | 35% |
| **Hobbies** | Jaccard Similarity | 20% |
| **Relationship Goals** | Compatibility Matrix | 20% |
| **Biography** | TF-IDF + Cosine Similarity | 15% |
| **Languages** | Jaccard Similarity | 10% |

The system dynamically renormalizes weights when profile data is incomplete, generates up to 3 human-readable explanation reasons per recommendation, and supports full opt-out for users who prefer non-personalized discovery.

**Evaluation Results:**
- Precision@1: 100%
- Precision@2: 100%
- Coverage: 100%
- Determinism: PASS
- Opt-Out: PASS

See [docs/ai-recommendation-system.md](docs/ai-recommendation-system.md) for detailed algorithm documentation.

---

## Testing

```bash
npm run test
```

**Test Suites:**
- **Recommendation Engine** (18 tests) — Jaccard similarity, cosine similarity, goal compatibility, weighted scoring, clamping, explanations, ranking, opt-out
- **Auth & Matching Integration** (8 tests) — Domain validation, age verification, password hashing, single-like invariance, reciprocal matching, self-swipe prevention, block deactivation

---

## Design System

WeDate uses an editorial lifestyle aesthetic with centralized CSS custom properties:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#FAF7F3` | Warm ivory background |
| `--color-primary` | `#762D43` | Deep burgundy primary |
| `--color-accent` | `#EBC9CE` | Soft blush accent |
| `--color-text-main` | `#252020` | Near-black text |
| `--color-border` | `#E8DFDD` | Warm-grey borders |

**Typography:** DM Serif Display (editorial headings) + Plus Jakarta Sans (body & controls)

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | Server port | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string | Auto in-memory |
| `JWT_SECRET` | JWT signing secret | *(required)* |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `ALLOWED_EMAIL_DOMAIN` | Student email domain restriction | `campus.edu` |
| `SMTP_HOST` | SMTP server host | Dev console fallback |
| `SMTP_PORT` | SMTP server port | — |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASS` | SMTP password | — |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Local file fallback |
| `CLOUDINARY_API_KEY` | Cloudinary API key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | — |

---

## Production Deployment

### Frontend
Deploy the `client/dist` folder (after `npm run build:client`) to **Vercel**, **Netlify**, or any static host.

### Backend
Deploy the `server/` directory to **Render**, **Railway**, or any Node.js host.

### Database
Use **MongoDB Atlas** for a managed, persistent MongoDB deployment.

### Media Storage
Configure **Cloudinary** credentials for production photo uploads.

### Email
Configure a production SMTP provider (SendGrid, Mailgun, etc.) via the `SMTP_*` environment variables.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System architecture, tech stack, component diagram |
| [API Reference](docs/api.md) | Complete REST API & Socket.IO event documentation |
| [Database Schema](docs/database.md) | All Mongoose models with ER diagram |
| [Security](docs/security.md) | Security practices and threat mitigations |
| [Smart Connection Assistant](docs/smart-connection-assistant.md) | Gemini generative AI integration, icebreakers & privacy |
| [AI Recommendation System](docs/ai-recommendation-system.md) | Algorithm details, equations, weights |
| [AI Evaluation](docs/ai-evaluation.md) | Evaluation methodology and benchmark results |
| [User Guide](docs/user-guide.md) | End-user guide for using WeDate |

---

## License

This project is for educational and demonstration purposes.

---

<p align="center">
  <strong>Built with ❤️ by the WeDate team</strong>
</p>
