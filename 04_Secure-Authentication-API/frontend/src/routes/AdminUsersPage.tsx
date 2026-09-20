import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { listUsers } from "@/services/api-client";
import type { User } from "@/types/auth";

export function AdminUsersPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    listUsers(accessToken)
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"));
  }, [accessToken]);

  return (
    <main>
      <h1>All Users (Admin)</h1>
      {error && <p role="alert">{error}</p>}
      {!users && !error && <p>Loading…</p>}
      {users && (
        <table>
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.is_active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
