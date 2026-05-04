// --- Dynamic API Base URL ---
// Sets the base URL for all API calls.
// It prioritizes the VITE_API_BASE environment variable,
// but falls back to the URL from the documentation if it's not set.
export const API_BASE = import.meta.env.VITE_API_BASE ?? "";

// --- Common Credentials ---
// Contains credentials required for every API request.
// Uses environment variables for security, with fallback values from the docs.
const COMMON_CREDENTIALS = {
  UserName: import.meta.env.VITE_API_USERNAME ?? "",
  Password: import.meta.env.VITE_API_PASSWORD ?? "",
};

// --- Dynamic Hotel Parameter ---
// A helper function to dynamically get the hotel's encoded parameter.
// It first tries to read a 'parameter' from the current page's URL query string.
// If not found, it falls back to an environment variable, and finally to an empty string.
function getParameterFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("parameter") ||
    import.meta.env.VITE_API_PARAMETER ||
    ""
  );
}

// --- API Endpoint Configurations ---

// ✅ Configuration for fetching hotel details
export const HOTEL_DETAILS_CONFIG = {
  ...COMMON_CREDENTIALS,
  Parameter: getParameterFromUrl(),
  Url: import.meta.env.VITE_HOTEL_DETAILS_ENDPOINT ?? `${API_BASE}/get_hotel_details.php`,
};

// ✅ Configuration for fetching room rates
export const ROOM_RATES_CONFIG = {
  ...COMMON_CREDENTIALS,
  Parameter: getParameterFromUrl(),
  Url: import.meta.env.VITE_ROOM_RATES_ENDPOINT ?? `${API_BASE}/get_room_rates.php`,
};

// ✅ Configuration for fetching taxes
export const TAXES_CONFIG = {
  ...COMMON_CREDENTIALS,
  Parameter: getParameterFromUrl(),
  Url: import.meta.env.VITE_TAXES_ENDPOINT ?? `${API_BASE}/get_taxes.php`,
};
