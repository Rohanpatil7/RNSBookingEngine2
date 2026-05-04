// src/admin/pages/Rooms.jsx
import React, { useEffect, useState } from 'react';
import { 
  Plus, Users, Maximize, Edit2, Trash2, BedDouble, Wifi, Coffee, Loader
} from 'lucide-react';
import { getHotelDetails, getRoomRates } from '../../api/api_services';
import AddRoom from '../components/AddRoom';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE FOR EDITING ---
  const [isAddMode, setIsAddMode] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null); // Track which room is being edited

  useEffect(() => {
    fetchRoomData();
  }, []);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      const [detailsRes, ratesRes] = await Promise.all([
        getHotelDetails(),
        getRoomRates({ BookingDate: new Date().toISOString().split('T')[0] })
      ]);

      if (detailsRes?.status === 1 && detailsRes?.data) {
        const mappedRooms = detailsRes.data.map(room => {
          const rateData = ratesRes?.data?.find(r => String(r.RoomId) === String(room.RoomId));
          return {
            id: room.RoomId,
            name: room.RoomName || room.Name || "Unknown Room",
            type: room.RoomType || room.RoomCategory || "Standard", 
            price: rateData ? `₹ ${rateData.RoomRate || rateData.Rate || rateData.Price || 0}` : "N/A",
            size: room.RoomSize ? `${room.RoomSize} sq.ft` : "N/A",
            capacity: room.MaxAdults || 2,
            status: "Available", 
            image: room.Image1 || room.RoomImage || "https://via.placeholder.com/300x200?text=No+Image",
          };
        });
        setRooms(mappedRooms);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: Open Edit Mode ---
  const handleEditClick = (room) => {
    setEditingRoom(room); // Pass the clicked room to state
    setIsAddMode(true);   // Switch view
  };

  // --- HANDLER: Save (Create or Update) ---
  const handleSaveRoom = (roomData) => {
    // Check if we are updating an existing room
    if (roomData.id) {
      setRooms(prevRooms => prevRooms.map(room => 
        room.id === roomData.id 
          ? {
              ...room,
              name: roomData.name,
              type: roomData.type,
              price: `₹ ${roomData.price}`, // Format back to string
              size: `${roomData.size} sq.ft`,
              capacity: roomData.capacity,
              image: roomData.images.length > 0 ? roomData.images[0].url : room.image
            } 
          : room
      ));
    } else {
      // Create New
      const newRoom = {
        id: Date.now(),
        name: roomData.name,
        type: roomData.type,
        price: `₹ ${roomData.price}`,
        size: `${roomData.size} sq.ft`,
        capacity: roomData.capacity,
        status: "Available",
        image: roomData.images.length > 0 ? roomData.images[0].url : "https://via.placeholder.com/300x200?text=No+Image"
      };
      setRooms(prev => [...prev, newRoom]);
    }

    // Reset and Close
    setIsAddMode(false);
    setEditingRoom(null);
  };

  // --- HANDLER: Close Form ---
  const handleBack = () => {
    setIsAddMode(false);
    setEditingRoom(null);
  };

  // --- RENDER CONDITIONAL VIEW ---
  if (isAddMode) {
    return (
      <AddRoom 
        onBack={handleBack} 
        onSave={handleSaveRoom} 
        initialData={editingRoom} // Pass the data to the form
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-indigo-600">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rooms & Rates</h1>
          <p className="text-slate-500 text-sm mt-1">Manage room inventory and pricing</p>
        </div>
        <button 
          onClick={() => { setEditingRoom(null); setIsAddMode(true); }} // Clear edit state for "Add"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium shadow-md shadow-indigo-100"
        >
          <Plus size={18} /> Add Room
        </button>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold shadow-sm ${
                        room.status === 'Available' ? 'bg-white text-emerald-600' : 'bg-slate-900 text-white'
                    }`}>
                        {room.status}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1 block">
                  {room.type}
                </span>

                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{room.name}</h3>
                    <span className="font-bold text-indigo-600">{room.price}<span className="text-xs text-slate-400 font-normal">/night</span></span>
                </div>
                
                <div className="flex items-center gap-4 text-slate-500 text-sm mb-4">
                    <div className="flex items-center gap-1"><Maximize size={14}/> {room.size}</div>
                    <div className="flex items-center gap-1"><Users size={14}/> {room.capacity} Guests</div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button 
                        onClick={() => handleEditClick(room)} // TRIGGER EDIT
                        className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Edit2 size={16} /> Edit
                    </button>
                    <button className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
            </div>
          </div>
        ))}
        
        {/* Add New Room Card */}
        <div 
            onClick={() => { setEditingRoom(null); setIsAddMode(true); }} 
            className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer"
        >
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <Plus size={24} />
            </div>
            <p className="font-medium">Add New Room</p>
        </div>
      </div>
    </div>
  );
}