/* eslint-disable no-unused-vars */
// src/components/BillingContact.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";

// --- Keys for Local/Session Storage ---
const TEMP_CONTACT_KEY = 'tempContactDetails';
const TEMP_GUESTS_KEY = 'tempAdditionalGuests';
const TEMP_SHOW_GST_KEY = 'tempShowGst';
const TEMP_GST_DETAILS_KEY = 'tempGstDetails';
const BOOKING_DETAILS_KEY = 'currentBookingDetails';
const TEMP_GUEST_COUNTS_KEY = 'tempGuestCounts';

export default function BillingContact({ hotelData, grandTotal, totalGuests }) {
  
  // Initialize state from sessionStorage (to keep draft logic working)
  const [contactDetails, setContactDetails] = useState(() => {
    try {
      const stored = sessionStorage.getItem(TEMP_CONTACT_KEY);
      return stored ? JSON.parse(stored) : {
        title: "Mr",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      };
    } catch (e) {
      return { title: "Mr", firstName: "", lastName: "", email: "", phone: "" };
    }
  });

  const [additionalGuests, setAdditionalGuests] = useState(() => {
    try {
      const stored = sessionStorage.getItem(TEMP_GUESTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [showGst, setShowGst] = useState(() => {
    try {
      const stored = sessionStorage.getItem(TEMP_SHOW_GST_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch (e) {
      return false;
    }
  });

  const [gstDetails, setGstDetails] = useState(() => {
    try {
      const stored = sessionStorage.getItem(TEMP_GST_DETAILS_KEY);
      return stored ? JSON.parse(stored) : {
        registrationNumber: "",
        companyName: "",
        companyAddress: "",
      };
    } catch (e) {
      return { registrationNumber: "", companyName: "", companyAddress: "" };
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // --- Keep sessionStorage updated for drafts (while user is typing) ---
  useEffect(() => {
    sessionStorage.setItem(TEMP_CONTACT_KEY, JSON.stringify(contactDetails));
  }, [contactDetails]);

  useEffect(() => {
    sessionStorage.setItem(TEMP_GUESTS_KEY, JSON.stringify(additionalGuests));
  }, [additionalGuests]);

  useEffect(() => {
    sessionStorage.setItem(TEMP_SHOW_GST_KEY, JSON.stringify(showGst));
  }, [showGst]);

  useEffect(() => {
    sessionStorage.setItem(TEMP_GST_DETAILS_KEY, JSON.stringify(gstDetails));
  }, [gstDetails]);

  const validate = () => {
    const newErrors = {};
    const { firstName, lastName, email, phone } = contactDetails;
    const { registrationNumber, companyName, companyAddress } = gstDetails;

    if (!firstName.trim()) newErrors.firstName = "First Name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last Name is required.";
    if (!email) newErrors.email = "Email address is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email address is invalid.";
    if (!phone) newErrors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(phone)) newErrors.phone = "Phone number must be exactly 10 digits.";

    if (showGst) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!registrationNumber.trim()) {
        newErrors.registrationNumber = "Registration No. is required.";
      } else if (!gstRegex.test(registrationNumber.trim())) {
        newErrors.registrationNumber = "Please enter a valid 15-character GSTIN.";
      }
      if (!companyName.trim()) newErrors.companyName = "Company Name is required.";
      if (!companyAddress.trim()) newErrors.companyAddress = "Company Address is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    let processedValue = value;
    if (id === "phone") processedValue = value.replace(/[^0-9]/g, "");

    setContactDetails((prev) => ({ ...prev, [id]: processedValue }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: null }));
  };

  const handleGstChange = (e) => {
    const { id, value } = e.target;
    let processedValue = value;
    if (id === "registrationNumber") processedValue = value.toUpperCase();

    setGstDetails((prev) => ({ ...prev, [id]: processedValue }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: null }));
  };

  const handleAddGuest = () => {
    const currentGuestFormCount = 1 + additionalGuests.length;
    if (totalGuests > 0 && currentGuestFormCount >= totalGuests) return;
    setAdditionalGuests((prev) => [...prev, { id: Date.now(), firstName: "", lastName: "" }]);
  };

  const handleRemoveGuest = (id) => {
    setAdditionalGuests((prev) => prev.filter((guest) => guest.id !== id));
  };

  const handleAdditionalGuestChange = (id, field, value) => {
    setAdditionalGuests((prev) =>
      prev.map((guest) => (guest.id === id ? { ...guest, [field]: value } : guest))
    );
  };

  const startPayment = async () => {
    setLoading(true);
    const hotelParam = localStorage.getItem("hotelParam");

    if (!hotelParam) {
      alert("Error: Hotel parameter is missing. Please refresh the page and try again.");
      setLoading(false);
      return;
    }

    try {
      const rawAmount = grandTotal ?? hotelData?.grandTotal ?? hotelData?.totalAmount ?? 0;
      const numAmount = Number(rawAmount);

      if (!Number.isFinite(numAmount) || numAmount <= 0) {
        console.log("Invalid amount. Please check the grand total.");
        setLoading(false);
        return;
      }

      const formattedAmount = numAmount.toFixed(2);

      const resp = await axios.post("/pg_demo/api/easebuzz_backend.php", {
        txnid: "TXN" + Date.now(),
        amount: formattedAmount,
        firstname: `${contactDetails.firstName} ${contactDetails.lastName}`,
        email: contactDetails.email,
        phone: contactDetails.phone,
        productinfo: "Hotel Booking",
        udf1: hotelParam || localStorage.getItem("hotelParam") ,
        ...(showGst && {
          gst_number: gstDetails.registrationNumber,
          gst_company_name: gstDetails.companyName,
          gst_company_address: gstDetails.companyAddress,
        }),
        key: hotelData.EaseBuzzKey,
        salt: hotelData.EaseBuzzSalt,
        allGuests: [
          { firstName: contactDetails.firstName, lastName: contactDetails.lastName, isPrimary: true },
          ...additionalGuests.map(g => ({ firstName: g.firstName, lastName: g.lastName, isPrimary: false }))
        ]
      });

      if (resp?.data?.status === 1 && resp?.data?.data) {
        const access_key = resp.data.data;

        // --- [CRITICAL CHANGE] SAVE TO LOCALSTORAGE FOR PERSISTENCE ---
        // We use localStorage because it survives the redirect to the payment gateway
        // and back, even if the session is lost or opened in a new view.
      
    
        // 1. Save Booking Details (Rooms, Dates, Prices)
        const bookingDetailsFn = sessionStorage.getItem(BOOKING_DETAILS_KEY);
         // ADD THIS LOG:
        console.log("Saving this to LocalStorage before redirect:", bookingDetailsFn);
        if (bookingDetailsFn) localStorage.setItem(BOOKING_DETAILS_KEY, bookingDetailsFn);

        // 2. Save Guest Counts (Adults/Children per room)
        const guestCountsFn = sessionStorage.getItem(TEMP_GUEST_COUNTS_KEY);
        if (guestCountsFn) localStorage.setItem(TEMP_GUEST_COUNTS_KEY, guestCountsFn);

        // 3. Save Contact Form Data (From current state)
        localStorage.setItem(TEMP_CONTACT_KEY, JSON.stringify(contactDetails));
        localStorage.setItem(TEMP_GUESTS_KEY, JSON.stringify(additionalGuests));
        localStorage.setItem(TEMP_SHOW_GST_KEY, JSON.stringify(showGst));
        localStorage.setItem(TEMP_GST_DETAILS_KEY, JSON.stringify(gstDetails));
        
        // Redirect to Payment
        const paymentURL = `https://pay.easebuzz.in/pay/${access_key}`;
        window.location.href = paymentURL;
      } else {
        console.log("Easebuzz API failed.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert("Error initiating payment: " + err.message);
      setLoading(false);
    }
  };

  const handlePaymentClick = () => {
    if (validate()) {
      setErrors({});
      startPayment();
    }
  };

  // Styles
  const inputBaseClass = "mt-1 block w-full px-1 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ";
  const errorClass = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const validClass = "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500";
  const inputClassName = (field, hasError) => `${inputBaseClass} ${hasError ? errorClass : validClass}`;
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1 ";
  const canAddMoreGuests = totalGuests > 0 ? (1 + additionalGuests.length) < totalGuests : true;

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-4 sm:p-6 pb-24 md:pb-6">
      {/* Guest Details Form */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Guest Details</h2>
        <p className="text-sm text-gray-600">Guest 1 (Primary Contact){totalGuests > 0 && ` of ${totalGuests}`}</p>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-2 cursor-pointer">
            <label htmlFor="title" className={labelClassName}>Title</label>
            <select id="title" value={contactDetails.title} onChange={handleChange} className={`cursor-pointer ${inputClassName("title", errors.title)}`}>
              <option>Mr</option>
              <option>Mrs</option>
              <option>Ms</option>
            </select>
          </div>
          <div className="sm:col-span-5">
            <label htmlFor="firstName" className={labelClassName}>First Name</label>
            <input type="text" id="firstName" value={contactDetails.firstName} onChange={handleChange} className={inputClassName("firstName", errors.firstName)} placeholder="First Name" />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>
          <div className="sm:col-span-5">
            <label htmlFor="lastName" className={labelClassName}>Last Name</label>
            <input type="text" id="lastName" value={contactDetails.lastName} onChange={handleChange} className={inputClassName("lastName", errors.lastName)} placeholder="Last Name" />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className={labelClassName}>Email Address</label>
            <input type="email" id="email" value={contactDetails.email} onChange={handleChange} className={inputClassName("email", errors.email)} placeholder="you@example.com" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className={labelClassName}>Mobile Number</label>
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 text-sm">+91</span>
              <input type="tel" id="phone" value={contactDetails.phone} onChange={handleChange} maxLength={10} className={`${inputBaseClass} w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md`} placeholder="9876543210" />
            </div>
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* GST Section */}
        <div className="pt-2">
          <div className="flex items-center">
            <input id="showGst" type="checkbox" checked={showGst} onChange={() => setShowGst(!showGst)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-pointer" />
            <label htmlFor="showGst" className="ml-2 block text-sm text-gray-900 cursor-pointer">Enter GST Details <span className="text-gray-500">(Optional)</span></label>
          </div>
          {showGst && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4 p-4 border border-gray-200 rounded-lg">
              <div>
                <label htmlFor="registrationNumber" className={labelClassName}>GST Number</label>
                <input type="text" id="registrationNumber" value={gstDetails.registrationNumber} onChange={handleGstChange} maxLength={15} className={inputClassName("registrationNumber", errors.registrationNumber)} placeholder="GST Number" />
                {errors.registrationNumber && <p className="mt-1 text-sm text-red-600">{errors.registrationNumber}</p>}
              </div>
              <div>
                <label htmlFor="companyName" className={labelClassName}>Company Name</label>
                <input type="text" id="companyName" value={gstDetails.companyName} onChange={handleGstChange} className={inputClassName("companyName", errors.companyName)} placeholder="Company Name" />
                {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
              </div>
              <div>
                <label htmlFor="companyAddress" className={labelClassName}>Company Address</label>
                <input type="text" id="companyAddress" value={gstDetails.companyAddress} onChange={handleGstChange} className={inputClassName("companyAddress", errors.companyAddress)} placeholder="Company Address" />
                {errors.companyAddress && <p className="mt-1 text-sm text-red-600">{errors.companyAddress}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Guests */}
      <div className="space-y-4 mt-4">
        {additionalGuests.map((guest, index) => (
          <div key={guest.id} className="p-4 border border-gray-200 rounded-lg relative space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-800">Guest {index + 2}{totalGuests > 0 && ` of ${totalGuests}`}</h4>
              <button type="button" onClick={() => handleRemoveGuest(guest.id)} className="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor={`guest_firstName_${guest.id}`} className={labelClassName}>First Name</label>
                <input type="text" id={`guest_firstName_${guest.id}`} value={guest.firstName} onChange={(e) => handleAdditionalGuestChange(guest.id, "firstName", e.target.value)} className={inputClassName("firstName", null)} placeholder="Optional" />
              </div>
              <div>
                <label htmlFor={`guest_lastName_${guest.id}`} className={labelClassName}>Last Name</label>
                <input type="text" id={`guest_lastName_${guest.id}`} value={guest.lastName} onChange={(e) => handleAdditionalGuestChange(guest.id, "lastName", e.target.value)} className={inputClassName("lastName", null)} placeholder="Optional" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button type="button" onClick={handleAddGuest} disabled={!canAddMoreGuests} className={`text-sm font-medium ${canAddMoreGuests ? "text-blue-600 hover:text-blue-700 cursor-pointer" : "text-gray-400 cursor-not-allowed"}`}>+ Add Guest</button>
      </div>

      {/* Payment Button */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-2 shadow-[0_-2px_6px_rgba(0,0,0,0.1)] md:static md:w-auto md:bg-transparent md:p-0 md:shadow-none md:pt-6">
        <button onClick={handlePaymentClick} disabled={loading} className={`w-full font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 cursor-pointer transition-all duration-300 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 hover:bg-indigo-700 hover:scale-101 text-white"}`}>
          {loading ? "Processing..." : "Complete Your Booking & Pay"}
        </button>
      </div>
    </div>
  );
}