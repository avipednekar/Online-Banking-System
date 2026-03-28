import { ChevronDown } from "lucide-react";

export function VaultField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  as = "input",
  type = "text",
  options = [],
  required = false,
  trailing = null,
  className = "",
  ...rest
}) {
  const isSelect = as === "select";
  const controlClassName = [
    "vault-field-control",
    Icon ? "has-leading-icon" : "",
    trailing || isSelect ? "has-trailing-control" : "",
    error ? "has-error" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={`vault-field ${className}`.trim()}>
      <span className="vault-field-label">
        {label}
      </span>
      <div className="vault-field-shell">
        {Icon ? (
          <Icon
            aria-hidden="true"
            className="vault-field-icon"
            strokeWidth={1.8}
          />
        ) : null}
        {isSelect ? (
          <>
            <select
              name={name}
              value={value}
              onChange={(event) => onChange(name, event.target.value)}
              onBlur={(event) => onBlur?.(name, event.target.value, event)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${name}-error` : undefined}
              required={required}
              className={`${controlClassName} vault-select`.trim()}
              {...rest}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="vault-field-chevron"
              strokeWidth={1.8}
            />
          </>
        ) : (
          <input
            name={name}
            type={type}
            value={value}
            onChange={(event) => onChange(name, event.target.value)}
            onBlur={(event) => onBlur?.(name, event.target.value, event)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${name}-error` : undefined}
            required={required}
            className={controlClassName}
            {...rest}
          />
        )}
        {trailing ? <div className="vault-field-trailing">{trailing}</div> : null}
      </div>
      {error ? (
        <span id={`${name}-error`} className="vault-field-error">
          {error}
        </span>
      ) : null}
    </label>
  );
}
