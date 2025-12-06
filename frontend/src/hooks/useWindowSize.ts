import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Hook para obtener dimensiones de ventana
 * Útil para comportamiento responsive
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook para detectar breakpoints de Tailwind
 */
export function useBreakpoint() {
  const { width } = useWindowSize();

  return {
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    isLarge: width >= 1280,
    width,
  };
}
