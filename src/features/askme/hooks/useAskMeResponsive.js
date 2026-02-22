import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 640;

/**
 * Tracks whether the viewport is mobile-sized (≤ 640 px).
 * Centralises the mobile/desktop JS branching point for the AskMe feature;
 * consumers can use `isMobile` for device-specific behaviour without repeating
 * the breakpoint logic or adding duplicate media-query listeners.
 */
export function useAskMeResponsive() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handleChange = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return { isMobile };
}
