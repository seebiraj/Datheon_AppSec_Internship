# 💼 Executive AppSec Project Walkthrough for LinkedIn

> **Instructions:** Copy and paste the text below into your LinkedIn post, verify that **@Datheon** is tagged, attach the provided architecture diagrams (`assets/architecture_diagram.svg` or screenshots), and paste your LinkedIn post URL back into the Datheon submission portal!

---

### 📝 LinkedIn Post Draft:

🚀 Excited to announce the completion of my **Application Security & API Pentesting Internship** with **@Datheon**! 🛡️

Over 60% of modern cloud breaches stem from **Broken Object Level Authorization (BOLA/IDOR)** and unauthenticated API endpoints. During this intensive technical program, I dove deep into the OWASP API Security Top 10 to hunt, exploit, and engineer defense-in-depth remediations for modern web applications.

Here is an executive walkthrough of the 4 security audit tasks I completed:

🔍 **Task 1: Black-Box Reconnaissance & URL Parameter Fuzzing (IDOR Discovery)**
• Conducted black-box pentesting on candidate dashboard endpoints relying on client-side routing.
• Demonstrated that manipulating query parameters (`?appId=DT-2026-001`) with zero cookies or authorization headers completely exfiltrated victim Personally Identifiable Information (PII) and confidential Directorate evaluation notes.
• Engineered an automated Python reconnaissance fuzzer and authored a formal Vulnerability Disclosure Report with a **CVSS v3.1 Base Score of 7.5 (HIGH)** (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`).

🛠️ **Task 2: Remediating Broken Object Level Authorization (BOLA/IDOR) in Node.js**
• Re-engineered vulnerable backend routes by eliminating blind single-parameter lookups.
• Implemented defensive authorization middleware cross-referencing session identities (`JWT/Cookie`) against resource ownership.
• Transformed database queries into multi-tenant scoped lookups (`WHERE id = :id AND user_id = :sessionUserId`).
• Built a 100% passing automated integration test suite verifying that cross-tenant access attempts fail gracefully with `HTTP 403 Forbidden` / `HTTP 404` without leaking database schema traces.

🍪 **Task 3: Cryptographic Session Security & Sliding Rate Limiting**
• Analyzed client-side storage risks where Cross-Site Scripting (XSS) can exfiltrate tokens from `localStorage`.
• Architected a secure session pipeline using stateless HMAC-SHA256 JWTs transported via cryptographically signed `HTTP-Only`, `SameSite=Lax`, and `Secure` cookies with automated refresh token rotation.
• Implemented an RFC 6585 sliding window counter rate limiter to throttle credential stuffing and automated ID guessing (`HTTP 429 Too Many Requests`).

🛡️ **Task 4: Public Endpoint Shielding, PII Masking & Automated DAST Pipeline**
• Designed a zero-leakage public credential verification gateway (verifying candidate application ID `DT-2026-TV82L`).
• Built a dynamic string masking engine protecting emails (`j***7@gmail.com`), phone numbers (`+91 ******3210`), and student names.
• Configured strict HTTP security headers (`Content-Security-Policy`, `HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`).
• Integrated an automated GitHub Actions CI/CD security workflow and CodeQL SAST scanning every pull request.

📦 **Full GitHub Repository & Audit Reports:**
🔗 https://github.com/seebiraj/Datheon_AppSec_Internship

A huge thank you to **@Datheon** for this industry-grade curriculum focused on practical proof of work! 🎓

**Verified Application ID:** `DT-2026-TV82L`  
**Institution:** Jeppiaar Institute of Technology  

#ApplicationSecurity #APISecurity #Cybersecurity #IDOR #BOLA #OWASP #DevSecOps #Datheon #ZeroTrust #WebSecurity #InfoSec #PenetrationTesting
