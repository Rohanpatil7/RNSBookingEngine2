// src/admin/pages/Bookings.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { 
  Search, Download, Calendar, 
  CheckCircle, Clock, XCircle, X, Save, AlertCircle, RefreshCw, Loader 
} from 'lucide-react';

import { 
  fetchBookingRegister, 
  fetchBookingsByCustomerName, 
  fetchGuestBookingHistory,
  fetchBookingsByMobile
} from '../apis/admin_api'; 

import BookingTable from '../components/BookingTable';

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false); // Track if we are viewing search results
  
  // Date Filter State
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Guest History State [NEW]
  const [guestHistory, setGuestHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const [statusKey, setStatusKey] = useState(null);

  const tabs = ['All', 'Confirmed', 'Pending', 'Cancelled'];

  useEffect(() => {
    loadBookings();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, itemsPerPage]);

  const loadBookings = async () => {
    setLoading(true);
    setIsSearchMode(false); // Reset search mode
    try {
      // Use date filters if present, otherwise fetchBookingRegister defaults to current month
      const res = await fetchBookingRegister(startDate, endDate); //
      if (res && res.status === 1 && Array.isArray(res.data)) {
        setBookings(res.data);
        if (res.data.length > 0) {
          detectStatusKey(res.data[0]);
        }
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to find the dynamic status key
  const detectStatusKey = (item) => {
    const key = ['Status', 'status', 'BookingStatus', 'booking_status'].find(k => k in item) 
                || Object.keys(item).find(k => k.toLowerCase().includes('status'));
    setStatusKey(key);
  };

  // --- NEW SERVER-SIDE SEARCH LOGIC ---
    const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadBookings();
      return;
    }

    setLoading(true);
    setIsSearchMode(true);
    try {
      // DETECT SEARCH TYPE: If input contains only digits, assume Mobile Number
      const isMobile = /^\d+$/.test(searchTerm.trim());
      
      let res;
      if (isMobile) {
        // Call the new Mobile API [cite: 307]
        res = await fetchBookingsByMobile(searchTerm.trim());
      } else {
        // Fallback to existing Name API
        res = await fetchBookingsByCustomerName(searchTerm);
      }
      
      // Handle both response formats (both return a 'bookings' array)
      if (res && res.status === 1 && Array.isArray(res.bookings)) {
        const normalizedData = res.bookings.map(b => ({
          ...b,
          GuestFirstName: b.GuestName ? b.GuestName.split(' ')[0] : '', 
          GuestLastName: b.GuestName ? b.GuestName.split(' ').slice(1).join(' ') : '',
          TotalAmount: b.GrandTotal || b.TotalAmount
        }));
        setBookings(normalizedData);
        if (normalizedData.length > 0) detectStatusKey(normalizedData[0]);
      } else {
        setBookings([]);
      }
      setCurrentPage(1);
    } catch (err) {
      console.error("Search failed:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getNormalizedStatus = useCallback((booking) => {
    const rawVal = statusKey ? booking[statusKey] : (booking.Status || booking.ActiveStatus);
    if (rawVal == null) return "Unknown";
    const s = String(rawVal).trim().toLowerCase();
    
    // API specific mappings
    if (['1', 'confirmed', 'active', 'booked', 'success'].includes(s)) return 'Confirmed';
    if (['0', 'pending', 'hold', 'initiated', 'waiting'].includes(s)) return 'Pending';
    if (['2', 'cancelled', 'canceled', 'refunded', 'failed'].includes(s)) return 'Cancelled';
    return String(rawVal);
  }, [statusKey]);

  const getStatusColor = (statusLabel) => {
    const s = String(statusLabel).toLowerCase();
    if (s === 'confirmed') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'pending')   return 'bg-amber-50 text-amber-600 border-amber-100';
    if (s === 'cancelled') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-slate-50 text-slate-600';
  };

  // --- FILTERING LOGIC ---
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Status Filter (Apply tabs even to search results)
      const status = getNormalizedStatus(b);
      const matchesTab = activeTab === 'All' || status.toLowerCase() === activeTab.toLowerCase();
      if (!matchesTab) return false;

      // 2. Date Filter (Only apply if NOT in search mode, as Search API doesn't support date params)
      if (!isSearchMode && (startDate || endDate)) {
        const checkIn = new Date(b.CheckInDate); 
        if (startDate) {
          const start = new Date(startDate);
          if (checkIn < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (checkIn > end) return false;
        }
      }

      return true;
    });
  }, [bookings, activeTab, getNormalizedStatus, startDate, endDate, isSearchMode]);

  // --- SORTING LOGIC ---
  const sortedBookings = useMemo(() => {
    let sortableItems = [...filteredBookings];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        switch (sortConfig.key) {
          case 'Guest': 
            aValue = `${a.GuestFirstName || ''} ${a.GuestLastName || ''}`.trim();
            bValue = `${b.GuestFirstName || ''} ${b.GuestLastName || ''}`.trim();
            break;
          case 'TotalAmount': 
            aValue = parseFloat(a.GrandTotal || a.TotalAmount || 0);
            bValue = parseFloat(b.GrandTotal || b.TotalAmount || 0);
            break;
          case 'BookingID': 
            aValue = Number(a.BookingID || a.ReservationNo || 0);
            bValue = Number(b.BookingID || b.ReservationNo || 0);
            break;
          case 'CheckInDate': 
            aValue = new Date(a.CheckInDate || 0).getTime();
            bValue = new Date(b.CheckInDate || 0).getTime();
            break;
          default: 
            aValue = a[sortConfig.key] || '';
            bValue = b[sortConfig.key] || '';
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
           return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        const strA = String(aValue).toLowerCase();
        const strB = String(bValue).toLowerCase();
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredBookings, sortConfig]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedBookings, currentPage, itemsPerPage]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // --- VIEW DETAILS & HISTORY FETCH ---
  const handleView = async (b) => {
    setSelectedBooking(b);
    setGuestHistory([]);
    setHistoryLoading(true);

    try {
      // Fetch history for the specific guest
      const guestName = b.GuestName || `${b.GuestFirstName} ${b.GuestLastName}`;
      const res = await fetchGuestBookingHistory(guestName, b.MobileNo);
      
      if (res && res.BookingHistory) {
        setGuestHistory(res.BookingHistory);
      }
    } catch (err) {
      console.error("Failed to fetch guest history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEdit = (b) => {
    setEditingBooking(b);
    setNewStatus(getNormalizedStatus(b)); 
  };

  const handleSaveStatus = async () => {
    if (!editingBooking || !statusKey) return;
    const updatedBookings = bookings.map((b) => {
      const bId = b.BookingID || b.ReservationNo;
      const editId = editingBooking.BookingID || editingBooking.ReservationNo;
      if (bId === editId) {
        return { ...b, [statusKey]: newStatus };
      }
      return b;
    });
    setBookings(updatedBookings);
    setEditingBooking(null);
    alert(`Status updated to ${newStatus} successfully!`);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setShowDateFilter(false);
    loadBookings(); // Reload full list
  };

  const stats = useMemo(() => {
    return bookings.reduce((acc, curr) => {
      const status = getNormalizedStatus(curr).toLowerCase();
      if (status === 'confirmed') acc.confirmed++;
      else if (status === 'pending') acc.pending++;
      else if (status === 'cancelled') acc.cancelled++;
      return acc;
    }, { confirmed: 0, pending: 0, cancelled: 0 });
  }, [bookings, getNormalizedStatus]);

  return (
    <div className="space-y-6 animate-fade-in-up relative pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all your hotel reservations</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Confirmed" count={stats.confirmed} icon={CheckCircle} color="emerald" active={activeTab === 'Confirmed'} onClick={() => setActiveTab('Confirmed')} />
        {/* <StatCard label="Pending" count={stats.pending} icon={Clock} color="amber" active={activeTab === 'Pending'} onClick={() => setActiveTab('Pending')} /> */}
        <StatCard label="Cancelled" count={stats.cancelled} icon={XCircle} color="red" active={activeTab === 'Cancelled'} onClick={() => setActiveTab('Cancelled')} />
      </div>

      {/* --- FILTERS & SEARCH BAR --- */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
        
        {/* Tabs */}
        <div className="flex p-1 bg-slate-50 rounded-lg w-full md:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === tab ? 'bg-white text-indigo-600 shadow-sm cursor-pointer' : 'text-slate-500 hover:text-slate-700 cursor-pointer'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Date Filter */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto px-2 pb-2 md:pb-0">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Name or Phone.." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          
          {/* --- DATE FILTER BUTTON --- */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowDateFilter(!showDateFilter)}
              disabled={isSearchMode} // Disable date filter during search mode
              className={`p-2 border rounded-lg transition-colors flex items-center cursor-pointer gap-2 ${
                (startDate || endDate) 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              } ${isSearchMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Filter by Date"
            >
              <Calendar size={18}/>
              {(startDate || endDate) && <span className="text-xs font-medium hidden sm:inline cursor-pointer">Active</span>}
            </button>

            {/* --- DATE FILTER DROPDOWN --- */}
            {showDateFilter && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50 animate-fade-in">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-slate-700 text-sm">Filter by Check-In</h4>
                  <button onClick={clearDateFilter} className="text-xs cursor-pointer text-slate-400 hover:text-red-500 flex items-center gap-1">
                    <RefreshCw size={12}/> Clear
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full cursor-pointer text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      className="w-full cursor-pointer text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => {
                        setShowDateFilter(false);
                        loadBookings(); // Trigger load with new dates
                    }} 
                    className="bg-indigo-600 cursor-pointer text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <BookingTable 
        bookings={paginatedBookings}
        loading={loading}
        getNormalizedStatus={getNormalizedStatus}
        getStatusColor={getStatusColor}
        onView={handleView}
        onEdit={handleEdit}
        onSort={handleSort}
        sortConfig={sortConfig}
        totalItems={filteredBookings.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* --- VIEW DETAILS MODAL (Updated with History) --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            
            <div className="p-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                   <div>
                       <p className="text-xs text-slate-500 uppercase font-bold">Guest</p>
                       <p className="font-medium text-slate-800">{selectedBooking.GuestFirstName} {selectedBooking.GuestLastName}</p>
                       <p className="text-xs text-slate-500">{selectedBooking.MobileNo}</p>
                   </div>
                   <div>
                       <p className="text-xs text-slate-500 uppercase font-bold">Booking ID</p>
                       <p className="font-medium text-slate-800">#{selectedBooking.BookingID || selectedBooking.ReservationNo}</p>
                   </div>
                   <div>
                       <p className="text-xs text-slate-500 uppercase font-bold">Check In</p>
                       <p className="font-medium text-slate-800">{selectedBooking.CheckInDate}</p>
                   </div>
                   <div>
                       <p className="text-xs text-slate-500 uppercase font-bold">Status</p>
                       <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs border ${getStatusColor(getNormalizedStatus(selectedBooking))}`}>
                        {getNormalizedStatus(selectedBooking)}
                       </span>
                   </div>
                </div>

                {/* --- GUEST HISTORY SECTION [NEW] --- */}
                <div className="border-t border-slate-100 pt-4">
                    <h4 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                        <Clock size={14} className="text-indigo-600"/> 
                        Guest History
                    </h4>
                    
                    {historyLoading ? (
                        <div className="flex items-center justify-center py-4 text-slate-400">
                             <Loader className="animate-spin mr-2" size={16}/> Loading history...
                        </div>
                    ) : guestHistory.length > 0 ? (
                        <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 text-slate-500 font-semibold uppercase">
                                    <tr>
                                        <th className="p-3">ID</th>
                                        <th className="p-3">Date</th>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {guestHistory.map((h, i) => (
                                        <tr key={i} className="hover:bg-white transition-colors">
                                            <td className="p-3 font-medium text-slate-700">#{h.BookingID}</td>
                                            <td className="p-3 text-slate-600">{h.CheckInDate}</td>
                                            <td className="p-3 text-right font-medium">₹{h.GrandTotal}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${h.PaymentStatus == 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {h.PaymentStatus == 1 ? 'Paid' : 'Unpaid'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-400 italic text-center">
                            No previous booking history found.
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedBooking(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT STATUS MODAL --- */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Update Status</h3>
                <p className="text-xs text-slate-500">ID: #{editingBooking.BookingID || editingBooking.ReservationNo}</p>
              </div>
              <button onClick={() => setEditingBooking(null)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex gap-3 items-start">
                 <AlertCircle className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                 <div className="text-xs text-indigo-800">
                    Changing status for <strong>{editingBooking.GuestFirstName}</strong>.
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select New Status</label>
                <div className="relative">
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-300 text-slate-700 py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button onClick={() => setEditingBooking(null)} className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={handleSaveStatus} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
                <Save size={16} /> Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Stats Card Component
const StatCard = React.memo(({ label, count, icon: Icon, color, active, onClick }) => {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-500 ring-emerald-500",
        amber: "bg-amber-50 text-amber-600 border-amber-500 ring-amber-500",
        red: "bg-red-50 text-red-600 border-red-500 ring-red-500",
    };
    const baseClass = `p-4 rounded-xl border cursor-pointer flex items-center justify-between shadow-sm transition-all`;
    const activeClass = active ? `ring-1 ${colors[color].split(" ").filter(c=>c.startsWith('border') || c.startsWith('ring')).join(" ")}` : "border-slate-200 hover:shadow-md";
    return (
        <div onClick={onClick} className={`${baseClass} ${activeClass} bg-white`}>
            <div>
                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">{label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{count}</h3>
            </div>
            <div className={`p-3 rounded-lg ${colors[color].split(" ").slice(0, 2).join(" ")}`}>
                <Icon size={24} />
            </div>
        </div>
    );
});