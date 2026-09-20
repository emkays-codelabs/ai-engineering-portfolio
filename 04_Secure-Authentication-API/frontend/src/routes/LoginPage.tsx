import { Link, useNavigate } from "react-router-dom";

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
    <main>
      <h1>Log in</h1>
      <LoginForm onSubmit={handleSubmit} />
      <p>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </main>
  );
}
