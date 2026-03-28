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
    "h-8 w-full border-0 border-b-2 bg-transparent text-sm font-medium text-[#102146] outline-none transition placeholder:text-[#9aa6bf] focus:ring-0",
    Icon ? "pl-6" : "",
    trailing || isSelect ? "pr-9" : "pr-1",
    error ? "border-rose-400" : "border-[#bcc6d9] focus:border-[#1fce91]"
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={`block ${className}`.trim()}>
      <span className="mb-2 block text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-[#7083ab]">
        {label}
      </span>
      <div className="group relative rounded-2xl bg-[#f2f4f6] px-4 pb-3 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition duration-200 hover:bg-[#edf1f6] focus-within:bg-white">
        {Icon ? (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-[1.05rem] h-4 w-4 text-[#7e8ba8] transition group-focus-within:text-[#1fce91]"
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
              className={`${controlClassName} appearance-none`}
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
              className="pointer-events-none absolute right-4 top-[1.05rem] h-4 w-4 text-[#7e8ba8]"
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
        {trailing ? <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div> : null}
      </div>
      {error ? (
        <span id={`${name}-error`} className="mt-2 block text-xs font-medium text-rose-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
