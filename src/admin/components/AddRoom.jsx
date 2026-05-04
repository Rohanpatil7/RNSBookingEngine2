// src/admin/pages/AddRoom.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, Upload, X, Plus, Check, 
  Wifi, Coffee, Tv, Lock 
} from 'lucide-react';

export default function AddRoom({ onBack, onSave, initialData }) {
  
  // --- STATE INITIALIZATION ---
  const [formData, setFormData] = useState({
    id: initialData?.id || null,
    name: initialData?.name || '',
    type: initialData?.type || 'Standard',
    status: initialData?.status || 'Available', // ✅ ADDED STATUS STATE
    price: initialData?.price ? String(initialData.price).replace(/[^0-9.]/g, '') : '',
    size: initialData?.size ? String(initialData.size).replace(/[^0-9.]/g, '') : '',
    capacity: initialData?.capacity || 2,
    description: initialData?.description || ''
  });

  const [images, setImages] = useState(() => {
    if (initialData?.image) return [{ url: initialData.image, file: null }];
    return initialData?.images || [];
  });

  const [inclusions, setInclusions] = useState(initialData?.inclusions || ['Breakfast']);
  const [newInclusion, setNewInclusion] = useState('');
  
  const [selectedAmenities, setSelectedAmenities] = useState(initialData?.amenities || []);

  const amenitiesList = [
    { id: 'wifi', label: 'Free Wifi', icon: Wifi },
    { id: 'tv', label: 'Smart TV', icon: Tv },
    { id: 'coffee', label: 'Coffee Maker', icon: Coffee },
    { id: 'safe', label: 'Electronic Safe', icon: Lock },
  ];

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (id) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const addInclusion = (e) => {
    e.preventDefault();
    if (newInclusion.trim()) {
      setInclusions(prev => [...prev, newInclusion.trim()]);
      setNewInclusion('');
    }
  };

  const removeInclusion = (index) => {
    setInclusions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const roomData = {
      ...formData,
      images,
      amenities: selectedAmenities,
      inclusions
    };
    if (onSave) onSave(roomData);
  };

  const isEditMode = !!initialData;

  // Helper to color code the status dropdown
  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'text-emerald-600 bg-emerald-50';
      case 'Maintenance': return 'text-orange-600 bg-orange-50';
      case 'Cleaning': return 'text-blue-600 bg-blue-50';
      case 'Occupied': return 'text-slate-600 bg-slate-50';
      default: return 'text-slate-700 bg-white';
    }
  };

  return (
    <div className="animate-fade-in-up pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEditMode ? 'Edit Room' : 'Add New Room'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEditMode ? `Update details for ${formData.name}` : 'Create a new room type for your hotel'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: DETAILS --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800 text-lg">Room Details</h3>
               
               {/* ✅ ADDED: Status Badge/Indicator (Visual only) */}
               <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  formData.status === 'Available' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 
                  formData.status === 'Maintenance' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                  'border-slate-200 bg-slate-50 text-slate-600'
               }`}>
                  {formData.status}
               </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
                <input 
                  type="text" name="name" required
                  placeholder="e.g. Ocean View Suite"
                  value={formData.name} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              
              {/* ✅ ADDED: Room Status Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Status</label>
                <select 
                  name="status" 
                  value={formData.status} onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium ${getStatusColor(formData.status)}`}
                >
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Type</label>
                <select 
                  name="type" 
                  value={formData.type} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option>Standard</option>
                  <option>Deluxe</option>
                  <option>Suite</option>
                  <option>Family</option>
                </select>
              </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (Per Night)</label>
                  <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                     <input 
                      type="number" name="price" required
                      placeholder="0"
                      value={formData.price} onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Size (sq.ft)</label>
                <input 
                  type="number" name="size"
                  placeholder="e.g. 350"
                  value={formData.size} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Capacity</label>
                <input 
                  type="number" name="capacity"
                  min="1" max="10"
                  value={formData.capacity} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                name="description" rows="3"
                placeholder="Describe the room features, view, and ambiance..."
                value={formData.description} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Amenities Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesList.map((item) => {
                const isSelected = selectedAmenities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAmenity(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isSelected && <Check size={16} className="ml-auto text-indigo-600"/>}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN: IMAGES & EXTRAS --- */}
        <div className="space-y-6">
          
          {/* Image Upload */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Room Images</h3>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input 
                type="file" multiple accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                <Upload size={20} />
              </div>
              <p className="text-sm font-medium text-slate-700">Click to upload images</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden h-24 border border-slate-200">
                    <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inclusions */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Inclusions</h3>
            
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                placeholder="Add inclusion (e.g. Breakfast)"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                type="button" 
                onClick={addInclusion}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {inclusions.map((inc, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm text-slate-700">
                  <span>{inc}</span>
                  <button type="button" onClick={() => removeInclusion(idx)} className="text-slate-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {inclusions.length === 0 && <p className="text-xs text-slate-400 italic">No inclusions added yet.</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
             <button 
              type="button" 
              onClick={onBack}
              className="flex-1 py-3 border border-slate-300 bg-white text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
             </button>
             <button 
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
            >
              {isEditMode ? 'Update Room' : 'Save Room'}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}