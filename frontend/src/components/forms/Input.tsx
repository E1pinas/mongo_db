import { forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Input - Componente de input reutilizable
 *
 * Input de texto con soporte para label, error y helper text
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2">{label}</label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 transition ${
            error
              ? "border-red-500 focus:ring-red-500/50"
              : "border-neutral-700 focus:ring-green-500/50"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
