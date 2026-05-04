import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Search, Download, FileText, 
  Users, CheckCircle, TrendingUp, PieChart as PieIcon 
} from 'lucide-react';
import { fetchRoomBookingStatus } from '../apis/admin_api';
import { BallTriangle } from 'react-loader-spinner';
import RoomPieChart from '../components/RoomPieChart';
import StatCard from '../components/StateCard'; // Note: Ensure filename matches your project (StateCard vs StatCard)

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function RoomCategoryReport() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  // Default to Current Month
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await fetchRoomBookingStatus(startDate, endDate);
      if (data) {
        setReportData(data);
      }
    } catch (error) {
      console.error("Failed to load report", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = () => {
    if (!reportData || !reportData.RoomCategories) return;
    
    const headers = ["Room Name", "Code", "Total Bookings", "Booked Rooms", "Adult Cap", "Child Cap"];
    const rows = reportData.RoomCategories.map(r => [
      r.Name.trim(),
      r.Code,
      r.TotalBookings,
      r.BookedRooms,
      r.RoomMaxCapacityAdult,
      r.RoomMaxCapacityChild
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `room_category_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process Data for Chart & Stats
  const { chartData, mostPopular, totalCapacity } = useMemo(() => {
    if (!reportData?.RoomCategories) return { chartData: [], mostPopular: '-', totalCapacity: 0 };

    const cData = reportData.RoomCategories
      .filter(r => r.TotalBookings > 0)
      .map(r => ({
        name: r.Name,
        count: r.TotalBookings
      }));

    const sorted = [...reportData.RoomCategories].sort((a, b) => b.TotalBookings - a.TotalBookings);
    const popular = sorted.length > 0 && sorted[0].TotalBookings > 0 ? sorted[0].Name : 'N/A';
    
    const capacity = reportData.RoomCategories.reduce((acc, curr) => acc + (curr.RoomMaxCapacityAdult || 0), 0);

    return { chartData: cData, mostPopular: popular, totalCapacity: capacity };
  }, [reportData]);

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Room Category Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Performance insights by room type</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={!reportData}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-all text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-auto">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">From Date</label>
          <div className="relative">
             <Calendar className="absolute left-3 cursor-pointer top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16}/>
             <input 
               type="date" 
               value={startDate}
               onChange={(e) => setStartDate(e.target.value)}
               className="pl-10 pr-4 py-2 border cursor-pointer border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none w-full md:w-48 transition-all"
             />
          </div>
        </div>
        
        <div className="w-full md:w-auto">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">To Date</label>
          <div className="relative">
             <Calendar className="absolute left-3 cursor-pointer top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16}/>
             <input 
               type="date" 
               value={endDate}
               onChange={(e) => setEndDate(e.target.value)}
               className="pl-10 pr-4 py-2 border cursor-pointer border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none w-full md:w-48 transition-all"
             />
          </div>
        </div>

        <button 
          onClick={handleSearch}
          className="bg-indigo-600 text-white cursor-pointer px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors flex items-center justify-center gap-2 text-sm h-[38px] w-full md:w-auto shadow-sm shadow-indigo-200"
        >
          <Search size={16} /> Generate Report
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100">
           <BallTriangle color="#4F46E5" height={60} width={60} visible={true} />
           <p className="mt-4 text-slate-400 text-sm">Analyzing room data...</p>
        </div>
      ) : reportData && reportData.RoomCategories ? (
        <div className="space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatCard 
               label="Total Bookings" 
               value={reportData.TotalBookings || 0} 
               icon={FileText} 
               color="text-indigo-600" 
             />
             <StatCard 
               label="Most Popular" 
               value={mostPopular} 
               icon={TrendingUp} 
               color="text-emerald-600"
               
               fontSize="8px"
             />
             <StatCard 
               label="Active Categories" 
               value={reportData.RoomCategories.filter(r => r.ActiveStatus === 1).length} 
               icon={CheckCircle} 
               color="text-blue-600" 
             />
             <StatCard 
               label="Total Capacity (Adults)" 
               value={totalCapacity} 
               icon={Users} 
               color="text-orange-600" 
             />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Main Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                 <h3 className="font-semibold text-slate-800">Category Details</h3>
                 <span className="text-xs text-slate-500 bg-white border px-2 py-1 rounded">
                   {reportData.RoomCategories.length} Records
                 </span>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Room Category</th>
                      <th className="px-6 py-4 text-center">Bookings</th>
                      <th className="px-6 py-4 text-center">Rooms Booked</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {reportData.RoomCategories.map((room, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                             <span className="font-medium text-slate-900">{room.Name}</span>
                             <span className="text-xs text-slate-500">Code: {room.Code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            room.TotalBookings > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {room.TotalBookings}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 font-medium">
                          {room.BookedRooms}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${
                            room.ActiveStatus === 1 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${room.ActiveStatus === 1 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {room.ActiveStatus === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {reportData.RoomCategories.length === 0 && (
                      <tr><td colSpan="4" className="p-10 text-center text-slate-400">No data found for this date range.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart Section */}
            {/* <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col h-[400px] lg:h-auto">
              <div className="flex items-center gap-2 mb-4">
                <PieIcon size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-800">Booking Distribution</h3>
              </div>
              
              {chartData.length > 0 ? (
                <div className="flex-1 -ml-4">
                   <RoomPieChart data={chartData} colors={COLORS} />
                </div>
              ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
                    <PieIcon size={32} className="mb-2 opacity-50"/>
                    <p>No bookings to display</p>
                 </div>
              )}
              
              {chartData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
                   Top performing category makes up {((chartData[0]?.count / reportData.TotalBookings) * 100).toFixed(0)}% of total bookings.
                </div>
              )}
            </div> */}

          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 text-slate-500 shadow-sm">
           <Search size={48} className="mx-auto text-slate-200 mb-4" />
           <p>No report generated. Please select a date range.</p>
        </div>
      )}
    </div>
  );
}