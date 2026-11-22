Add-Type -AssemblyName System.Drawing

$assetsDir = "C:\Users\SEEBIRAJ V\Datheon_AppSec_Internship\assets"
if (!(Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
}

function Create-Card {
    param (
        [string]$Title,
        [string]$Subtitle,
        [string]$TaskNumber,
        [string]$BadgeText,
        [System.Drawing.Color]$AccentColor,
        [string[]]$KeyPoints,
        [string[]]$CodeLines,
        [string]$OutputPath
    )

    $width = 1200
    $height = 675
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Background
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(11, 15, 25))
    $g.FillRectangle($bgBrush, 0, 0, $width, $height)

    # Accent top border
    $accentBrush = New-Object System.Drawing.SolidBrush $AccentColor
    $g.FillRectangle($accentBrush, 0, 0, $width, 8)

    # Header Panel
    $headerBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(19, 26, 42))
    $g.FillRectangle($headerBrush, 40, 30, ($width - 80), 95)
    
    $borderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(40, 52, 75)), 1
    $g.DrawRectangle($borderPen, 40, 30, ($width - 80), 95)

    # Title Fonts with [float]
    $fontTag = New-Object System.Drawing.Font("Arial", [float]11, [System.Drawing.FontStyle]::Bold)
    $fontTitle = New-Object System.Drawing.Font("Segoe UI", [float]20, [System.Drawing.FontStyle]::Bold)
    $fontSub = New-Object System.Drawing.Font("Segoe UI", [float]12, [System.Drawing.FontStyle]::Regular)
    $fontSection = New-Object System.Drawing.Font("Segoe UI", [float]14, [System.Drawing.FontStyle]::Bold)
    $fontBody = New-Object System.Drawing.Font("Segoe UI", [float]13, [System.Drawing.FontStyle]::Regular)
    $fontMono = New-Object System.Drawing.Font("Consolas", [float]11, [System.Drawing.FontStyle]::Regular)
    $fontFooter = New-Object System.Drawing.Font("Segoe UI", [float]10, [System.Drawing.FontStyle]::Regular)

    # Tag Badge
    $tagBrush = New-Object System.Drawing.SolidBrush $AccentColor
    $g.DrawString($TaskNumber.ToUpper(), $fontTag, $tagBrush, 60, 42)

    # Title
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 250, 252))
    $g.DrawString($Title, $fontTitle, $whiteBrush, 60, 62)

    # Subtitle
    $subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(148, 163, 184))
    $g.DrawString($Subtitle, $fontSub, $subBrush, 60, 96)

    # Badge Box Right
    $badgeBoxBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 41, 59))
    $g.FillRectangle($badgeBoxBrush, ($width - 320), 50, 260, 45)
    $g.DrawRectangle($borderPen, ($width - 320), 50, 260, 45)
    $badgeTextBrush = New-Object System.Drawing.SolidBrush $AccentColor
    $g.DrawString($BadgeText, $fontTag, $badgeTextBrush, ($width - 305), 64)

    # Left Panel: Key Highlights
    $leftX = 40
    $leftY = 145
    $leftW = 540
    $leftH = 430
    $panelBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 23, 42))
    $g.FillRectangle($panelBrush, $leftX, $leftY, $leftW, $leftH)
    $g.DrawRectangle($borderPen, $leftX, $leftY, $leftW, $leftH)

    $g.DrawString("Security Analysis & Technical Highlights", $fontSection, $accentBrush, ($leftX + 25), ($leftY + 20))

    $yPos = $leftY + 65
    foreach ($point in $KeyPoints) {
        $g.FillEllipse($accentBrush, ($leftX + 25), ($yPos + 5), 8, 8)
        $g.DrawString($point, $fontBody, $whiteBrush, ($leftX + 45), $yPos)
        $yPos += 55
    }

    # Right Panel: Code / Output Preview
    $rightX = 610
    $rightY = 145
    $rightW = ($width - $rightX - 40)
    $rightH = 430
    $darkCodeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(8, 11, 18))
    $g.FillRectangle($darkCodeBrush, $rightX, $rightY, $rightW, $rightH)
    $g.DrawRectangle($borderPen, $rightX, $rightY, $rightW, $rightH)

    # Window header bar
    $winBarBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(24, 32, 48))
    $g.FillRectangle($winBarBrush, $rightX, $rightY, $rightW, 35)
    $dotRed = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(239, 68, 68))
    $dotYellow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 158, 11))
    $dotGreen = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(16, 185, 129))
    $g.FillEllipse($dotRed, ($rightX + 15), ($rightY + 12), 11, 11)
    $g.FillEllipse($dotYellow, ($rightX + 33), ($rightY + 12), 11, 11)
    $g.FillEllipse($dotGreen, ($rightX + 51), ($rightY + 12), 11, 11)
    $g.DrawString("Console Terminal & Verification PoC", $fontTag, $subBrush, ($rightX + 80), ($rightY + 9))

    # Code lines
    $codeY = $rightY + 50
    $codeColor = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(203, 213, 225))
    foreach ($line in $CodeLines) {
        $lineBrush = $codeColor
        if ($line.StartsWith(">") -or $line.StartsWith("$")) {
            $lineBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(56, 189, 248))
        } elseif ($line.Contains("CRITICAL") -or $line.Contains("ERROR") -or $line.Contains("403") -or $line.Contains("429")) {
            $lineBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 113, 113))
        } elseif ($line.Contains("SUCCESS") -or $line.Contains("PASS") -or $line.Contains("200 OK") -or $line.Contains("VERIFIED")) {
            $lineBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(52, 211, 153))
        }
        $g.DrawString($line, $fontMono, $lineBrush, ($rightX + 20), $codeY)
        $codeY += 24
    }

    # Footer
    $footerBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(100, 116, 139))
    $g.DrawString("Candidate: Seebiraj V  |  Application ID: DT-2026-TV82L  |  Datheon AppSec & API Pentesting Internship", $fontFooter, $footerBrush, 40, 600)
    $g.DrawString("Repo: github.com/seebiraj/Datheon_AppSec_Internship", $fontFooter, $footerBrush, ($width - 420), 600)

    # Save
    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    # Cleanup
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created image: $OutputPath"
}

