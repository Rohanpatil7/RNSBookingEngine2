// src/admin/components/WeeklyTrafficChart.jsx
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const WeeklyTrafficChart = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
            }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', color: '#64748b' }} 
          />
          {/* Check-ins Bar */}
          <Bar 
            name="Check-ins" 
            dataKey="checkins" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]} 
            barSize={12} 
            animationDuration={1500}
          />
          {/* Check-outs Bar */}
          <Bar 
            name="Check-outs" 
            dataKey="checkouts" 
            fill="#EF4444" 
            radius={[4, 4, 0, 0]} 
            barSize={12} 
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyTrafficChart;