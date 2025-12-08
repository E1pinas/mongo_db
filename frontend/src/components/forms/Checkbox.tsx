import { forwardRef, InputHTMLAttributes } from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

/**
 * Checkbox - Componente de checkbox reutilizable
 *
 * Checkbox con soporte para label y descripción
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = "", ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          className={`mt-1 w-5 h-5 bg-neutral-800 border-neutral-700 rounded focus:ring-2 focus:ring-green-500/50 transition cursor-pointer ${className}`}
          {...props}
        />
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label className="block text-sm font-medium cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-neutral-400 mt-1">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
