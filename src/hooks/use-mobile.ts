
import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 640; // Matching Tailwind's sm: breakpoint

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Set initial value
    checkMobile();
    
    // Add resize listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      checkMobile();
    };
    
    // Modern API
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    } 
    // Fallback for older browsers
    else {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, []);

  return !!isMobile;
};

// Create an alias for backwards compatibility
export const useIsMobile = useMobile;
