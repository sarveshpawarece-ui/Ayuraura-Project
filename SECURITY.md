# AyurSetu — Security & Privacy Architecture Specification (SIH 2026 Problem Statement 26044)

## Executive Summary
AyurSetu implements a multi-layered security architecture designed to enforce strictly controlled role-based access, data privacy isolation, tamper-evident cryptographic verification, and parameterization against web vulnerabilities.

---

## 1. Authentication & JWT Token Security

### **Token Architecture**
- **Algorithm**: HS256 JWT Signed Tokens
- **Secret Key Isolation**: Managed via environment variables (`JWT_SECRET_KEY`)
- **Payload Claims**:
  ```json
  {
    "sub": "user_uuid_here",
    "role": "STUDENT",
    "exp": 1756548000
  }
  ```
- **Validation Controls**:
  - Missing token requests return `HTTP 401 Unauthorized`
  - Tampered or forged JWT signatures return `HTTP 401 Unauthorized`
  - Expired tokens require re-authentication via standard OAuth2 password flow

---

## 2. Role-Based Access Control (RBAC) Matrix

| Endpoint Group | STUDENT | INDUSTRY | INSTITUTION | FACULTY | ADMIN | PUBLIC |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `/api/v1/students/me/*` | **ALLOWED** | FORBIDDEN (403) | FORBIDDEN (403) | FORBIDDEN (403) | FORBIDDEN (403) | FORBIDDEN (401) |
| `/api/v1/student/portfolio` | **ALLOWED** | FORBIDDEN (403) | FORBIDDEN (403) | FORBIDDEN (403) | FORBIDDEN (403) | FORBIDDEN (401) |
| `/api/v1/industry/*` | FORBIDDEN (403) | **ALLOWED** | FORBIDDEN (403) | FORBIDDEN (403) | FORBIDDEN (403) | FORBIDDEN (401) |
| `/api/v1/institution/*` | FORBIDDEN (403) | FORBIDDEN (403) | **ALLOWED** | FORBIDDEN (403) | FORBIDDEN (403) | FORBIDDEN (401) |
| `/api/v1/admin/verifications/*` | FORBIDDEN (403) | FORBIDDEN (403) | FORBIDDEN (403) | FORBIDDEN (403) | **ALLOWED** | FORBIDDEN (401) |
| `/api/v1/public/*` | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** |

---

## 3. IDOR & Data Privacy Isolation Rules

### **Application Isolation**
Students can ONLY query their own submitted applications (`/api/v1/students/me/applications`). Attempting to fetch another student's application using a foreign UUID returns `HTTP 404 Not Found` or `HTTP 403 Forbidden`.

### **Public Portfolio Privacy Sanitization**
When a student publishes a public portfolio accessible via `/api/v1/public/portfolio/{slug}`:
- **Exposed Fields**: Name, Headline, Summary, Published Projects, Verified Skill Badges.
- **Sanitized / Omitted Fields**: User Account Password Hashes, Private Applications History, Internal Reviewer Notes, Unverified Evidence Document Filepaths, Private Contact Emails (unless explicitly opted-in).

### **Verification Evidence Cryptographic Hashing**
Every uploaded verification evidence document produces a SHA-256 integrity hash stored in `verification_evidence.sha256_hash` to detect document tampering.

### **Separation of Duties Rule**
The Verification Engine explicitly blocks self-approval: `reviewer_id != submitted_by`. An admin or reviewer attempting to approve their own request is rejected with `HTTP 400 Bad Request`.

---

## 4. Input Sanitization & Parameterization

- **SQL Injection Prevention**: Built entirely on Async SQLAlchemy ORM using parameterized queries (`select()`, `where()`). Raw SQL queries are prohibited.
- **XSS Payload Handling**: Input strings containing HTML/JS tags (`<script>`) are stored as escaped literal strings and sanitized prior to client UI rendering.

---

## 5. Security Audit Status
- **JWT Security & Tamper Detection**: Verified (`test_security_privacy.py`)
- **RBAC Role Escalation Guard**: Verified (`test_security_privacy.py`)
- **IDOR Isolation Guard**: Verified (`test_security_privacy.py`)
- **Public Proof Token Sanitization**: Verified (`test_security_privacy.py`)
- **SQL / XSS Parameterization**: Verified (`test_security_privacy.py`)
