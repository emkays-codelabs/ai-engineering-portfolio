import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

/** Branded shell for authenticated pages — header nav, content area, footer. */
export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="app-header__nav">
          <span className="brand">SaffronyxAI.in</span>
          <Link to="/dashboard">Dashboard</Link>
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        </nav>
        <div className="app-header__nav">
          {user && <span className="app-header__user">{user.email}</span>}
          <button type="button" className="btn btn--ghost" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <span>© 2026 SaffronyxAI.in · All Rights Reserved</span>
        <span className="brand-tagline">Designing Intelligent Systems That Last</span>
      </footer>
    </div>
  );
}
