// src/components/Costcard.jsx
import React from 'react';

const formatDate = (date) => {
  if (!date) return 'Select Date';
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function Costcard({
  bookingDetails,
  hotelData,
  taxBreakdown = [],
  calculatedTaxAmount = 0,
  serviceFee = 0,
  grandTotal = 0,
  dynamicRoomCost,
  extraAdultCost = 0,
  extraChildCost = 0,
  TaxableAmount = 0,
  roomTypePrices = {}
}) {
  if (!bookingDetails) return null;

  const {
    rooms = [],
    dates = {},
    totalPrice = 0,
  } = bookingDetails;

  const { checkIn, checkOut, nights = 0 } = dates;
  const totalRooms = rooms.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const hotelImage = hotelData?.HotelImages?.[0];

  // FIX Bug 1+2: dynamicRoomCost already contains full room cost incl. extra adults.
  // Fallback must NEVER add extraAdultCost — totalPrice from the cart already reflects
  // the pax-based rate chosen at selection time, so no extras exist at that stage.
  const fullRoomCost =
    dynamicRoomCost !== undefined
      ? dynamicRoomCost
      : totalPrice;

  const displayBaseCost = fullRoomCost - extraAdultCost;

  return (
    <div className="max-w-screen rounded-xl md:w-full bg-white font-sans shadow-lg overflow-hidden mb-12">
      {hotelImage && (
        <img className="w-full h-48 object-cover" src={hotelImage} alt="Hotel" />
      )}

      <div className="p-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Your Stay Summary</h2>
          <p className="text-sm text-gray-500">
            {totalRooms} Room{totalRooms !== 1 ? 's' : ''}
          </p>
          <p className="mt-3 text-sm font-medium text-gray-800">
            {formatDate(checkIn)} ----- {nights} Night{nights !== 1 ? 's' : ''} ----- {formatDate(checkOut)}
          </p>
        </div>

        <hr className="my-2" />

        {/* Room List */}
        <div className="space-y-2 opacity-80">
          {rooms.map((item, index) => {
            // FIX Bug 1: Key must match instanceRoomId used in Gueatcounter's roomTypeBaseCosts
            const dynamicPrice = roomTypePrices[item.instanceRoomId];

            const displayPrice =
              dynamicPrice !== undefined
                ? dynamicPrice
                : (item.quantity || 0) * (item.pricePerNight || 0) * nights;

            return (
              <div key={`room_${item.roomId}_${index}`} className="flex items-center justify-between text-xs text-gray-500">
                <p className="pr-2">
                  {item.quantity} x {item.title}
                </p>
                <p className="font-medium text-gray-700 whitespace-nowrap">
                  {formatCurrency(displayPrice)}
                </p>
              </div>
            );
          })}
        </div>

        <hr className="my-2 border border-dotted border-black" />

        {/* Cost Breakdown */}
        <div className="space-y-1">

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Total Room Cost</p>
            <p className="font-medium text-gray-800">{formatCurrency(displayBaseCost)}</p>
          </div>

          {extraAdultCost > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Extra Adult Cost</p>
              <p className="font-medium text-gray-800">{formatCurrency(extraAdultCost)}</p>
            </div>
          )}

          {extraChildCost > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Extra Child Cost</p>
              <p className="font-medium text-gray-800">{formatCurrency(extraChildCost)}</p>
            </div>
          )}

          {/* Taxable */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-1 mt-1">
            <p className="text-sm font-semibold text-gray-700">Taxable Amount</p>
            <p className="font-semibold text-gray-800">{formatCurrency(TaxableAmount)}</p>
          </div>

          {/* Taxes */}
          {taxBreakdown.length > 0 ? (
            taxBreakdown.map((tax, i) => (
              <div key={`${tax.TaxGroupName}_${i}`} className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {tax.TaxGroupName}
                  {tax.Percent !== undefined && (
                    <span className="text-gray-500"> ({tax.Percent}%)</span>
                  )}
                </p>
                <p className="font-medium text-gray-800">
                  {formatCurrency(tax.Amount)}
                </p>
              </div>
            ))
          ) : (
            calculatedTaxAmount > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Taxes</p>
                <p className="font-medium text-gray-800">
                  {formatCurrency(calculatedTaxAmount)}
                </p>
              </div>
            )
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Service Fee</p>
            <p className="font-medium text-gray-800">{formatCurrency(serviceFee)}</p>
          </div>
        </div>

        <hr className="my-2" />

        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold text-indigo-700">Grand Total</p>
          <p className="text-xl font-semibold text-indigo-700">
            {formatCurrency(grandTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Costcard;