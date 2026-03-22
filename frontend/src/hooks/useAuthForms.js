import { initialLoginForm, initialRegisterForm } from "../constants/forms";
import { useAuth } from "../context/AuthContext";
import { useForm } from "./useForm";
import { useToast } from "./useToast";
import { collectFieldErrors } from "../utils/formatters";
import { validateLogin, validateRegistration } from "../utils/validation";

export function useAuthForms() {
  const { login, register, authLoading } = useAuth();
  const { notifyError, notifySuccess } = useToast();
  const loginForm = useForm(initialLoginForm);
  const registerForm = useForm(initialRegisterForm);

  function handleApiError(title, error, form) {
    form.setErrors(error.fields || {});
    notifyError(title, error.message || "Request failed", collectFieldErrors(error.fields));
  }

  async function submitLogin(event) {
    event.preventDefault();

    if (!loginForm.validate(validateLogin)) {
      notifyError("Login failed", "Please correct the highlighted fields.");
      return;
    }

    try {
      const { response, profile } = await login(loginForm.values);
      loginForm.reset();
      notifySuccess(
        profile?.role === "ADMIN" ? "Admin signed in" : "Signed in",
        response.message || "Login successful."
      );
    } catch (error) {
      handleApiError("Login failed", error, loginForm);
    }
  }

  async function submitRegistration(event) {
    event.preventDefault();

    if (!registerForm.validate(validateRegistration)) {
      notifyError("Registration failed", "Please correct the highlighted fields.");
      return;
    }

    try {
      const { response } = await register(registerForm.values);
      registerForm.reset(initialRegisterForm);
      loginForm.reset(initialLoginForm);
      notifySuccess(
        "Customer onboarded",
        response.message || "Registration completed successfully.",
        ["KYC status is pending review."]
      );
    } catch (error) {
      handleApiError("Registration failed", error, registerForm);
    }
  }

  return {
    authLoading,
    loginForm,
    registerForm,
    submitLogin,
    submitRegistration
  };
}
