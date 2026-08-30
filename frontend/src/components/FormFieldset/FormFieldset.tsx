import type { ChangeEventHandler, ReactNode } from "react";

interface FormFieldsetProps {
  autoFocus?: boolean;
  children?: ReactNode;
  handler: ChangeEventHandler<HTMLInputElement>;
  minLength?: number;
  name: string;
  normal?: boolean;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}

function FormFieldset({
  autoFocus,
  children,
  handler,
  minLength,
  name,
  normal,
  placeholder,
  required,
  type = "text",
  value,
}: FormFieldsetProps) {
  return (
    <fieldset className="form-group">
      <input
        autoFocus={autoFocus}
        className={`form-control${normal ? "" : " form-control-lg"}`}
        minLength={minLength}
        name={name}
        onChange={handler}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
      {children}
    </fieldset>
  );
}

export default FormFieldset;
