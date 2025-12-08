import { forwardRef, TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Textarea - Componente de textarea reutilizable
 *
 * Textarea con soporte para label, error y helper text
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", rows = 4, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2">{label}</label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full px-4 py-2 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
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

Textarea.displayName = "Textarea";

export default Textarea;
