import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/features/auth/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@/services/api-client";
import type { User } from "@/types/auth";

vi.mock("@/services/api-client");

const testUser: User = {
  id: "1",
  email: "alice@example.com",
  role: "user",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
};

function Probe() {
  const { status, user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="email">{user?.email ?? "none"}</span>
      <button onClick={() => login("alice@example.com", "a-password")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe("AuthProvider", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("becomes authenticated on mount when a valid refresh cookie already exists", async () => {
    vi.mocked(api.refresh).mockResolvedValue({ access_token: "token", token_type: "bearer" });
    vi.mocked(api.getCurrentUser).mockResolvedValue(testUser);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("email")).toHaveTextContent("alice@example.com");
  });

  it("becomes unauthenticated on mount when there is no valid refresh cookie", async () => {
    vi.mocked(api.refresh).mockRejectedValue(new Error("no cookie"));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"),
    );
    expect(screen.getByTestId("email")).toHaveTextContent("none");
  });

  it("login() transitions to authenticated with the returned user", async () => {
    vi.mocked(api.refresh).mockRejectedValue(new Error("no cookie"));
    vi.mocked(api.login).mockResolvedValue({ access_token: "token", token_type: "bearer" });
    vi.mocked(api.getCurrentUser).mockResolvedValue(testUser);
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"),
    );

    await user.click(screen.getByText("login"));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("email")).toHaveTextContent("alice@example.com");
  });

  it("logout() transitions back to unauthenticated and clears the user", async () => {
    vi.mocked(api.refresh).mockResolvedValue({ access_token: "token", token_type: "bearer" });
    vi.mocked(api.getCurrentUser).mockResolvedValue(testUser);
    vi.mocked(api.logout).mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));

    await user.click(screen.getByText("logout"));

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"),
    );
    expect(screen.getByTestId("email")).toHaveTextContent("none");
  });
});
