# Zero-Trust API Architecture & Authorization Specifications

## 1. Zero-Trust Architectural Principles Applied
In traditional perimeter security models, once a client crosses the edge, internal requests are implicitly trusted. In modern microservices and API gateways, every request must be authenticated, authorized, and validated explicitly.

### Principle 1: Never Trust the Client for Object Identity
Client-side routing frameworks (such as Next.js or React Router) control UI presentation, not data access control. An API endpoint must never assume that because a user requested a dashboard containing `?appId=DT-2026-001`, they are authorized to view it.

### Principle 2: Session Ownership Binding
Every database lookup querying private tenant assets must evaluate a composite predicate:
```sql
SELECT * FROM candidates 
WHERE id = :candidate_id 
  AND (user_id = :authenticated_user_id OR :user_role = 'directorate');
```

### Principle 3: Defense-in-Depth Session Storage
* `localStorage` / `sessionStorage`: Vulnerable to Cross-Site Scripting (XSS).
* `HTTP-Only Cookies`: Inaccessible to `document.cookie` in JavaScript runtime.
* `SameSite=Lax`: Prevents cross-site request forgery in top-level state-changing navigations.
* `Secure`: Guarantees encrypted transit over TLS/HTTPS.

### Principle 4: Graceful Degradation & Zero-Leakage Error Handling
When authorization fails, the gateway emits uniform RFC 7807 problem details:
* HTTP 401 Unauthorized for missing/expired session tokens.
* HTTP 403 Forbidden or HTTP 404 Not Found for ownership mismatches.
* Internal database schemas, table names, SQL queries, and stack traces are stripped before response serialization.
