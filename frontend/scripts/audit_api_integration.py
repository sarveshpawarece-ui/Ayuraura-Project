import os
import re
import json
import httpx

FRONTEND_SRC = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
OPENAPI_URL = "http://127.0.0.1:8000/api/v1/openapi.json"

# Regex to find api calls: api.get("..."), api.post(`...`), etc.
API_CALL_REGEX = re.compile(r'\bapi\.(get|post|put|patch|delete)\s*(?:<[^>]+>)?\s*\(\s*([`\'"])(.*?)\2', re.DOTALL)
FETCH_CALL_REGEX = re.compile(r'\bfetch\s*\(\s*([`\'"])(.*?)\1', re.DOTALL)

def normalize_path(path):
    # Strip template literals like ${id}, ${opportunity_id}, ${token}
    # Replace ${...} with {param}
    p = re.sub(r'\$\{[^}]+\}', '{param}', path)
    # Strip query string ?...
    p = p.split('?')[0]
    # Strip trailing slashes
    p = p.rstrip('/')
    return p

def matches_openapi(call_path, openapi_paths):
    # If call_path starts with /api/v1, check if the client already prepends it
    # Note: frontend api instance uses baseURL: "http://localhost:8000/api/v1"
    # So if frontend calls "/students/me/profile", the actual request is "/api/v1/students/me/profile".
    candidates = []
    if call_path.startswith("/api/v1/"):
        candidates.append(call_path)
    else:
        candidates.append(f"/api/v1{call_path if call_path.startswith('/') else '/' + call_path}")
        candidates.append(call_path)
        
    for cand in candidates:
        cand_norm = normalize_path(cand)
        for op in openapi_paths:
            op_norm = re.sub(r'\{[^}]+\}', '{param}', op).rstrip('/')
            if cand_norm == op_norm:
                return True, op
                
    return False, None

def run_audit():
    print("=========================================================")
    print("FRONTEND-BACKEND INTEGRATION & ENDPOINT AUDIT")
    print("=========================================================")
    
    # 1. Load OpenAPI paths
    try:
        r = httpx.get(OPENAPI_URL, timeout=10.0)
        openapi_data = r.json()
        openapi_paths = set(openapi_data.get("paths", {}).keys())
        print(f"[+] Loaded {len(openapi_paths)} backend endpoints from OpenAPI specification.")
    except Exception as e:
        print(f"[-] Could not load OpenAPI: {e}")
        return
        
    # 2. Walk through frontend/src and inspect all TS/TSX files
    total_files = 0
    total_api_calls = 0
    matched_calls = []
    unmatched_calls = []
    potential_double_prefix = []
    
    for root, dirs, files in os.walk(FRONTEND_SRC):
        for f in files:
            if f.endswith(".tsx") or f.endswith(".ts"):
                total_files += 1
                filepath = os.path.join(root, f)
                relpath = os.path.relpath(filepath, FRONTEND_SRC)
                
                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                        content = file.read()
                        
                    # Find api.<method> calls
                    for match in API_CALL_REGEX.finditer(content):
                        method = match.group(1).upper()
                        raw_url = match.group(3).strip()
                        total_api_calls += 1
                        
                        # Check for double prefix
                        if raw_url.startswith("/api/v1") or raw_url.startswith("api/v1"):
                            potential_double_prefix.append((relpath, method, raw_url))
                            
                        matched, op_route = matches_openapi(raw_url, openapi_paths)
                        if matched:
                            matched_calls.append((relpath, method, raw_url, op_route))
                        else:
                            # If it's an external url or relative like "../", ignore or flag
                            if not raw_url.startswith("http") and not raw_url.startswith("//"):
                                unmatched_calls.append((relpath, method, raw_url))
                except Exception as ex:
                    print(f"[-] Error reading {relpath}: {ex}")
                    
    print(f"[+] Scanned {total_files} frontend files.")
    print(f"[+] Detected {total_api_calls} API invocations in frontend code.")
    print(f"[+] Matched with Backend OpenAPI: {len(matched_calls)}")
    print(f"[!] Unmatched / Discrepancy Invocations: {len(unmatched_calls)}")
    print(f"[!] Potential Double-Prefix (/api/v1) Invocations: {len(potential_double_prefix)}")
    
    if potential_double_prefix:
        print("\n--- POTENTIAL DOUBLE PREFIX DETECTED ---")
        for file, method, url in potential_double_prefix[:10]:
            print(f"  * {file} -> {method} '{url}'")
            
    if unmatched_calls:
        print("\n--- UNMATCHED CALLS DETECTED (POTENTIAL BROKEN ENDPOINTS) ---")
        # Group by url
        grouped = {}
        for file, method, url in unmatched_calls:
            norm = normalize_path(url)
            grouped.setdefault(norm, []).append((file, method, url))
            
        for norm, occurrences in list(grouped.items())[:20]:
            print(f"\n  Endpoint: '{norm}' (x{len(occurrences)} occurrences)")
            for file, method, raw_url in occurrences[:3]:
                print(f"    - [{method}] in {file}")
                
    # Save full audit report to JSON
    audit_results = {
        "total_files_scanned": total_files,
        "total_api_calls": total_api_calls,
        "matched_count": len(matched_calls),
        "unmatched_count": len(unmatched_calls),
        "double_prefix_count": len(potential_double_prefix),
        "unmatched_details": [{"file": f, "method": m, "url": u} for f, m, u in unmatched_calls],
        "double_prefix_details": [{"file": f, "method": m, "url": u} for f, m, u in potential_double_prefix]
    }
    
    out_file = os.path.join(os.path.dirname(__file__), "api_audit_results.json")
    with open(out_file, "w", encoding="utf-8") as out:
        json.dump(audit_results, out, indent=2)
    print(f"\n[+] Full audit results written to: {out_file}")

if __name__ == "__main__":
    run_audit()
