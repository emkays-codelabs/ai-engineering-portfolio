import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthLayout } from "@/components/AuthLayout";
import { RegisterForm } from "@/features/auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  async function handleSubmit(email: string, password: string) {
    await register(email, password);
    setSuccess(true);
    window.setTimeout(() => navigate("/login"), 1500);
  }

  return (
    <AuthLayout>
      <p className="auth-card__eyebrow">Get started</p>
      <h2 className="auth-card__title">Create account</h2>
      <p className="auth-card__sub">
        New accounts are always created with the standard user role.
      </p>

      {success ? (
        <p className="notice" role="status">
          Account created — redirecting to login…
        </p>
      ) : (
        <RegisterForm onSubmit={handleSubmit} />
      )}

      <p className="auth-card__foot">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
