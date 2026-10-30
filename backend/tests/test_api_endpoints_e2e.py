import asyncio
import httpx
import json
import sys
import os

BASE_URL = "http://127.0.0.1:8000"
API_V1 = f"{BASE_URL}/api/v1"

DEMO_USERS = [
    ("student@ayursetu.in", "password123", "STUDENT"),
    ("doctor@ayursetu.in", "password123", "DOCTOR"),
    ("industry@ayursetu.in", "password123", "INDUSTRY"),
    ("institute@ayursetu.in", "password123", "INSTITUTION"),
    ("admin@ayursetu.in", "password123", "ADMIN"),
]

async def run_api_e2e():
    print("=========================================================")
    print("AYURSETU COMPREHENSIVE END-TO-END API & RBAC TEST RUNNER")
    print("=========================================================")
    
    report = {
        "total_endpoints_in_openapi": 0,
        "auth_tests": {"passed": 0, "failed": 0},
        "rbac_tests": {"passed": 0, "failed": 0},
        "endpoints_tested": 0,
        "endpoints_passed": 0,
        "endpoints_failed": 0,
        "failures": []
    }
    
    tokens = {}
    
    async with httpx.AsyncClient(timeout=20.0) as client:
        # 1. Fetch OpenAPI specification
        try:
            r = await client.get(f"{API_V1}/openapi.json")
            if r.status_code == 200:
                spec = r.json()
                paths = spec.get("paths", {})
                report["total_endpoints_in_openapi"] = len(paths)
                print(f"[+] Successfully loaded OpenAPI: {len(paths)} routes defined.")
            else:
                print(f"[-] Failed to load OpenAPI: status {r.status_code}")
        except Exception as e:
            print(f"[-] Error fetching openapi.json: {e}")

        # 2. Authentication: Login demo accounts
        print("\n--- 2.1 AUTHENTICATION & TOKEN ACQUISITION ---")
        for email, pwd, role in DEMO_USERS:
            try:
                res = await client.post(
                    f"{API_V1}/auth/login",
                    data={"username": email, "password": pwd},
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                if res.status_code == 200:
                    data = res.json()
                    tokens[role] = data["access_token"]
                    print(f"  [PASS] {role:12} ({email}) -> Authenticated 200 OK | Token: {tokens[role][:18]}...")
                    report["auth_tests"]["passed"] += 1
                else:
                    print(f"  [FAIL] {role:12} ({email}) -> Status {res.status_code}: {res.text}")
                    report["auth_tests"]["failed"] += 1
                    report["failures"].append(f"Login failed for {email}: {res.text}")
            except Exception as e:
                print(f"  [FAIL] {role:12} ({email}) -> Exception: {e}")
                report["auth_tests"]["failed"] += 1
                report["failures"].append(f"Login exception for {email}: {e}")
                
        # Test Invalid Credentials (Should return 400 Bad Request)
        try:
            res = await client.post(
                f"{API_V1}/auth/login",
                data={"username": "unregistered@ayursetu.org", "password": "WrongPassword999"},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            assert res.status_code == 400
            print("  [PASS] Invalid credentials check -> Correctly rejected with HTTP 400")
            report["auth_tests"]["passed"] += 1
        except Exception as e:
            print(f"  [FAIL] Invalid credentials test failed: {e}")
            report["auth_tests"]["failed"] += 1

        # 3. Public & Common GET Endpoints (No Auth Required)
        print("\n--- 2.2 PUBLIC & COMMON ENDPOINTS ---")
        public_endpoints = [
            ("/", [200]),
            ("/health", [200]),
            (f"{API_V1}/health", [200]),
            (f"{API_V1}/career-roles", [200]),
            (f"{API_V1}/skills/taxonomy", [200]),
            (f"{API_V1}/opportunities", [200]),
            (f"{API_V1}/camps", [200]),
            (f"{API_V1}/learning/shlokas", [200]),
        ]
        
        for ep, expected in public_endpoints:
            url = ep if ep.startswith("http") else f"{BASE_URL}{ep}"
            report["endpoints_tested"] += 1
            try:
                r = await client.get(url)
                if r.status_code in expected:
                    print(f"  [PASS] GET {ep:40} -> Status {r.status_code}")
                    report["endpoints_passed"] += 1
                else:
                    print(f"  [FAIL] GET {ep:40} -> Status {r.status_code} (Expected {expected})")
                    report["endpoints_failed"] += 1
                    report["failures"].append(f"GET {ep} returned {r.status_code}")
            except Exception as e:
                print(f"  [FAIL] GET {ep:40} -> Exception: {e}")
                report["endpoints_failed"] += 1
                report["failures"].append(f"GET {ep} exception: {e}")

        # 4. Role-Based Access Control (RBAC) & Protected Endpoints
        print("\n--- 2.3 ROLE-BASED ACCESS & PROTECTED MODULES ---")
        
        test_cases = [
            # Endpoint, Method, Target Role, Expected Statuses, Description
            (f"{API_V1}/students/me/profile", "GET", "STUDENT", [200], "Student Profile"),
            (f"{API_V1}/students/me/skills", "GET", "STUDENT", [200], "Student Skill Scores"),
            (f"{API_V1}/students/me/applications", "GET", "STUDENT", [200], "Student Applications"),
            (f"{API_V1}/students/me/recommendations", "GET", "STUDENT", [200], "Student Recommendations"),
            (f"{API_V1}/students/me/opportunities", "GET", "STUDENT", [200], "Student Matched Opportunities"),
            (f"{API_V1}/internships/student/history", "GET", "STUDENT", [200], "Student Internship History"),
            (f"{API_V1}/bams-ecosystem/cases", "GET", "STUDENT", [200], "BAMS Case Studies"),
            (f"{API_V1}/quiz/subjects", "GET", "STUDENT", [200], "Topic Quiz Subjects"),
            (f"{API_V1}/doctor/profile/me", "GET", "DOCTOR", [200], "Doctor Profile"),
            (f"{API_V1}/doctor/dashboard/summary", "GET", "DOCTOR", [200], "Doctor Dashboard Summary"),
            (f"{API_V1}/doctor/clinics/me", "GET", "DOCTOR", [200], "Doctor Registered Clinics"),
            (f"{API_V1}/doctor/internships/analytics", "GET", "DOCTOR", [200], "Doctor Mentorship Analytics"),
            (f"{API_V1}/doctor/internships/history", "GET", "DOCTOR", [200], "Doctor Internship History"),
            (f"{API_V1}/admin/verifications", "GET", "ADMIN", [200], "Admin Verifications List"),
            (f"{API_V1}/admin/verifications/analytics", "GET", "ADMIN", [200], "Admin Verification Analytics"),
            (f"{API_V1}/admin/organizations", "GET", "ADMIN", [200], "Admin Organizations Queue"),
            (f"{API_V1}/admin/institutions", "GET", "ADMIN", [200], "Admin Institutions Queue"),
            (f"{API_V1}/industry/dashboard", "GET", "INDUSTRY", [200], "Industry Dashboard"),
            (f"{API_V1}/institution/dashboard", "GET", "INSTITUTION", [200], "Institution Dashboard"),
            (f"{API_V1}/institution/analytics", "GET", "INSTITUTION", [200], "Institution Analytics"),
        ]
        
        for url, method, role, expected, desc in test_cases:
            report["endpoints_tested"] += 1
            token = tokens.get(role)
            if not token:
                print(f"  [SKIP] {desc} (No token for {role})")
                continue
                
            headers = {"Authorization": f"Bearer {token}"}
            try:
                if method == "GET":
                    r = await client.get(url, headers=headers)
                elif method == "POST":
                    r = await client.post(url, headers=headers)
                    
                if r.status_code in expected:
                    print(f"  [PASS] {role:11} {desc:32} -> HTTP {r.status_code}")
                    report["endpoints_passed"] += 1
                    report["rbac_tests"]["passed"] += 1
                else:
                    print(f"  [FAIL] {role:11} {desc:32} -> HTTP {r.status_code} ({r.text[:120]})")
                    report["endpoints_failed"] += 1
                    report["rbac_tests"]["failed"] += 1
                    report["failures"].append(f"{role} {desc} ({url}) returned {r.status_code}")
            except Exception as e:
                print(f"  [FAIL] {role:11} {desc:32} -> Exception: {e}")
                report["endpoints_failed"] += 1
                report["rbac_tests"]["failed"] += 1
                report["failures"].append(f"{role} {desc} exception: {e}")

        # 5. Security Check: Role Boundary Enforcement (Negative RBAC Testing)
        print("\n--- 2.4 ROLE BOUNDARY & SECURITY ENFORCEMENT ---")
        
        # Student attempting to access Admin verification queue -> Must return 403 Forbidden
        student_token = tokens.get("STUDENT")
        if student_token:
            r = await client.get(f"{API_V1}/admin/verifications", headers={"Authorization": f"Bearer {student_token}"})
            if r.status_code == 403:
                print("  [PASS] Student -> Admin Verifications correctly BLOCKED with HTTP 403 Forbidden")
                report["rbac_tests"]["passed"] += 1
            else:
                print(f"  [FAIL] Student -> Admin Verifications returned HTTP {r.status_code} (Expected 403)")
                report["rbac_tests"]["failed"] += 1
                report["failures"].append("Security Boundary: Student accessing Admin Verifications did not return 403")

        # Unauthenticated request to protected endpoint -> Must return 401 Unauthorized
        r = await client.get(f"{API_V1}/students/me/profile")
        if r.status_code == 401:
            print("  [PASS] Anonymous -> Protected Student Endpoint correctly BLOCKED with HTTP 401 Unauthorized")
            report["rbac_tests"]["passed"] += 1
        else:
            print(f"  [FAIL] Anonymous -> Protected Student Endpoint returned HTTP {r.status_code} (Expected 401)")
            report["rbac_tests"]["failed"] += 1
            report["failures"].append("Security Boundary: Anonymous access did not return 401")

    print("\n=========================================================")
    print("API & RBAC TEST SUMMARY:")
    print(f"  * Total Endpoints in OpenAPI: {report['total_endpoints_in_openapi']}")
    print(f"  * Authentication Tests Passed: {report['auth_tests']['passed']} / {report['auth_tests']['passed'] + report['auth_tests']['failed']}")
    print(f"  * RBAC & Security Tests Passed: {report['rbac_tests']['passed']} / {report['rbac_tests']['passed'] + report['rbac_tests']['failed']}")
    print(f"  * Tested Endpoints Passed: {report['endpoints_passed']} / {report['endpoints_tested']}")
    print("=========================================================")
    
    if report["failures"]:
        print(f"\n[!] Total Issues / Discrepancies Found: {len(report['failures'])}")
        for f in report["failures"]:
            print(f"  - {f}")
    else:
        print("\n[SUCCESS] ALL API & RBAC TESTS PASSED WITH ZERO ERRORS!")

if __name__ == "__main__":
    asyncio.run(run_api_e2e())
