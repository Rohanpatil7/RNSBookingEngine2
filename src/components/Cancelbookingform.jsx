/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { getBookingsFromMobile, sendOtp, cancelBooking } from "../api/api_services";

const CancelBookingForm = () => {
  const [mobile, setMobile] = useState("");
  const [guestName, setGuestName] = useState("");
  const [reason, setReason] = useState("");

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);

  const [step, setStep] = useState("FORM"); // FORM | OTP | RESULT
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /* ---------- SEND OTP ---------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    console.log("📤 Send OTP clicked");
    
    if (!/^\d{10}$/.test(mobile)) {
      return setError("Enter valid 10-digit mobile number");
    }
    if (!guestName.trim() || !reason.trim()) {
      return setError("Guest name and reason required");
    }

    setError("");
    setLoading(true);

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);

    try {
      await sendOtp(mobile, code);
      setStep("OTP");
    } catch (err) {
      setError("OTP sending failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- VERIFY OTP ---------- */
  const handleVerifyOtp = async () => {
    if (otp !== generatedOtp) {
      return setError("Invalid OTP");
    }

    setLoading(true);
    setError("");

    try {
      const res = await getBookingsFromMobile(mobile);
      const activeBookings = res?.bookings?.filter((b) => b.ActiveStatus === 1) || [];

      if (!activeBookings.length) {
        return setError("No active bookings found for this mobile number.");
      }

      setBookings(activeBookings);
      setStep("RESULT");
    } catch (err) {
      setError("Failed to fetch bookings. Please try again.");
    } finally {
      setLoading(false);
      setOtp("");
      setGeneratedOtp(null);
    }
  };

  /* ---------- HANDLE CANCEL ACTION ---------- */
  const handleCancelClick = async (booking) => {
    if (!reason.trim()) {
        alert("A cancellation reason is required.");
        return;
    }

    if (!window.confirm(`Are you sure you want to cancel Booking ID: ${booking.BookingID}?`)) {
        return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    // 1️⃣ RETRIEVE PARAMETER (Fallback if HotelId is missing)
    const storedParam = localStorage.getItem("hotelParam") || "";

    try {
        console.log("🔍 Debugging Selected Booking:", booking);

        // 2️⃣ CONSTRUCT PAYLOAD
        const payload = {
           // Send Parameter as a backup (many XpressHotel APIs rely on this)
            Parameter: storedParam ,
            MobileNo: mobile,
            BookingID: booking.BookingID,
            CancellationReason: reason,
            
            
        };

        // 🚨 DEBUG: Check this in your browser console!
        console.log("📤 Sending Cancel Payload:", payload);

        if (!payload.Parameter) {
            throw new Error("Missing Hotel Parameter");
        }
       

        const res = await cancelBooking(payload);

        // Check for various success flags (API dependent)
        if (res.status === "Success" || res.success === true || res.Status === "Success") {
            setSuccessMsg(`Booking ${booking.BookingID} cancelled successfully!`);
            setBookings(prev => prev.filter(b => b.BookingID !== booking.BookingID));
        } else {
            // Display backend error message
            setError(res.message || res.Message || "Cancellation failed.");
        }
    } catch (err) {
        console.error(err);
        setError(err.message || "Error processing cancellation.");
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="p-4 max-w-lg mx-auto">
      {step === "FORM" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Cancel Booking</h2>
          <input
            type="tel"
            maxLength={10}
            placeholder="Mobile Number"
            className="w-full border p-2 rounded"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <input
            type="text"
            placeholder="Guest Name"
            className="w-full border p-2 rounded"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
          <textarea
            rows={3}
            placeholder="Cancellation Reason"
            className="w-full border p-2 rounded"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="w-full bg-red-600 text-white py-2 rounded">
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === "OTP" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Verify OTP</h2>
          <input
            type="number"
            placeholder="Enter OTP"
            className="w-full border p-2 rounded"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      {step === "RESULT" && (
        <div className="mt-4">
          <h2 className="font-semibold mb-3">Active Bookings</h2>
          
          {successMsg && <div className="bg-green-400 text-green-700 p-2 rounded mb-2 text-sm">{successMsg}</div>}
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2 text-sm">{error}</div>}

          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active bookings remaining.</p>
          ) : (
            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Guest</th>
                    <th className="border p-2">Dates</th>
                    <th className="border p-2">Amt</th>
                    <th className="border p-2">Action</th>
                </tr>
                </thead>
                <tbody>
                {bookings.map((b) => (
                    <tr key={b.BookingID} className="text-center">
                    <td className="border p-2">{b.BookingID}</td>
                    <td className="border p-2">{b.GuestName}</td>
                    <td className="border p-2">
                        <div className="text-xs">{b.CheckInDate}</div>
                        <div className="text-xs text-gray-500">to {b.CheckOutDate}</div>
                    </td>
                    <td className="border p-2">₹{b.GrandTotal}</td>
                    <td className="border p-2">
                        <button 
                            onClick={() => handleCancelClick(b)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          )}

          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
            <p><b>Requesting Cancellation For:</b></p>
            <p>Name: {guestName}</p>
            <p>Reason: {reason}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelBookingForm;