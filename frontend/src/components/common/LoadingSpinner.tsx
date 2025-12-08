interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * LoadingSpinner - Indicador de carga reutilizable
 */
export default function LoadingSpinner({
  text = "Cargando...",
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="text-center py-12">
      <div
        className={`inline-block ${sizeClasses[size]} border-4 border-neutral-600 border-t-white rounded-full animate-spin`}
      />
      {text && <p className="text-neutral-400 mt-4">{text}</p>}
    </div>
  );
}
