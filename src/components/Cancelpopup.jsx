import React from "react";
import CancelBookingForm from "./cancelbookingform.jsx";

const CancelPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Popup Card */}
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl"
        >
          ✕
        </button>

        {/* Render Cancel Booking Form */}
        <CancelBookingForm />
      </div>
    </div>
  );
};

export default CancelPopup;
