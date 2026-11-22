# CVSS v3.1 Severity Scoring Reference Guide

**Vulnerability Target:** Broken Object Level Authorization (BOLA/IDOR) on Student Dashboard Endpoint  
**Evaluator:** Seebiraj V (DT-2026-TV82L)  
**Standard:** FIRST Common Vulnerability Scoring System v3.1  

---

## Metric Breakdown & Equations

### Base Metrics Evaluation

1. **Attack Vector (AV): Network [0.85]**  
   The vulnerable endpoint (`/api/vulnerable/dashboard?appId=...`) is bound to the public internet network stack.

2. **Attack Complexity (AC): Low [0.77]**  
   No specialized conditions, race conditions, or timing attacks are required. Simply modifying the string in the URL parameters triggers unauthorized disclosure.

3. **Privileges Required (PR): None [0.85]**  
   The vulnerability exists on an unauthenticated interface. Stripping all session cookies and authorization tokens still successfully executes the query.

4. **User Interaction (UI): None [0.85]**  
   No victim action is necessary to trigger the data leak.

5. **Scope (S): Unchanged [6.42]**  
   The compromised resource (candidate database) resides within the same security authority boundary.

6. **Confidentiality Impact (C): High [0.56]**  
   Total disclosure of candidate Personally Identifiable Information (PII), academic records, contact numbers, and confidential review notes.

7. **Integrity Impact (I): None [0.0]**  
   The probed dashboard endpoint is a read-only HTTP `GET` handler.

8. **Availability Impact (A): None [0.0]**  
   Exploiting the endpoint does not crash the database or degrade application uptime.

---

## Mathematical Computation

$$
\text{ISS} = 1 - \big[(1 - \text{Impact}_{\text{Conf}}) \times (1 - \text{Impact}_{\text{Integ}}) \times (1 - \text{Impact}_{\text{Avail}})\big]
$$
$$
\text{ISS} = 1 - \big[(1 - 0.56) \times (1 - 0) \times (1 - 0)\big] = 0.56
$$

$$
\text{Impact} = 6.42 \times \text{ISS} = 6.42 \times 0.56 = 3.5952
$$

$$
\text{Exploitability} = 8.22 \times \text{AV} \times \text{AC} \times \text{PR} \times \text{UI}
$$
$$
\text{Exploitability} = 8.22 \times 0.85 \times 0.77 \times 0.85 \times 0.85 \approx 3.88
$$

$$
\text{BaseScore} = \text{RoundUp}(\min(\text{Impact} + \text{Exploitability}, 10)) = \text{RoundUp}(3.5952 + 3.88) = \mathbf{7.5}
$$

**Final Base Score:** `7.5 HIGH`  
**Vector String:** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`
