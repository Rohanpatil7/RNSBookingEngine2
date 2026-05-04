// src/admin/components/BookingTable.jsx
import React from 'react';
import { Eye, Edit, Loader, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlignCenter } from 'lucide-react';

const BookingTable = ({ 
  bookings, 
  loading, 
  getNormalizedStatus, 
  getStatusColor, 
  onView, 
  onEdit,
  // New Props
  onSort,
  sortConfig,
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) => {

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Helper to render sort arrow
  const SortIcon = ({ columnKey }) => {
    if (sortConfig?.key !== columnKey) return <div className="w-4 h-4" />; // Placeholder
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className="text-indigo-600" /> 
      : <ChevronDown size={14} className="text-indigo-600" />;
  };

  // Helper for clickable header
  const SortableHeader = ({ label, columnKey, className = "" }) => (
    <th 
      onClick={() => onSort(columnKey)} 
      className={`p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none group ${className}`}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon columnKey={columnKey} />
      </div>
    </th>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-[500px]">
      
      {/* --- TABLE CONTENT --- */}
      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4 w-10"></th>
              
              <SortableHeader label="Booking ID" columnKey="BookingID" className='justify-center' />
              <SortableHeader label="Guest" columnKey="Guest" className='text-center' />
              <SortableHeader label="Room" columnKey="RoomName" className='text-center' />
              <SortableHeader label="Check-In" columnKey="CheckInDate" />
              
              <th className="p-4">Status</th>
              
              <SortableHeader label="Amount" columnKey="TotalAmount" className="text-right justify-end" />
              
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="8" className="h-[400px]">
                  <div className="flex flex-col items-center justify-center text-slate-400 h-full">
                    <Loader className="animate-spin mb-2" size={32} />
                    <p>Loading bookings...</p>
                  </div>
                </td>
              </tr>
            ) : bookings.length > 0 ? (
              bookings.map((b, index) => {
                const statusLabel = getNormalizedStatus(b);
                return (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4"></td>
                    <td className="p-4 font-medium text-indigo-600">
                      {b.BookingID || b.ReservationNo || "N/A"}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{b.GuestFirstName} {b.GuestLastName}</div>
                    </td>
                    <td className="p-4 text-slate-600">{b.RoomName || "Standard"}</td>
                    <td className="p-4 text-slate-600">
                      <div className="flex flex-col text-xs">
                         <span>{b.CheckInDate}</span>
                         <span className="text-slate-400">to {b.CheckOutDate}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(statusLabel)}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-900">
                      ₹ {b.TotalAmount || b.GrandTotal || 0}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                         <button 
                            onClick={() => onView(b)} 
                            className="p-1.5 cursor-pointer text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="View Details"
                         >
                            <Eye size={16}/>
                         </button>
                         <button 
                            onClick={() => onEdit(b)} 
                            className="p-1.5 cursor-pointer text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                            title="Edit"
                         >
                            <Edit size={16}/>
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="8" className="p-8 text-center text-slate-500 h-[300px]">No bookings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION FOOTER --- */}
      {!loading && totalItems > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/50 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          
          {/* Rows per page */}
          <div className="flex items-center gap-2 text-slate-500">
            <span>Rows per page:</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="border border-slate-200 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Range Info */}
          <div className="text-slate-500">
            Showing <span className="font-medium text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium text-slate-900">{totalItems}</span> results
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16}/>
            </button>
            
            {/* Simple Page Numbers (First, Current, Last) */}
            <div className="flex gap-1">
               {/* Always show Page 1 */}
               <button 
                  onClick={() => onPageChange(1)}
                  className={`px-3 py-1 border rounded ${currentPage === 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  1
               </button>

               {/* Dots if far from start */}
               {currentPage > 3 && <span className="px-1 py-1 text-slate-400">...</span>}

               {/* Current Page (if not first or last) */}
               {currentPage > 1 && currentPage < totalPages && (
                  <button className="px-3 py-1 border border-indigo-600 bg-indigo-600 text-white rounded">
                    {currentPage}
                  </button>
               )}

               {/* Dots if far from end */}
               {currentPage < totalPages - 2 && <span className="px-1 py-1 text-slate-400">...</span>}

               {/* Always show Last Page (if more than 1 page) */}
               {totalPages > 1 && (
                 <button 
                    onClick={() => onPageChange(totalPages)}
                    className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    {totalPages}
                 </button>
               )}
            </div>

            <button 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTable;