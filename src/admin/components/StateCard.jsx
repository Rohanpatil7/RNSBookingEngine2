// src/admin/components/StatCard.jsx
import React from 'react';

const StatCard = ({ label, value, icon: Icon, color }) => {
  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow duration-300">
      
      <div className="flex-1 pr-4 min-w-0">
        {/* Label: text-xs (12px) on mobile, scales to text-sm (14px) on tablet+ */}
        <p className="text-gray-500 text-xs sm:text-sm font-semibold uppercase tracking-wide truncate">
          {label}
        </p>
        
        <div className="flex items-center mt-1 sm:mt-2">
          {/* Value: 
              - text-lg (18px) on mobile (Reduced from text-xl)
              - sm:text-2xl (24px) on tablet
              - lg:text-3xl (30px) on desktop 
          */}
          <h3 className="text-lg sm:text-sx  lg:text-xl font-bold text-gray-800 whitespace-nowrap truncate">
            {value}
          </h3>
        </div>
      </div>

      <div className={`p-2 sm:p-3 rounded-lg bg-gray-50 flex-shrink-0`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ${color}`} />
      </div>
    </div>
  );
};

export default StatCard;