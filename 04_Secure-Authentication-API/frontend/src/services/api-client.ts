import { ApiError, type ApiErrorBody, type TokenResponse, type User } from "@/types/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    const body = await response.json();
    if (body && typeof body === "object" && "code" in body && "message" in body) {
      return body as ApiErrorBody;
    }
  } catch {
    // response body wasn't JSON at all — fall through to the generic envelope
  }
  return {
    error: true,
    code: "UNKNOWN_ERROR",
    message: `Request failed with status ${response.status}`,
    details: {},
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorBody(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function register(email: string, password: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<User>(response);
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams({ username: email, password }).toString();
  const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "include", // required: the refresh token is set as an HttpOnly cookie
    body,
  });
  return handleResponse<TokenResponse>(response);
}

export async function refresh(): Promise<TokenResponse> {
  const response = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse<TokenResponse>(response);
}

export async function logout(): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse<void>(response);
}

export async function getCurrentUser(accessToken: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<User>(response);
}

export async function listUsers(accessToken: string): Promise<User[]> {
  const response = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<User[]>(response);
}
