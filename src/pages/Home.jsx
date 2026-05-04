// src/pages/Home.jsx
// --- [START OF FINAL FIX] ---

import React, { useState, useEffect, useCallback } from "react";
import DatePricePicker from "../components/DatePricePicker.jsx";
import { NavLink } from "react-router-dom";
import CancelPopup from "../components/Cancelpopup";


// Helper SVG components for slider arrows (no changes here)
const ChevronLeftIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"></path>
  </svg>
);
const ChevronRightIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"></path>
  </svg>
);

const PLACEHOLDER_ICON =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2220%22%20height%3D%2220%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20rx%3D%224%22%20fill%3D%22%23e5e7eb%22/%3E%3Cpath%20d%3D%22M4%2010h12%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22/%3E%3Cpath%20d%3D%22M10%204v12%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22/%3E%3C/svg%3E";


// --- MODIFICATION 1: Use the CORRECT key to match other components ---
const BOOKING_DETAILS_KEY = 'currentBookingDetails';

const getTomorrow = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

const getDayAfterTomorrow = () => {
  const tomorrow = getTomorrow();
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  return dayAfter;
};


function Home({ hotelData, isBookingDisabled }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  // --- MODIFICATION 2: Replaced initializer with the "read-safe" version ---
  const [bookingDetails, setBookingDetails] = useState(() => {
    // 1. Check for URL Parameters (Priority 1)
    const params = new URLSearchParams(window.location.search);
    const urlCheckIn = params.get('checkin');
    const urlCheckOut = params.get('checkout');
    const urlAdults = parseInt(params.get('adults'), 10);
    const urlChildren = parseInt(params.get('children'), 10);

    if (urlCheckIn && urlCheckOut && new Date(urlCheckIn) > new Date()) {
        const checkIn = new Date(urlCheckIn);
        const checkOut = new Date(urlCheckOut);
        const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
            checkIn,
            checkOut,
            nights,
            adults: urlAdults || 1,
            children: urlChildren || 0,
        };
    }

    // 2. Define Defaults
    const defaultDetails = {
      checkIn: getTomorrow(),
      checkOut: getDayAfterTomorrow(),
      nights: 1,
      adults: 1,
      children: 0,
    };

    // 3. Check Session Storage (Priority 2)
    // This logic correctly parses the complex object from AllRooms/Booking
    const savedDetails = sessionStorage.getItem(BOOKING_DETAILS_KEY);
    if (savedDetails) {
        try {
            const parsed = JSON.parse(savedDetails);
            
            // This safely extracts data from the complex object
            // without corrupting the Home.jsx simple state.
            return {
                ...defaultDetails,
                checkIn: parsed.dates?.checkIn ? new Date(parsed.dates.checkIn) : defaultDetails.checkIn,
                checkOut: parsed.dates?.checkOut ? new Date(parsed.dates.checkOut) : defaultDetails.checkOut,
                nights: parsed.dates?.nights || 1,
                adults: parsed.guests?.adults || 1,
                children: parsed.guests?.children || 0,
            };
        } catch (e) {
            console.error('Could not parse booking details', e);
            // Fall through to defaults
        }
    }

    // 4. Return defaults if nothing is saved
    return defaultDetails;
  });
  // --- END OF MODIFICATION 2 ---

  
  const hasImages = hotelData?.HotelImages && hotelData.HotelImages.length > 0;

  // CHANGED: Wrapped slide navigation functions in useCallback
  const prevSlide = useCallback(() => {
    if (!hasImages) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? hotelData.HotelImages.length - 1 : prevIndex - 1
    );
  }, [hasImages, hotelData?.HotelImages.length]);

  const nextSlide = useCallback(() => {
    if (!hasImages) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === hotelData.HotelImages.length - 1 ? 0 : prevIndex + 1
    );
  }, [hasImages, hotelData?.HotelImages.length]);


     // Robust onError handler—applies fallback exactly once
  const applyFallback = (e, fallbackSrc = PLACEHOLDER_ICON) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackApplied === "true") return;
    img.dataset.fallbackApplied = "true";
    img.src = fallbackSrc;
  };

  // --- MODIFICATION 3: The useEffect that wrote to sessionStorage is REMOVED ---
  // This hook is no longer here, which stops the pollution.
  // --- END OF MODIFICATION 3 ---

  // Effect for auto-sliding every 5 seconds
  useEffect(() => {
    if (!hasImages) return;
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [hasImages, nextSlide]); // CHANGED: Simplified dependency array


  if (!hotelData) {
    return <div className="text-center text-xl p-10">Waiting for hotel data...</div>;
  }

  return (
    <div>
      {/* Hero section is now a dynamic slider */}
      <section className="relative h-[50vh] md:h-[600px]  w-full text-white  bg-white">
        {hasImages ? (
          <>
            {/* Slider Background Images */}
            <div className="w-full h-full overflow-hidden shadow:bg-linear-to-t from-sky-500 to-indigo-500">
              <div
                className="flex h-full transition-transform ease-out duration-700 "
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
               {hotelData?.HotelImages.map((image, index) => (
                  <div key={index} className="w-full h-full flex-shrink-0">
                    <img
                      src={image}
                      alt={`Hotel View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
                
            {/* Slider Controls */}
            <>
              {/* Left Arrow */}
              <button onClick={prevSlide} className="absolute top-1/2 left-5 -translate-y-1/2 rounded-full p-2 bg-black/30 hover:bg-black/60 transition-colors cursor-pointer z-10">
                <ChevronLeftIcon />
              </button>
              {/* Right Arrow */}
              <button onClick={nextSlide} className="absolute top-1/2 right-5 -translate-y-1/2 rounded-full p-2 bg-black/30 hover:bg-black/60 transition-colors cursor-pointer z-10">
                <ChevronRightIcon />
              </button>
            </>

            {/* Navigation Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-3">
              {hotelData?.HotelImages.map((_, slideIndex) => (
                <div
                  key={slideIndex}
                  onClick={() => setCurrentIndex(slideIndex)}
                  className={`h-1 w-4 rounded-full cursor-pointer transition-all ${
                    currentIndex === slideIndex ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                ></div>
              ))}
            </div>
             
            {/* --- MODIFICATION: DatePricePicker was removed from here --- */}
          </>
          
        ) : (
          // --- MODIFICATION: Replaced picker with a simple fallback bg ---
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <p className="text-gray-500">No hotel images available.</p>
          </div>
          // --- END OF MODIFICATION ---
        )}
      </section>

   
      <section className="relative z-10 -mt-20 md:-mt-16 w-full max-w-5xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-6 flex flex-col items-center">
          <h2 className="text-xl text-center md:text-2xl font-semibold text-gray-900">Pick Date To Book Your Room</h2>
          <p className="text-sm text-center text-gray-600 mt-1">Standard Check-in: {hotelData.StdCheckinTime} -- Standard Check-out: {hotelData.StdChecoutTime}</p>
          
          <div className="w-full max-w-4xl mt-4 ">
            <DatePricePicker 
              onDateChange={setBookingDetails}
              initialCheckIn={bookingDetails.checkIn}
              initialCheckOut={bookingDetails.checkOut}
            />
          </div>
        </div>
      </section>
   

      {/* Main Content Section */}
      {/* --- MODIFICATION: Changed mt-4 to mt-8 for spacing --- */}
      <div className="flex mt-8 flex-col h-full w-full">

        {/* --- MODIFIED SECTION: About Property & Facilities --- */}
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12 px-4 py-10">
            
            {/* About Property Section */}
            <div className="lg:w-1/2 flex flex-col">
                <h1 className="text-2xl font-semibold text-center  mb-4">
                    About our Property
                </h1>
                <p className="text-gray-800 md:text-center sm:text-center ">
                    {hotelData?.AboutHotel}
                </p>
            </div>

            {/* Facilities Section */}
            {hotelData?.HotelAmenities && hotelData?.HotelAmenities.length > 0 && (
                <div className="lg:w-1/2">
                    <h1 className="text-2xl font-semibold text-center mb-4">
                        Facilities We Provide
                    </h1>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-2 gap-y-4 justify-items-center">
                        {hotelData?.HotelAmenities.map((amenity, index) => (
                            <div key={index} className="flex flex-col items-center text-center">
                                <div className="size-12 p-2  rounded-lg">
                                    <img src={amenity.IconUrl || PLACEHOLDER_ICON} alt={amenity.Name}  onError={(e) => applyFallback(e, PLACEHOLDER_ICON)} className="w-full h-full object-contain"/>
                                </div>
                                <div className="mt-2">
                                    <h3 className="text-sm font-medium text-slate-600">{amenity.Name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        {/* --- END OF MODIFIED SECTION --- */}

        {/* Policies Section */}
        {hotelData?.HotelPolicies && hotelData?.HotelPolicies.length > 0 && (
        <div className="w-full py-12 px-4 sm:px-8 lg:px-16">
          <h3 className="text-2xl font-semibold text-center mx-auto mb-4">Hotel Policies</h3>
          {/* Policies are now in a responsive 2-column grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-2 text-gray-700">
            {hotelData?.HotelPolicies.map((policy, index) => (
              <div key={index} className="flex items-start">
                {/* Checkmark Icon */}
                <svg className="w-4 h-4 text-indigo-500 mr-3 mt-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{policy}</span>
              </div>
            ))}
          </div>
        </div>
      )}  

        {/* Room Selection */}
        <div className="flex justify-between items-center px-4 sm:px-8 md:px-24 h-20 sticky bottom-0 bg-white shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.1)] gap-4">
          <div className="flex-1">
            <p className="font-bold text-lg">Ready to book?</p>
            <p className="text-sm text-gray-500">{/* --- MODIFICATION START --- */}
      {bookingDetails.checkIn && bookingDetails.checkOut ? (
        <span className="font-medium text-indigo-600">
          {/* UPDATED: Now includes guest count */}
          {`${new Date(bookingDetails.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric',year:'numeric' })} - ${new Date(bookingDetails.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric',year:'numeric' })}`}
        </span>
      ) : (
        'Select your dates to see available rooms.'
      )}
      {/* --- MODIFICATION END --- */}</p>
          </div>

          <div className="w-auto hover:scale-110 transition-all">
            <button
              onClick={() => setShowCancelPopup(true)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all
                ${isBookingDisabled
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-b from-red-500 via-red-600 to-red-700 text-white hover:shadow-lg"}
              `}
              >
              Cancel Booking
            </button>
          </div>

          <div className="w-auto hover:scale-110 transition-all">
            <NavLink
              to="/allrooms"
              state={{ initialBookingDetails: bookingDetails }}
              className={`rounded-lg px-4 py-2 text-sm font-medium border transition-all  ${
                isBookingDisabled
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700   text-white hover:bg-indigo-700 hover:shadow-lg shadow-indigo-200 backdrop-brightness-75 "
              }`}
            >
              Select Rooms
            </NavLink>
          </div>
        </div>
      </div>

      <CancelPopup
          isOpen={showCancelPopup}
          onClose={() => setShowCancelPopup(false)}
      />
    </div>
  );
}

export default Home;

