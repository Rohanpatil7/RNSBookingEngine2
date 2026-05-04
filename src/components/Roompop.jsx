import React, { useEffect } from 'react';

// Renamed to Roompop and it now accepts an `onClose` and `room` prop
function Roompop({ room, onClose }) {
   
  // This useEffect hook manages the side effect of disabling/enabling body scroll.
  useEffect(() => {
    // Get the original overflow style of the body
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // When the component mounts, disable scrolling on the body
    document.body.style.overflow = 'hidden';

    // This is a cleanup function that will be called when the component unmounts
    return () => {
      // Restore the original overflow style
      document.body.style.overflow = originalStyle;
    };
  }, []); // The empty dependency array [] ensures this effect runs only once on mount and unmount.

  return (
    // Modal overlay: covers the entire screen
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm  bg-opacity-60"
      onClick={onClose} // Close modal if you click on the overlay
    >
      {/* Modal content: stop propagation to prevent closing when clicking inside */}
      <div
        className="relative w-full max-w-2xl p-6 bg-indigo-50 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="text-xl font-semibold text-indigo-800  ">{room.title} Details</h4>
        
        <p className="text-gray-600 text-sm mb-4">{room.description}</p>

        <h5 className="text-md font-semibold text-gray-800 mb-2">Guest Capacity</h5>
        <div className="flex items-center mb-4 text-gray-700">
          {/* User Icon */}
          <svg className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-sm font-normal">{`${room.maxCapacityAdult} Adults ${room.maxCapacityChild} Children`}</span>
        </div>


        <h5 className="text-md font-semibold text-gray-800 mb-2">Amenities</h5>
        <div className="max-w-7xl  grid grid-cols-2 md:grid-cols-3 mb-2 gap-x-12 gap-y-2 text-gray-700">
          {room.amenities.map((amenity, index) => (
            <div key={index} className="flex items-start">
              {/* Checkmark Icon */}
              <svg className="w-4 h-4 text-indigo-500 mr-3  flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span><img src={amenity.Image} alt={amenity.Name} className="w-5 h-5 object-contain mr-1" /></span>
              <span className='text-sm'>{amenity.Name}</span>
            </div>
          ))}
        </div>

        <h5 className=" text-md font-semibold text-gray-800 mb-2">Room Policies</h5>
        <div className="max-w-7xl mx-auto  text-gray-700">
          {room.roomPolicies.map((policy, index) => (
            <div key={index} className="flex items-start">
              {/* Checkmark Icon */}
              <svg className="w-4 h-4 text-indigo-500 mr-3 mt-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <span className='text-sm font-medium'>{policy.Name} :</span>
                <span className='text-sm'> {policy.Description}</span>
              </div>
              
            </div>
          ))}
        </div>


        {/* Close button inside the modal */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          {/* A simple 'X' icon for closing */}
          <svg className="w-6 h-6 hover:text-indigo-600 hover:scale-115 duration-200 drop-shadow-black ease-in-out cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}

export default Roompop;