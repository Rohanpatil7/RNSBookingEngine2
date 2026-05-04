// src/components/Gueatcounter.jsx
import React, { useState, useEffect, useMemo } from 'react';

const TEMP_GUEST_COUNTS_KEY = 'tempGuestCounts';
const TEMP_CHILDREN_AGES_KEY = 'tempChildrenAges';

const CounterButton = ({ onClick, disabled, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    type="button"
    className={`p-1 rounded-full transition-all duration-200 ${
      disabled 
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' 
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:scale-110 active:scale-95 cursor-pointer'
    }`}
  >
    <Icon />
  </button>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const getRateForPax = (rates, adultCount) => {
  if (!rates || !Array.isArray(rates) || rates.length === 0) {
    return { rate: 0, childRate: 0, extraComponent: 0 };
  }

  const numAdults = Number(adultCount);

  // 1. Exact Match Check - STRICT NUMBER CASTING FIX
  const exactMatch = rates.find(r => Number(r.NoOfPax) === numAdults);
  
  if (exactMatch) {
    return { 
      rate: parseFloat(exactMatch.Rate || 0), 
      childRate: parseFloat(exactMatch.PaidChildRate || 0),
      extraComponent: 0 
    };
  }

  // 2. Find Max Defined Pax
  const maxPaxRate = rates.reduce((prev, curr) => (Number(prev.NoOfPax) > Number(curr.NoOfPax) ? prev : curr), rates[0]);
  const maxPax = Number(maxPaxRate.NoOfPax);
  
  // 3. Exceeded Max Pax Logic
  if (numAdults > maxPax) {
    const extraAdults = numAdults - maxPax;
    const baseRate = parseFloat(maxPaxRate.Rate || 0);
    const extraRate = parseFloat(maxPaxRate.ExtraAdultRate || 0);
    
    // Total Rate = Base + Extra
    const extraCostTotal = extraAdults * extraRate;
    const calculatedRate = baseRate + extraCostTotal;
    
    return { 
      rate: calculatedRate, 
      childRate: parseFloat(maxPaxRate.PaidChildRate || 0),
      extraComponent: extraCostTotal 
    };
  }

  // 4. Fallback
  return { 
    rate: parseFloat(maxPaxRate.Rate || 0), 
    childRate: parseFloat(maxPaxRate.PaidChildRate || 0),
    extraComponent: 0
  };
};

const Gueatcounter = ({ rooms, dates, initialGuestCounts, initialChildrenAges, onConfirm, onGuestChange, onRemoveRoom }) => {
  
  const roomInstances = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];

    return rooms.flatMap((room, roomIndex) => {
      const rates = room.selectedMealPlan?.Rates || [];
      const std = room.selectedMealPlan?.userSelectedPax || room.room?.RoomMinCapacity || 1;
      const minAdults = 1; 
      const maxAdults = room.room?.maxCapacityAdult ?? room.room?.RoomMaxCapacityAdult ?? 4;
      const maxChildren = room.room?.maxCapacityChild ?? room.room?.RoomMaxCapacityChild ?? 4;
      const paxCount = room.paxCount || room.room?.RoomMinCapacity || 1;

      return Array.from({ length: room.quantity }).map((_, i) => ({
        instanceId: `${room.instanceRoomId}_${i}`,
        instanceRoomId: room.instanceRoomId,
        roomId: room.roomId,
        roomIndex: roomIndex,
        title: room.title,
        instanceNum: i + 1,
        metrics: { std, maxAdults, maxChildren, minAdults, rates, paxCount }
      }));
    });
  }, [rooms]);

   // FIX: Merge stored counts with fresh room initialization.
  const [guestCounts, setGuestCounts] = useState(() => {
    let storedCounts = {};
    try {
      const stored = sessionStorage.getItem(TEMP_GUEST_COUNTS_KEY);
      if (stored) storedCounts = JSON.parse(stored);  // ← save it, don't return early
    } catch {}
    const defaults = {};
    if (rooms) {
      rooms.forEach((room) => {
        const initialAdults = room.selectedMealPlan?.userSelectedPax || room.room?.RoomMinCapacity || 1;
        for (let i = 0; i < room.quantity; i++) {
          const instanceId = `${room.instanceRoomId}_${i}`;
          defaults[instanceId] =
            storedCounts[instanceId]  // ← old room → keep user edits
            || { adults: initialAdults, children: 0 };  // ← new room → use cart pax
        }
      });
    }
    return defaults;
  });

  // FIX: Same merge for childrenAges — new rooms start empty, old rooms keep ages.
  const [childrenAges, setChildrenAges] = useState(() => {
    let storedAges = {};
    try {
      const stored = sessionStorage.getItem(TEMP_CHILDREN_AGES_KEY);
      if (stored) storedAges = JSON.parse(stored);
    } catch {}
    const ages = {};
    if (rooms) {
      rooms.forEach((room) => {
        for (let i = 0; i < room.quantity; i++) {
          const instanceId = `${room.instanceRoomId}_${i}`;
          ages[instanceId] = storedAges[instanceId] || [];  // ← new room gets []
        }
      });
    }
    return ages;
  });

  useEffect(() => {
    sessionStorage.setItem(TEMP_GUEST_COUNTS_KEY, JSON.stringify(guestCounts));
  }, [guestCounts]);

  useEffect(() => {
    sessionStorage.setItem(TEMP_CHILDREN_AGES_KEY, JSON.stringify(childrenAges));
  }, [childrenAges]);

  useEffect(() => {
    if (!onGuestChange) return;

    let totalCalculatedRoomCost = 0;
    let totalExtraAdultCost = 0; 
    let totalExtraChildCost = 0;
    let totalGuests = 0;
    
    const roomTypeBaseCosts = {}; 

    const nights = dates?.nights || 0;

    roomInstances.forEach(({ instanceId, instanceRoomId, metrics }) => {
      const counts = guestCounts[instanceId] || { adults: metrics.minAdults, children: 0 };
      totalGuests += (counts.adults || 0) + (counts.children || 0);

      const pricing = getRateForPax(metrics.rates, counts.adults);
      
      const instanceFullCost = pricing.rate * nights;
      const instanceExtraCost = pricing.extraComponent * nights;
      const instanceBaseCost = instanceFullCost - instanceExtraCost; 

      totalCalculatedRoomCost += instanceFullCost;
      if (pricing.extraComponent > 0) {
        totalExtraAdultCost += instanceExtraCost;
      }

      roomTypeBaseCosts[instanceRoomId] = (roomTypeBaseCosts[instanceRoomId] || 0) + instanceBaseCost;

      const instanceAges = childrenAges[instanceId] || [];
      const chargeableChildrenCount = instanceAges.filter(age => {
        const val = parseInt(age, 10);
        return !isNaN(val) && val > 5;
      }).length;

      if (chargeableChildrenCount > 0) {
        totalExtraChildCost += (chargeableChildrenCount * pricing.childRate * nights);
      }
    });

    onGuestChange({ 
      guestCounts, 
      childrenAges, 
      totalCalculatedRoomCost, 
      totalExtraAdultCost, 
      extraChildCost: totalExtraChildCost, 
      roomTypeBaseCosts,
      totalGuests 
    });
  }, [guestCounts, childrenAges, onGuestChange, dates?.nights, roomInstances]);

  const handleCountChange = (instanceId, type, delta, metrics) => {
    setGuestCounts(prev => {
      const current = prev[instanceId] || { adults: metrics.minAdults, children: 0 };
      const newValue = current[type] + delta;

      if (type === 'adults') {
        if (newValue < metrics.minAdults) return prev;
        if (newValue > metrics.maxAdults) return prev;
      } else {
        if (newValue < 0 || newValue > metrics.maxChildren) return prev;
      }

      const updated = { ...prev, [instanceId]: { ...current, [type]: newValue } };

      if (type === 'children') {
        setChildrenAges(prevAges => {
          const ages = [...(prevAges[instanceId] || [])];
          if (delta > 0) ages.push(''); 
          else ages.pop();
          return { ...prevAges, [instanceId]: ages };
        });
      }
      return updated;
    });
  };

  const handleChildAgeChange = (instanceId, index, val) => {
    let parsed = parseInt(val, 10);
    if (isNaN(parsed)) parsed = '';
    else {
      if (parsed > 15) {
        parsed = 15;
      }
      if (parsed < 0) parsed = 0;
    }

    setChildrenAges(prev => {
      const ages = [...(prev[instanceId] || [])];
      ages[index] = parsed;
      return { ...prev, [instanceId]: ages };
    });
  };

  if (roomInstances.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto p-1 font-Rubik">
      <div className="bg-white p-2 sm:p-2 rounded-2xl shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-md font-bold text-gray-900">Guest Details</h2>
          <p className="text-sm sm:text-xs text-gray-500 mt-2">Specify adults and children for each room.</p>
        </div>

        <div className="space-y-6 text-sm">
          {roomInstances.map(({ instanceId, title, instanceNum, metrics, roomIndex }) => {
            const counts = guestCounts[instanceId] || { adults: metrics.minAdults, children: 0 };
            const currentTotal = (counts.adults || 0) + (counts.children || 0);
            
            const isMinAdults = counts.adults <= metrics.minAdults;
            const isMaxAdults = counts.adults >= metrics.maxAdults;
            const isMinChildren = counts.children <= 0;
            const isMaxChildren = counts.children >= metrics.maxChildren;

            const rates = metrics.rates;
            // FIX: Enforce Number conversion for Threshold checking
            const maxPaxRate = rates && rates.length > 0 
                ? rates.reduce((prev, curr) => (Number(prev.NoOfPax) > Number(curr.NoOfPax) ? prev : curr), rates[0]) 
                : null;
            const adultThreshold = maxPaxRate ? Number(maxPaxRate.NoOfPax) : metrics.std;
            const extraAdults = counts.adults > adultThreshold ? counts.adults - adultThreshold : 0;

            const extraChildren = counts.children; 

            const hasExtras = extraAdults > 0 || extraChildren > 0;
            
            return (
              <div key={instanceId} className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-indigo-200 relative group">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-200 pb-4 mb-4">
                  <div className="flex justify-between w-full sm:w-auto sm:block">
                    <div>
                      <h4 className="text-md sm:text-md font-semibold text-gray-800">{title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Room {instanceNum} | Base : {metrics.paxCount} Adults, Max: {metrics.maxAdults} Adults
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center sm:items-end justify-between gap-4 mt-2 sm:mt-0">
                    <div className="text-xs text-gray-600 flex-shrink-0">
                      Total Guests: <span className="font-bold text-indigo-600">{currentTotal}</span>
                    </div>
                    {onRemoveRoom && (
                      <button 
                        onClick={() => onRemoveRoom(roomIndex)}
                        className="text-red-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-all duration-200"
                        title="Remove Room"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div className="flex items-center justify-around gap-1">
                    <label className="text-sm font-medium text-gray-700">Adults</label>
                    <div className="flex items-center gap-2">
                      <CounterButton 
                        onClick={() => handleCountChange(instanceId, 'adults', -1, metrics)} 
                        disabled={isMinAdults} 
                        icon={MinusIcon} 
                      />
                      <span className="text-md font-semibold w-6 text-center">{counts.adults}</span>
                      <CounterButton 
                        onClick={() => handleCountChange(instanceId, 'adults', 1, metrics)} 
                        disabled={isMaxAdults} 
                        icon={PlusIcon} 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-around gap-1">
                    <label className="text-sm font-medium text-gray-700">Children</label>
                    <div className="flex items-center gap-2">
                      <CounterButton 
                        onClick={() => handleCountChange(instanceId, 'children', -1, metrics)} 
                        disabled={isMinChildren} 
                        icon={MinusIcon} 
                      />
                      <span className="text-md font-semibold w-4 text-center">{counts.children}</span>
                      <CounterButton 
                        onClick={() => handleCountChange(instanceId, 'children', 1, metrics)} 
                        disabled={isMaxChildren} 
                        icon={PlusIcon} 
                      />
                    </div>
                  </div>
                </div>
                
                {hasExtras && (
                    <div className="mt-4 p-2.5 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2.5 animate-fadeIn">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5">
                          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                       </svg>
                       <div className="flex-1">
                          
                          <p className="text-xs text-yellow-700 mt-0.5">
                            {extraAdults > 0 && "Exceeding standard capacity "}
                            {extraAdults > 0 && <span className="font-bold"> {extraAdults} Adult{extraAdults > 1 ? 's' : ''}</span>}
                            {extraAdults > 0 && extraChildren > 0 && <span>, </span>}
                            {extraChildren > 0 && <span className="font-bold"> {extraChildren} Child{extraChildren > 1 ? 'ren' : ''}</span>}
                            
                            {extraAdults > 0 && extraChildren > 0 
                                ? ". Extra adult & child fees apply." 
                                : (extraAdults > 0 
                                    ? ". Extra adult fees apply." 
                                    : " added. Child fees apply.")}
                          </p>
                       </div>
                    </div>
                )}

                {childrenAges[instanceId]?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm flex font-medium text-gray-700 mb-3 gap-2">
                      Children&apos;s Ages <span className='text-[10px] self-center text-gray-400 font-normal'>(optional)</span>
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {childrenAges[instanceId].map((age, index) => (
                        <div key={index}>
                          <label className="block text-xs text-gray-500 mb-1">Child {index + 1}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={age}
                            onChange={e => handleChildAgeChange(instanceId, index, e.target.value)}
                            className="w-full px-3 py-2 text-center bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                            placeholder="Age"
                            min="0"
                            max="15"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <button 
            type="button" 
            onClick={onConfirm} 
            className="w-full bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 text-white font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 transform active:scale-95 hover:scale-[1.01] shadow-md cursor-pointer"
          >
            Confirm Guests
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gueatcounter;