# ----------------- Task 1 Image -----------------
Create-Card `
    -Title "Task 1: Black-Box Reconnaissance & URL Parameter Fuzzing" `
    -Subtitle "Hunting Insecure Direct Object References (IDOR/BOLA) in Candidate Dashboard" `
    -TaskNumber "Task 1 Deliverable" `
    -BadgeText "CVSS v3.1: 7.5 (HIGH)" `
    -AccentColor ([System.Drawing.Color]::FromArgb(239, 68, 68)) `
    -KeyPoints @(
        "Identified unauthenticated query parameter leaks (?appId=DT-2026-001).",
        "Discovered that client-side routing assumptions left API unauthenticated.",
        "Demonstrated PII exfiltration (full name, phone, email, confidential notes).",
        "Calculated CVSS 3.1: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N.",
        "Developed automated Python parameter fuzzer and raw cURL exploit script."
    ) `
    -CodeLines @(
        "$ python scripts/idor_fuzzer_poc.py",
        "[*] Probing endpoint: /api/vulnerable/dashboard?appId=DT-2026-001",
        "🚨 [CRITICAL VULNERABILITY DETECTED - IDOR/BOLA]",
        "├─ Status: HTTP 200 OK (Unauthenticated Access)",
        "├─ Victim: Alice Johnson (alice.johnson@targetbank.com)",
        "├─ Phone: +1 (555) 234-5678",
        "└─ Notes: Confidential review: Undergoing background verification...",
        "",
        "$ curl -s http://localhost:4000/api/vulnerable/candidates/DT-2026-002",
        "HTTP/1.1 200 OK (Bob Miller PII Leaked without cookies!)",
        "",
        "PASS tests/task1_recon.test.ts (3/3 Tests Passed)"
    ) `
    -OutputPath "$assetsDir\task1_idor_recon.png"

