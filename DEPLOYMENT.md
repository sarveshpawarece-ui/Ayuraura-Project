# AAYURAURA — PRODUCTION DEPLOYMENT & READINESS GUIDE

**Platform:** Aayuraura — BAMS Academic & Clinical Intelligence Platform  
**Target Architecture:**
- **Frontend:** Next.js 16 (App Router) on Vercel / Cloudflare Pages / Node.js Standalone
- **Backend:** FastAPI (Python 3.11 / 3.12) on Render / Railway / AWS ECS / Ubuntu VPS
- **Database:** PostgreSQL 15+ (Production) / SQLite with aiosqlite (Dev / Demo)
- **Object Storage:** AWS S3 / MinIO / Local Secure Storage
- **Reverse Proxy:** Nginx / Cloudflare (SSL termination, HSTS, rate-limiting)

---

## 1. Environment Variables Specification

### Backend Variables (`backend/.env`)

| Variable Name | Required | Default / Example | Purpose / Security Notes |
| :--- | :---: | :--- | :--- |
| `PROJECT_NAME` | No | `"Aayuraura Backend"` | Title shown in OpenAPI docs & health checks |
| `SECRET_KEY` | **YES (Prod)** | *Generated 32-byte hex* | Used for signing JWT authentication tokens. **Do not use default in production.** |
| `ALGORITHM` | No | `"HS256"` | JWT token hashing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` (24 Hours) | JWT token lifespan in minutes |
| `DATABASE_URL` | **YES (Prod)** | `postgresql+asyncpg://user:pass@host:5432/aayuraura` | PostgreSQL async connection string. If omitted, falls back to local SQLite |
| `USE_SQLITE_DEV` | No | `true` | When set to `false`, forces PostgreSQL connection |
| `CORS_ORIGINS` | **YES (Prod)** | `https://aayuraura.vercel.app,https://aayuraura.in` | Comma-separated list of permitted origin domains |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Enables Google Gemini 1.5 Flash for unified AI chatbot & clinical tools |
| `OPENAI_API_KEY` | Optional | `sk-...` | Optional alternative LLM provider |
| `MINIO_ENDPOINT` | Optional | `localhost:9000` | S3-compatible object storage endpoint |
| `MINIO_ACCESS_KEY` | Optional | `minioadmin` | Storage access key |
| `MINIO_SECRET_KEY` | Optional | `minioadmin` | Storage secret key |
| `MINIO_BUCKET_NAME`| Optional | `aayuraura-uploads` | S3 bucket name |

### Frontend Variables (`frontend/.env.local` / Vercel Settings)

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | **YES** | `https://aayuraura-backend.onrender.com/api/v1` | Public backend API URL accessed by client browser |
| `BACKEND_API_URL` | Optional | `https://aayuraura-backend.onrender.com` | Internal SSR backend proxy URL used by `next.config.ts` rewrites |
| `NEXT_PUBLIC_APP_NAME` | No | `"Aayuraura"` | Display brand text |

---

## 2. Production Build & Start Commands

### Backend

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run Database Migrations (if Alembic is configured) or rely on startup lifespan
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend

```bash
# 1. Install dependencies
npm ci

# 2. Type-check & Production Build
npm run build

# 3. Start Production Server
npm start
```

---

## 3. Step-by-Step Deployment Instructions

### Option A: Render (Backend) + Vercel (Frontend)

