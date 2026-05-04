// import React, { useState, useEffect } from 'react';
import { 
  Download, 
  User, 
  Settings,
  RefreshCcw,
  Printer,
  Calendar,
  CreditCard,
  Building,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';

// --- VOUCHER COMPONENT (PRINTABLE) ---
const Voucher = ({ data }) => {
  const { 
    bookingDetails: booking = {}, 
    guestDetails: guest = {}, 
    stayDetails: stay = {}, 
    financials = {}, 
    gstDetails: gst = {} 
  } = data;

  return (
    <div className="bg-white w-full mx-auto p-10 shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0" id="voucher-print-area">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-600 uppercase tracking-tighter">make my trip</h1>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Hotelier Voucher</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Booking ID</p>
          <p className="text-lg font-bold text-slate-900">{booking.bookingId}</p>
          <p className="text-[10px] font-medium text-slate-500 mt-1">Booked on: {booking.bookedOn}</p>
        </div>
      </div>

      {/* Primary Guest */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Guest Details</p>
        <p className="text-xl font-bold text-slate-900">{guest.primaryGuestName}</p>
      </div>

      {/* Stay Grid */}
      <div className="grid grid-cols-4 border border-slate-200 rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-r border-slate-200">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Check-In</p>
          <p className="font-bold text-sm">{stay.checkInDate}</p>
          <p className="text-xs text-slate-600">{stay.checkInTime}</p>
        </div>
        <div className="p-4 border-r border-slate-200">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Check-Out</p>
          <p className="font-bold text-sm">{stay.checkOutDate}</p>
          <p className="text-xs text-slate-600">{stay.checkOutTime} ({stay.nights})</p>
        </div>
        <div className="p-4 border-r border-slate-200">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Guests</p>
          <p className="font-bold text-sm">{guest.totalGuests}</p>
          <p className="text-xs text-slate-600">{guest.rooms}</p>
        </div>
        <div className="p-4 bg-slate-50 col-span-1">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Property</p>
          <p className="font-bold text-base text-indigo-600 leading-tight break-words">
            {stay.hotelName}
          </p>
          <p className="text-[10px] text-slate-500 leading-tight mt-1.5">
            {stay.address}
          </p>
        </div>
      </div>

      {/* Status Table */}
      <div className="grid grid-cols-4 gap-4 bg-indigo-50/30 border border-indigo-100 p-4 rounded-lg mb-6">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Booking Status</p>
          <p className="text-xs font-bold text-green-600 flex items-center gap-1">
            <CheckCircle size={10} /> {booking.status}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Payment Status</p>
          <p className="text-xs font-bold text-slate-700">{booking.paymentStatus}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Booked Via</p>
          <p className="text-xs font-bold text-slate-700">{booking.bookedVia}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">PNR</p>
          <p className="text-xs font-bold text-slate-700">{booking.pnr}</p>
        </div>
      </div>

      {/* GST Details */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="p-4 border border-slate-100 rounded-lg">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-2 bg-slate-50 px-2 py-1 inline-block">Company GST Details</p>
          <p className="text-xs font-bold">{gst.companyName}</p>
          <p className="text-xs text-slate-600 mt-1">GSTN: {gst.companyGstn}</p>
        </div>
        <div className="p-4 border border-slate-100 rounded-lg">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-2 bg-slate-50 px-2 py-1 inline-block">Property GST Details</p>
          <p className="text-xs font-bold text-indigo-600 underline decoration-slate-200 underline-offset-2 mb-1">
            {stay.hotelName}
          </p>
          <p className="text-xs text-slate-600">GSTN: {gst.propertyGstn}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Room Wise Payment Breakup</p>
        <div className="border border-slate-900 overflow-hidden">
          <table className="w-full text-[11px] text-center border-collapse">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-2 border-r border-slate-700">Date</th>
                <th className="p-2 border-r border-slate-700">Room Chg (R)</th>
                <th className="p-2 border-r border-slate-700">Extra (E)</th>
                <th className="p-2 border-r border-slate-700">Taxes (T)</th>
                <th className="p-2 border-r border-slate-700">Gross (G)</th>
                <th className="p-2 border-r border-slate-700">Comm (C)</th>
                <th className="p-2">Net Rate (G-C)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-200">{stay.checkInDate}</td>
                <td className="p-2 border-r border-slate-200">{financials.roomCharges}</td>
                <td className="p-2 border-r border-slate-200">0.00</td>
                <td className="p-2 border-r border-slate-200">{financials.taxes}</td>
                <td className="p-2 border-r border-slate-200">{financials.grossCharges}</td>
                <td className="p-2 border-r border-slate-200">{financials.commissionTotal}</td>
                <td className="p-2 font-bold">{financials.netRate}</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="p-2 border-r border-slate-200">TOTAL</td>
                <td className="p-2 border-r border-slate-200">{financials.roomCharges}</td>
                <td className="p-2 border-r border-slate-200">0.00</td>
                <td className="p-2 border-r border-slate-200">{financials.taxes}</td>
                <td className="p-2 border-r border-slate-200">{financials.grossCharges}</td>
                <td className="p-2 border-r border-slate-200">{financials.commissionTotal}</td>
                <td className="p-2">{financials.netRate}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Summary Calculation (INR)</p>
        <div className="border-t border-slate-800 pt-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span>1. Room Charges (Base)</span>
            <span className="font-semibold">{financials.roomCharges}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>2. Applicable Property Taxes</span>
            <span className="font-semibold">{financials.taxes}</span>
          </div>
          <div className="flex justify-between text-xs font-bold border-t border-slate-100 pt-1 mt-1">
            <span>(A) Gross Total Charges</span>
            <span>{financials.grossCharges}</span>
          </div>

          <div className="py-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>3. MMT Commission @ Base</span>
              <span className="font-semibold">{financials.commissionBase}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>4. GST on Commission @ 18%</span>
              <span className="font-semibold">{financials.commissionGst}</span>
            </div>
            <div className="flex justify-between text-xs font-bold border-t border-slate-100 pt-1 mt-1">
              <span>(B) Total Commission (Incl. GST)</span>
              <span>{financials.commissionTotal}</span>
            </div>
          </div>

          <div className="flex justify-between text-xs text-slate-600 italic">
            <span>5. Statutory Tax Deductions (TCS/TDS)</span>
            <span>- {financials.totalDeductions}</span>
          </div>

          {/* Indigo themed Net Payable section */}
          <div className="flex justify-between items-center bg-indigo-50 p-3 mt-4 rounded border-l-4 border-indigo-600">
            <div>
              <p className="text-[10px] font-bold text-indigo-800 uppercase leading-none">Net Payable to Property</p>
              <p className="text-[8px] text-indigo-600 font-medium">Calculation: (A - B - Deductions)</p>
            </div>
            <div className="text-xl font-black text-indigo-600">
              INR {financials.payableToProperty}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-6">
        <p className="text-[10px] font-bold text-indigo-600 mb-1 uppercase">Important Information:</p>
        <ul className="text-[9px] text-slate-500 space-y-0.5 list-disc pl-3">
          <li>This voucher is valid only for the hotel and dates specified above.</li>
          <li>Identification proof (Aadhar/Passport/DL) is mandatory for all guests during check-in.</li>
          <li>Payments are released by MakeMyTrip within 72 hours of check-out completion.</li>
        </ul>
        <p className="text-[9px] text-slate-400 text-center mt-8 font-medium">
          MakeMyTrip India Pvt. Ltd. | DLF Cyber City, Phase-II, Gurgaon, Haryana, 122002
        </p>
      </div>
    </div>
  );
};

export default Voucher;