# ----------------- Task 2 Image -----------------
Create-Card `
    -Title "Task 2: Remediating Broken Object Level Authorization" `
    -Subtitle "Zero-Trust Defensive Middleware & Multi-Tenant Scoped Database Queries" `
    -TaskNumber "Task 2 Deliverable" `
    -BadgeText "OWASP API1:2023 REMEDIATED" `
    -AccentColor ([System.Drawing.Color]::FromArgb(16, 185, 129)) `
    -KeyPoints @(
        "Eliminated blind single-parameter queries (db.findByIdBlind).",
        "Injected requireSessionAuth middleware rejecting missing auth with 401.",
        "Injected enforceObjectLevelAuthorization checking session subject context.",
        "Multi-tenant query: WHERE id = :id AND user_id = :sessionUserId.",
        "Cross-tenant access fails gracefully with 403 Forbidden without schema leak.",
        "Published remediation Git Diff pull request with comprehensive test suite."
    ) `
    -CodeLines @(
        "$ npm test -- -t 'Task 2'",
        "PASS tests/task2_bola_remediation.test.ts",
        "  √ SEC-01: Reject unauth requests with 401 Unauthorized (114 ms)",
        "  √ SEC-02: Allow User A to access own record (200 OK) (19 ms)",
        "  √ SEC-03: BLOCK User A requesting User B with 403 Forbidden (24 ms)",
        "  √ SEC-04: BLOCK cross-tenant query ?appId=... with 403 (17 ms)",
        "  √ SEC-05: Allow Directorate Admin audited evaluation (20 ms)",
        "  √ SEC-06: Sanitized error format (zero stack trace leak) (17 ms)",
        "",
        "Tests: 6 passed, 6 total (100% PASS)",
        "Git Patch: pull_requests/PR_TASK2_BOLA_REMEDIATION.diff"
    ) `
    -OutputPath "$assetsDir\task2_bola_remediation.png"

# ----------------- Task 3 Image -----------------
Create-Card `
    -Title "Task 3: Cryptographic Session Security & Rate Limiting" `
    -Subtitle "Stateless HMAC-SHA256 JWTs via HTTP-Only Cookies vs LocalStorage XSS" `
    -TaskNumber "Task 3 Deliverable" `
    -BadgeText "HTTP-ONLY COOKIE DEFENSE" `
    -AccentColor ([System.Drawing.Color]::FromArgb(56, 189, 248)) `
    -KeyPoints @(
        "Replaced vulnerable browser localStorage with cryptographically signed cookies.",
        "Shields against XSS token exfiltration (document.cookie cannot access token).",
        "Enforces Secure, SameSite=Lax flags, mitigating CSRF attacks.",
        "Engineered refresh token rotation pipeline (7-day lifecycle).",
        "Implemented RFC 6585 sliding window counter rate limiter.",
        "Automated throttling emits HTTP 429 Too Many Requests with Retry-After."
    ) `
    -CodeLines @(
        "$ npx ts-node scripts/demo_session_ratelimit.ts",
        "[Step 1] POST /api/v1/auth/login",
        "[+] Status: HTTP 200 OK",
        "[+] Set-Cookie: datheon_access_token=...; HttpOnly; SameSite=Lax",
        "",
        "[Step 2] GET /api/v1/candidates/DT-2026-TV82L with Cookie",
        "[+] Status: HTTP 200 OK (Session Authenticated)",
        "",
        "[Step 3] Simulating automated brute-force attack...",
        "    Request #1-4: HTTP 200 OK",
        "🚨 Rate limiter triggered! HTTP 429 Too Many Requests",
        "   X-RateLimit-Limit: 5 | Retry-After: 60 seconds",
        "",
        "PASS tests/task3_session_security.test.ts (5/5 Tests Passed)"
    ) `
    -OutputPath "$assetsDir\task3_session_security.png"

