// This relative path is non-negotiable. It MUST start with '/api' to trigger
// the proxy rule defined in your vite.config.js.
const isLocal = import.meta.env.DEV;

// AUTOMATIC SWITCHING:
// 1. If Local: Use "/booking/api" so it goes through your Vite Proxy (Fixes CORS)
// 2. If Live: Use the full URL because cPanel doesn't have a proxy
export const API_BASE = isLocal 
  ? "/booking/api_bck" 
  : "https://membership.xpresshotelpos.com/booking/api_bck";

// --- Common Credentials ---
// These are static credentials from the API documentation.
const COMMON_CREDENTIALS = {
  UserName: import.meta.env.VITE_USER_API_USERNAME,
  Password: import.meta.env.VITE_USER_API_PASSWORD,
};


// --- Dynamic Hotel Parameter with localStorage Support ---
// ✅ UPDATED: This function now preserves the parameter across page reloads
function getParameterFromUrl() {
  // 1️⃣ Try to get from URL first
  const params = new URLSearchParams(window.location.search);
  const urlParam = params.get("parameter");
  
  // 2️⃣ Get from localStorage as fallback
  const storedParam = localStorage.getItem("hotelParam");
  
  // 3️⃣ Use whichever is available
  const finalParam = urlParam || storedParam || "";
  
  // 4️⃣ Save to localStorage if from URL (for future page loads)
  if (urlParam && urlParam !== storedParam) {
    localStorage.setItem("hotelParam", urlParam);
    // console.log("✅ Saved parameter to localStorage:", urlParam);
  }
  
  // console.log("🔍 Using parameter:", finalParam);
  return finalParam;
}

// --- API Endpoint Configurations ---

// ✅ The 'Url' for each configuration now correctly and reliably points to the local proxy path.
export const HOTEL_DETAILS_CONFIG = {
  ...COMMON_CREDENTIALS,
  Parameter: getParameterFromUrl(),
  Url: `${API_BASE}/get_hotel_details.php`,
};

export const ROOM_RATES_CONFIG = {
  ...COMMON_CREDENTIALS,
  Parameter: getParameterFromUrl(),
  Url: `${API_BASE}/get_room_rates.php`,
};

export const TAXES_CONFIG = {
  ...COMMON_CREDENTIALS,
  Parameter: getParameterFromUrl(),
  Url: `${API_BASE}/get_taxes.php`,
};

// [NEW] Configuration for sending the Booking Voucher

export const SAVE_BOOKING_CONFIG = {
  ...COMMON_CREDENTIALS,
  Parameter: getParameterFromUrl(),
  Url: `${API_BASE}/save_booking.php`, 
};

export const GET_BOOKING_FROM_MOB_CONFIG = {
  ...COMMON_CREDENTIALS,
  Parameter: getParameterFromUrl(),
  Url: `${API_BASE}/get_bookings_from_mob.php`, 
};


// [NEW] Configuration for OTP SMS API
export const OTP_CONFIG = {
  ...COMMON_CREDENTIALS, // Inherits UserName and Password from your env
  Parameter: getParameterFromUrl(),
  Url: `${API_BASE}/send_otp_sms.php`, // Points to /booking/api/send_otp_sms.php
};

// [NEW] Configuration for Cancel Booking API
export const CANCEL_BOOKING_CONFIG = {
  ...COMMON_CREDENTIALS,
  Url: `${API_BASE}/cancel_booking.php`,
};