# Contributing to Aayuraura

Thank you for your interest in contributing to **Aayuraura — National Ayurvedic Education & Healthcare Intelligence Platform**.

---

## Code of Conduct & Standards

1. **Maintain Code Quality**: All contributions must pass TypeScript checks (`npx tsc --noEmit`) and backend test suites (`pytest`).
2. **Security First**:
   - Never commit sensitive keys, secrets, or personal email credentials.
   - All email registration and login must comply with the `@gmail.com` validation policy.
   - Privileged roles (`DOCTOR`, `FACULTY`, `INSTITUTION`, `ADMIN`) must require explicit institutional approval or administrative verification.
3. **Branching & Commits**:
   - Use descriptive commit messages following the standard convention: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.

---

## Development Workflow

1. Fork or clone the repository:
   ```bash
   git clone https://github.com/sarveshpawarece-ui/Ayuraura-Project.git
   ```
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Run tests locally before opening a pull request:
   ```bash
   # Backend tests
   cd backend
   pytest tests/
   
   # Frontend tests
   cd ../frontend
   npx tsc --noEmit
   npm run build
   ```
4. Open a pull request against the `main` branch.
