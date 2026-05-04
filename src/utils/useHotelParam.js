import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * Simple hook to get hotel parameter - checks URL first, then localStorage
 * Use this hook in ANY component that needs to make API calls
 */
export const useHotelParam = () => {
  const [searchParams] = useSearchParams();
  const [hotelParam, setHotelParam] = useState(null);

  useEffect(() => {
    // ✅ 1. Try URL first
    const urlParam = searchParams.get("parameter");
    
    // ✅ 2. Fallback to localStorage
    const storedParam = localStorage.getItem("hotelParam");
    
    // ✅ 3. Use whichever is available
    const finalParam = urlParam || storedParam;

    // ✅ 4. Save to localStorage if from URL
    if (urlParam && urlParam !== storedParam) {
      localStorage.setItem("hotelParam", urlParam);
    }

    setHotelParam(finalParam);
  }, [searchParams]);

  return hotelParam;
};
