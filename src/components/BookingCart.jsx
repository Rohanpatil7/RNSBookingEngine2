// src/components/BookingCart.jsx

import React, { useEffect, useState } from 'react';

const BOOKING_DETAILS_KEY = 'currentBookingDetails';

const BookingCart = ({ cart, bookingDetails, onRemove, onAdd, totalPrice, onBookNow, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
   
    const totalNights = bookingDetails.nights > 0 ? bookingDetails.nights : 0;

    useEffect(() => {
        const currentBookingDetails = {
            rooms: cart.map(item => ({
                roomId: item.room._id.split('-')[0],
                instanceRoomId: item.room._id,
                roomTypeId: item.room.RoomTypeID,
                mealPlanId: item.room.selectedMealPlan?.MealPlanID, // Ensure this accessor is safe
                title: item.room.title,
                quantity: item.quantity,
                pricePerNight: item.room.pricePerNight,
                // --- FIX: Pass all selected meal plan data ---
                selectedMealPlan: item.room.selectedMealPlan,
                
                // --- NEW VARIABLE: Store the count of Pax Objects (e.g. 4 if rates for 1,2,3,4 exist) ---
                paxCount: item.room.selectedMealPlan?.Rates?.length || item.room.maxCapacityAdult || 0,

                // --- FIX: Persist ALL room capacity limits ---
                room: {
                    maxOccupancy: item.room.maxCapacity,
                    maxCapacityAdult: item.room.maxCapacityAdult, // Critical for Adult Limit
                    maxCapacityChild: item.room.maxCapacityChild, // Critical for Child Limit
                    FreeChildAge: item.room.FreeChildAge,
                    RoomMinCapacity: item.room.RoomMinCapacity || 1,
                    // Spread any other properties needed
                    ...item.room 
                }
            })),
            dates: {
                checkIn: bookingDetails.checkIn,
                checkOut: bookingDetails.checkOut,
                nights: totalNights,
            },
            guests: {
                adults: bookingDetails.adults,
                children: bookingDetails.children,
            },
            totalPrice: totalPrice,
        };
        
        sessionStorage.setItem(BOOKING_DETAILS_KEY, JSON.stringify(currentBookingDetails));

    }, [cart, bookingDetails, totalPrice, totalNights]);

    const handleBookNow = () => {
        if (totalNights === 0 || cart.length === 0) {
            console.error("Booking cannot proceed: Dates not selected or cart is empty.");
            return;
        }
        onBookNow(); 
    };

    if (cart.length === 0) {
        return null;
    }

    return (
        <>
            {!isOpen && (
                <div className="fixed bottom-4 right-4 z-30 animate-none cursor-pointer">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700  text-white font-semibold cursor-pointer py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
                        aria-label="Open booking cart"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        View Selection ({cart.reduce((acc, item) => acc + item.quantity, 0)})
                    </button>
                </div>
            )}

            <div 
                className={`fixed bottom-0 left-0 right-0 bg-gray-900 text-white shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.2)] z-40 transition-transform duration-300 ease-in-out
                            ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="absolute top-2 right-2 z-50">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-red-300 hover:scale-125 transition-all p-2"
                        aria-label="Close booking cart"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex-grow min-w-0 w-full md:w-auto">
                            <h3 className="text-lg font-semibold mb-3 text-gray-200 text-center md:text-left">
                                Your Selection
                            </h3>

                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                            {cart.map(item => (
                            <div
                                key={item.room._id || item.room.id}
                                className="bg-gray-700 rounded-lg p-3 flex-shrink-0 flex items-center gap-3 max-w-[280px]"
                            >
                                <div className="flex-grow min-w-0">
                                <div className="text-center justify-center">
                                    <p className="text-sm font-semibold line-clamp-3 whitespace-normal break-words text-center">
                                    {item.room.title}
                                    </p>

                                    <p className="text-xs text-center text-indigo-300">
                                    ₹{item.room.pricePerNight.toLocaleString('en-IN')} / night
                                    </p>
                                    
                                    {/* Optional: Show selected Pax in cart for verification */}
                                    {item.room.selectedMealPlan?.userSelectedPax && (
                                        <p className="text-[10px] text-gray-400 text-center">
                                            For {item.room.selectedMealPlan.userSelectedPax} Adult{item.room.selectedMealPlan.userSelectedPax > 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-2 flex justify-center items-start gap-2">
                                    <p className="text-sm text-gray-400 ">No.Rooms:</p>
                                    <div className="flex items-center gap-2 bg-gray-800 rounded-full w-fit px-2">
                                    <button
                                        onClick={() => onRemove(item.room)}
                                        className="text-white font-bold text-lg w-7 h-7 cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                                        aria-label={`Decrease quantity of ${item.room.title}`}
                                    >
                                        -
                                    </button>
                                    <span className="font-medium text-sm w-4 text-center">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => onAdd(item.room)}
                                        className="text-white font-bold text-lg w-7 h-7 cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50"
                                        aria-label={`Increase quantity of ${item.room.title}`}
                                        disabled={item.quantity >= (item.room.remainingRooms || 99)}
                                    >
                                        +
                                    </button>
                                    </div>
                                </div>
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>

                        <div className="h-px w-full md:h-16 md:w-px bg-gray-600 my-2 md:my-0 md:mx-4"></div>

                        <div className="flex-shrink-0 flex items-center justify-between md:justify-center gap-4 w-full md:w-auto px-2">
                            <div className='text-left'>
                                <p className="text-lg md:text-xl font-bold">Estimated: ₹{totalPrice.toLocaleString('en-IN')}</p>
                                
                                {totalNights > 0 && (<p className="text-sm text-gray-400">for {totalNights} {totalNights > 1 ? 'nights' : 'night'}</p>)}
                                {totalNights === 0 && (<p className="text-sm text-yellow-400 font-semibold">Please select dates.</p>)}
                            </div>
                            
                            <button
                                onClick={handleBookNow} 
                                className="bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700   text-white font-semibold cursor-pointer text-base py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap "
                                disabled={totalNights === 0 || totalPrice === 0 || isLoading}
                            >
                                {isLoading ? 'Loading Rates...' : 'Book Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookingCart;