# BharatSeva AI — Multilingual Citizen Welfare Platform

> **AI-powered, production-ready platform** helping Indian citizens discover government welfare schemes, check eligibility, and receive step-by-step application guidance in **7 Indian languages**.

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Architecture](#-architecture)
5. [Security Model](#-security-model)
6. [Getting Started (Local)](#-getting-started-local)
7. [Environment Variables](#-environment-variables)
8. [Running in Docker](#-running-in-docker)
9. [Deployment Guide](#-deployment-guide)
10. [API Reference](#-api-reference)
11. [Project Structure](#-project-structure)
12. [Development Phases](#-development-phases)

---

## 🎯 Overview

BharatSeva AI is a multilingual civic technology platform that removes linguistic and bureaucratic barriers so every Indian citizen can discover and access their rightful welfare entitlements.

**Supported Languages:** Hindi (हिंदी) · Kannada (ಕನ್ನಡ) · Tamil (தமிழ்) · Telugu (తెలుగు) · Marathi (मराठी) · Bengali (বাংলা) · English

> ⚠️ **Public Disclaimer:** BharatSeva AI is an independent civic-technology discovery platform. It is **NOT** an official government portal and is **not** affiliated with the Government of India. All assessments are strictly informational; final eligibility decisions are made solely by competent administrative authorities.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🌍 **Multilingual AI Chat** | Ask questions about schemes in any of 7 languages via text or voice |
| 🔍 **Scheme Discovery Engine** | Search 200+ central and state government welfare schemes |
| 🏅 **Eligibility Assessment** | 4-tier deterministic eligibility engine (Eligible / Likely / Uncertain / Ineligible) |
| 🎤 **Voice Input** | Web Speech API integration for hands-free querying |
| 🔊 **Text-to-Speech** | Sarvam AI TTS for scheme summaries in Indian languages |
| 🔖 **Saved Schemes** | Bookmark schemes and track application progress |
| 👤 **User Profiles** | Store personal details for personalized eligibility recommendations |
| 📱 **PWA** | Installable Progressive Web App with offline support |
| 🔐 **Secure Auth** | JWT-based authentication with bcrypt password hashing |

---

## 🛠️ Technology Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 (JavaScript, no TypeScript) |
| Build Tool | Vite 6 with manual code splitting |
| Styling | Tailwind CSS v3 (custom Bharat-inspired palette) |
| Routing | React Router DOM v7 |
| HTTP Client | Axios (centralized client with auth interceptors) |
| Icons | Lucide React |
| PWA | Web App Manifest + Service Worker |
| Production Server | Nginx (in Docker) |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js v20+ (ES Modules) |
| Framework | Express.js v4 |
| Database | MongoDB via Mongoose v8 |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Security | Helmet, CORS, HPP, Compression, Rate Limiting |
| AI Integration | Sarvam AI API (STT, TTS, Translation) |
| Logging | Custom structured logger with secret redaction |

### Infrastructure
| Layer | Technology |
|---|---|
| Containerization | Docker (multi-stage builds) |
| Orchestration | Docker Compose (dev + prod configs) |
| CI/CD Ready | GitHub Actions compatible |

---

## 🏛️ Architecture

```
aiseva/
├── frontend/                     # React 19 + Vite + Tailwind CSS
│   ├── public/
│   │   ├── manifest.json         # PWA Web App Manifest
│   │   └── sw.js                 # Service Worker (cache + offline)
│   ├── src/
│   │   ├── api/                  # Centralized Axios API clients
│   │   │   ├── client.js         # Axios instance (auth interceptors)
│   │   │   ├── auth.api.js       # Authentication endpoints
│   │   │   ├── schemes.api.js    # Scheme listing/search
│   │   │   ├── ai.api.js         # AI query/TTS/STT
│   │   │   └── savedSchemes.api.js
│   │   ├── components/common/    # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ErrorBoundary.jsx # Crash-resilient wrapper
│   │   │   ├── SchemeCard.jsx
│   │   │   ├── EligibilityBadge.jsx
│   │   │   ├── VoiceInputButton.jsx
│   │   │   └── LoadingSkeleton.jsx
│   │   ├── context/              # React Contexts
│   │   │   ├── AuthContext.jsx   # Auth state + saved schemes
│   │   │   └── LanguageContext.jsx
│   │   ├── pages/                # Lazy-loaded route pages
│   │   │   ├── Home.jsx
│   │   │   ├── ChatPage.jsx      # AI Chat interface
│   │   │   ├── SchemeSearchPage.jsx
│   │   │   ├── SchemeDetailPage.jsx
│   │   │   ├── LoginPage.jsx / RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── SavedSchemesPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── constants/
│   │   │   ├── languages.js      # All 7 language configs + UI translations
│   │   │   └── mockSchemes.js    # Offline fallback scheme data
│   │   ├── config/env.js         # Frontend environment validator
│   │   ├── App.jsx               # Lazy routes + Error Boundary + ScrollToTop
│   │   ├── main.jsx              # Entry point + SW registration
│   │   └── index.css             # Global styles (accessible focus, scrollbar)
│   ├── Dockerfile                # Multi-stage: Node build → Nginx serve
│   ├── nginx.conf                # SPA routing + gzip + security headers
│   └── vite.config.js            # Build optimization + dev proxy
│
├── backend/                      # Node.js + Express (ES Modules)
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js            # Fail-fast env validator
│   │   │   └── db.js             # Mongoose with retry + graceful shutdown
│   │   ├── controllers/          # Thin request/response handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── scheme.controller.js
│   │   │   ├── ai.controller.js
│   │   │   ├── savedScheme.controller.js
│   │   │   └── health.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js           # JWT protect + role restrict
│   │   │   ├── sanitize.middleware.js       # XSS input sanitization ✨Phase5
│   │   │   ├── validate.middleware.js       # Field-level validation ✨Phase5
│   │   │   ├── rateLimiters.middleware.js   # Per-route rate limits ✨Phase5
│   │   │   ├── requestContext.middleware.js # Request ID + timing ✨Phase5
│   │   │   ├── errorHandler.js
│   │   │   └── notFoundHandler.js
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── Scheme.model.js
│   │   │   └── SavedScheme.model.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── auth.routes.js    # + authLimiter + validation
│   │   │   ├── scheme.routes.js
│   │   │   ├── ai.routes.js      # + aiLimiter + validation
│   │   │   ├── savedScheme.routes.js
│   │   │   └── health.routes.js
│   │   ├── services/
│   │   │   ├── sarvam.service.js         # Sarvam AI STT/TTS/translate
│   │   │   ├── recommendation.service.js # NLP query → scheme matching
│   │   │   ├── eligibility.service.js    # Deterministic eligibility engine
│   │   │   └── nlu.service.js            # Natural language understanding
│   │   ├── utils/
│   │   │   ├── logger.js         # Structured logger (redacts secrets)
│   │   │   ├── token.js          # JWT sign/verify helpers
│   │   │   └── seedData.js       # 10 verified scheme seed records
│   │   ├── tests/                # Node.js native test runner
│   │   ├── app.js                # Express app + all middleware stack
│   │   └── server.js             # HTTP server + graceful shutdown
│   ├── Dockerfile                # Multi-stage: non-root runtime user
│   └── .dockerignore
│
├── docker-compose.yml            # Dev: MongoDB + Backend + Frontend
├── docker-compose.prod.yml       # Production: runtime stages + no source mounts
├── .gitignore                    # Comprehensive secret protection
└── README.md
```

---

## 🔐 Security Model

### Backend Security Layers (Defense in Depth)

| Layer | Implementation |
|---|---|
| **HTTPS Headers** | Helmet.js with custom CSP, X-Frame-Options, Referrer-Policy |
| **CORS** | Strict origin allowlist from environment variables |
| **Rate Limiting** | Global (100/15min) + Auth (10/15min) + AI (30/5min) + Registration (5/hr) |
| **Input Sanitization** | Custom middleware strips `<script>`, event handlers, null bytes |
| **Field Validation** | 422 errors with per-field detail before controllers |
| **HPP Protection** | Prevents HTTP Parameter Pollution attacks |
| **Password Hashing** | bcryptjs with salt rounds |
| **JWT Security** | Signed tokens, expiry enforced, production length/content checks |
| **Request Tracing** | Unique request IDs on every request + response time |
| **Compression** | gzip for all API responses |
| **Secret Logging** | Logger redacts passwords, tokens, API keys, MongoDB credentials |
| **Prototype Pollution** | Sanitizer drops `__proto__`, `constructor`, `prototype` keys |

### Frontend Security
- No secrets in frontend — all keys strictly backend-only
- `Content-Security-Policy` via Nginx headers
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- PWA offline only serves app shell — never stale government data

---

## 🚀 Getting Started (Local)

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | v20+ |
| npm | v9+ |
| MongoDB | Local instance OR [MongoDB Atlas](https://cloud.mongodb.com) free tier |

### 1. Clone & Setup

```bash
git clone https://github.com/your-org/bharatseva-ai.git
cd bharatseva-ai
```

### 2. Setup Environment Files

```bash
# Backend
copy backend\.env.example backend\.env

# Frontend
copy frontend\.env.example frontend\.env
```

Edit `backend/.env` — at minimum set:
```env
MONGODB_URI=mongodb://localhost:27017/bharatseva
JWT_SECRET=your_super_secret_key_at_least_32_chars
SARVAM_API_KEY=your_sarvam_api_key_here
```

### 3. Install Dependencies

```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 4. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running at: http://localhost:5000
# Health check:   http://localhost:5000/api/health
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running at: http://localhost:3000
```

> The Vite dev proxy forwards `/api/*` to `localhost:5000` automatically — no CORS config needed.

---

## 🌍 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Environment name |
| `PORT` | No | `5000` | Server port |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Min 32 chars in production |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime |
| `SARVAM_API_KEY` | **Yes*** | — | Required for STT/TTS/translate |
| `FRONTEND_URL` | No | `http://localhost:3000` | Used for CORS |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated allowed origins |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | 15 minutes |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Requests per window |

*STT/TTS features fall back gracefully when `SARVAM_API_KEY` is absent.

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | — | Backend API URL (e.g. `http://localhost:5000/api`) |
| `VITE_APP_NAME` | No | `BharatSeva AI` | App display name |
| `VITE_APP_VERSION` | No | `1.0.0` | App version |

> **Security:** All `VITE_*` variables are embedded in the JavaScript bundle at build time and are publicly visible. **Never put secrets here.**

---

## 🐳 Running in Docker

### Development (with hot-reload)

```bash
# Start all services
docker compose up

# Or rebuild images first
docker compose up --build
```

Services:
- **MongoDB:** `localhost:27017`
- **Backend API:** `localhost:5000`
- **Frontend:** `localhost:3000`

### Production

```bash
# Create production .env
copy .env.example .env.prod
# Edit .env.prod with production secrets

# Start production stack
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

Required production environment variables:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bharatseva
JWT_SECRET=your_production_jwt_secret_min_32_chars
SARVAM_API_KEY=your_sarvam_production_key
FRONTEND_URL=https://your-domain.com
CORS_ORIGINS=https://your-domain.com
VITE_API_BASE_URL=https://api.your-domain.com/api
```

---

## ☁️ Deployment Guide

### Render.com (Recommended — Free Tier Available)

**Backend:**
1. Connect your GitHub repository
2. Service type: **Web Service**
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node src/server.js`
6. Add all environment variables from `backend/.env.example`

**Frontend:**
1. Service type: **Static Site**
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

### Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**
```bash
cd frontend
npx vercel --prod
# Set VITE_API_BASE_URL in Vercel dashboard
```

**Backend on Railway:**
- Connect GitHub repository
- Set `ROOT_DIRECTORY=backend`
- Add all environment variables
- MongoDB: use Railway MongoDB plugin or Atlas

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api`

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Service status, DB status, uptime |

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Register citizen account |
| POST | `/auth/login` | None | Login, receive JWT |
| GET | `/auth/me` | Bearer JWT | Get current citizen profile |
| PUT | `/auth/profile` | Bearer JWT | Update profile details |

### Schemes
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/schemes` | None | List schemes (filterable, paginated) |
| GET | `/schemes/:identifier` | None | Get scheme by slug or ID |
| POST | `/schemes/seed` | None | Re-seed database with sample schemes |

### Saved Schemes
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/saved-schemes` | Bearer JWT | Get citizen's saved schemes |
| POST | `/saved-schemes` | Bearer JWT | Bookmark a scheme |
| DELETE | `/saved-schemes/:slug` | Bearer JWT | Remove a bookmark |
| GET | `/saved-schemes/check/:slug` | Bearer JWT | Check if scheme is bookmarked |

### AI
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ai/query` | Optional JWT | Natural language scheme query |
| POST | `/ai/evaluate-eligibility` | Optional JWT | Eligibility check for a scheme |
| POST | `/ai/stt` | Bearer JWT | Speech-to-text via Sarvam AI |
| POST | `/ai/tts` | Bearer JWT | Text-to-speech via Sarvam AI |

---

## 🧪 Running Tests

```bash
# Backend unit tests (Node.js native test runner)
cd backend
npm test

# Frontend production build (validates no compile errors)
cd frontend
npm run build
```

---

## 📐 Development Phases

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | Project scaffold, Vite+React frontend, Express backend, environment config | ✅ Complete |
| **Phase 2** | MongoDB models, JWT auth, scheme seeding, all CRUD routes | ✅ Complete |
| **Phase 3** | Full frontend UI: all 11 pages, multilingual context, voice input | ✅ Complete |
| **Phase 4** | Sarvam AI integration (STT/TTS/translate), NLP query engine, eligibility service | ✅ Complete |
| **Phase 5** | Security hardening, performance optimization, Docker, PWA, production readiness | ✅ Complete |

---

## 📄 License

ISC — Built with 🇮🇳 for all citizens of Bharat.
