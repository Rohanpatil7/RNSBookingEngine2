// src/pages/AllRooms.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Roomcard from '../components/Roomcard';
import DatePricePicker from '../components/DatePricePicker';
import BookingCart from '../components/BookingCart';
import { getRoomRates } from '../api/api_services.js';
import { useHotelParam } from '../utils/useHotelParam';
import { BallTriangle } from 'react-loader-spinner';
import RinaAIWidget from '../components/RinaAIWidget.jsx';

const BOOKING_CART_KEY = 'bookingCart';
const BOOKING_DETAILS_KEY = 'currentBookingDetails';

const formatDateForApi = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRateForOccupancy = (paxRates, adults) => {
  if (!paxRates || !Array.isArray(paxRates) || paxRates.length === 0) return null;

  const numAdults = adults || 1;
  const exactMatch = paxRates.find(r => Number(r.NoOfPax) === numAdults);
  if (exactMatch) return exactMatch.Rate;

  const maxPaxRate = paxRates.reduce((prev, current) =>
    (prev.NoOfPax > current.NoOfPax) ? prev : current
  );

  if (numAdults > maxPaxRate.NoOfPax) {
    const extraPaxCount = numAdults - maxPaxRate.NoOfPax;
    const extraRate = maxPaxRate.ExtraAdultRate || 0;
    return maxPaxRate.Rate + (extraPaxCount * extraRate);
  }

  return maxPaxRate.Rate;
};

const mergeUniqueItems = (currentItems = [], incomingItems = [], getKey, mergeItem) => {
  const mergedMap = new Map();

  [...currentItems, ...incomingItems].forEach((item) => {
    const key = getKey(item);
    if (key === undefined || key === null) return;

    const existingItem = mergedMap.get(key);
    mergedMap.set(key, existingItem ? mergeItem(existingItem, item) : item);
  });

  return Array.from(mergedMap.values());
};

const mergePolicies = (currentPolicies = [], incomingPolicies = []) =>
  mergeUniqueItems(
    currentPolicies,
    incomingPolicies,
    (policy) => String(policy?.ID ?? policy?.Name ?? JSON.stringify(policy)),
    (existingPolicy, incomingPolicy) => ({ ...existingPolicy, ...incomingPolicy })
  );

const mergePaxRates = (currentRates = [], incomingRates = []) =>
  mergeUniqueItems(
    currentRates,
    incomingRates,
    (rate) => String(rate?.NoOfPax),
    (existingRate, incomingRate) => ({ ...existingRate, ...incomingRate })
  );

const mergeRateTypes = (currentRateTypes = [], incomingRateTypes = []) =>
  mergeUniqueItems(
    currentRateTypes,
    incomingRateTypes,
    (rateType) => String(rateType?.RateTypeId ?? rateType?.RateType),
    (existingRateType, incomingRateType) => ({
      ...existingRateType,
      ...incomingRateType,
      PaxRates: mergePaxRates(existingRateType?.PaxRates, incomingRateType?.PaxRates),
    })
  );

const mergeMealPlans = (currentPlans = [], incomingPlans = []) =>
  mergeUniqueItems(
    currentPlans,
    incomingPlans,
    (plan) => String(plan?.MealPlanID ?? plan?.MealPlan),
    (existingPlan, incomingPlan) => ({
      ...existingPlan,
      ...incomingPlan,
      RateTypes: mergeRateTypes(existingPlan?.RateTypes, incomingPlan?.RateTypes),
      MealPlanPolicies: mergePolicies(existingPlan?.MealPlanPolicies, incomingPlan?.MealPlanPolicies),
    })
  );

const preferNonEmptyArray = (currentItems = [], incomingItems = []) =>
  currentItems.length > 0 ? currentItems : incomingItems;

