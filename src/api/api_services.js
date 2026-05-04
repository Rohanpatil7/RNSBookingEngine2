import axios from 'axios';
import {
  HOTEL_DETAILS_CONFIG,
  ROOM_RATES_CONFIG,
  TAXES_CONFIG,
  SAVE_BOOKING_CONFIG, // [NEW] Import the new config
  GET_BOOKING_FROM_MOB_CONFIG,
  OTP_CONFIG,
  CANCEL_BOOKING_CONFIG
} from './api_config';

// ... (getHotelDetails function remains the same) ...
export async function getHotelDetails() {
  const { Url, ...payload } = HOTEL_DETAILS_CONFIG;
  // console.log('Fetching hotel details from:', Url);
  try {
    const response = await axios.post(Url, payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching hotel details:', error.message);
    throw error;
  }
}


/**
 * Initiates payment with backend server.
 * @param {object} paymentData - { amount, firstname, email, phone, productinfo }
 * @returns {Promise<object>} - Payment gateway response.
 */
export async function initiatePayment(paymentData) {
  // ✅ CORRECTED: This path should match the server route
  const paymentPath = '/initiate-payment';

  // This logic is now correct, but the error indicates the deployed
  // version might have an older, incorrect version of this file.
  const backendURL = import.meta.env.DEV
    ? paymentPath // Uses Vite proxy in development
    : (import.meta.env.VITE_BACKEND_URL || '') + paymentPath;

  console.log('Initiating payment via:', backendURL); // This will now log the correct URL

  try {
    const response = await axios.post(backendURL, paymentData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Payment API error:', error.message);
    throw error;
  }
}

// ... (getRoomRates and getTaxes functions remain the same) ...
export async function getRoomRates(params = {}) {
  const { Url, ...basePayload } = ROOM_RATES_CONFIG;
  const payload = { ...basePayload, ...params };
  console.log(`Fetching room rates from: ${Url} for date: ${payload.BookingDate}`);
  try {
    const response = await axios.post(Url, payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching room rates:', error.message);
    throw error;
  }
}

export async function getTaxes() {
  const { Url, ...payload } = TAXES_CONFIG;
  console.log('Fetching taxes from:', Url);
  try {
    const response = await axios.post(Url, payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching taxes:', error.message);
    throw error;
  }
}


export async function saveBookingDetails(data) {
  // Deconstruct Url but ignore the static Parameter from config
  const { Url, Parameter: staticParam, ...basePayload } = SAVE_BOOKING_CONFIG;

  // ✅ Fetch the latest parameter from localStorage dynamically
  const currentParam = localStorage.getItem("hotelParam") || staticParam;

  let payload;
  let headers = {};

  if (data instanceof FormData) {
    payload = data;
    // Add base fields (including dynamic Parameter) to FormData
    Object.keys(basePayload).forEach(key => {
      if (!payload.has(key)) payload.append(key, basePayload[key]);
    });
    if (!payload.has('Parameter')) payload.append('Parameter', currentParam);
  } else {
    // Standard JSON payload with dynamic Parameter
    payload = { ...basePayload, Parameter: currentParam, ...data };
    headers['Content-Type'] = 'application/json';
  }

  console.log('Saving booking details to:', Url);

  try {
    const response = await axios.post(Url, payload, { headers });
    return response.data;
  } catch (error) {
    console.error('Error saving booking details:', error.message);
    throw error;
  }
}


/* ---------------- SEND OTP ---------------- */
export const sendOtp = async (mobile, otp) => {
  // 1. Destructure config
  const {
    Url,
    UserName,
    Password,
    Parameter: staticParam
  } = OTP_CONFIG;

  // 2. [CRITICAL] Fetch latest parameter dynamically from localStorage 
  // This ensures it works even if the config loaded before the param was saved.
  const currentParam = localStorage.getItem("hotelParam") || staticParam;

  // 3. Construct payload matching the API requirement exactly
  const payload = {
    ApiUser: UserName,   // Maps to 'pmsuser' (from .env)
    ApiPass: Password,   // Maps to 'pms@123' (from .env)
    Mobile: mobile,      // The user's mobile input
    OTP: otp,            // The generated OTP
    Parameter: currentParam // The dynamic hotel parameter
  };

  console.log("📨 Sending OTP Payload:", payload);
  
  try {
    const response = await axios.post(Url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log("✅ OTP API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ OTP send failed:", error.message);
    throw error;
  }
};

/* ---------------- FETCH BOOKINGS ---------------- */
export const getBookingsFromMobile = async (mobile) => {
  const { Url } = GET_BOOKING_FROM_MOB_CONFIG;

  // ⛔ DO NOT USE basePayload
  const payload = {
    ApiUser: GET_BOOKING_FROM_MOB_CONFIG.UserName,
    ApiPass: GET_BOOKING_FROM_MOB_CONFIG.Password,
    Parameter: GET_BOOKING_FROM_MOB_CONFIG.Parameter,
    MobileNo: mobile,
  };

  console.log("📤 FINAL booking payload:", payload);

  try {
    const { data } = await axios.post(Url, payload);
    console.log("📥 Booking API response:", data);
    return data;
  } catch (error) {
    console.error("❌ Booking fetch failed:", error);
    throw error;
  }
};


/* ---------------- CANCEL BOOKING ---------------- */
export const cancelBooking = async (bookingData) => {
  const { Url, UserName, Password } = CANCEL_BOOKING_CONFIG;

  // Merge static credentials with dynamic booking data
  const payload = {
    ApiUser: UserName,
    ApiPass: Password,
    ...bookingData // { HotelId, BookingID, CancellationReason, UserId }
  };

  console.log("📤 Cancelling booking with payload:", payload);

  try {
    const response = await axios.post(Url, payload, {
        headers: { 'Content-Type': 'application/json' }
    });
    console.log("📥 Cancel API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Cancel booking failed:", error.message);
    throw error;
  }
};