// src/components/Roomcard.jsx
import React, { useState } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import RoomOption from "./RoomOption";
import Roompop from "./Roompop";

const PLACEHOLDER_IMAGE = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22800%22%20height%3D%22533%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23e5e7eb%22/%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%236b7280%22%20font-size%3D%2228%22%20font-family%3D%22sans-serif%22%3EImage%20unavailable%3C/text%3E%3C/svg%3E";
const PLACEHOLDER_ICON = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2220%22%20height%3D%2220%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20rx%3D%224%22%20fill%3D%22%23e5e7eb%22/%3E%3Cpath%20d%3D%22M4%2010h12%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22/%3E%3Cpath%20d%3D%22M10%204v12%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22/%3E%3C/svg%3E";

function Roomcard({ room, bookingDetails, onAddToCart }) {
  const roomImages = room.images && room.images.length > 0 ? room.images : [
    "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg",
  ];

  const galleryImages = roomImages.map((url) => ({
    original: url,
    thumbnail: url,
    originalAlt: `${room.title} gallery image`,
    thumbnailAlt: `${room.title} thumbnail image`,
  }));

  const isBookingDisabled = !bookingDetails.checkIn || !bookingDetails.checkOut;
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  
  const togglePopup = () => setIsPopupVisible(!isPopupVisible);

  const applyFallback = (e, fallbackSrc = PLACEHOLDER_IMAGE) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackApplied === "true") return;
    img.dataset.fallbackApplied = "true";
    img.src = fallbackSrc;
  };

  const renderItem = (item) => (
    <img src={item.original} alt={item.originalAlt} onError={(e) => applyFallback(e)} className="image-gallery-image" loading="lazy" />
  );

  const renderThumbInner = (item) => (
    <img src={item.thumbnail} alt={item.thumbnailAlt} onError={(e) => applyFallback(e)} loading="lazy" className="object-fit" />
  );

  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row mb-6 border border-gray-200">
      
      {/* Left Side: Images & Info */}
      <div className="w-full md:w-1/3 p-4 border-r border-gray-200 flex flex-col">
        <div className="sticky top-0 bg-white z-10 text-xl font-bold text-gray-800 pb-2">
          <h3>{room.title}</h3>
        </div>

        <div className="relative mb-4 rounded-md overflow-clip aspect-w-4 aspect-h-3">
          <ImageGallery items={galleryImages} showThumbnails={false} showPlayButton={false} showNav={false} showFullscreenButton={true} autoPlay={true} slideInterval={4000} showBullets={true} renderItem={renderItem} renderThumbInner={renderThumbInner} onErrorImageURL={PLACEHOLDER_IMAGE} />
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700 mt-2">
          {room.amenities && room.amenities.slice(0, 4).map((amenity, index) => (
            <div key={index} className="flex items-center gap-2">
              <img src={amenity.Image || PLACEHOLDER_ICON} alt={amenity.Name} onError={(e) => applyFallback(e, PLACEHOLDER_ICON)} className="w-5 h-5 object-contain" loading="lazy"/>
              <span>{amenity.Name}</span>
            </div>
          ))}
        </div>

        <button onClick={togglePopup} className="w-fit text-blue-600 font-semibold text-xs text-left pt-4 cursor-pointer hover:scale-102 transition duration-200">
          View More Details
        </button>
      </div>

      {/* Right Side: Options */}
      <div className="w-full md:w-2/3 flex flex-col">
        <div className="flex bg-gray-50 p-2 border-b border-gray-200 flex-shrink-0 justify-around items-center">
          <div className="w-2/3 font-semibold text-gray-700 text-left pl-2">Room Options</div>
          <div className="w-1/3 font-semibold text-gray-700 pr-4 text-right">Price</div>
        </div>

        <div className="overflow-y-auto max-h-[450px] scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-indigo-100 flex-grow">
          {!room.ratePlans || room.ratePlans.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No plans available for this room.</div>
          ) : (
            room.ratePlans.map((planGroup, index) => (
              <RoomOption
                // 🔥 THE FIX: Combining Room ID and MealPlan ID so React knows this is a unique row
                key={`room-${room._id}-plan-${planGroup.UniqueGroupID || index}`}
                planGroup={planGroup} 
                room={room}
                onAddToCart={onAddToCart}
                isBookingDisabled={isBookingDisabled}
                bookingDetails={bookingDetails}
              />
            ))
          )}
        </div>
      </div>
      
      {isPopupVisible && <Roompop room={room} onClose={togglePopup} />}
    </div>
  );
}

export default Roomcard;