const normalizeRooms = (resultEntries = []) => {
  const roomMap = new Map();

  resultEntries.forEach((entry) => {
    (entry?.Rooms || []).forEach((apiRoom) => {
      const roomId = String(apiRoom?.RoomTypeID);
      const existingRoom = roomMap.get(roomId);

      if (!existingRoom) {
        roomMap.set(roomId, {
          ...apiRoom,
          RoomImages: [...(apiRoom?.RoomImages || [])],
          Amenities: [...(apiRoom?.Amenities || [])],
          MealPlans: mergeMealPlans([], apiRoom?.MealPlans || []),
          roomPolicies: [...(apiRoom?.roomPolicies || [])],
        });
        return;
      }

      roomMap.set(roomId, {
        ...existingRoom,
        ...apiRoom,
        RoomCategory: existingRoom.RoomCategory || apiRoom.RoomCategory,
        Description: existingRoom.Description || apiRoom.Description,
        RoomImages: preferNonEmptyArray(existingRoom.RoomImages || [], apiRoom.RoomImages || []),
        Amenities: preferNonEmptyArray(existingRoom.Amenities || [], apiRoom.Amenities || []),
        MealPlans: mergeMealPlans(existingRoom.MealPlans || [], apiRoom.MealPlans || []),
        roomPolicies: mergePolicies(existingRoom.roomPolicies || [], apiRoom.roomPolicies || []),
      });
    });
  });

  return Array.from(roomMap.values());
};

