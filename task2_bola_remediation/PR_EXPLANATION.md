# Pull Request #1: Remediating Broken Object Level Authorization (BOLA/IDOR)

**PR Title:** `fix(security): implement defensive authorization middleware and multi-tenant scoped database lookups`  
**Branch:** `security/patch-bola-idor-remediation` -> `main`  
**Author:** Seebiraj V (`jeeviseebi007@gmail.com`)  
**Application ID:** `DT-2026-TV82L`  
**Target Vulnerability:** OWASP API1:2023 - Broken Object Level Authorization (CWE-639)  

---

## 1. Problem Description & Root Cause
The previous implementation of candidate and dashboard retrieval endpoints (`/api/vulnerable/candidates/:id` and `/api/vulnerable/dashboard?appId=...`) relied solely on client-side routing assumptions. The backend accepted arbitrary user-controlled parameters (`id`, `appId`, or `userId`) and queried the database blindly (`db.findByIdBlind(id)`) without:
1. Validating whether the caller possessed an active, authenticated session.
2. Cross-referencing whether the requested resource was owned by the authenticated session identity.

Consequently, an unauthenticated attacker or an authenticated User A could replace parameter values with User B's identifier (`DT-2026-001`, `DT-2026-002`) to exfiltrate private PII (emails, telephone numbers, institutional records) and sensitive internal Directorate evaluation notes.

---

## 2. Defensive Engineering Solution

### A. Defensive Middleware Layer (`src/middleware/sessionAuth.ts` & `authGuard.ts`)
- **Step 1:** Injected `requireSessionAuth` to reject unauthenticated requests immediately with `HTTP 401 Unauthorized`.
- **Step 2:** Injected `enforceObjectLevelAuthorization` to verify that the requesting user's identity (`req.user.userId` / `req.user.candidateId`) matches the requested resource. Attempts to access foreign records are blocked with `HTTP 403 Forbidden` (or `404 Not Found`).

### B. Ownership-Bound Multi-Tenant Database Query (`src/db/store.ts`)
- Removed blind queries (`SELECT * FROM candidates WHERE id = :id`).
- Implemented ownership constraints: The query now evaluates `WHERE id = :id AND (userId = :sessionUserId OR role IN ('admin', 'directorate'))`.
- If no row matches both predicates, the query returns `null`.

### C. Information Leak Suppression & Error Sanitization (`src/middleware/errorHandler.ts`)
- Suppressed internal database schemas, ORM traces, and server stack traces.
- Failed authorization checks emit uniform JSON problem details conforming to RFC 7807.

---

## 3. Automated Test Verification
A dedicated integration test suite (`tests/task2_bola_remediation.test.ts`) verifies the remediation:
- `SEC-01`: Unauthenticated request -> Rejection `401 Unauthorized` (Passed)
- `SEC-02`: User A accessing User A's record (`DT-2026-TV82L`) -> Allowed `200 OK` (Passed)
- `SEC-03`: User A attempting horizontal BOLA on User B's record (`DT-2026-001`) -> Blocked `403 Forbidden` (Passed)
- `SEC-04`: User B querying User A via query param (`?appId=DT-2026-TV82L`) -> Blocked `403 Forbidden` (Passed)
- `SEC-05`: Directorate Admin audited access -> Allowed `200 OK` (Passed)
- `SEC-06`: Sanitized error responses on missing entities -> `404 Resource Not Found`, zero stack trace leaks (Passed)
