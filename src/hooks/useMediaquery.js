import { useState, useEffect } from 'react';

/**
 * Custom hook for tracking the state of a media query.
 * @param {string} query - The media query string to watch (e.g., '(max-width: 767px)').
 * @returns {boolean} - True if the media query matches, otherwise false.
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Ensure window is defined (for server-side rendering)
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => {
      setMatches(media.matches);
    };

    // Add the event listener
    media.addEventListener('change', listener);

    // Clean up the listener on component unmount
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};