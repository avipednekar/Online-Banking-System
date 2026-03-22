import { FormField } from "../forms/FormField";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";

export function LoginForm({ form, isLoading, onSubmit }) {
  return (
    <Panel>
      <h2>Customer and admin sign in</h2>
      <p className="muted">
        Role-aware access switches the interface after authentication without changing the login
        endpoint.
      </p>
      <form className="form-grid compact-grid" onSubmit={onSubmit}>
        <FormField
          label="Username"
          name="username"
          value={form.values.username}
          onChange={form.setValue}
          error={form.errors.username}
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.values.password}
          onChange={form.setValue}
          error={form.errors.password}
          required
        />
        <SubmitButton
          isLoading={isLoading}
          idleLabel="Login"
          loadingLabel="Signing in..."
          disabled={isLoading}
        />
      </form>
    </Panel>
  );
}
