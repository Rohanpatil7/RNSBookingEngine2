// src/admin/components/RoomPieChart.jsx
import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';

const RoomPieChart = ({ data, colors }) => {
  // Calculate total for percentage display
  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.count, 0), [data]);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, fill,count } = payload[0].payload;
      const percent = ((count / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-xs z-50">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fill }}></span>
            <span className="font-semibold text-slate-800">{name}</span>
          </div>
          <div className="text-slate-500 pl-4">
            <span className="font-bold text-slate-700">{value}</span> bookings ({percent}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between h-full min-h-[300px] gap-6">
      
      {/* Chart Section */}
      <div className="relative w-full md:w-1/2 h-[220px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={4}
              dataKey="count"
              stroke="none"
              cornerRadius={6}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                  className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text (Total Count) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-3xl font-bold text-slate-800 leading-none">{total}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">Total</p>
        </div>
      </div>

      {/* Custom Legend Section */}
      <div className="w-full md:w-1/2 flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
        {data.map((entry, index) => {
           const percent = total > 0 ? ((entry.count / total) * 100).toFixed(0) : 0;
           const color = colors[index % colors.length];
           
           return (
             <div 
               key={index} 
               className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors group cursor-default border border-transparent hover:border-slate-100"
             >
               <div className="flex items-center gap-3 overflow-hidden min-w-0">
                 <div 
                   className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" 
                   style={{ backgroundColor: color }}
                 />
                 <span className="text-sm text-slate-600 truncate font-medium group-hover:text-slate-900 transition-colors" title={entry.name}>
                   {entry.name}
                 </span>
               </div>
               
               <div className="flex items-center gap-3 text-sm flex-shrink-0 pl-2">
                 {/* <span className="font-bold text-slate-800">{entry.count}</span> */}
                 {/* <span className="text-xs text-slate-400 w-9 text-right bg-slate-100 px-1.5 py-0.5 rounded-md">
                   {percent}%
                 </span> */}
               </div>
             </div>
           );
        })}
      </div>
      
    </div>
  );
};

export default RoomPieChart;