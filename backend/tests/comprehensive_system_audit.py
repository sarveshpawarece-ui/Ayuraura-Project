import asyncio
import httpx
import uuid
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

async def run_audit():
    print("================================================================")
    print("STARTING COMPREHENSIVE AYURSETU QUALITY & FUNCTIONAL AUDIT")
    print("================================================================")

    results = {"passed": 0, "failed": 0, "errors": []}

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=15.0) as client:
        # 1. TEST ROOT HEALTH
        try:
            r = await client.get("/")
            print(f"[TEST 1] Root API Status: {r.status_code}")
            assert r.status_code in [200, 404] # Root of api_router or base
            results["passed"] += 1
        except Exception as e:
            results["failed"] += 1
            results["errors"].append(f"Root API failed: {e}")

        # 2. TEST AUTHENTICATION: LOGIN SEEDED USERS
        tokens = {}
        users_to_test = [
            ("student@ayursetu.local", "AyurSetu@2026", "STUDENT"),
            ("industry@ayursetu.local", "AyurSetu@2026", "INDUSTRY"),
            ("institution@ayursetu.local", "AyurSetu@2026", "INSTITUTION"),
            ("admin@ayursetu.local", "AyurSetu@2026", "ADMIN"),
            ("doctor@ayursetu.in", "Doctor@123", "DOCTOR"),
        ]

        print("\n--- AUTHENTICATION AUDIT ---")
        for email, pwd, role in users_to_test:
            try:
                login_data = {"username": email, "password": pwd}
                r = await client.post("/auth/login", data=login_data)
                if r.status_code == 200:
                    token = r.json()["access_token"]
                    tokens[role] = token
                    print(f" -> Login SUCCESS for {role} ({email}) - HTTP 200")
                    results["passed"] += 1
                else:
                    print(f" -> Login FAILED for {role} ({email}) - HTTP {r.status_code}: {r.text}")
                    results["failed"] += 1
                    results["errors"].append(f"Login failed for {role}: {r.text}")
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"Login exception for {role}: {e}")

        # Test Invalid Credentials (Should fail with 400)
        try:
            r = await client.post("/auth/login", data={"username": "invalid@ayursetu.local", "password": "WrongPassword"})
            assert r.status_code == 400
            print(" -> Invalid credentials test: PASSED (HTTP 400 returned correctly)")
            results["passed"] += 1
        except Exception as e:
            results["failed"] += 1
            results["errors"].append(f"Invalid credentials test failed: {e}")

        # Test /auth/me for each logged-in role
        for role, token in tokens.items():
            try:
                headers = {"Authorization": f"Bearer {token}"}
                r = await client.get("/auth/me", headers=headers)
                assert r.status_code == 200
                assert r.json()["role"] == role
                print(f" -> GET /auth/me verified for {role}")
                results["passed"] += 1
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"/auth/me failed for {role}: {e}")

        # 3. STUDENT ECOSYSTEM AUDIT
        print("\n--- STUDENT SYSTEM AUDIT ---")
        student_headers = {"Authorization": f"Bearer {tokens.get('STUDENT')}"} if "STUDENT" in tokens else {}
        student_endpoints = [
            ("GET", "/students/me", student_headers),
            ("GET", "/students/me/skills", student_headers),
            ("GET", "/students/me/skill-gap", student_headers),
            ("GET", "/students/me/career-readiness", student_headers),
            ("GET", "/students/me/opportunities", student_headers),
            ("GET", "/career-roles", {}),
            ("GET", "/skills/taxonomy", {}),
            ("GET", "/assessments/questions", student_headers),
            ("GET", "/student/portfolio/me", student_headers),
            ("GET", "/student/verifications/me", student_headers),
            ("GET", "/recommendations/students/me", student_headers),
            ("GET", "/recommendations/students/me/career-paths", student_headers),
            ("GET", "/recommendations/students/me/learning-path", student_headers),
        ]

        for method, ep, hdrs in student_endpoints:
            try:
                r = await client.request(method, ep, headers=hdrs)
                if r.status_code == 200:
                    print(f" -> {method} {ep} - HTTP 200 OK")
                    results["passed"] += 1
                else:
                    print(f" -> {method} {ep} - HTTP {r.status_code}: {r.text[:120]}")
                    results["failed"] += 1
                    results["errors"].append(f"{method} {ep} returned {r.status_code}")
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{method} {ep} exception: {e}")

        # 4. DOCTOR SYSTEM AUDIT
        print("\n--- DOCTOR SYSTEM AUDIT ---")
        doctor_headers = {"Authorization": f"Bearer {tokens.get('DOCTOR')}"} if "DOCTOR" in tokens else {}
        doctor_endpoints = [
            ("GET", "/doctors/me/profile", doctor_headers),
            ("GET", "/doctors/me/clinics", doctor_headers),
            ("GET", "/doctors/me/internships", doctor_headers),
            ("GET", "/doctors/me/applications", doctor_headers),
            ("GET", "/doctors/me/sessions", doctor_headers),
            ("GET", "/doctors/experts", {}),
            ("GET", "/guidance/sessions", {}),
            ("GET", "/guidance/sessions/recommended", doctor_headers),
        ]

        for method, ep, hdrs in doctor_endpoints:
            try:
                r = await client.request(method, ep, headers=hdrs)
                if r.status_code in [200, 201]:
                    print(f" -> {method} {ep} - HTTP {r.status_code} OK")
                    results["passed"] += 1
                else:
                    print(f" -> {method} {ep} - HTTP {r.status_code}: {r.text[:120]}")
                    results["failed"] += 1
                    results["errors"].append(f"{method} {ep} returned {r.status_code}")
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{method} {ep} exception: {e}")

        # 5. INSTITUTION SYSTEM AUDIT
        print("\n--- INSTITUTION SYSTEM AUDIT ---")
        inst_headers = {"Authorization": f"Bearer {tokens.get('INSTITUTION')}"} if "INSTITUTION" in tokens else {}
        inst_endpoints = [
            ("GET", "/institution/profile", inst_headers),
            ("GET", "/institution/students", inst_headers),
            ("GET", "/institution/analytics", inst_headers),
            ("GET", "/institution/opportunities", inst_headers),
        ]

        for method, ep, hdrs in inst_endpoints:
            try:
                r = await client.request(method, ep, headers=hdrs)
                if r.status_code == 200:
                    print(f" -> {method} {ep} - HTTP 200 OK")
                    results["passed"] += 1
                else:
                    print(f" -> {method} {ep} - HTTP {r.status_code}: {r.text[:120]}")
                    results["failed"] += 1
                    results["errors"].append(f"{method} {ep} returned {r.status_code}")
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{method} {ep} exception: {e}")

        # 6. INDUSTRY SYSTEM AUDIT
        print("\n--- INDUSTRY SYSTEM AUDIT ---")
        ind_headers = {"Authorization": f"Bearer {tokens.get('INDUSTRY')}"} if "INDUSTRY" in tokens else {}
        ind_endpoints = [
            ("GET", "/industry/profile", ind_headers),
            ("GET", "/industry/opportunities", ind_headers),
            ("GET", "/industry/applications", ind_headers),
            ("GET", "/industry/analytics", ind_headers),
            ("GET", "/opportunities", {}),
        ]

        for method, ep, hdrs in ind_endpoints:
            try:
                r = await client.request(method, ep, headers=hdrs)
                if r.status_code == 200:
                    print(f" -> {method} {ep} - HTTP 200 OK")
                    results["passed"] += 1
                else:
                    print(f" -> {method} {ep} - HTTP {r.status_code}: {r.text[:120]}")
                    results["failed"] += 1
                    results["errors"].append(f"{method} {ep} returned {r.status_code}")
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{method} {ep} exception: {e}")

        # 7. CAMPS & NGO AUDIT
        print("\n--- CAMPS & NGO AUDIT ---")
        camp_endpoints = [
            ("GET", "/camps", {}),
            ("GET", "/community/volunteers", {}),
            ("GET", "/community/herbs", {}),
            ("GET", "/community/events", {}),
        ]

        for method, ep, hdrs in camp_endpoints:
            try:
                r = await client.request(method, ep, headers=hdrs)
                if r.status_code == 200:
                    print(f" -> {method} {ep} - HTTP 200 OK")
                    results["passed"] += 1
                else:
                    print(f" -> {method} {ep} - HTTP {r.status_code}: {r.text[:120]}")
                    results["failed"] += 1
                    results["errors"].append(f"{method} {ep} returned {r.status_code}")
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{method} {ep} exception: {e}")

        # 8. QUIZ & LEARNING AUDIT
        print("\n--- QUIZ & LEARNING AUDIT ---")
        quiz_endpoints = [
            ("GET", "/quiz/subjects", student_headers),
            ("GET", "/learning/shlokas", {}),
            ("GET", "/learning/treatises", {}),
        ]

        for method, ep, hdrs in quiz_endpoints:
            try:
                r = await client.request(method, ep, headers=hdrs)
                if r.status_code == 200:
                    print(f" -> {method} {ep} - HTTP 200 OK")
                    results["passed"] += 1
                else:
                    print(f" -> {method} {ep} - HTTP {r.status_code}: {r.text[:120]}")
                    results["failed"] += 1
                    results["errors"].append(f"{method} {ep} returned {r.status_code}")
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{method} {ep} exception: {e}")

        # 9. BAMS LEARNING ECOSYSTEM AUDIT
        print("\n--- BAMS ECOSYSTEM AUDIT ---")
        bams_endpoints = [
            ("GET", "/bams-ecosystem/pipeline", student_headers),
            ("GET", "/bams-ecosystem/weak-topics", student_headers),
            ("GET", "/bams-ecosystem/cases", {}),
            ("GET", "/bams-ecosystem/timetable/preferences", student_headers),
        ]

        for method, ep, hdrs in bams_endpoints:
            try:
                r = await client.request(method, ep, headers=hdrs)
                if r.status_code == 200:
                    print(f" -> {method} {ep} - HTTP 200 OK")
                    results["passed"] += 1
                else:
                    print(f" -> {method} {ep} - HTTP {r.status_code}: {r.text[:120]}")
                    results["failed"] += 1
                    results["errors"].append(f"{method} {ep} returned {r.status_code}")
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{method} {ep} exception: {e}")

    print("\n================================================================")
    print(f"AUDIT COMPLETE. PASSED: {results['passed']}, FAILED: {results['failed']}")
    if results["errors"]:
        print("ERRORS DISCOVERED:")
        for err in results["errors"]:
            print(f"  * {err}")
    print("================================================================")
    return results

if __name__ == "__main__":
    res = asyncio.run(run_audit())
    sys.exit(0 if res["failed"] == 0 else 1)
