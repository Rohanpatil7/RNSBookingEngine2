// src/pages/Booking.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Costcard from '../components/Costcard';
import Gueatcounter from '../components/Gueatcounter';
import BillingContact from '../components/BillingContact';
import { getTaxes } from '../api/api_services';
import { useHotelParam } from '../utils/useHotelParam';

const BOOKING_DETAILS_KEY = 'currentBookingDetails';
const BOOKING_CART_KEY = 'bookingCart'; 
const TEMP_GUEST_COUNTS_KEY = 'tempGuestCounts';
const TEMP_CHILDREN_AGES_KEY = 'tempChildrenAges';

function Booking({ hotelData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hotelParam = useHotelParam();
  const step = location.state?.step || 'guest-count';

  const [bookingData, setBookingData] = useState({
    details: null,
    guestCounts: {},
    childrenAges: {},
    dynamicTotals: {
      roomCost: 0,
      extraAdultCost: 0,
      extraChildCost: 0,
      roomTypeBaseCosts: {},
    }
  });

  const [taxSlabs, setTaxSlabs] = useState([]);
  const [totalGuestCount, setTotalGuestCount] = useState(0);

  // =========================
  // Clearing old bookings for every new booking 
  // =========================
  useEffect(() => {
        // Guarantee a clean slate every time the user enters the checkout page
        localStorage.removeItem('bookingApiPayload');
        localStorage.removeItem('bookingApiResponse');
    }, []);
    
  // =========================
  // INIT BOOKING DATA
  // =========================

  useEffect(() => {
    let initialDetails = null;

     if (location.state?.bookingDetails) {
      initialDetails = location.state.bookingDetails;
    } else {
      // No navigation state — must be a page refresh. Fall back to sessionStorage.
      try {
        const stored = sessionStorage.getItem(BOOKING_DETAILS_KEY);
        if (stored) initialDetails = JSON.parse(stored);
      } catch (e) {
        console.error('Session parse error:', e);
      }
    }

    if (initialDetails && initialDetails.rooms) {
      sessionStorage.setItem(BOOKING_DETAILS_KEY, JSON.stringify(initialDetails));

        // FIX: Merge stored counts with fresh room initialization.
      const initialCounts = (() => {
        let storedCounts = {};  // load old data, but don't return it blindly
        try {
          const stored = sessionStorage.getItem(TEMP_GUEST_COUNTS_KEY);
          if (stored) storedCounts = JSON.parse(stored);
        } catch {}
        const counts = {};
        initialDetails.rooms.forEach((room) => {
          const initialAdults = room.selectedMealPlan?.userSelectedPax || room.room?.RoomMinCapacity || 1;
          for (let i = 0; i < room.quantity; i++) {
            const instanceId = `${room.instanceRoomId}_${i}`;
            counts[instanceId] =
              storedCounts[instanceId]  // ← existing room: keep user's prior edits
              || { adults: initialAdults, children: 0 }; // ← NEW room: use cart pax
          }
        });
        return counts;
      })();

       // FIX: Same merge approach for children ages.
      const initialAges = (() => {
        let storedAges = {};
        try {
          const stored = sessionStorage.getItem(TEMP_CHILDREN_AGES_KEY);
          if (stored) storedAges = JSON.parse(stored);
        } catch {}
        const ages = {};
        initialDetails.rooms.forEach((room) => {
          for (let i = 0; i < room.quantity; i++) {
            const instanceId = `${room.instanceRoomId}_${i}`;
            ages[instanceId] = storedAges[instanceId] || [];
          }
        });
        return ages;
      })();

      let initialTotalGuests = 0;
      Object.values(initialCounts).forEach(c => {
        initialTotalGuests += (c.adults || 0) + (c.children || 0);
      });

      setBookingData({
        details: initialDetails,
        guestCounts: initialCounts,
        childrenAges: initialAges,
        dynamicTotals: location.state?.dynamicTotals || {  // ← restore if available
          roomCost: Number(initialDetails.totalPrice) || 0,
          extraAdultCost: 0,
          extraChildCost: Number(initialDetails.extraChildCost) || 0,
          roomTypeBaseCosts: {},
  }
      });

      setTotalGuestCount(initialTotalGuests);
    } else {
      navigate('/allrooms');
    }

  }, [navigate, location.state]);

  // =========================
  // FETCH TAX SLABS
  // =========================

  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        const data = await getTaxes(hotelParam);
        if (data?.result?.tax_slabs) {
          setTaxSlabs(data.result.tax_slabs);
        }
      } catch (error) {
        console.error('Failed to fetch tax data:', error);
      }
    };

    fetchTaxes();
  }, [hotelParam]);

  // =========================
  // GUEST UPDATE
  // =========================

  const handleGuestUpdate = useCallback((data) => {
    const {
      guestCounts,
      childrenAges,
      totalCalculatedRoomCost,
      totalExtraAdultCost,
      extraChildCost,
      roomTypeBaseCosts,
      totalGuests
    } = data;

    setBookingData(prev => {
      sessionStorage.setItem(TEMP_GUEST_COUNTS_KEY, JSON.stringify(guestCounts));
      sessionStorage.setItem(TEMP_CHILDREN_AGES_KEY, JSON.stringify(childrenAges));

      return {
        ...prev,
        guestCounts,
        childrenAges,
        dynamicTotals: {
          roomCost: totalCalculatedRoomCost,
          extraAdultCost: totalExtraAdultCost,
          extraChildCost: extraChildCost,
          roomTypeBaseCosts
        }
      };
    });

    setTotalGuestCount(totalGuests);
  }, []);

  // =========================
  // REMOVE ROOM
  // =========================

  const handleRemoveRoom = useCallback((roomIndex) => {
    setBookingData(prev => {
      const newDetails = { ...prev.details };
      const newRooms = newDetails.rooms.map(r => ({ ...r }));

      try {
        const roomToRemove = newRooms[roomIndex];
        const targetInstanceId = roomToRemove.instanceRoomId; 
        
        const storedCart = sessionStorage.getItem(BOOKING_CART_KEY);
        if (storedCart && targetInstanceId) {
          const cart = JSON.parse(storedCart);
          const cartItemIndex = cart.findIndex(item => item.room._id === targetInstanceId);

          if (cartItemIndex !== -1) {
            if (newRooms[roomIndex].quantity > 1) {
              if (cart[cartItemIndex].quantity > 1) {
                 cart[cartItemIndex].quantity -= 1;
              } else {
                 cart.splice(cartItemIndex, 1);
              }
            } else {
              cart.splice(cartItemIndex, 1);
            }
            sessionStorage.setItem(BOOKING_CART_KEY, JSON.stringify(cart));
          }
        }
      } catch (err) {
        console.error("Failed to sync room removal with cart:", err);
      }

      if (newRooms[roomIndex].quantity > 1) {
        newRooms[roomIndex].quantity -= 1;
      } else {
        newRooms.splice(roomIndex, 1);
      }

      if (newRooms.length === 0) {
        navigate('/allrooms');
        return prev;
      }

      newDetails.rooms = newRooms;
      sessionStorage.setItem(BOOKING_DETAILS_KEY, JSON.stringify(newDetails));

      return { ...prev, details: newDetails };
    });
  }, [navigate]);

  const handleGuestConfirm = () => {
    navigate('.', {
      state: {
        ...(location.state || {}),
        bookingDetails: bookingData.details,
        dynamicTotals: bookingData.dynamicTotals,
        step: 'guest-details',
      },
    });
  };

  // =========================
  // FINAL TAX LOGIC
  // =========================

  const {
    finalGrandTotal,
    calculatedTaxAmount,
    currentTaxBreakdown,
    serviceFee,
    taxableAmount
  } = useMemo(() => {

    const details = bookingData.details;
    if (!details) {
      return {
        finalGrandTotal: 0,
        calculatedTaxAmount: 0,
        currentTaxBreakdown: [],
        serviceFee: 0,
        taxableAmount: 0
      };
    }

    const roomCost = Number(bookingData.dynamicTotals?.roomCost) || 0;
    const childCost = Number(bookingData.dynamicTotals?.extraChildCost) || 0;
    const currentTaxable = roomCost + childCost;

    const sFee =
      Number(details.serviceFee ??
        hotelData?.ServiceCharges ??
        hotelData?.serviceFee ?? 0) || 0;

    if (!taxSlabs?.length) {
      return {
        finalGrandTotal: currentTaxable + sFee,
        calculatedTaxAmount: 0,
        currentTaxBreakdown: [],
        serviceFee: sFee,
        taxableAmount: currentTaxable
      };
    }

    try {
      const sortedSlabs = [...taxSlabs].sort((a, b) => {
        const aTo = a.to_amt == null ? Infinity : Number(a.to_amt);
        const bTo = b.to_amt == null ? Infinity : Number(b.to_amt);
        return aTo - bTo;
      });

      let activeSlab = null;

      for (const slab of sortedSlabs) {
        const to = slab.to_amt == null ? Infinity : Number(slab.to_amt);
        if (currentTaxable <= to) {
          activeSlab = slab;
          break;
        }
      }

      if (!activeSlab && sortedSlabs.length) {
        activeSlab = sortedSlabs[sortedSlabs.length - 1];
      }

      let totalTax = 0;
      let formattedBreakdown = [];

      if (activeSlab) {
        const slabPct = Number(activeSlab.tax_percentage) || 0;
        totalTax = currentTaxable * (slabPct / 100);

        if (activeSlab.sub_taxes?.length) {
          activeSlab.sub_taxes.forEach(sub => {
            const pct = Number(sub.TaxPercetage) || 0;
            const amt = currentTaxable * (pct / 100);

            formattedBreakdown.push({
              TaxGroupName: sub.SubTaxName,
              Amount: Math.round(amt),
              Percent: pct
            });
          });
        } else {
          formattedBreakdown.push({
            TaxGroupName: activeSlab.tax_name,
            Amount: Math.round(totalTax),
            Percent: slabPct
          });
        }
      }

      const finalTotal = 1;

      return {
        finalGrandTotal: Math.round(finalTotal),
        calculatedTaxAmount: Math.round(totalTax),
        currentTaxBreakdown: formattedBreakdown,
        serviceFee: sFee,
        taxableAmount: currentTaxable
      };

    } catch (err) {
      console.error("Tax calc error:", err);
      return {
        finalGrandTotal: currentTaxable + sFee,
        calculatedTaxAmount: 0,
        currentTaxBreakdown: [],
        serviceFee: sFee,
        taxableAmount: currentTaxable
      };
    }

  }, [bookingData.details, bookingData.dynamicTotals, taxSlabs, hotelData]);

  if (!bookingData.details) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen sm:flex-col-reverse">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:gap-6 lg:gap-8">

          <div className="w-full md:w-3/5 space-y-6">
            {step === 'guest-count' && (
              <Gueatcounter
                rooms={bookingData.details?.rooms}
                dates={bookingData.details?.dates}
                initialGuestCounts={bookingData.guestCounts}
                initialChildrenAges={bookingData.childrenAges}
                onConfirm={handleGuestConfirm}
                onGuestChange={handleGuestUpdate}
                onRemoveRoom={handleRemoveRoom}
              />
            )}

            {step === 'guest-details' && (
              <BillingContact
                hotelData={hotelData}
                grandTotal={finalGrandTotal}
                totalGuests={totalGuestCount}
              />
            )}
          </div>

          <div className="w-full md:w-2/5">
            <div className="lg:sticky lg:top-8 mt-6 md:mt-0">
              <Costcard
                bookingDetails={bookingData.details}
                hotelData={hotelData}
                taxBreakdown={currentTaxBreakdown}
                calculatedTaxAmount={calculatedTaxAmount}
                serviceFee={serviceFee}
                grandTotal={finalGrandTotal}
                dynamicRoomCost={bookingData.dynamicTotals?.roomCost}
                extraAdultCost={bookingData.dynamicTotals?.extraAdultCost}
                extraChildCost={bookingData.dynamicTotals?.extraChildCost}
                roomTypePrices={bookingData.dynamicTotals?.roomTypeBaseCosts}
                TaxableAmount={taxableAmount}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Booking;