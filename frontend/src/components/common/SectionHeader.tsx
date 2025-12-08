import { ReactNode } from "react";
import Button from "./Button";

interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  rightElement?: ReactNode;
}

/**
 * SectionHeader - Encabezado de sección con título y acción opcional
 */
export default function SectionHeader({
  title,
  action,
  rightElement,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm text-neutral-400 hover:text-white font-semibold transition-colors"
        >
          {action.label}
        </button>
      )}
      {rightElement && rightElement}
    </div>
  );
}
