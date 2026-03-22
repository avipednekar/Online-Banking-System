import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
import { useAuthForms } from "../hooks/useAuthForms";

export default function AuthPage() {
  const { authLoading, loginForm, registerForm, submitLogin, submitRegistration } = useAuthForms();

  return (
    <section className="auth-grid">
      <RegisterForm form={registerForm} isLoading={authLoading} onSubmit={submitRegistration} />
      <LoginForm form={loginForm} isLoading={authLoading} onSubmit={submitLogin} />
    </section>
  );
}
