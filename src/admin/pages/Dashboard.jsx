// src/admin/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { 
  Users, IndianRupee, DoorOpen, CalendarCheck
} from 'lucide-react';
import { fetchBookingRegister, fetchRoomBookingStatus } from '../apis/admin_api';
import { getHotelDetails } from '../../api/api_services';
import { BallTriangle } from 'react-loader-spinner';

// --- Imported Components ---
import RevenueChart from '../components/RevenueChart';
import RoomPieChart from '../components/RoomPieChart';
import StatCard from '../components/StateCard';
import WeeklyTrafficChart from '../components/WeeklyTrafficChart';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    revenue: 0,
    pendingCheckins: 0,
    occupancy: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [chartData, setChartData] = useState([]); // Revenue Chart Data
  const [roomTypeData, setRoomTypeData] = useState([]);
  const [weeklyTrafficData, setWeeklyTrafficData] = useState([]); // State for Weekly Traffic
  
  const [statusKey, setStatusKey] = useState(null);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const normalizeStatus = (statusVal) => {
    if (statusVal === undefined || statusVal === null) return 'Unknown';
    const s = String(statusVal).toLowerCase().trim();
    if (['1', 'confirmed', 'success', 'active', 'booked'].includes(s)) return 'Confirmed';
    if (['0', 'pending', 'hold', 'initiated', 'waiting'].includes(s)) return 'Pending';
    if (['2', 'cancelled', 'failed', 'refunded'].includes(s)) return 'Cancelled';
    return String(statusVal);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      
      // 1. Define Date Ranges
      // Current Month (for Main Stats & Revenue)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Last 7 Days (for Weekly Traffic Chart)
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      // 2. Expand Fetch Range for Booking Register
      // If 7 days ago was in the previous month, we must start fetching from there
      const fetchStartDate = sevenDaysAgo < startOfMonth ? sevenDaysAgo : startOfMonth;
      
      const formatDate = (d) => d.toISOString().split('T')[0];

      // 3. Fetch Data (Bookings, Hotel Details, and Room Stats)
      const [bookingRes, hotelRes, roomStatusRes] = await Promise.all([
        fetchBookingRegister(formatDate(fetchStartDate), formatDate(endOfMonth)),
        getHotelDetails(),
        // Fetch room stats specifically for the current month to align with the monthly revenue/stats
        fetchRoomBookingStatus(formatDate(startOfMonth), formatDate(endOfMonth))
      ]);

      if (bookingRes && bookingRes.status === 1 && bookingRes.data) {
        const roomsList = (hotelRes && hotelRes.status === 1) ? hotelRes.data : [];
        
        let detectedKey = null;
        if (bookingRes.data.length > 0) {
          const firstItem = bookingRes.data[0];
          detectedKey = ['Status', 'status', 'BookingStatus', 'booking_status', 'reservation_status'].find(k => k in firstItem) 
                        || Object.keys(firstItem).find(k => k.toLowerCase().includes('status'));
          setStatusKey(detectedKey);
        }

        // Pass the fetched data to the processing function
        processDashboardData(bookingRes.data, roomsList, detectedKey, startOfMonth, roomStatusRes);
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const processDashboardData = (allBookings, rooms, key, startOfMonth, roomStatusData) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    // --- 1. Filter for Monthly Stats (Revenue, Counts) ---
    // We only want bookings belonging to the current month for the top cards
    const monthlyBookings = allBookings.filter(b => {
      const d = (b.BookingDate || b.booking_date || b.CheckInDate || '').split(' ')[0];
      return d >= startOfMonthStr; 
    });

    // Calculate Total Stats based on Monthly Data
    const totalBookings = monthlyBookings.length;
    const revenue = monthlyBookings.reduce((sum, item) => sum + (parseFloat(item.TotalAmount || item.GrandTotal || item.total_amount || 0)), 0);
    
    // Pending Check-ins (Today) - Check all bookings as check-in might be from prev month booking
    const pending = allBookings.filter(b => {
        const rawStatus = key ? b[key] : (b.Status || b.status); 
        const status = normalizeStatus(rawStatus);
        const checkIn = (b.CheckInDate || b.check_in_date || '').split(' ')[0]; 
        return checkIn === todayStr && status === 'Confirmed';
    }).length;

    // Occupancy Rate (Active stays today)
    const activeBookings = allBookings.filter(b => {
      const rawStatus = key ? b[key] : (b.Status || b.status);
      const status = normalizeStatus(rawStatus);
      const checkIn = (b.CheckInDate || b.check_in_date || '').split(' ')[0];
      const checkOut = (b.CheckOutDate || b.check_out_date || '').split(' ')[0];
      return status === 'Confirmed' && checkIn <= todayStr && checkOut > todayStr;
    }).length;

    const totalRooms = rooms.reduce((sum, room) => sum + (parseInt(room.NoOfRooms || 1)), 0) || 20;
    const occupancyRate = Math.round((activeBookings / totalRooms) * 100);

    // Revenue Chart Data (Current Month Daily)
    const dailyMap = {};
    monthlyBookings.forEach(booking => {
      const d = (booking.BookingDate || booking.booking_date || booking.CheckInDate || '').split(' ')[0];
      if (d) {
        dailyMap[d] = (dailyMap[d] || 0) + parseFloat(booking.TotalAmount || booking.GrandTotal || 0);
      }
    });
    
    const revenueChart = Object.keys(dailyMap).sort().map(date => ({
      name: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      revenue: dailyMap[date]
    })); 

    // --- Room Type Pie Data (From New API) ---
    let pieData = [];
    if (roomStatusData && Array.isArray(roomStatusData.RoomCategories)) {
      // Use the accurate server-side stats if available
      pieData = roomStatusData.RoomCategories.map(room => ({
        name: room.Name,
        count: room.TotalBookings || 0
      })).filter(item => item.count > 0); // Optional: Hide rooms with 0 bookings to keep chart clean
    } else {
      // Fallback to manual calculation if API fails
      const roomMap = {};
      monthlyBookings.forEach(booking => {
        const type = booking.RoomName || booking.Room || booking.room_name || "Standard";
        roomMap[type] = (roomMap[type] || 0) + 1;
      });
      pieData = Object.keys(roomMap).map(key => ({ name: key, count: roomMap[key] }));
    }

    // --- 2. Filter for Weekly Traffic (Last 7 Days) ---
    // We use 'allBookings' here because it contains the extra days from the previous month if needed
    const trafficData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const checkins = allBookings.filter(b => {
        const cIn = (b.CheckInDate || b.check_in_date || '').split(' ')[0];
        return cIn === dateStr;
      }).length;

      const checkouts = allBookings.filter(b => {
        const cOut = (b.CheckOutDate || b.check_out_date || '').split(' ')[0];
        return cOut === dateStr;
      }).length;

      trafficData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        fullDate: dateStr,
        checkins,
        checkouts
      });
    }

    setStats({
      totalBookings,
      revenue: revenue.toLocaleString('en-IN'),
      pendingCheckins: pending,
      occupancy: `${occupancyRate}%`
    });
    setChartData(revenueChart);
    setRoomTypeData(pieData);
    setWeeklyTrafficData(trafficData);
    
    // Recent Bookings: Sort all fetched bookings by date
    const sortedBookings = [...allBookings].sort((a, b) => {
        const dA = new Date(a.BookingDate || a.booking_date || 0);
        const dB = new Date(b.BookingDate || b.booking_date || 0);
        return dB - dA;
    });
    setRecentBookings(sortedBookings.slice(0, 5));
  };

  const getStatusColor = (normalizedStatus) => {
    const s = normalizedStatus.toLowerCase();
    if (s === 'confirmed') return 'bg-green-100 text-green-700';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (s === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <BallTriangle color="#4F46E5" height={80} width={80} visible={true} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time data from your Booking Engine.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:auto-cols-min lg:grid-cols-4 gap-2">
        <StatCard label="Total Bookings" value={stats.totalBookings} icon={CalendarCheck} color="bg-blue-50 text-blue-600" />
        <StatCard label="Revenue (Month)" value={`₹ ${stats.revenue}`} icon={IndianRupee} color="bg-green-50 text-green-600" />
        <StatCard label="Pending Check-ins" value={stats.pendingCheckins} icon={Users} color="bg-purple-50 text-purple-600" />
        <StatCard label="Occupancy Rate" value={stats.occupancy} icon={DoorOpen} color="bg-orange-50 text-orange-600" />
      </div>

      {/* Main Charts Section: Revenue & Room Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trends (This Month)</h3>
          <RevenueChart data={chartData} />
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Bookings by Room</h3>
          {/* Check if data exists before rendering chart, else show placeholder */}
          {roomTypeData.length > 0 ? (
             <RoomPieChart data={roomTypeData} colors={COLORS} />
          ) : (
             <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No data available</div>
          )}
        </div>
      </div>

      {/* Secondary Section: Weekly Traffic Chart (Full Width) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Traffic (Last 7 Days)</h3>
        <WeeklyTrafficChart data={weeklyTrafficData} />
      </div>

      {/* Bottom Section: Recent Bookings Table (Full Width) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100"><h3 className="text-lg font-semibold text-gray-800">Recent Bookings</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                <th className="p-4">Booking ID</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Room</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-gray-600">
              {recentBookings.map((b, idx) => {
                const rawStatus = statusKey ? b[statusKey] : (b.Status || b.status);
                const normalizedStatus = normalizeStatus(rawStatus);
                
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-indigo-600">
                      #{b.BookingID || b.ReservationNo || b.id || 'N/A'}
                    </td>
                    <td className="p-4 font-medium">
                      {b.GuestFirstName || b.guest_name || 'Guest'} {b.GuestLastName || ''}
                    </td>
                    <td className="p-4">
                      {b.RoomName || b.Room || b.room_name || "Standard"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(normalizedStatus)}`}>
                        {normalizedStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      ₹ {b.TotalAmount || b.GrandTotal || b.total_amount || 0}
                    </td>
                  </tr>
                );
              })}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-400">No recent bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}