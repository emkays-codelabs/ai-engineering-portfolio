import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { AdminRoute } from "@/routes/AdminRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import * as useAuthModule from "@/hooks/useAuth";
import type { AuthContextValue } from "@/features/auth/AuthContext";

function mockAuth(overrides: Partial<AuthContextValue>) {
  vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
    user: null,
    accessToken: null,
    status: "unauthenticated",
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
}

describe("ProtectedRoute", () => {
  it("redirects to /login when unauthenticated", () => {
    mockAuth({ status: "unauthenticated" });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<p>login page</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<p>dashboard</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("renders the protected content when authenticated", () => {
    mockAuth({ status: "authenticated" });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<p>login page</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<p>dashboard</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });
});

describe("AdminRoute", () => {
  it("shows a forbidden message for a non-admin user", () => {
    mockAuth({
      status: "authenticated",
      user: {
        id: "1",
        email: "user@example.com",
        role: "user",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<p>admin panel</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText("admin panel")).not.toBeInTheDocument();
    expect(screen.getByText(/do not have access/i)).toBeInTheDocument();
  });

  it("renders the admin content for an admin user", () => {
    mockAuth({
      status: "authenticated",
      user: {
        id: "1",
        email: "admin@example.com",
        role: "admin",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<p>admin panel</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("admin panel")).toBeInTheDocument();
  });
});
