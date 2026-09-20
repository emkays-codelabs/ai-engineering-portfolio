import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <main>
      <h1>Dashboard</h1>
      {user && (
        <dl>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Role</dt>
          <dd>{user.role}</dd>
        </dl>
      )}
      {user?.role === "admin" && <Link to="/admin">Admin: view all users</Link>}
      <button onClick={handleLogout}>Log out</button>
    </main>
  );
}
