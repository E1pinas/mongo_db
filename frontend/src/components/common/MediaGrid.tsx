import { ReactNode } from "react";

interface MediaGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
}

/**
 * MediaGrid - Grid responsive para tarjetas de contenido
 */
export default function MediaGrid({ children, columns = 6 }: MediaGridProps) {
  const gridColumns = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  };

  return <div className={`grid ${gridColumns[columns]} gap-4`}>{children}</div>;
}