#### Step 1: Deploy Backend to Render
1. Connect repository to [Render.com](https://render.com).
2. Select **Web Service**, set root directory to `backend`.
3. Set Runtime to **Python 3**.
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Under Environment Variables:
   - Add `SECRET_KEY` with a strong random 32-character string.
   - Add `USE_SQLITE_DEV=true` (or link a managed Render PostgreSQL database).
   - Add `CORS_ORIGINS=https://your-frontend.vercel.app`.
   - Optionally add `GEMINI_API_KEY`.
7. Click **Create Web Service**. Note the public URL (e.g., `https://aayuraura-backend.onrender.com`).

#### Step 2: Deploy Frontend to Vercel
1. Import repository in [Vercel](https://vercel.com).
2. Set root directory to `frontend`.
3. Framework Preset: **Next.js**.
4. Under Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://aayuraura-backend.onrender.com/api/v1`
   - `BACKEND_API_URL`: `https://aayuraura-backend.onrender.com`
5. Click **Deploy**.

### Option B: Production Docker Compose (Single Host / AWS EC2 / DigitalOcean)

1. Clone repository to server:
   ```bash
   git clone <repo-url> /opt/aayuraura
   cd /opt/aayuraura
   ```
2. Create environment files:
   - Populate `backend/.env` using `backend/.env.production.example`.
   - Populate `frontend/.env.production` using `frontend/.env.production.example`.
3. Build and launch containers in detached mode:
   ```bash
   docker compose up -d --build
   ```
4. Verify running services:
   ```bash
   docker compose ps
   curl -s http://localhost:8000/health
   ```

### Option C: Ubuntu VPS with Nginx & Systemd

1. **System Prerequisites**:
   ```bash
   sudo apt-get update && sudo apt-get install -y python3.12 python3.12-venv postgresql nginx certbot python3-certbot-nginx nodejs npm
   ```
2. **Backend Service (`/etc/systemd/system/aayuraura-backend.service`)**:
   ```ini
   [Unit]
   Description=Aayuraura FastAPI Backend Service
   After=network.target postgresql.service

   [Service]
   User=www-data
   WorkingDirectory=/var/www/aayuraura/backend
   EnvironmentFile=/var/www/aayuraura/backend/.env
   ExecStart=/var/www/aayuraura/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
   Restart=always
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```
3. **Frontend Standalone Service (`/etc/systemd/system/aayuraura-frontend.service`)**:
   ```ini
   [Unit]
   Description=Aayuraura Next.js Standalone Frontend
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/aayuraura/frontend
   Environment=NODE_ENV=production
   Environment=PORT=3000
   Environment=HOSTNAME=127.0.0.1
   ExecStart=/usr/bin/node server.js
   Restart=always
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```

---

## 4. Health Checks, Monitoring & Telemetry

### 1. Active Liveness & Readiness Endpoints
- **Public Health Ping:** `GET /health`
  - Evaluates both API responsiveness and executes an async `SELECT 1` ping to PostgreSQL/SQLite.
  - Returns `200 OK` with JSON:
    ```json
    {
      "status": "healthy",
      "version": "1.0.0",
      "database": "connected"
    }
    ```
  - If the database is unreachable, returns `503 Service Unavailable` with `"status": "degraded"`.
- **API v1 Health Ping:** `GET /api/v1/health`
  - Fully authenticated service status for client applications and monitoring probes.

### 2. Error Logging & Security Sanitation
- Application logging is routed through standard Python `logging` with structured output: `%(asctime)s [%(levelname)s] [%(name)s] %(message)s`.
- **Sensitive Data Redaction:** Passwords, JWT secrets, authentication headers, and personal patient information are scrubbed before reaching stdout or disk logs.
- Startup lifespan displays a high-visibility warning in logs if the default development `SECRET_KEY` is detected when `USE_SQLITE_DEV=false`.

### 3. Application Metrics & Platform Analytics
- System administrators can monitor real-time platform health, student enrollments, faculty activity, and active test completions directly via the `/admin/analytics` dashboard.

---

## 5. Database Safety, Migrations & Rollback Procedures

### Pre-Deployment Backup Protocol (Mandatory Before Migrations)
1. **PostgreSQL Production Backup:**
   ```bash
   pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -Fc -f /backups/pre_migration_$(date +%Y%m%d_%H%M%S).dump
   ```
2. **SQLite Dev / Demo Backup:**
   ```bash
   sqlite3 ayursetu_dev.db ".backup '/backups/pre_migration_$(date +%Y%m%d_%H%M%S).db'"
   ```

### Migration Execution
1. **Run Alembic Migrations:**
   ```bash
   cd backend
   alembic upgrade head
   ```
2. **Apply Additive Schema Scripts (Non-destructive):**
   ```bash
   python scripts/migrate_community_collaboration.py
   ```

### Safe Rollback Procedure
If a migration fails or anomalous errors occur during deployment:
1. **Revert Application Version:**
   ```bash
   # Option A (Git / Systemd):
   git checkout <previous-release-tag>
   sudo systemctl restart aayuraura-backend aayuraura-frontend

   # Option B (Docker):
   docker compose down
   docker compose up -d --build --no-deps
   ```
2. **Revert Alembic Migration:**
   ```bash
   cd backend
   alembic downgrade -1
   ```
3. **Database Restore (If Schema or Data was Corrupted):**
   ```bash
   # PostgreSQL:
   pg_restore --clean --if-exists -h $DB_HOST -U $DB_USER -d $DB_NAME /backups/pre_migration_<timestamp>.dump

   # SQLite:
   cp /backups/pre_migration_<timestamp>.db ayursetu_dev.db
   ```

---

## 6. Post-Deployment Smoke Test Matrix

After every deployment, verify the following core flows:
1. **Health Verification:** `curl -f https://<backend-domain>/health` returns `HTTP 200` with `"status": "healthy"`.
2. **Authentication Flow:**
   - Log in as Student (`student@ayursetu.in` / `Student@123`).
   - Log in as Faculty (`faculty@ayursetu.in` / `Faculty@123`).
   - Log in as Admin (`admin@ayursetu.in` / `Admin@123`).
3. **Student Dashboard & Analytics:** Verify learning metrics, streak, and quiz scores render without errors.
4. **Interactive 3D Anatomy:** Open `/anatomy`, verify 3D Canvas mounts and systems toggle cleanly (no console exceptions).
5. **Community & Faculty Q&A:** Submit a test question in `/community`, verify faculty sees it in their queue.
6. **Admin Verification Queue:** Verify doctor and institution approval tabs render with audit logging.

---

## 7. Production Security & Hardening Checklist

- [x] **Strict Security Headers Middleware**: Responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`.
- [x] **No Secrets in Client Bundle**: Zero API keys or database connection credentials exposed to frontend.
- [x] **IDOR & Data Isolation**: All private student notes, test attempts, and progress records filtered strictly by `user_id == current_user.id`.
- [x] **Secure File Uploads**: Doctor profile photo uploads validate MIME types, enforce file size limits (<5MB), and randomize filenames using user UUIDs to prevent directory traversal.
- [x] **Input Sanitization**: HTML tags stripped and parameters escaped before database storage.
- [x] **Password Protection**: Passwords hashed with `bcrypt` (work factor 12).
- [x] **Separation of Duties**: Self-approval in administrative verification queues is strictly rejected.
