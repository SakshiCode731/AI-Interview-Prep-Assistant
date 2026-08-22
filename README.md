# PrepAI — AI Interview Preparation Platform

![CI](https://github.com/SakshiCode731/AI-Interview-Prep-Assistant/actions/workflows/ci.yml/badge.svg)
![Tests](https://img.shields.io/badge/tests-17%20passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

An AI-powered, full-stack interview preparation platform built for engineering students preparing for campus placements — combining a RAG-based chatbot grounded in real company interview data, AI-evaluated mock interviews, resume-based readiness scoring, and system design practice.

**🔗 Live Demo:** [ai-interview-prep-assistant-mauve.vercel.app](https://ai-interview-prep-assistant-mauve.vercel.app/)

---

## ✨ Features

- **RAG-based Chatbot** — Answers grounded in real company-wise interview data (not generic hallucinated advice).
- **AI-Evaluated Mock Interviews** — Practice questions generated per job role, with instant scoring on correctness, clarity, and completeness (powered by Groq's `llama-3.3-70b-versatile`).
- **Answer Evaluator** — Submit any question + answer pair and get a detailed rubric-based evaluation: score, verdict, STAR-method adherence (for behavioral questions), keyword coverage, confidence indicators, strengths, and improvement areas.
- **Resume-Based Readiness Score** — Upload a resume and get a job-role-specific readiness score with skill match, experience, and project analysis.
- **System Design Practice Module** — Dedicated practice track for system design interview rounds.
- **Auto Topic Detection** — Every attempted question is automatically classified into a topic (DSA, System Design, HR, Behavioral, Frontend, Backend, Database, OOP) using the same AI evaluation call — no manual tagging required.
- **Per-User Progress Analytics** — Real dashboard showing total questions attempted, average score, and a genuine topic-wise breakdown (not just a single "Technical" bucket).
- **Company Directory** — Browse company-specific interview patterns and expectations, served with an in-memory caching layer for fast repeated reads.
- **Authentication** — Secure signup/login with JWT-based sessions and protected routes.

---

## 🛡️ Engineering & Production Practices

This isn't just a feature demo — the backend is built with production concerns in mind:

| Concern | Implementation |
|---|---|
| **Rate Limiting** | `express-rate-limit` — general limiter (100 req/15min per IP) + a stricter AI-specific limiter (15 req/15min) on all Groq-calling routes to prevent abuse of expensive AI calls |
| **Input Validation** | `Joi` schemas validate every request body (signup, login, chat, answer evaluation, mock interview, readiness) before it touches a controller |
| **Caching** | `node-cache` in-memory caching on read-heavy, rarely-changing routes (companies), with automatic invalidation on writes |
| **Error Monitoring** | Sentry integrated across the backend for real-time production error tracking |
| **Testing** | 17 unit tests covering core backend logic |
| **CI/CD** | GitHub Actions pipeline — every push to `main` installs dependencies, builds the frontend, and runs the full test suite automatically |

---

## 🧱 Tech Stack

**Frontend**
- React
- (Add: Tailwind CSS / CSS framework, state management library, etc. if used)

**Backend**
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication
- Groq SDK (`llama-3.3-70b-versatile`) for all AI evaluation/generation

**DevOps / Infra**
- Frontend deployed on **Vercel**
- Backend deployed on **Render**
- CI/CD via **GitHub Actions**
- Error monitoring via **Sentry**

> _Fill in any additional libraries (e.g. specific UI kit, chart library, PDF parser for resumes) so this section is fully accurate before submitting._

---

## 📁 Project Structure

```
AI-Interview-Prep-Assistant/
├── Server/
│   ├── controllers/       # Route handlers (auth, chat, answer evaluator, mock interview, readiness, companies, progress)
│   ├── models/             # Mongoose schemas (User, Answer, Readiness, Company, etc.)
│   ├── routes/              # Express route definitions
│   ├── middleware/          # authMiddleware, rateLimiter, validate
│   ├── utils/                # cache.js and other helpers
│   ├── config/                # DB connection
│   └── index.js               # App entry point
├── Client/                     # React frontend (adjust path/name if different)
├── .github/workflows/ci.yml    # CI/CD pipeline
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas connection string)
- A [Groq API key](https://console.groq.com)

### 1. Clone the repository
```bash
git clone https://github.com/SakshiCode731/AI-Interview-Prep-Assistant.git
cd AI-Interview-Prep-Assistant
```

### 2. Backend setup
```bash
cd Server
npm install
```

Create a `.env` file inside `Server/` with:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
SENTRY_DSN=your_sentry_dsn   # optional, for error monitoring
```

Run the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../Client
npm install
npm run dev
```

The app should now be running locally — backend on `http://localhost:5000`, frontend on whichever port your React dev server uses (typically `5173` for Vite or `3000` for CRA).

---

## 🧪 Running Tests

```bash
cd Server
npm test
```

All 17 unit tests should pass. The same suite runs automatically in CI on every push to `main`.

---

## 📡 API Overview

| Route | Description | Auth Required |
|---|---|---|
| `POST /api/auth/signup` | Register a new user | No |
| `POST /api/auth/login` | Login and receive a JWT | No |
| `GET /api/companies` | List companies (cached) | Yes |
| `GET /api/companies/:id` | Get company detail (cached) | Yes |
| `POST /api/chat/message` | Chat with the RAG-based assistant | Yes |
| `POST /api/answer/evaluate` | Evaluate a single question/answer pair | Yes |
| `POST /api/mock-interview/questions` | Generate mock interview questions for a job role | Yes |
| `POST /api/mock-interview/evaluate` | Evaluate an answer within a mock interview session | Yes |
| `POST /api/readiness/score` | Get a resume-based readiness score | Yes |
| `GET /api/readiness/me` | Get your latest readiness score | Yes |
| `GET /api/progress` | Get aggregated, topic-wise progress analytics | Yes |

> Admin-only routes exist for company management (`POST` / `PUT` / `DELETE /api/companies/:id`).

---

## 🗺️ Roadmap

- [ ] Expand system design module with visual diagram practice
- [ ] Add peer/mentor review mode for mock interviews
- [ ] Support multiple resume formats and richer parsing
- [ ] Add leaderboard / streak-based gamification

---

## 🤝 Contributing

This is currently a solo project. Issues and suggestions are welcome via GitHub Issues.

## 📄 License

MIT
