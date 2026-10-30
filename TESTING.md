# AyurSetu — System Testing & Quality Assurance Guide (SIH 2026 Problem Statement 26044)

## Executive Summary
AyurSetu's test suite provides complete, non-destructive automated verification across all 16 platform phases — covering functionality, authentication, RBAC, domain business logic, assessment calculations, ML recommendation models, matching scores, industry & institution workflows, student portfolios, verification proof tokens, and security/privacy isolation.

---

## 1. Testing Architecture & Pyramid

```
                       /\
                      /  \     End-to-End User Journey QA
                     /    \    (test_end_to_end_journey.py)
                    /------\
                   /        \   Integration & Domain Workflow Tests
                  /          \  (Applications, Opportunities, Verification, Portfolio)
                 /------------\
                /              \  Unit & Algorithmic Engine Tests
               /                \ (Skill Scoring, Skill-Gap, Matching Engine, Recommendations)
              /------------------\
             /                    \ Security & Performance QA
            /                      \(test_security_privacy.py, test_performance_concurrency.py)
           /------------------------\
```

---

## 2. Test Suite Inventory (83 Total Tests Across 18 Modules)

| Test Module | Coverage Area | Test Count | Status |
| :--- | :--- | :---: | :---: |
| `test_applications.py` | Application lifecycles, matching snapshot, status transition audit trail | 7 | **PASS (100%)** |
| `test_assessment.py` | MCQ assessment start, security question leakage, submission calculation | 5 | **PASS (100%)** |
| `test_end_to_end_journey.py` | SIH 26044 multi-role journey (Student -> Industry -> Institution -> Admin) | 1 | **PASS (100%)** |
| `test_health.py` | System health check, root ping & API status | 2 | **PASS (100%)** |
| `test_industry.py` | Industry profile, unverified posting guard, candidate shortlisting & notes | 6 | **PASS (100%)** |
| `test_institution.py` | Institution dashboard, department metrics, placement rate analytics | 6 | **PASS (100%)** |
| `test_intelligence.py` | AI skill scoring engine, level calculation, decay functions | 2 | **PASS (100%)** |
| `test_matching_engine.py` | Multi-factor matching score engine, qualification weights | 4 | **PASS (100%)** |
| `test_opportunities.py` | Opportunity listing, active filters, search parameterization | 5 | **PASS (100%)** |
| `test_performance_concurrency.py`| Pagination limits, N+1 query safety, concurrent submission state isolation | 3 | **PASS (100%)** |
| `test_portfolio.py` | Student portfolio CRUD, project showcase, public slug resolution | 6 | **PASS (100%)** |
| `test_recommendations.py` | Hybrid recommendation engine, relevance scoring, dismissal | 4 | **PASS (100%)** |
| `test_security_privacy.py` | JWT security, RBAC role escalation, IDOR isolation, XSS/SQL parameterization | 5 | **PASS (100%)** |
| `test_skill_gap.py` | Target career gap analysis, missing critical skills identification | 5 | **PASS (100%)** |
| `test_skill_profile.py` | Skill profile state management, domain tags | 5 | **PASS (100%)** |
| `test_student_profile.py` | Student profile CRUD, education level validation, completion % | 6 | **PASS (100%)** |
| `test_target_career.py` | Career role listing, selection, prerequisite validation | 5 | **PASS (100%)** |
| `test_verification.py` | Verification request state machine, evidence SHA-256 hash, public lookup | 6 | **PASS (100%)** |

---

## 3. Command Line Execution Commands

### **Running Complete Backend Test Suite**
```bash
cd backend
.\venv\Scripts\python -m pytest
```

### **Running Specific Test Modules**
```bash
# Security & Privacy QA
.\venv\Scripts\python -m pytest tests/test_security_privacy.py

# End-to-End User Journey
.\venv\Scripts\python -m pytest tests/test_end_to_end_journey.py

# Verification System Tests
.\venv\Scripts\python -m pytest tests/test_verification.py
```

### **Running Next.js Frontend Verification**
```bash
cd frontend
npm run build
```

---

## 4. Quality Assurance Summary
- **Backend Test Pass Rate**: 83/83 (100%)
- **Frontend Production Build**: 34/34 routes compiled with zero errors
- **Database Schema Validation**: Alembic `upgrade head` clean sync
- **Deployment Status**: Production Ready with High Confidence.
