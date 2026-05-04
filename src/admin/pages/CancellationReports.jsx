import React, { useState, useEffect } from 'react';
import { Calendar, Search } from 'lucide-react';
import { fetchCancellationReport } from '../apis/admin_api'; // ✅ Import API

export default function CancellationReports() {
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Default to current month
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({ count: 0, amount: 0 });

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetchCancellationReport(fromDate, toDate);
      if (res && res.status === 1) {
        setCancellations(res.cancellations || []);
        setStats({
          count: res["total cancelled bookings"] || 0,
          amount: res.total_cancel_amount || 0
        });
      } else {
        setCancellations([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Cancellation Report</h1>
      
      {/* Date Filters */}
      <div className="flex gap-4 items-end bg-white p-4 rounded-xl border border-slate-200">
         <div>
            <label className="text-xs font-bold text-slate-500">From</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border p-2 rounded w-full"/>
         </div>
         <div>
            <label className="text-xs font-bold text-slate-500">To</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border p-2 rounded w-full"/>
         </div>
         <button onClick={loadReport} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Fetch Report
         </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
           <h3 className="text-red-800 text-sm font-bold">Total Cancelled</h3>
           <p className="text-2xl font-bold text-red-600">{stats.count}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
           <h3 className="text-red-800 text-sm font-bold">Refund Amount</h3>
           <p className="text-2xl font-bold text-red-600">₹ {stats.amount}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 font-bold text-slate-500">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Guest</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Cancelled By</th>
              <th className="p-4 text-right">Refund</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cancellations.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50">
                 <td className="p-4 text-slate-600">#{c.BookingID}</td>
                 <td className="p-4 font-medium">{c.GuestName}</td>
                 <td className="p-4 text-red-500">{c.CancelReason}</td>
                 <td className="p-4 text-xs">{c.CancelledByUserName}</td>
                 <td className="p-4 text-right font-bold">₹{c.CancelAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}