import { memo } from "react";

export const FormField = memo(function FormField({
  label,
  name,
  value,
  onChange,
  error,
  as = "input",
  type = "text",
  options = [],
  required = false,
  ...rest
}) {
  const Component = as;

  return (
    <label className="form-field">
      <span className="field-label">{label}</span>
      {Component === "select" ? (
        <select
          name={name}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          required={required}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Component
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          required={required}
          {...rest}
        />
      )}
      {error ? (
        <span id={`${name}-error`} className="field-error">
          {error}
        </span>
      ) : null}
    </label>
  );
});
