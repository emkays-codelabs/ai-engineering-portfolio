import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

export function AdminRoute() {
  const { status, user } = useAuth();

  if (status === "loading") {
    return <p>Loading…</p>;
  }
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== "admin") {
    return <p role="alert">You do not have access to this resource.</p>;
  }
  return <Outlet />;
}
