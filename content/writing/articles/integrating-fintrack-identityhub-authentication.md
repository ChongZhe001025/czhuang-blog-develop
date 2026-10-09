# Integrating Authentication Across FinTrack and IdentityHub

Moving sign-in into a shared identity service changes more than the login page. The client, identity provider, API middleware and application authorization checks all need to agree on redirects, token lifetime and the meaning of an authenticated request.

The HomeLab conversations followed this integration across IdentityHub and FinTrack: project setup, login and registration flows, redirects, API `401` errors, password login, token storage and security review.

## Define the browser flow before debugging individual screens

Write the complete flow down:

```text
FinTrack -> IdentityHub sign-in -> callback to FinTrack
         -> establish application session -> call protected API
```

For every transition, identify the expected state: which service owns the login screen, how the callback is validated, where the application obtains identity claims, and what happens when a token expires. A successful redirect is only one step; the API still has to validate the caller.

The service boundary is explicit in the implementation: IdentityHub validates the bearer JWT, requires an `access` token, and checks the session when the token carries a session ID. FinTrack then verifies the claims include FinTrack product access before placing the user and claims in request context. A valid identity token without product entitlement should therefore be rejected as forbidden rather than treated as a successful FinTrack login.

```go
if !claims.HasProductAccess("fintrack") {
    c.AbortWithStatusJSON(http.StatusForbidden,
        gin.H{"error": "FinTrack access is required"})
    return
}
```

The integration work exposed several distinct failure classes:

- login succeeds but the user is not returned to the application;
- the client calls the wrong service origin and receives `401`;
- registration is available when the product intends to restrict it;
- logout updates the UI but leaves authentication state usable;
- refresh behavior differs between the identity service and the client.

Treat each as a contract or state-transition issue rather than changing the login page until the symptom disappears.

Registration mode is another service boundary. FinTrack supports `open` and `restricted` configuration: the browser can show or hide registration, while the backend/IdentityHub policy must enforce whether an account may be created. The setting needs to match the execution path (Compose environment versus Vite environment); a frontend-only restriction is not an authorization control.

## Make authorization fail closed

A security review flagged a suspicious path where missing identity claims could be interpreted as authenticated. Verify the middleware's control flow and add a regression test for requests with no claims. Missing identity evidence must not become an authenticated state.

Test the boundary cases explicitly:

| Request state | Expected result |
|---|---|
| No token or identity claims | Reject as unauthenticated |
| Invalid or expired access token | Reject or enter the defined refresh flow |
| Valid identity, insufficient permission | Authenticated but forbidden |
| Valid identity and permission | Continue to the protected operation |
| Logout completed | Clear the client session and reject subsequent protected calls |

Authentication answers “who is this caller?” Authorization answers “may this caller do this?” Keeping those checks separate makes both the code and error responses easier to reason about.

## Review token storage and configuration

The review also raised the XSS exposure of storing access and refresh tokens in `localStorage`. That approach is convenient for browser clients, but injected script can read stored values. Evaluate the threat model and whether a server-managed session or `HttpOnly`, `Secure`, appropriately scoped cookies fit the architecture. If browser storage remains, reduce token lifetime and strengthen content-security and XSS protections.

Keep public client configuration distinct from secrets. A browser client identifier may be public by design, but callback origins, issuer URLs and environment-specific endpoints still need explicit configuration. Never place client secrets in frontend bundles.

## Test the service boundary, not only the UI

The project conversations included login restrictions, password login, 401 handling, refresh-token lifetime and increased client/console test coverage. Build tests around the contract between services:

- allowed and denied redirect origins;
- registration enabled and disabled;
- missing, invalid and expired identity claims;
- refresh success and refresh failure;
- logout followed by a protected API request;
- environment configuration pointing to the intended identity service.

Run browser-level tests for the user journey and API-level tests for the security boundary. A button appearing or a login page loading does not prove that authorization is correct.

Before publication, re-check the current code against the security review findings. The conversations record issues worth testing; they do not, by themselves, prove every item was fixed.

The current source has separate IdentityHub middleware tests and FinTrack auth middleware/API tests. Keep the checks separate: token validity and revocation belong to the identity boundary; product entitlement and application data access belong to FinTrack. The review also flagged `localStorage` token exposure and absent-claims handling for explicit verification. Do not infer those findings were fully remediated until the corresponding regression cases and browser storage behavior are confirmed.
