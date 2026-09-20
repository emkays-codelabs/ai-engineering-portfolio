import { afterEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser, listUsers, login, logout, refresh, register } from "@/services/api-client";
import { ApiError } from "@/types/auth";

function mockFetchOnce(status: number, body: unknown) {
  // Fetch spec forbids a body on 204/205/304 responses, even an empty one.
  const response =
    status === 204
      ? new Response(null, { status })
      : new Response(JSON.stringify(body), {
          status,
          headers: { "Content-Type": "application/json" },
        });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
}

describe("api-client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("register() posts JSON and returns the created user", async () => {
    const user = {
      id: "1",
      email: "alice@example.com",
      role: "user",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    };
    mockFetchOnce(201, user);

    const result = await register("alice@example.com", "a-password");

    expect(result).toEqual(user);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/register"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("register() throws ApiError with the parsed error envelope on failure", async () => {
    mockFetchOnce(409, {
      error: true,
      code: "EMAIL_ALREADY_REGISTERED",
      message: "Email already registered: alice@example.com",
      details: {},
    });

    await expect(register("alice@example.com", "a-password")).rejects.toMatchObject({
      status: 409,
      code: "EMAIL_ALREADY_REGISTERED",
    });
  });

  it("login() posts form-encoded credentials with credentials included", async () => {
    mockFetchOnce(200, { access_token: "token123", token_type: "bearer" });

    const result = await login("alice@example.com", "a-password");

    expect(result.access_token).toBe("token123");
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.credentials).toBe("include");
    expect(init.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(init.body).toContain("username=alice%40example.com");
  });

  it("getCurrentUser() sends the bearer token in the Authorization header", async () => {
    const user = {
      id: "1",
      email: "alice@example.com",
      role: "user",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    };
    mockFetchOnce(200, user);

    const result = await getCurrentUser("token123");

    expect(result).toEqual(user);
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer token123");
  });

  it("refresh() and logout() include credentials so the refresh cookie is sent", async () => {
    mockFetchOnce(200, { access_token: "new-token", token_type: "bearer" });
    await refresh();
    let [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.credentials).toBe("include");

    mockFetchOnce(204, null);
    await logout();
    [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.credentials).toBe("include");
  });

  it("listUsers() sends the bearer token and returns the array of users", async () => {
    const users = [
      {
        id: "1",
        email: "admin@example.com",
        role: "admin",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
      },
    ];
    mockFetchOnce(200, users);

    const result = await listUsers("admin-token");

    expect(result).toEqual(users);
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain("/api/v1/admin/users");
    expect(init.headers.Authorization).toBe("Bearer admin-token");
  });

  it("throws a fallback ApiError when the error body isn't the expected shape", async () => {
    mockFetchOnce(500, "Internal Server Error");

    await expect(register("a@example.com", "pw")).rejects.toBeInstanceOf(ApiError);
  });
});
