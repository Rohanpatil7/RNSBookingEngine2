// src/admin/pages/SummaryReport.jsx
import React, { useEffect, useState } from "react";
import { 
  Calendar, Search, Download, FileText, 
  CheckCircle, IndianRupee, PieChart, AlertCircle, 
  XCircle, Filter, RefreshCw, TrendingUp 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { BallTriangle } from "react-loader-spinner";

import { fetchSummaryReport } from "../apis/admin_api";
import StatCard from "../components/StateCard"; 

export default function SummaryReport() {
  // ----------------------------
  // 1️⃣ STATE VARIABLES
  // ----------------------------
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [paymentSummary, setPaymentSummary] = useState(null);
  const [categoryList, setCategoryList] = useState([]);

  // ----------------------------
  // 2️⃣ API CALL
  // ----------------------------
  const loadSummaryReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchSummaryReport({
        FromDate: fromDate,
        ToDate: toDate,
      });

      if (response?.status === 1) {
        setPaymentSummary(response.payment_summary || null);

        const categories = (response.categorywise_bookings || []).map(
          (item) => ({
            category_name: item.category_name ?? item.catergory_name ?? "Unknown",
            booking_count: Number(item.booking_count || 0),
            booking_amount: Number(item.booking_amount || 0),
          })
        );
        setCategoryList(categories);
      } else {
        setPaymentSummary(null);
        setCategoryList([]);
        setError("No data found for the selected date range.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server.");
      setPaymentSummary(null);
      setCategoryList([]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // 3️⃣ INITIAL LOAD
  // ----------------------------
  useEffect(() => {
    loadSummaryReport();
  }, []);

  // Calculate Total Revenue for Percentage Bars
  const totalRevenue = categoryList.reduce((sum, item) => sum + item.booking_amount, 0);

  const handleExport = () => {
    if (categoryList.length === 0) return;
    const headers = ["Category,Bookings,Amount"];
    const rows = categoryList.map(c =>
      `${c.category_name},${c.booking_count},${c.booking_amount}`
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `summary_report_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20 max-w-[1600px] mx-auto">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Summary Report</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-500"/>
            Financial & operational performance overview
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={categoryList.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* --- FILTER TOOLBAR --- */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5 items-end">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">From Date</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={18}/>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all cursor-pointer hover:bg-white"
                    />
                </div>
            </div>
            <div className="relative group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">To Date</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={18}/>
                    <input
                        type="date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all cursor-pointer hover:bg-white"
                    />
                </div>
            </div>
        </div>
        
        <button
          onClick={loadSummaryReport}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="animate-spin" size={18}/> : <Search size={18} />}
          Generate Report
        </button>
      </div>

      {/* --- LOADING STATE --- */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-2xl border border-dashed border-slate-200">
          <BallTriangle color="#4F46E5" height={60} width={60} />
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Analyzing data...</p>
        </div>
      )}

      {/* --- ERROR STATE --- */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
             <AlertCircle size={24} />
          </div>
          <h3 className="text-red-800 font-bold text-lg mb-1">Unable to load report</h3>
          <p className="text-red-600/80">{error}</p>
        </div>
      )}

      {/* --- DATA CONTENT --- */}
      {!loading && !error && paymentSummary && (
        <div className="space-y-8">

          {/* 1. KEY METRICS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard 
                label="Total Bookings" 
                value={paymentSummary.total_bookings} 
                icon={FileText} 
                color="text-indigo-600"
            />
            <StatCard 
                label="Total Revenue" 
                value={`₹ ${paymentSummary.booking_amount?.toLocaleString("en-IN")}`} 
                icon={IndianRupee} 
                color="text-emerald-600"
            />
            <StatCard 
                label="Paid Bookings" 
                value={paymentSummary.paid_bookings} 
                icon={CheckCircle} 
                color="text-blue-600"
            />
            <StatCard 
                label="Failed Transactions" 
                value={paymentSummary.failed_bookings} 
                icon={XCircle} 
                color="text-red-500"
            />
            <StatCard 
                label="Cancelled Value" 
                value={`₹ ${paymentSummary.cancel_amount?.toLocaleString("en-IN")}`} 
                icon={IndianRupee} 
                color="text-orange-500"
            />
             <StatCard 
                label="Failed Value" 
                value={`₹ ${paymentSummary.failed_amount?.toLocaleString("en-IN")}`} 
                icon={XCircle} 
                color="text-red-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 2. REVENUE CHART */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[420px]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
                            <PieChart size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Revenue Distribution</h2>
                            <p className="text-xs text-slate-500">Income by room category</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-0">
                        {categoryList.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryList} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="category_name" 
                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
                                        axisLine={false} 
                                        tickLine={false}
                                        dy={10}
                                        interval={0} // Show all labels
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 11, fill: '#64748b' }} 
                                        axisLine={false} 
                                        tickLine={false}
                                        tickFormatter={(val) => `₹${val/1000}k`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc', opacity: 0.8 }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-xs z-50">
                                                        <p className="font-bold text-slate-800 mb-1">{payload[0].payload.category_name}</p>
                                                        <p className="text-indigo-600 font-semibold">
                                                            ₹ {payload[0].value.toLocaleString("en-IN")}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="booking_amount"
                                        radius={[6, 6, 0, 0]}
                                        barSize={40}
                                        animationDuration={1500}
                                    >
                                        {categoryList.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill="#6366f1" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                                <PieChart size={32} className="mb-2 opacity-20"/>
                                No revenue data available for chart
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. DETAILED TABLE */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[420px]">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div>
                             <h3 className="font-bold text-slate-800 text-lg">Category Breakdown</h3>
                             <p className="text-xs text-slate-500">Detailed performance metrics</p>
                        </div>
                        <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                            {categoryList.length} Categories
                        </span>
                    </div>
                    
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 bg-slate-50/80 backdrop-blur">Category Name</th>
                                    <th className="px-6 py-4 text-center bg-slate-50/80 backdrop-blur">Bookings</th>
                                    <th className="px-6 py-4 text-right bg-slate-50/80 backdrop-blur">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {categoryList.length > 0 ? (
                                    categoryList.map((item, index) => {
                                        // Calculate percentage contribution
                                        const percent = totalRevenue > 0 ? (item.booking_amount / totalRevenue) * 100 : 0;
                                        
                                        return (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-8 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    {item.category_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    {item.booking_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-slate-800">
                                                        ₹ {item.booking_amount.toLocaleString("en-IN")}
                                                    </span>
                                                    {/* Visual Progress Bar */}
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-indigo-500 rounded-full" 
                                                            style={{ width: `${percent}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 mt-0.5">{percent.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )})
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-20 text-center text-slate-400 text-sm">
                                            <div className="flex flex-col items-center gap-2">
                                                <Filter size={24} className="opacity-20" />
                                                No data found for this selection
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
      )}
    </div>
  );
}