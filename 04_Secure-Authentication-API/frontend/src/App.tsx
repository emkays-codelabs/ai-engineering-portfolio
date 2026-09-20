import { Navigate, Route, Routes } from "react-router-dom";

import { AdminRoute } from "@/routes/AdminRoute";
import { AdminUsersPage } from "@/routes/AdminUsersPage";
import { DashboardPage } from "@/routes/DashboardPage";
import { LoginPage } from "@/routes/LoginPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RegisterPage } from "@/routes/RegisterPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminUsersPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
