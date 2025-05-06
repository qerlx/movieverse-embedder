
import { useState, useEffect } from 'react';

// A hook to determine if the viewport is mobile
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Update the state initially
    setMatches(media.matches);
    
    // Define a callback for media query change events
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    // Add the callback as a listener for changes to the media query
    media.addEventListener('change', listener);
    
    // Remove the listener when the hook is unmounted
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
};

// Convenience hook for mobile detection
export const useIsMobile = (): boolean => {
  return useMediaQuery('(max-width: 768px)');
};

export default useIsMobile;
