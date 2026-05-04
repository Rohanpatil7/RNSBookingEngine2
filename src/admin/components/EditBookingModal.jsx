// src/admin/components/EditBookingModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';

const EditBookingModal = ({ booking, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    GuestFirstName: '',
    GuestLastName: '',
    Status: 'Pending',
    // Add other fields here if needed (e.g., CheckInDate)
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when booking data changes
  useEffect(() => {
    if (booking) {
      setFormData({
        GuestFirstName: booking.GuestFirstName || '',
        GuestLastName: booking.GuestLastName || '',
        Status: booking.Status || 'Pending'
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Pass the updated data back to the parent
    await onSave({ ...booking, ...formData });
    setIsSaving(false);
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">Edit Booking</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Read-Only ID Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Booking ID</label>
            <input 
              type="text" 
              value={booking.BookingID || booking.ReservationNo || ''} 
              disabled 
              className="w-full p-2 bg-slate-100 border border-slate-200 rounded text-slate-600 text-sm cursor-not-allowed"
            />
          </div>

          {/* Guest Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                <input 
                  name="GuestFirstName"
                  type="text" 
                  value={formData.GuestFirstName} 
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                <input 
                  name="GuestLastName"
                  type="text" 
                  value={formData.GuestLastName} 
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
            <div className="relative">
              <select 
                name="Status"
                value={formData.Status}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              {/* Custom Arrow Icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-md shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingModal;