// 1. Define your base values and environment variables

const isLocal = import.meta.env.DEV;
const BASE_URL = isLocal 
  ? "/booking/api_bck" 
  : "https://membership.xpresshotelpos.com/booking/api_bck";
const USERNAME = import.meta.env.VITE_API_USERNAME ;
const PASSWORD = import.meta.env.VITE_API_PASSWORD ;

// 2. Export the configuration object expected by admin_api.js
export const API_CONFIG = {
  BASE_URL: BASE_URL,
  API_USER: USERNAME,
  API_PASS: PASSWORD,
};

// 3. Helper Function: Manage Hotel Parameter (URL vs LocalStorage)
// This ensures 'hotelParam' is available in localStorage for admin_api.js to read.
// export function getParameterFromUrl() {
//   // 1️⃣ Try to get from URL first
//   const params = new URLSearchParams(window.location.search);
//   const urlParam = params.get("parameter");
  
//   // 2️⃣ Get from localStorage as fallback
//   const storedParam = localStorage.getItem("hotelParam");
  
//   // 3️⃣ Use whichever is available
//   const finalParam = urlParam || storedParam || "";
  
//   // 4️⃣ Save to localStorage if from URL (for future page loads)
//   if (urlParam && urlParam !== storedParam) {
//     localStorage.setItem("hotelParam", urlParam);
//   }
  
//   return finalParam;
// }