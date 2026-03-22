import { useState } from "react";

export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  function setValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: ""
    }));
  }

  function reset(nextValues = initialValues) {
    setValues(nextValues);
    setErrors({});
  }

  function validate(validator) {
    const nextErrors = validator(values);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  return {
    values,
    errors,
    setValues,
    setErrors,
    setValue,
    reset,
    validate
  };
}
