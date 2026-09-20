import { useEffect, useState } from "react";

import { AppLayout } from "@/components/AppLayout";
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
    <AppLayout>
      <p className="page-eyebrow">Administration</p>
      <h1 className="page-title">All Users</h1>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      {!users && !error && <p className="state-msg">Loading users…</p>}

      {users && users.length === 0 && <p className="state-msg">No users registered yet.</p>}

      {users && users.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    <span className={`tag ${u.role === "admin" ? "tag--admin" : ""}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`tag ${u.is_active ? "tag--active" : ""}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
