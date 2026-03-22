import { useState } from "react";
import { createInitialFormErrors, initialLoginForm, initialRegisterForm } from "../../constants/forms";
import { useAuth } from "../../context/AuthContext";
import { collectFieldErrors } from "../../utils/formatters";

function ButtonLabel({ active, idleLabel, loadingLabel }) {
  if (!active) {
    return idleLabel;
  }

  return (
    <span className="button-content">
      <span className="button-spinner" aria-hidden="true" />
      {loadingLabel}
    </span>
  );
}

export function AuthScreen({ notify }) {
  const { login, register, authLoading } = useAuth();
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [formErrors, setFormErrors] = useState(createInitialFormErrors);
  const [activeAction, setActiveAction] = useState("");

  function clearFormErrors(formKey) {
    setFormErrors((current) => ({
      ...current,
      [formKey]: {}
    }));
  }

  function updateField(setter, formKey, field, value) {
    setter((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({
      ...current,
      [formKey]: {
        ...current[formKey],
        [field]: ""
      }
    }));
  }

  function renderFieldError(formKey, field) {
    const message = formErrors[formKey]?.[field];
    return message ? <span className="field-error">{message}</span> : null;
  }

  function renderFormAlert(formKey) {
    const hasErrors = Object.values(formErrors[formKey] || {}).some(Boolean);
    return hasErrors ? (
      <div className="inline-alert" role="alert">
        Please correct the highlighted fields before continuing.
      </div>
    ) : null;
  }

  function handleApiError(title, error, formKey) {
    setFormErrors((current) => ({
      ...current,
      [formKey]: error.fields || {}
    }));
    notify("error", title, error.message || "Request failed", collectFieldErrors(error.fields));
  }

  async function handleRegister(event) {
    event.preventDefault();
    clearFormErrors("register");
    setActiveAction("register");
    try {
      const { response } = await register(registerForm);
      setRegisterForm(initialRegisterForm);
      setLoginForm(initialLoginForm);
      notify(
        "success",
        "Customer onboarded",
        response.message || "Registration completed successfully.",
        ["KYC status is pending review."]
      );
    } catch (error) {
      handleApiError("Registration failed", error, "register");
    } finally {
      setActiveAction("");
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    clearFormErrors("login");
    setActiveAction("login");
    try {
      const { response, profile } = await login(loginForm);
      setLoginForm(initialLoginForm);
      notify(
        "success",
        profile?.role === "ADMIN" ? "Admin signed in" : "Signed in",
        response.message || "Login successful."
      );
    } catch (error) {
      handleApiError("Login failed", error, "login");
    } finally {
      setActiveAction("");
    }
  }

  return (
    <section className="auth-grid">
      <form className="panel" onSubmit={handleRegister}>
        <h2>Customer onboarding</h2>
        <p className="muted">
          Capture the core KYC profile now. New registrations start in pending review.
        </p>
        {renderFormAlert("register")}
        <label>
          Full name
          <input
            value={registerForm.fullName}
            onChange={(event) =>
              updateField(setRegisterForm, "register", "fullName", event.target.value)
            }
            required
          />
          {renderFieldError("register", "fullName")}
        </label>
        <label>
          Username
          <input
            value={registerForm.username}
            onChange={(event) =>
              updateField(setRegisterForm, "register", "username", event.target.value)
            }
            required
          />
          {renderFieldError("register", "username")}
        </label>
        <label>
          Email
          <input
            type="email"
            value={registerForm.email}
            onChange={(event) => updateField(setRegisterForm, "register", "email", event.target.value)}
            required
          />
          {renderFieldError("register", "email")}
        </label>
        <label>
          Password
          <input
            type="password"
            value={registerForm.password}
            onChange={(event) =>
              updateField(setRegisterForm, "register", "password", event.target.value)
            }
            required
          />
          {renderFieldError("register", "password")}
        </label>
        <label>
          Phone number
          <input
            value={registerForm.phoneNumber}
            onChange={(event) =>
              updateField(setRegisterForm, "register", "phoneNumber", event.target.value)
            }
            required
          />
          {renderFieldError("register", "phoneNumber")}
        </label>
        <label>
          Gender
          <select
            value={registerForm.gender}
            onChange={(event) => updateField(setRegisterForm, "register", "gender", event.target.value)}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          {renderFieldError("register", "gender")}
        </label>
        <label>
          Occupation
          <input
            value={registerForm.occupation}
            onChange={(event) =>
              updateField(setRegisterForm, "register", "occupation", event.target.value)
            }
            required
          />
          {renderFieldError("register", "occupation")}
        </label>
        <label>
          Address line 1
          <input
            value={registerForm.addressLine1}
            onChange={(event) =>
              updateField(setRegisterForm, "register", "addressLine1", event.target.value)
            }
            required
          />
          {renderFieldError("register", "addressLine1")}
        </label>
        <label>
          Address line 2
          <input
            value={registerForm.addressLine2}
            onChange={(event) =>
              updateField(setRegisterForm, "register", "addressLine2", event.target.value)
            }
          />
        </label>
        <label>
          City
          <input
            value={registerForm.city}
            onChange={(event) => updateField(setRegisterForm, "register", "city", event.target.value)}
            required
          />
          {renderFieldError("register", "city")}
        </label>
        <label>
          State
          <input
            value={registerForm.state}
            onChange={(event) => updateField(setRegisterForm, "register", "state", event.target.value)}
            required
          />
          {renderFieldError("register", "state")}
        </label>
        <label>
          Postal code
          <input
            value={registerForm.postalCode}
            onChange={(event) =>
              updateField(setRegisterForm, "register", "postalCode", event.target.value)
            }
            required
          />
          {renderFieldError("register", "postalCode")}
        </label>
        <label>
          Country
          <input
            value={registerForm.country}
            onChange={(event) =>
              updateField(setRegisterForm, "register", "country", event.target.value)
            }
            required
          />
          {renderFieldError("register", "country")}
        </label>
        <label>
          Date of birth
          <input
            type="date"
            value={registerForm.dateOfBirth}
            onChange={(event) =>
              updateField(setRegisterForm, "register", "dateOfBirth", event.target.value)
            }
            required
          />
          {renderFieldError("register", "dateOfBirth")}
        </label>
        <button type="submit" disabled={authLoading}>
          <ButtonLabel
            active={activeAction === "register"}
            idleLabel="Register"
            loadingLabel="Registering..."
          />
        </button>
      </form>

      <form className="panel" onSubmit={handleLogin}>
        <h2>Customer and admin sign in</h2>
        <p className="muted">
          Central management uses the same secure login endpoint and routes by role after authentication.
        </p>
        {renderFormAlert("login")}
        <label>
          Username
          <input
            value={loginForm.username}
            onChange={(event) => updateField(setLoginForm, "login", "username", event.target.value)}
            required
          />
          {renderFieldError("login", "username")}
        </label>
        <label>
          Password
          <input
            type="password"
            value={loginForm.password}
            onChange={(event) => updateField(setLoginForm, "login", "password", event.target.value)}
            required
          />
          {renderFieldError("login", "password")}
        </label>
        <button type="submit" disabled={authLoading}>
          <ButtonLabel
            active={activeAction === "login"}
            idleLabel="Login"
            loadingLabel="Signing in..."
          />
        </button>
      </form>
    </section>
  );
}
