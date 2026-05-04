import React, { useState } from 'react';
import { Search, User, Phone, Calendar, IndianRupee } from 'lucide-react';
import { fetchRepeatGuests } from '../apis/admin_api';
import { BallTriangle } from 'react-loader-spinner';

export default function RepeatGuests() {
  const [mobileNo, setMobileNo] = useState('');
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!mobileNo) return;
    
    setLoading(true);
    setError('');
    setGuestData(null);

    try {
      const data = await fetchRepeatGuests(mobileNo);
      // Check if data returned valid guests
      if (data && data.RepeatGuests && data.RepeatGuests.length > 0) {
        setGuestData(data);
      } else {
        setError('No repeat guest history found for this number.');
      }
    } catch (err) {
      setError('Failed to fetch guest details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Repeat Guests</h1>
        <p className="text-slate-500 text-sm mt-1">Search guest history and loyalty details.</p>
      </div>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Guest Mobile Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        value={mobileNo}
                        onChange={(e) => setMobileNo(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>
            <button 
                type="submit" 
                disabled={loading || !mobileNo}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
                {loading ? 'Searching...' : <><Search size={18} /> Search</>}
            </button>
        </form>
      </div>

      {/* Results Section */}
      {loading && (
        <div className="flex justify-center py-10">
           <BallTriangle color="#4F46E5" height={60} width={60} visible={true} />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium">
            {error}
        </div>
      )}

      {guestData && (
        <div className="space-y-4">
             {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase font-bold">Total Repeat Visits</p>
                    <p className="text-2xl font-bold text-indigo-600">{guestData.RepeatGuestCount}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                     <p className="text-xs text-slate-500 uppercase font-bold">Hotel</p>
                     <p className="text-lg font-semibold text-slate-800 truncate">{guestData.HotelName}</p>
                </div>
            </div>

            {/* Guest List */}
            {guestData.RepeatGuests.map((guest, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{guest.GuestName}</h3>
                            <p className="text-xs text-slate-500">{guest.MobileNo}</p>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><IndianRupee size={20} /></div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase">Total Spent</p>
                                <p className="font-bold text-slate-700">₹ {guest.TotalSpent}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={20} /></div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase">Total Bookings</p>
                                <p className="font-bold text-slate-700">{guest.TotalBookings}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><ClockIcon size={20} /></div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase">Last Visit</p>
                                <p className="font-bold text-slate-700">{guest.LastBookingDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

const ClockIcon = ({size}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);