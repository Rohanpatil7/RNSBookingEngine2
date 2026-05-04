import React, { useState } from "react";
import axios from "axios";

export default function PaymentForm() {
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    setLoading(true);
    try {
      const txnid = "TXN" + Date.now();

      // Step 1️⃣: Ask backend to initiate payment
      const resp = await axios.post("http://localhost:8080/initiate-payment", {
        txnid,
        amount: 1.00, // must be 2 decimals
        firstname: "John",
        email: "john@example.com",
        phone: "9999999999",
        productinfo: "HotelBooking", // no spaces or symbols
      });

      console.log("Easebuzz API Response:", resp.data);

      // Step 2️⃣: Extract the access key from backend response
      if (resp.data && resp.data.status === 1 && resp.data.data) {
        const access_key = resp.data.data;

        // Step 3️⃣: Build the payment URL and redirect
        const paymentURL = `https://pay.easebuzz.in/pay/${access_key}`;
        console.log("Redirecting to:", paymentURL);

        // Redirect the browser to Easebuzz payment page
        window.location.href = paymentURL;
      } else {
        alert("Easebuzz API failed. Check backend logs.");
      }
    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert("Error initiating payment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Easebuzz Live Payment Demo</h2>
      <button onClick={startPayment} disabled={loading}>
        {loading ? "Processing..." : "Payment"}
      </button>
    </div>
  );
}
