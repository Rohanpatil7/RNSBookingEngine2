// src/pages/Paysuccess.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveBookingDetails } from "../api/api_services";

// ─── Storage Keys ──────────────────────────────────────────────────────────────
const BOOKING_DETAILS_KEY   = "currentBookingDetails";
const TEMP_CONTACT_KEY      = "tempContactDetails";
const TEMP_GUEST_COUNTS_KEY = "tempGuestCounts";
const TEMP_GST_DETAILS_KEY  = "tempGstDetails";

const STORAGE_KEYS_TO_CLEAR = [
  BOOKING_DETAILS_KEY,
  TEMP_GUEST_COUNTS_KEY,
  "tempChildrenAges",
  "bookingCart",
  TEMP_CONTACT_KEY,
  "tempAdditionalGuests",
  "tempShowGst",
  TEMP_GST_DETAILS_KEY,
  "tempBookingStep",
  "paymentDetails",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getHotelParam = () => {
  try { return localStorage.getItem("hotelParam") || ""; }
  catch { return ""; }
};

const parseEasebuzzParams = (searchParams) => {
  const params = Object.fromEntries(searchParams.entries());
  Object.keys(params).forEach((key) => {
    params[key] = decodeURIComponent(String(params[key]).replace(/\+/g, " "));
  });
  return params;
};

const extractNameParts = (firstnameParam, contactSession) => {
  let firstName = contactSession?.firstName || "";
  let lastName  = contactSession?.lastName  || "";
  if (!firstName || !lastName) {
    const parts = (firstnameParam || "").trim().split(" ");
    if (parts.length > 1) {
      firstName = parts.slice(0, -1).join(" ");
      lastName  = parts.slice(-1).join(" ");
    } else {
      firstName = firstnameParam || "Guest";
      lastName  = "User";
    }
  }
  return { firstName, lastName };
};

// ─── Save-Status Badge ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    idle:    { label: "Preparing…",          cls: "bg-gray-100 text-gray-500" },
    sending: { label: "Saving Booking…",     cls: "bg-yellow-100 text-yellow-700 animate-pulse" },
    success: { label: "Booking Confirmed ✓", cls: "bg-green-100 text-green-700" },
    error:   { label: "Save Failed",         cls: "bg-red-100 text-red-600" },
  };
  const { label, cls } = map[status] || map.idle;
  return (
    <span
      className={`inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 ${cls}`}
    >
      {label}
    </span>
  );
};

// ─── Component ─────────────────────────────────────────────────────────────────
const PaySuccess = ({ hotelData }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [paymentDetails, setPaymentDetails] = useState(() => {
    try {
      const stored = localStorage.getItem("paymentDetails");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [saveStatus, setSaveStatus] = useState("idle");
  const [apiError,   setApiError]   = useState(null);
  const dataSentRef = useRef(false);

  // ── Parse URL params from Easebuzz redirect ──────────────────────────────────
  useEffect(() => {
    const parsed = parseEasebuzzParams(searchParams);
    if (Object.keys(parsed).length > 0) {
      setPaymentDetails(parsed);
      localStorage.setItem("paymentDetails", JSON.stringify(parsed));
    }
  }, [searchParams]);

  // ── Send booking to API ───────────────────────────────────────────────────────
  const sendBookingToApi = async (payload) => {
    try {
      setSaveStatus("sending");
      localStorage.setItem("bookingApiPayload", JSON.stringify(payload));

      const res = await saveBookingDetails(payload);
      localStorage.setItem("bookingApiResponse", JSON.stringify(res));

      if (
        res?.Success === true || res?.success === true ||
        res?.status === "success" || res?.status === "Success"
      ) {
        setSaveStatus("success");
        STORAGE_KEYS_TO_CLEAR.forEach((k) => {
          localStorage.removeItem(k);
          sessionStorage.removeItem(k);
        });
      } else {
        setSaveStatus("error");
        setApiError(res?.Message || "Booking save failed.");
      }
    } catch {
      setSaveStatus("error");
      setApiError("Server error while saving booking.");
    }
  };

  // ── Build payload once paymentDetails arrive ─────────────────────────────────
  useEffect(() => {
    if (!paymentDetails) return;
    if (String(paymentDetails.status || "").toLowerCase() !== "success") return;
    if (dataSentRef.current) return;
    dataSentRef.current = true;
    setSaveStatus("sending");

    try {
      const bookingSession = JSON.parse(localStorage.getItem(BOOKING_DETAILS_KEY) || "{}");
      const contactSession = JSON.parse(localStorage.getItem(TEMP_CONTACT_KEY)      || "{}");
      const guestCounts    = JSON.parse(localStorage.getItem(TEMP_GUEST_COUNTS_KEY) || "{}");
      const gstSession     = JSON.parse(localStorage.getItem(TEMP_GST_DETAILS_KEY)  || "{}");

      if (!bookingSession?.rooms?.length) {
        setSaveStatus("error");
        setApiError("Booking session expired. No room data found.");
        return;
      }

      const { firstName, lastName } = extractNameParts(paymentDetails.firstname, contactSession);
      const formatDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");
      const num        = (v) => parseFloat(v || 0);
      const hotelParam = getHotelParam();
      const nights     = bookingSession?.dates?.nights || 1;

      let roomSubtotal = 0, extraAdultAmount = 0, extraChildAmount = 0, totalGuests = 0;
      const room_details = [];

      bookingSession.rooms.forEach((room) => {
        for (let i = 0; i < room?.quantity; i++) {
          const key = `${room?.instanceRoomId}_${i}`;
          const counts = guestCounts[key] || { adults: 1, children: 0 };
          totalGuests += counts.adults + counts.children;

          const r_extraAdults    = room?.ExtraAdultRate || 0;
          const r_extraChildren  = room?.PaidChildRate || 0;
          const r_extraAdultRate = num(bookingSession.extraAdultCost) || 0;
          const r_extraChildRate = num(bookingSession.extraChildCost) || 0;

          const tariff_subtotal    = num(room.pricePerNight) * nights;
          const extra_pax_subtotal =
            ((r_extraAdults * r_extraAdultRate) + (r_extraChildren * r_extraChildRate)) * nights;
          const room_total_amount  = tariff_subtotal + extra_pax_subtotal;
          const tax_amt            = num(room?.tax);

          roomSubtotal     += tariff_subtotal;
          extraAdultAmount += r_extraAdults   * r_extraAdultRate * nights;
          extraChildAmount += r_extraChildren * r_extraChildRate * nights;

          room_details.push({
            room_type_id:        room?.roomId       || "",
            room_type_name:      room?.roomName     || "",
            rate_type_id:        room?.selectedMealPlan?.RateTypeId       || "",
            rate_type_name:      room?.selectedMealPlan?.RateType         || "",
            meal_plan_id:        room?.selectedMealPlan?.OriginalMealPlanID || "",
            meal_plan_name:      room?.selectedMealPlan?.MealPlanName     || "",
            no_of_adults:        counts.adults,
            extra_adult:         r_extraAdults,
            extra_child:         r_extraChildren,
            rate_per_night:      num(room?.pricePerNight),
            no_of_nights:        nights,
            extra_adult_rate:    r_extraAdultRate,
            child_rate:          r_extraChildRate,
            tariff_subtotal:     tariff_subtotal,
            extra_pax_subtotal:  extra_pax_subtotal,
            subtotal:            room_total_amount,
            discount_amount:     0,
            discount_percentage: 0,
            discount_note:       "",
            taxable_amount:      room_total_amount,
            tax_id:              1,
            tax_name:            "GST",
            tax_percentage:      12,
            tax_amount:          tax_amt,
            total_amount:        room_total_amount + tax_amt,
            sub_taxes: [
              {
                tax_id: 1, tax_name: "GST", sub_tax_id: 11,
                sub_tax_name: "CGST", tax_percentage: 6, sub_tax_amount: tax_amt / 2,
              },
              {
                tax_id: 1, tax_name: "GST", sub_tax_id: 12,
                sub_tax_name: "SGST", tax_percentage: 6, sub_tax_amount: tax_amt / 2,
              },
            ],
          });
        }
      });

      const grandTotal = num(paymentDetails?.amount);
      const subTotal   = roomSubtotal + extraAdultAmount + extraChildAmount;
      const taxAmount  = num(bookingSession?.totalTax);

      const payload = {
        ApiUser:   import.meta.env.VITE_API_USERNAME,
        ApiPass:   import.meta.env.VITE_API_PASSWORD,
        parameter: hotelParam,

        guest_title: contactSession?.title || "Mr",
        first_name:  firstName,
        last_name:   lastName,
        email:       paymentDetails?.email || contactSession?.email || "",
        mobile:      paymentDetails?.phone || contactSession?.phone || "",

        address_line1: contactSession?.address || "",
        address_line2: contactSession?.city    || "",
        pincode:       contactSession?.zipCode || "",

        company_name:    gstSession?.companyName        || "",
        company_gst_no:  gstSession?.registrationNumber || "",
        company_address: gstSession?.companyAddress     || "",

        check_in_date:  formatDate(bookingSession?.dates?.checkIn),
        check_out_date: formatDate(bookingSession?.dates?.checkOut),
        no_of_nights:   nights,
        no_of_guests:   totalGuests,

        room_subtotal:        roomSubtotal,
        extra_adult_amount:   extraAdultAmount,
        extra_child_amount:   extraChildAmount,
        sub_total:            subTotal,
        discount_amount:      0,
        taxable_amount:       subTotal,
        tax_amount:           taxAmount,
        round_off:            0,
        service_charge:       0,
        total_booking_amount: grandTotal,

        payment_status: "PAID",
        payment_txn_id: paymentDetails?.txnid || "",

        room_details,
        payment_gateway_response: paymentDetails || {},
      };

      sendBookingToApi(payload);
    } catch (err) {
      console.error("Payload construction error:", err);
      setSaveStatus("error");
      setApiError("Failed to process booking data.");
    }
  }, [paymentDetails, hotelData]);

  // ── Transaction table rows (full set — mirrors PayFailure) ───────────────────
  const tableRows = paymentDetails
    ? [
        { label: "Payment Status", value: paymentDetails.status,                                    highlight: true },
        { label: "Transaction ID", value: paymentDetails.txnid        || "—" },
        { label: "Easepay ID",     value: paymentDetails.easepayid    || "—" },
        { label: "Amount",         value: `₹${parseFloat(paymentDetails.amount || 0).toFixed(2)}` },
        { label: "Email",          value: paymentDetails.email        || "—" },
        { label: "Phone",          value: paymentDetails.phone        || "—" },
        { label: "Card Type",      value: paymentDetails.card_type    || "—" },
        { label: "Bank Ref No.",   value: paymentDetails.bank_ref_num || "—" },
        { label: "Product Info",   value: paymentDetails.productinfo  || "—" },
      ]
    : [];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center">

        {/* ── Success Icon ───────────────────────────────────────────────── */}
        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
          <svg
            className="w-9 h-9 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* ── Heading ────────────────────────────────────────────────────── */}
        <h1 className="text-3xl sm:text-4xl text-green-600 font-bold mt-4">
          Payment Successful!
        </h1>
        <p className="text-base sm:text-lg text-gray-600 my-4">
          Your booking has been confirmed. A confirmation will be sent to your email.
        </p>

        {/* ── Booking-save status badge ───────────────────────────────────── */}
        {/* <StatusBadge status={saveStatus} /> */}

        {/* ── API error banner ────────────────────────────────────────────── */}
        {saveStatus === "error" && apiError && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-left">
            <span className="mt-0.5 shrink-0">⚠</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* ── Transaction Details Table ───────────────────────────────────── */}
        {paymentDetails && (
          <div className="text-left my-6 sm:my-8 border-t border-b border-gray-200 py-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
              Transaction Details
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableRows.map((row) => (
                    <tr key={row.label} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                        {row.label}
                      </td>
                      <td
                        className={`px-4 sm:px-6 py-3 text-sm font-semibold whitespace-nowrap ${
                          row.highlight ? "text-green-600" : "text-gray-800"
                        }`}
                      >
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Back to Home ────────────────────────────────────────────────── */}
        <button
          className="py-2 px-6 text-base text-white bg-green-600 rounded-lg cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>

      </div>
    </div>
  );
};

export default PaySuccess;