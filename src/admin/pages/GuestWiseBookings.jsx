import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Calendar, 
  Users, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  Wallet,
  Briefcase
} from "lucide-react";
import { fetchBookingRegister, fetchBookingsByCustomerName } from "../apis/admin_api"; //
import StatCard from "../components/StateCard"; 

export default function GuestWiseBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'totalAmount', direction: 'desc' });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetchBookingRegister();
      if (res?.status === 1 && Array.isArray(res.data)) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Guest-wise booking load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW SEARCH HANDLER ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      // If search is empty, reload full register
      loadBookings();
      return;
    }

    setLoading(true);
    setCurrentPage(1); // Reset to first page
    try {
      const res = await fetchBookingsByCustomerName(searchTerm); //
      
      if (res && res.status === 1 && Array.isArray(res.bookings)) {
        // Normalize data to match fetchBookingRegister structure for aggregation
        const normalizedData = res.bookings.map(b => ({
            ...b,
            // Split GuestName into First/Last if they don't exist, as aggregation relies on them
            GuestFirstName: b.GuestFirstName || (b.GuestName ? b.GuestName.split(' ')[0] : ''), 
            GuestLastName: b.GuestLastName || (b.GuestName ? b.GuestName.split(' ').slice(1).join(' ') : ''),
            GrandTotal: b.GrandTotal || b.TotalAmount
        }));
        setBookings(normalizedData);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Guest search failed:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DATA PROCESSING
  // ===============================
  
  // 1. Group & Filter
  const filteredData = useMemo(() => {
    const map = {};

    bookings.forEach((b) => {
      // Robust name handling
      const fName = b.GuestFirstName || "";
      const lName = b.GuestLastName || "";
      const guestName = (fName || lName) ? `${fName} ${lName}`.trim() : (b.GuestName || "Unknown Guest");

      if (!guestName) return;

      // Date filter applied to individual bookings before aggregation
      if (startDate || endDate) {
        const checkIn = new Date(b.CheckInDate);
        if (startDate && checkIn < new Date(startDate)) return;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (checkIn > end) return;
        }
      }

      if (!map[guestName]) {
        map[guestName] = {
          guestName,
          totalBookings: 0,
          totalAmount: 0,
          lastCheckIn: b.CheckInDate,
          // Store raw date for sorting
          lastCheckInDateObj: new Date(b.CheckInDate)
        };
      }

      map[guestName].totalBookings += 1;
      map[guestName].totalAmount += parseFloat(b.GrandTotal || 0);

      const currentCheckIn = new Date(b.CheckInDate);
      if (currentCheckIn > map[guestName].lastCheckInDateObj) {
        map[guestName].lastCheckIn = b.CheckInDate;
        map[guestName].lastCheckInDateObj = currentCheckIn;
      }
    });

    let result = Object.values(map);

    // Note: We removed the client-side 'includes(searchTerm)' filter here 
    // because the API now handles the searching. 
    // However, if you want to filter strictly within the API results:
    if (searchTerm) {
       const term = searchTerm.toLowerCase();
       result = result.filter(g => g.guestName.toLowerCase().includes(term));
    }

    return result;
  }, [bookings, searchTerm, startDate, endDate]);

  // 2. Sort
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle string vs number comparison
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // 3. Paginate
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return sortedData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, itemsPerPage, sortedData]);

  // Stats Calculation
  const stats = useMemo(() => {
    return {
      guests: filteredData.length,
      bookings: filteredData.reduce((acc, curr) => acc + curr.totalBookings, 0),
      revenue: filteredData.reduce((acc, curr) => acc + curr.totalAmount, 0)
    };
  }, [filteredData]);

  // Handlers
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setShowDateFilter(false);
  };

  // Clear search and reload all
  const clearSearch = () => {
    setSearchTerm("");
    loadBookings();
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Guest Wise Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Insights into guest performance and revenue.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard 
          label="Unique Guests" 
          value={stats.guests} 
          icon={Users} 
          color="text-blue-600" 
        />
        <StatCard 
          label="Total Bookings" 
          value={stats.bookings} 
          icon={Briefcase} 
          color="text-indigo-600" 
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative w-full md:w-96 flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                type="text"
                placeholder="Search by guest name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
            />
            {searchTerm && (
                <button 
                  type="button" 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                >
                    <RefreshCw size={14} />
                </button>
            )}
          </div>
          <button 
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Date Filter */}
        <div className="relative w-full md:w-auto z-20">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`flex items-center cursor-pointer justify-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium w-full md:w-auto transition-colors ${
              (startDate || endDate) 
                ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Calendar size={18} /> 
            {(startDate || endDate) ? "Date Active" : "Filter by Date"}
            <ChevronDown size={14} className={`transition-transform ${showDateFilter ? "rotate-180" : ""}`}/>
          </button>

          {showDateFilter && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 rounded-xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-sm text-slate-700">Check-In Range</h4>
                <button
                  onClick={clearDateFilter}
                  className="text-xs cursor-pointer text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
                >
                  <RefreshCw size={12} /> Reset
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 ml-1">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full cursor-pointer border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 ml-1">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full cursor-pointer border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <SortableHeader label="Guest Name" columnKey="guestName" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Total Bookings" columnKey="totalBookings" currentSort={sortConfig} onSort={handleSort} align="center" />
                <SortableHeader label="Last Check-In" columnKey="lastCheckIn" currentSort={sortConfig} onSort={handleSort} align="center" />
                <SortableHeader label="Total Spent" columnKey="totalAmount" currentSort={sortConfig} onSort={handleSort} align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <RefreshCw className="animate-spin text-indigo-500" size={24} />
                       <span>Processing booking data...</span>
                    </div>
                  </td>
                </tr>
              ) : currentTableData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-slate-500">
                    No guests found matching your criteria.
                  </td>
                </tr>
              ) : (
                currentTableData.map((g, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {g.guestName}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {g.totalBookings}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      {g.lastCheckIn}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      ₹{g.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && filteredData.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/30 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm mt-auto rounded-b-xl">
            
            <div className="text-slate-500">
              Showing <span className="font-medium text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium text-slate-900">{filteredData.length}</span> guests
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16}/>
              </button>
              
              <span className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600">
                Page {currentPage} of {totalPages}
              </span>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

// Helper Component for Sortable Headers
const SortableHeader = ({ label, columnKey, currentSort, onSort, align = "left" }) => {
  const isSorted = currentSort.key === columnKey;
  
  return (
    <th 
      onClick={() => onSort(columnKey)} 
      className={`px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none group text-${align}`}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
        {label}
        <div className="flex flex-col w-3">
          {isSorted ? (
            currentSort.direction === 'asc' ? <ChevronUp size={12} className="text-indigo-600" /> : <ChevronDown size={12} className="text-indigo-600" />
          ) : (
            <ChevronDown size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
    </th>
  );
};