function AllRooms({hotelData}) {
  const navigate = useNavigate();
  const location = useLocation();
  const hotelParam = useHotelParam();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasRoomsButNoRates, setHasRoomsButNoRates] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [bookingDetails, setBookingDetails] = useState(() => {
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

    const defaultDetails = {
      checkIn: getTomorrow(),
      checkOut: getDayAfterTomorrow(),
      nights: 1,
      adults: 1,
      children: 0,
    };

    const params = new URLSearchParams(window.location.search);
    const urlCheckIn = params.get('checkin');
    const urlCheckOut = params.get('checkout');
    const urlAdults = parseInt(params.get('adults'), 10);
    const urlChildren = parseInt(params.get('children'), 10);

    if (urlCheckIn && urlCheckOut && new Date(urlCheckIn) > new Date()) {
      const checkIn = new Date(urlCheckIn);
      const checkOut = new Date(urlCheckOut);
      const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return { checkIn, checkOut, nights, adults: urlAdults || 1, children: urlChildren || 0 };
    }

    const homePageDetails = location.state?.initialBookingDetails;
    if (homePageDetails) {
      return {
        ...defaultDetails, ...homePageDetails,
        checkIn: new Date(homePageDetails.checkIn),
        checkOut: new Date(homePageDetails.checkOut),
      };
    }

    const savedDetails = sessionStorage.getItem(BOOKING_DETAILS_KEY);
    if (savedDetails) {
      try {
        const parsed = JSON.parse(savedDetails);
        return {
          ...defaultDetails,
          checkIn: parsed.dates?.checkIn ? new Date(parsed.dates.checkIn) : defaultDetails.checkIn,
          checkOut: parsed.dates?.checkOut ? new Date(parsed.dates.checkOut) : defaultDetails.checkOut,
          nights: parsed.dates?.nights || 1,
          adults: parsed.guests?.adults || 1,
          children: parsed.guests?.children || 0,
        };
      } catch (e) { console.error(e); }
    }
    return defaultDetails;
  });

  const [tempBookingDetails, setTempBookingDetails] = useState(bookingDetails);

  const [cart, setCart] = useState(() => {
    const savedCart = sessionStorage.getItem(BOOKING_CART_KEY);
    try { return savedCart ? JSON.parse(savedCart) : []; } catch (e) { return []; }
  });

  useEffect(() => {
    sessionStorage.setItem(BOOKING_CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    let isCancelled = false;

    const fetchRoomRates = async () => {
      const checkInDate = formatDateForApi(bookingDetails.checkIn);

      if (!checkInDate || !hotelParam) {
        setLoading(false); setRooms([]); return;
      }
      setLoading(true); setError(null); setHasRoomsButNoRates(false);

      try {
        const params = { BookingDate: checkInDate, Parameter: hotelParam };
        const responseData = await getRoomRates(params);

        if (isCancelled) return;

        const allRooms = normalizeRooms(responseData?.result || []);

        const topLevelError = responseData?.result?.find((entry) => entry?.Error)?.Error;

        if (allRooms.length > 0) {

          console.log("Raw API Response in AllRooms (all rooms):", allRooms);

          const availableRooms = [];

          allRooms.forEach((apiRoom) => {
            // Skip rooms with no meal plans
            if (!apiRoom.MealPlans || apiRoom.MealPlans.length === 0) return;

            const validRateGroups = [];

            apiRoom.MealPlans.forEach(plan => {
              // Only process meal plans that have RateTypes with content
              if (plan.RateTypes && Array.isArray(plan.RateTypes) && plan.RateTypes.length > 0) {

                const validRatesForPlan = [];

                plan.RateTypes.forEach(rt => {
                  // Only include rate types that have actual PaxRates
                  if (rt.PaxRates && Array.isArray(rt.PaxRates) && rt.PaxRates.length > 0) {
                    validRatesForPlan.push({
                      // Globally unique ID combining RoomTypeID + MealPlanID + RateType string
                      MealPlanID: `Room${apiRoom.RoomTypeID}-Plan${plan.MealPlanID}-Type${rt.RateType.replace(/\s+/g, '')}`,
                      OriginalMealPlanID: plan.MealPlanID,   // ← ADD: numeric ID from API
                      RateTypeId: rt.RateTypeId,   
                      RateType: rt.RateType,
                      Rates: rt.PaxRates,
                      Policies: plan.MealPlanPolicies || [],
                      MealPlanName: plan.MealPlan,
                      MealPlan: `${plan.MealPlan} (${rt.RateType})`,
                    });
                  }
                });

                if (validRatesForPlan.length > 0) {
                  validRateGroups.push({
                    UniqueGroupID: `Room${apiRoom.RoomTypeID}-Plan${plan.MealPlanID}`,
                    MealPlanName: plan.MealPlan,
                    AvailableRates: validRatesForPlan,
                  });
                }
              }
            });

            if (validRateGroups.length > 0) {
              const firstRateArray = validRateGroups[0].AvailableRates[0].Rates;
              const displayPrice = getRateForOccupancy(firstRateArray, 1) || 0;

              availableRooms.push({
                _id: String(apiRoom.RoomTypeID),
                title: apiRoom.RoomCategory ? apiRoom.RoomCategory.trim() : 'Unknown Room',
                description: apiRoom.Description,
                images: apiRoom.RoomImages || [],
                amenities: apiRoom.Amenities || [],
                roomPolicies: apiRoom.roomPolicies || [],
                ratePlans: validRateGroups,
                pricePerNight: displayPrice,
                maxCapacityAdult: apiRoom.RoomMaxCapacityAdult || 2,
                maxCapacityChild: apiRoom.RoomMaxCapacityChild || 0,
                FreeChildAge: apiRoom.FreeChildAge || 0,
                maxCapacity: (apiRoom.RoomMaxCapacityAdult || 2) + (apiRoom.RoomMaxCapacityChild || 0),
                RoomMinCapacity: apiRoom.RoomMinCapacity || 1,
              });
            }
          });

          // If rooms existed in raw data but none passed the rate-validation filter
          if (allRooms.length > 0 && availableRooms.length === 0) {
            setHasRoomsButNoRates(true);
          }

          setRooms(availableRooms);

        } else if (topLevelError) {
          setError(topLevelError);
          setRooms([]);
        } else {
          setError('Could not find room data in the API response.');
          setRooms([]);
        }
      } catch (err) {
        if (!isCancelled) setError(err.message || 'An unknown error occurred.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchRoomRates();
    return () => { isCancelled = true; };
  }, [bookingDetails.checkIn, hotelParam]);

  const filteredRooms = useMemo(() => rooms, [rooms]);

  const handleAddToCart = (baseRoom, selectedRate) => {
    const paxForPrice = selectedRate.userSelectedPax || bookingDetails.adults || 1;
    const pricePerNight = getRateForOccupancy(selectedRate.Rates, paxForPrice);

    if (pricePerNight === undefined || pricePerNight === null) {
      alert('This rate option is currently unavailable for the selected number of guests.');
      return;
    }

    const roomToAdd = {
      ...baseRoom,
      _id: `${baseRoom._id}-${selectedRate.MealPlanID}-${paxForPrice}`,
      title: `${baseRoom.title} - ${selectedRate.MealPlanName} (${selectedRate.RateType})`,
      pricePerNight,
      selectedMealPlan: selectedRate,
    };

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.room._id === roomToAdd._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.room._id === roomToAdd._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { room: roomToAdd, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (roomToRemove) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.room._id === roomToRemove._id);
      if (existingItem && existingItem.quantity === 1) {
        return prevCart.filter((item) => item.room._id !== roomToRemove._id);
      }
      return prevCart.map((item) =>
        item.room._id === roomToRemove._id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const totalNights = bookingDetails.nights > 0 ? bookingDetails.nights : 0;
  const totalPrice = useMemo(() => {
    const perNightTotal = cart.reduce((total, item) => total + item.room.pricePerNight * item.quantity, 0);
    return perNightTotal * totalNights;
  }, [cart, totalNights]);

  const handleProceedToBooking = () => {
    if (loading) return;

    const bookingDataForState = {
      rooms: cart.map((item) => ({
        roomId: item.room._id.split('-')[0],
        instanceRoomId: item.room._id,
        title: item.room.title,
        quantity: item.quantity,
        pricePerNight: item.room.pricePerNight,
        room: {
          maxOccupancy: item.room.maxCapacity,
          maxCapacityAdult: item.room.maxCapacityAdult,
          maxCapacityChild: item.room.maxCapacityChild,
          FreeChildAge: item.room.FreeChildAge,
          RoomMinCapacity: item.room.RoomMinCapacity,
        },
        selectedMealPlan: item.room.selectedMealPlan,
      })),
      dates: { checkIn: bookingDetails.checkIn, checkOut: bookingDetails.checkOut, nights: totalNights },
      guests: { adults: bookingDetails.adults, children: bookingDetails.children },
      totalPrice,
    };

    if (bookingDataForState.rooms.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    sessionStorage.setItem(BOOKING_DETAILS_KEY, JSON.stringify(bookingDataForState));
    sessionStorage.setItem(BOOKING_CART_KEY, JSON.stringify(cart));
    navigate('/booking/new', { state: { bookingDetails: bookingDataForState } });
  };

  const openEditor = () => { setTempBookingDetails(bookingDetails); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const closeEditor = () => { setIsEditing(false); setCart([]); setBookingDetails(tempBookingDetails); };
  const formatDate = (date) => {
    if (!date) return 'Not selected';
    return new Date(date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-1 md:p-1 sm:p-1 z-50 bg-white">
      <div className="sticky top-18 z-50 p-1 bg-white mb-2">
        {isEditing ? (
          <div>
            <DatePricePicker
              onDateChange={(newDateInfo) => setTempBookingDetails((prev) => ({ ...prev, ...newDateInfo }))}
              initialCheckIn={tempBookingDetails.checkIn}
              initialCheckOut={tempBookingDetails.checkOut}
            />
            <div className="flex justify-center items-center mt-4">
              <button onClick={closeEditor} className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Set Dates</button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-1">
            <div className="flex flex-col w-full items-center justify-around gap-1 px-4 py-1">
              <div className="flex flex-row items-center gap-x-2 gap-y-1 md:text-md text-gray-700">
                <span className="truncate"><span className="font-semibold text-indigo-500">Check-In:</span> {formatDate(bookingDetails.checkIn)}</span>
                <span className="truncate"><span className="font-semibold text-indigo-500">Check-Out:</span> {formatDate(bookingDetails.checkOut)}</span>
              </div>
              <button onClick={openEditor} className="shrink-0 cursor-pointer text-sm md:text-md font-medium text-indigo-600 rounded px-1 hover:bg-indigo-600 hover:text-white transition">Edit Details</button>
            </div>
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex flex-col gap-4 mt-4 lg:pl-8 sm:px-0 lg:mx-24 md:mx-4 sm:mx-8 mb-4">
          {loading ? (
            <div className="text-center p-10 justify-center flex align-baseline">
              <BallTriangle height={100} width={100} radius={5} color="#3d52f2" ariaLabel="ball-triangle-loading" visible={true} />
            </div>
          ) : error ? (
            <div className="text-center p-10 text-red-500">Error: {error}</div>
          ) : filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <Roomcard
                key={`room-${room._id}`}
                room={room}
                bookingDetails={bookingDetails}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">{hasRoomsButNoRates ? "Rooms available but no rates set." : "No rooms found for selected dates."}</p>
          )}
        </div>
      )}

      <RinaAIWidget hotelData={hotelData} rooms={filteredRooms} />

      {!isEditing && (
        <BookingCart
          cart={cart}
          bookingDetails={bookingDetails}
          onRemove={handleRemoveFromCart}
          onAdd={(room) => {
            const baseRoomId = room._id.split('-')[0];
            const baseRoom = rooms.find((r) => r._id.toString() === baseRoomId);
            if (baseRoom && room.selectedMealPlan) {
              handleAddToCart(baseRoom, room.selectedMealPlan);
            }
          }}
          totalPrice={totalPrice}
          onBookNow={handleProceedToBooking}
          isLoading={loading}
        />
      )}
    </div>
  );
}

export default AllRooms;
