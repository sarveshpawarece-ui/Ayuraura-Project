# Aayuraura — National Ayurvedic Education & Healthcare Intelligence Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB.svg?style=flat&logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Security](https://img.shields.io/badge/Security-Gmail%20OAuth%20%2B%202FA%20OTP-success.svg)](SECURITY.md)

---

## 🌿 Overview & Purpose

**Aayuraura** is a comprehensive educational, clinical guidance, and career intelligence platform designed specifically for the Ayurvedic healthcare ecosystem (BAMS students, clinical practitioners, academic faculty, research institutions, and industry organizations).

The platform bridges classical Ayurvedic pedagogy (Samhita, Siddhanta, Dravyaguna, Panchakarma) with modern clinical practice, structured mentorship, institutional governance, and healthcare career opportunities across India.

---

## ✨ Key Features

### 1. Robust Authentication & Account Security
- **Official Google Sign-In**: Integration with Google Identity Services (GIS) and server-side OpenID Connect ID token verification.
- **Strict Gmail Restriction**: Dual-layer frontend and backend validation accepting only verified `@gmail.com` addresses; non-Gmail providers (Yahoo, Outlook, custom domains) are strictly rejected.
- **Two-Step Verification (SMTP OTP)**: 6-digit cryptographic, time-limited, single-use email OTP sent via SMTP with strict attempt rate-limiting and resend cooldowns.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `STUDENT`, `DOCTOR`, `FACULTY`, `INSTITUTION`, `INDUSTRY`, and `ADMIN`. Google Sign-In strictly defaults to `STUDENT` to prevent unauthorized privilege escalation.

### 2. Student Learning & Academic Success
- **Educational Resource Management**: Access approved Ayurvedic texts, digital study materials, and subject notes.
- **Interactive 3D Learning**: Anatomical and botanical 3D visualizations powered by Three.js / React Three Fiber.
- **BAMS Case Studies & Clinical Guidance**: Interactive clinical case analysis with doctor feedback loops.
- **Flashcards & Exam Preparation**: Topic-wise flashcards, quiz modules, and timed practice examinations.
- **Curriculum & Timetable Planning**: Academic timetable preferences and study organizers.

### 3. Faculty & Institution Management
- **Faculty Dashboard & AI Assistant**: Curriculum management, lecture uploads, and educational AI assistance.
- **Secure Institutional Invitations**: Token-based institutional invites (`/auth/accept-invitation`) for verified faculty and student onboarding.
- **Academic Governance**: Departmental administration, student progress tracking, and AISHE-linked institutional profiles.

### 4. Career Guidance, Internships & Mentorship
- **Clinical Doctor Network**: Mentorship matching connecting undergraduate students with verified Ayurvedic doctors.
- **Healthcare Camps & Internships**: Clinical internships and rural healthcare camp coordination.
- **Career Pathways**: Career readiness assessments, skill profile tracking, and industry opportunities.

### 5. Community & Quality Governance
- **Student & Faculty Feedback**: Structured feedback forms with automated profanity filtering, sentiment scoring, and administrator moderation.
- **Audit Logging**: Comprehensive `SecurityAuditLog` tracking all authentication, invitation, and administrative events.

---

## 🛠 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16.3.3 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Lucide React, Three.js (`@react-three/fiber`, `@react-three/drei`) |
| **Backend** | FastAPI, Python 3.12, SQLAlchemy (AsyncIO), Pydantic v2, Passlib (Bcrypt), PyJWT, HTTPX |
| **Database** | PostgreSQL / SQLite (via AsyncIO drivers `asyncpg` / `aiosqlite`) with automatic migration scripts |
| **Storage** | MinIO / AWS S3 compatible Object Storage for educational files and clinical media |
| **Email / SMTP** | Python `smtplib` with STARTTLS / SSL support for transactional OTP delivery |
| **DevOps & Proxy** | Docker, Docker Compose, Nginx reverse proxy configuration |

---

## 📁 Project Structure

```
AyurSetu 1/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/     # REST API route handlers (auth, resources, feedback, student, doctor, etc.)
│   │   ├── core/                  # Configuration, database engine, security tokens, hashing
│   │   ├── db/                    # DB initialization & automatic migrations (init_db.py)
│   │   ├── models/                # SQLAlchemy models (User, Profiles, Resources, Feedback, 2FA OTP)
│   │   ├── schemas/               # Pydantic validation schemas
│   │   ├── services/              # Email SMTP service, MinIO storage client
│   │   └── main.py                # FastAPI application entrypoint & middleware
│   ├── tests/                     # Pytest automated test suites
│   ├── Dockerfile                 # Backend containerization definition
│   └── requirements.txt           # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js 16 App Router (102 routes: auth, student, doctor, faculty, admin)
│   │   │   ├── (auth)/            # Sign-in (/login) and registration (/register) pages
│   │   │   ├── student/           # Student learning, flashcards, assessments, ecosystem
│   │   │   ├── doctor/            # Doctor clinical portal, mentorship, internships
│   │   │   ├── faculty/           # Faculty AI assistant, lectures, analytics
│   │   │   └── admin/             # Platform oversight, moderation, monitoring
│   │   ├── components/            # Reusable UI components & GoogleSignInButton
│   │   └── lib/                   # API client (Axios/Fetch), auth state utilities
│   ├── public/                    # Logos, emblems, static artwork
│   ├── package.json               # Frontend dependencies & Next.js scripts
│   └── tsconfig.json              # TypeScript compilation config
├── nginx/                         # Nginx reverse proxy configuration
├── docker-compose.yml             # Full-stack orchestration (PostgreSQL, MinIO, Backend, Frontend)
├── .env.example                   # Master environment configuration template
├── DEPLOYMENT.md                  # Production deployment guide
├── SECURITY.md                    # Platform security architecture & audit rules
└── TESTING.md                     # Test execution documentation
```

---

## 🚀 Installation & Local Development

### Prerequisites
- **Node.js**: v18.17+ or v20+
- **Python**: 3.11 or 3.12
- **Git**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/sarveshpawarece-ui/Ayuraura-Project.git
cd Ayuraura-Project
```

---

### Step 2: Configure Environment Variables

1. Copy the master `.env.example` file:
   ```bash
   cp .env.example backend/.env
   cp frontend/.env.production.example frontend/.env.local
   ```
2. Update the environment files with your local configuration:
   - **`backend/.env`**:
     ```env
     PROJECT_NAME="Aayuraura Backend"
     API_V1_STR="/api/v1"
     SECRET_KEY="your-32-byte-random-secret-key"
     
     # PostgreSQL Database (or SQLite for fast testing)
     POSTGRES_SERVER="localhost"
     POSTGRES_PORT=5432
     POSTGRES_USER="ayursetu_user"
     POSTGRES_PASSWORD="ayursetu_password"
     POSTGRES_DB="ayursetu_db"
     
     # Google Sign-In (from Google Cloud Console)
     GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
     GOOGLE_CLIENT_SECRET="your-client-secret"
     
     # SMTP Email Two-Step Verification (2FA OTP)
     SMTP_HOST="smtp.gmail.com"
     SMTP_PORT=587
     SMTP_USER="your-email@gmail.com"
     SMTP_PASSWORD="your-app-password"
     REQUIRE_OTP_LOGIN=true
     OTP_EXPIRATION_MINUTES=5
     ```
   - **`frontend/.env.local`**:
     ```env
     NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api/v1"
     NEXT_PUBLIC_APP_NAME="Aayuraura"
     NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
     ```

---

### Step 3: Backend Setup & Startup

1. Navigate to the backend directory and activate a virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # Linux / macOS:
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend API documentation will be available at:
   - Interactive Swagger UI: `http://localhost:8000/docs`
   - OpenAPI Specification: `http://localhost:8000/api/v1/openapi.json`

---

### Step 4: Frontend Setup & Startup

1. Open a new terminal in the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at: `http://localhost:3000`

---

## 🔒 Google Sign-In & OAuth Setup Guide

To enable official Google Sign-In:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project and navigate to **APIs & Services** > **Credentials**.
3. Click **Create Credentials** > **OAuth client ID**.
4. Choose **Web application**.
5. Set **Authorized JavaScript origins**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
6. Set **Authorized redirect URIs**:
   - `http://localhost:3000`
   - `http://localhost:3000/login`
   - `https://your-domain.com`
   - `https://your-domain.com/login`
7. Copy your **Client ID** into `backend/.env` and `frontend/.env.local`.

---

## 🧪 Testing

### Backend Unit & Integration Tests (Pytest)
Run the automated test suite including Google OAuth token verification, Gmail validation, and 2FA OTP:
```bash
cd backend
.venv\Scripts\python.exe -m pytest tests/test_google_auth_and_gmail.py tests/test_two_factor_auth.py -v
```

### Frontend Typechecking & Production Build
Validate TypeScript definitions and ensure zero build errors across all 102 routes:
```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## 🛡 Security Policy & Reporting

- Never commit `.env` or production credentials to source control.
- All incoming user passwords are encrypted using `bcrypt` (12 rounds).
- Google OAuth ID tokens are verified server-side against Google's tokeninfo authority.
- See [`SECURITY.md`](SECURITY.md) for full vulnerability reporting and security architecture details.

---

## 📄 License & Attribution

This project is maintained for the National Ayush & BAMS educational ecosystem. All rights reserved. Refer to [`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md) for third-party component licenses.
