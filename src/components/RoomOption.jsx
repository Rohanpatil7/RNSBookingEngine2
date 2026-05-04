// src/components/RoomOption.jsx
import React, { useState, useEffect, useMemo } from 'react';

const getRateForOccupancy = (paxRates, adults) => {
  if (!paxRates || !Array.isArray(paxRates)) return null;
  const numAdults = adults || 1;

  const exactMatch = paxRates.find(r => Number(r.NoOfPax) === numAdults);
  if (exactMatch) return exactMatch.Rate;

  const maxPaxRate = paxRates.reduce((prev, current) => (prev.NoOfPax > current.NoOfPax) ? prev : current);

  if (numAdults > maxPaxRate.NoOfPax) {
    const extraPaxCount = numAdults - maxPaxRate.NoOfPax;
    return maxPaxRate.Rate + (extraPaxCount * (maxPaxRate.ExtraAdultRate || 0));
  }
  return maxPaxRate.Rate;
};

const getDefaultRateKey = (planGroup) => planGroup?.AvailableRates?.[0]?.MealPlanID ?? '';

function RoomOption({ room, planGroup, onAddToCart, isBookingDisabled, bookingDetails }) {

  const [selectedRateKey, setSelectedRateKey] = useState(() => getDefaultRateKey(planGroup));
  const [selectedPax, setSelectedPax] = useState(bookingDetails.adults || 1);

  useEffect(() => {
    setSelectedRateKey(getDefaultRateKey(planGroup));
  }, [room._id, planGroup.UniqueGroupID]);

  const selectedRate = useMemo(() => {
    if (!planGroup?.AvailableRates?.length) return null;

    return planGroup.AvailableRates.find((rate) => rate.MealPlanID === selectedRateKey)
      || planGroup.AvailableRates[0];
  }, [planGroup, selectedRateKey]);

  const paxOptions = useMemo(() => (
    selectedRate?.Rates
      ? selectedRate.Rates.map((rate) => Number(rate.NoOfPax)).sort((a, b) => a - b)
      : []
  ), [selectedRate]);

  useEffect(() => {
    console.log(`Currently selected: ${selectedRate?.RateType}`);
    console.log("Prices for this selection:", selectedRate?.Rates);
  }, [selectedRate]);
  
  useEffect(() => {
    if (paxOptions.length === 0) {
      setSelectedPax(bookingDetails.adults || 1);
      return;
    }

    const requestedAdults = Number(bookingDetails.adults) || 1;
    if (paxOptions.includes(requestedAdults)) {
      setSelectedPax(requestedAdults);
    } else {
      setSelectedPax(paxOptions[0]);
    }
  }, [bookingDetails.adults, paxOptions]);

  const handleRateTypeChange = (e) => {
    setSelectedRateKey(e.target.value);
  };

  const handlePaxChange = (e) => {
    setSelectedPax(parseInt(e.target.value, 10));
  };

  if (!selectedRate) return null;

  const rateForOccupancy = getRateForOccupancy(selectedRate.Rates, selectedPax);
  const hasPrice = rateForOccupancy !== undefined && rateForOccupancy !== null;
  const finalPrice = hasPrice ? rateForOccupancy : 0;

  const handleAddToCartClick = () => {
    const rateWithPax = { ...selectedRate, userSelectedPax: selectedPax };
    onAddToCart(room, rateWithPax);
  };

  return (
    <div className="flex p-4 border-b border-gray-200 last:border-b-0 items-center hover:bg-gray-50/60 transition-colors duration-200">

      {/* COLUMN 1: Room & Rate Info */}
      <div className="w-1/2 pr-6">
        <div className='flex flex-col gap-1.5 mb-2'>
          <p className="font-bold text-base text-gray-800 tracking-tight">
            {planGroup.MealPlanName}
          </p>

          <div className="relative w-full max-w-[280px]">
            {planGroup.AvailableRates.length > 1 ? (
              <div className="relative group">
                <select
                  value={selectedRateKey}
                  onChange={handleRateTypeChange}
                  className="appearance-none w-full bg-white border border-gray-300 text-sm text-gray-700 py-2.5 pl-3 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer transition-all duration-200 hover:border-indigo-400"
                >
                  {planGroup.AvailableRates.map((rate) => (
                    <option key={rate.MealPlanID} value={rate.MealPlanID}>
                      {rate.RateType}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-600 group-hover:text-indigo-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center bg-gray-100 border border-gray-200 text-sm text-gray-700 font-medium px-3 py-2 rounded-md">
                {selectedRate.RateType}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 flex items-center mt-1 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-500 mr-1.5 opacity-90">
              <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
            </svg>
            <p>{`${room.maxCapacityAdult} Adults, ${room.maxCapacityChild} Children capacity`}</p>
          </div>
        </div>

        <ul className="space-y-1 mt-2">
          {selectedRate.Policies?.map((policy, index) => (
            <li key={`pol-${index}`} className="flex items-start text-xs text-gray-600">
              <span className="mr-1.5 mt-1 block w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
              {policy.Name}
            </li>
          ))}
        </ul>
      </div>

      {/* COLUMN 2: Occupancy Selector */}
      <div className="w-1/4 px-2 flex flex-col items-center justify-center border-l border-gray-100">
        <div className="relative inline-block group w-full max-w-[80px]">
          <div className="relative flex items-center justify-between bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 transition-all duration-200 overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute left-1.5 w-4 h-4 text-gray-600 group-hover:text-indigo-600 transition-colors pointer-events-none">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>

            <select
              id={`pax-${room._id}-${planGroup.UniqueGroupID}`}
              value={selectedPax}
              onChange={handlePaxChange}
              disabled={isBookingDisabled}
              className="appearance-none bg-transparent border-none text-base font-semibold text-gray-800 focus:ring-0 cursor-pointer text-center w-full py-1.5 pl-6 pr-6 outline-none z-10"
            >
              {paxOptions.map(num => (
                <option key={`pax-${num}`} value={num}>
                  {num}
                </option>
              ))}
            </select>

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute right-1.5 w-4 h-4 text-gray-500 group-hover:text-indigo-600 transition-colors pointer-events-none">
              <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* COLUMN 3: Price & Action */}
      <div className="w-1/4 text-right flex flex-col items-end justify-center pl-4 border-l border-gray-100">
        {hasPrice ? (
          <div className="flex flex-col items-end">
            <p className="text-xl font-bold text-gray-900 leading-none">
              ₹{finalPrice.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">per night</p>
          </div>
        ) : (
          <p className="text-gray-500 mb-2 text-xs italic">Price unavailable</p>
        )}

        <button
          disabled={isBookingDisabled || !hasPrice}
          onClick={handleAddToCartClick}
          className="mt-3 w-full max-w-[100px] bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white text-sm font-semibold py-2 rounded-md shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-indigo-600"
        >
          Select
        </button>
      </div>
    </div>
  );
}

export default RoomOption;
