import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
    <main>
      <h1>Register</h1>
      {success ? (
        <p role="status">Account created — redirecting to login…</p>
      ) : (
        <RegisterForm onSubmit={handleSubmit} />
      )}
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