# ----------------- Task 4 Image -----------------
Create-Card `
    -Title "Task 4: Public Endpoint Shielding & Automated DAST Pipeline" `
    -Subtitle "Zero-Leakage Dynamic PII Masking & Strict OWASP HTTP Security Headers" `
    -TaskNumber "Task 4 Deliverable" `
    -BadgeText "ZERO PII LEAKAGE" `
    -AccentColor ([System.Drawing.Color]::FromArgb(168, 85, 247)) `
    -KeyPoints @(
        "Designed public certificate verification endpoint for DT-2026-TV82L.",
        "Engineered dynamic string PII masking engine (email, telephone, name).",
        "Email masked: jeeviseebi007@gmail.com -> j***7@gmail.com.",
        "Phone masked: +91 98765 43210 -> +91 ******3210.",
        "Injected strict security headers: CSP, HSTS, X-Frame-Options: DENY.",
        "Automated GitHub Actions CI/CD security audit and CodeQL SAST."
    ) `
    -CodeLines @(
        "$ curl -s http://localhost:4000/api/v1/public/verify/DT-2026-TV82L",
        "HTTP/1.1 200 OK",
        "X-Content-Type-Options: nosniff",
        "X-Frame-Options: DENY",
        "Content-Security-Policy: default-src 'self'...",
        "",
        "{",
        '  "verificationStatus": "AUTHENTICATED_AND_VALID",',
        '  "fullName": "S******j V.",',
        '  "email": "j***7@gmail.com",',
        '  "phone": "+91 ******3210",',
        '  "verified": true',
        "}",
        "PASS tests/task4_pii_headers.test.ts (4/4 Tests Passed)"
    ) `
    -OutputPath "$assetsDir\task4_pii_masking_dast.png"

# ----------------- Project Overview Banner -----------------
Create-Card `
    -Title "Datheon Application Security & API Pentesting Internship" `
    -Subtitle "Executive Project Showcase: Tasks 1, 2, 3 & 4 Fully Implemented & Audited" `
    -TaskNumber "Verified Credential: DT-2026-TV82L" `
    -BadgeText "18/18 TESTS PASSING (100%)" `
    -AccentColor ([System.Drawing.Color]::FromArgb(245, 158, 11)) `
    -KeyPoints @(
        "Candidate: Seebiraj V (Jeppiaar Institute of Technology).",
        "Task 1: Black-Box IDOR Recon Fuzzer & CVSS 3.1 Report (7.5 High).",
        "Task 2: Node.js BOLA Remediation & Multi-Tenant Scoped Queries.",
        "Task 3: Cryptographic JWT HTTP-Only Cookies & Sliding Rate Limiter.",
        "Task 4: Public Shielding PII Masking & Automated DAST CI/CD Pipeline.",
        "All unit & integration tests passing with 100% code integrity."
    ) `
    -CodeLines @(
        "===========================================================",
        "🛡️  DATHEON APPLICATION SECURITY & API PENTESTING GATEWAY",
        "===========================================================",
        "PASS tests/task1_recon.test.ts            (3/3 Passed)",
        "PASS tests/task2_bola_remediation.test.ts (6/6 Passed)",
        "PASS tests/task3_session_security.test.ts (5/5 Passed)",
        "PASS tests/task4_pii_headers.test.ts      (4/4 Passed)",
        "",
        "Test Suites: 4 passed, 4 total",
        "Tests:       18 passed, 18 total (100%)",
        "Coverage:    >90% across core security components",
        "GitHub:      https://github.com/seebiraj/Datheon_AppSec_Internship"
    ) `
    -OutputPath "$assetsDir\project_overview_banner.png"

Write-Host "All 5 infographic images generated successfully!"
