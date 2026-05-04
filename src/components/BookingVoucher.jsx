import React from 'react';

const BookingVoucher = ({ data }) => {
  // Fallback if data is missing
  if (!data) return <div className="p-4 text-center">No voucher data available</div>;

  const {
    source,
    bookingDetails,
    guestDetails,
    stayDetails,
    roomDetails,
    taxAndBusinessDetails,
    financials,
    platformInfo
  } = data;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 shadow-lg border border-gray-200 font-sans text-gray-800 print:shadow-none print:border-none">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-start border-b border-gray-300 pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 uppercase tracking-wide">{source}</h1>
          <p className="text-sm text-gray-500 font-semibold uppercase mt-1">Hotelier Voucher</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Booking ID</p>
          <p className="text-lg font-bold text-gray-900">{bookingDetails.bookingId}</p>
        </div>
      </div>

      {/* --- PRIMARY DETAILS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Guest Details */}
        <div className="bg-gray-50 p-3 rounded border border-gray-100">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Primary Guest</p>
          <p className="font-bold text-lg">{guestDetails.primaryGuestName}</p>
          <p className="text-sm text-gray-600 mt-1">{guestDetails.totalGuests.text}</p>
        </div>

        {/* Check-in/Out */}
        <div className="bg-gray-50 p-3 rounded border border-gray-100 flex justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Check-In</p>
            <p className="font-bold text-md">{stayDetails.checkIn.date}</p>
            <p className="text-sm text-gray-600">{stayDetails.checkIn.time}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Check-Out</p>
            <p className="font-bold text-md">{stayDetails.checkOut.date}</p>
            <p className="text-sm text-gray-600">{stayDetails.checkOut.time}</p>
            <p className="text-xs text-gray-400 mt-1">({stayDetails.checkOut.duration})</p>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="bg-gray-50 p-3 rounded border border-gray-100">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Hotel Details</p>
          <p className="font-bold text-sm text-blue-800">{stayDetails.hotelName}</p>
          <p className="text-xs text-gray-600 mt-1 leading-snug">{stayDetails.address}</p>
        </div>
      </div>

      {/* --- STATUS TABLE --- */}
      <div className="mb-6 overflow-hidden rounded border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-500">
            <tr>
              <th className="p-3 font-semibold">Booking Status</th>
              <th className="p-3 font-semibold">Payment Status</th>
              <th className="p-3 font-semibold">Booked Via</th>
              <th className="p-3 font-semibold">PNR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="p-3 font-bold text-green-600">{bookingDetails.status}</td>
              <td className="p-3">{bookingDetails.paymentStatus}</td>
              <td className="p-3">{bookingDetails.bookedVia}</td>
              <td className="p-3 font-mono">{bookingDetails.pnr}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* --- CONFIRMATION & GST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <p className="text-xs text-gray-400">Booked On: <span className="text-gray-600">{bookingDetails.bookedOn}</span></p>
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-center">
            <p className="text-green-800 font-bold text-sm">{bookingDetails.confirmationText}</p>
          </div>
        </div>

        <div className="text-sm">
           <h3 className="font-bold text-gray-700 border-b border-gray-200 pb-1 mb-2">GST Details</h3>
           <div className="grid grid-cols-2 gap-4">
              <div>
                  <p className="text-xs text-gray-500">Property GSTN</p>
                  <p className="font-medium">{taxAndBusinessDetails.property.gstn}</p>
              </div>
              <div>
                  <p className="text-xs text-gray-500">Customer GSTN</p>
                  <p className="font-medium">{taxAndBusinessDetails.customer.gstn || 'N/A'}</p>
              </div>
           </div>
           {taxAndBusinessDetails.customer.companyName && (
               <div className="mt-2">
                   <p className="text-xs text-gray-500">Company Name</p>
                   <p className="font-medium">{taxAndBusinessDetails.customer.companyName}</p>
               </div>
           )}
        </div>
      </div>

      {/* --- ROOM DETAILS --- */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 uppercase border-b border-gray-300 pb-2 mb-3">Room Details</h3>
        {roomDetails.map((room, index) => (
            <div key={index} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 border-b border-gray-100 pb-4 last:border-0">
                <div className="flex-1">
                    <p className="font-bold text-lg">{room.quantity} x {room.roomType}</p>
                    <p className="text-sm text-gray-600">Occupancy: {room.occupancy}</p>
                </div>
                <div className="flex-1">
                     <p className="text-xs text-gray-500 font-bold uppercase">Inclusions</p>
                     <ul className="list-disc list-inside text-sm text-gray-700">
                         {room.inclusions.map((inc, i) => <li key={i}>{inc}</li>)}
                     </ul>
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-500 font-bold uppercase">Cancellation Policy</p>
                    <p className="text-xs text-red-500 mt-1 leading-snug">{room.policies.cancellation}</p>
                </div>
            </div>
        ))}
      </div>

      {/* --- FINANCIAL BREAKDOWN (The Calculation Table) --- */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-700 uppercase border-b border-gray-300 pb-2 mb-3">Payment Breakdown</h3>
        <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full text-sm text-right">
                <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                    <tr>
                        <th className="p-3 text-left">Description</th>
                        <th className="p-3">Amount ({financials.currency})</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {/* Gross Charges */}
                    <tr>
                        <td className="p-2 text-left text-gray-600 pl-4">Room Charges</td>
                        <td className="p-2">{financials.breakdown.roomCharges.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="p-2 text-left text-gray-600 pl-4">Extra Adult/Child Charges</td>
                        <td className="p-2">{financials.breakdown.extraPersonCharges.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="p-2 text-left text-gray-600 pl-4">Taxes</td>
                        <td className="p-2">{financials.breakdown.propertyTaxes.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-gray-50 font-bold">
                        <td className="p-2 text-left pl-4">Property Gross Charges (A)</td>
                        <td className="p-2">{financials.breakdown.totalGross.toFixed(2)}</td>
                    </tr>

                    {/* Deductions */}
                    <tr>
                        <td className="p-2 text-left text-gray-600 pl-4">Platform Commission</td>
                        <td className="p-2 text-red-500">-{financials.deductions.commission.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="p-2 text-left text-gray-600 pl-4">GST on Commission</td>
                        <td className="p-2 text-red-500">-{financials.deductions.gstOnCommission.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-gray-50 font-bold">
                        <td className="p-2 text-left pl-4">Total Commission (B)</td>
                        <td className="p-2 text-red-600">-{financials.deductions.totalCommission.toFixed(2)}</td>
                    </tr>
                     
                    {/* Final */}
                     <tr className="bg-indigo-50 border-t-2 border-indigo-100">
                        <td className="p-3 text-left pl-4 font-bold text-indigo-900 text-lg">Net Payable to Property (A - B)</td>
                        <td className="p-3 font-bold text-indigo-900 text-lg">{financials.payableToProperty.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">
            * Payment will be released by {financials.paymentReleaseDate}.
        </p>
      </div>

      {/* --- FOOTER / PLATFORM INFO --- */}
      <div className="border-t-2 border-gray-800 pt-6 mt-6 flex flex-col md:flex-row justify-between text-xs text-gray-500">
         <div className="mb-4 md:mb-0 max-w-sm">
             <p className="font-bold text-gray-800 mb-2 uppercase">{platformInfo.name} Details</p>
             <p>PAN: {platformInfo.pan}</p>
             <p>GSTIN: {platformInfo.gstin}</p>
             <p>CIN: {platformInfo.cin}</p>
             <p className="mt-1">{platformInfo.serviceCategory}</p>
         </div>
         <div className="max-w-sm text-right">
             <p className="font-bold text-gray-800 mb-2 uppercase">Important Note</p>
             <p>Please do not reply to this email. It is an unmonitored mailbox.</p>
             <p className="mt-1">Under no circumstances charge guests for services listed in this voucher.</p>
         </div>
      </div>

    </div>
  );
};

export default BookingVoucher;