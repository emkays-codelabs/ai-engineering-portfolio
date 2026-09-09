/**
 * Fetch wrapper around the AgentFlow backend API.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

// Thin fetch wrapper around the AgentFlow backend (backend/app/main.py).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error || `Request to ${path} failed (${response.status})`);
  }
  return body;
}

export function getHealth() {
  return request("/api/health");
}

export function runAgent(query, mode = "auto") {
  return request("/api/run", {
    method: "POST",
    body: JSON.stringify({ query, mode }),
  });
}

export function runBenchmark() {
  return request("/api/benchmark", { method: "POST" });
}
