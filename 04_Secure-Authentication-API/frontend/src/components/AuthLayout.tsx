import type { ReactNode } from "react";

/** Split-screen branded shell for the unauthenticated pages (login / register). */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div>
          <span className="brand">SaffronyxAI.in</span>
          <h1 className="auth-aside__headline">Secure Authentication API</h1>
          <p className="auth-aside__sub">
            JWT authentication with refresh-token rotation, reuse detection, and server-side
            role enforcement.
          </p>
          <ul className="auth-aside__points">
            <li>Rotating refresh tokens — replayed tokens are rejected</li>
            <li>Roles verified server-side on every request</li>
            <li>Refresh token stored in an HttpOnly cookie, never in localStorage</li>
          </ul>
        </div>
        <p className="brand-tagline">Designing Intelligent Systems That Last</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
