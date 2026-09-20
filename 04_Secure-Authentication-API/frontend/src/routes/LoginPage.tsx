import { Link, useNavigate } from "react-router-dom";

import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "@/features/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(email: string, password: string) {
    await login(email, password);
    navigate("/dashboard");
  }

  return (
    <AuthLayout>
      <p className="auth-card__eyebrow">Welcome back</p>
      <h2 className="auth-card__title">Log in</h2>
      <p className="auth-card__sub">Use your registered email and password to continue.</p>

      <LoginForm onSubmit={handleSubmit} />

      <p className="auth-card__foot">
        Don&apos;t have an account? <Link to="/register">Create one</Link>
      </p>
    </AuthLayout>
  );
}
