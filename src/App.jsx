import React, { useEffect, useState } from "react";
// 1. Import useLocation
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import AllRooms from "./pages/AllRooms.jsx";
import Booking from "./pages/Booking.jsx";
import { getHotelDetails } from "./api/api_services.js";
import PaySuccess from "./pages/Paysuccess.jsx";
import PayFailure from "./pages/Payfailure.jsx";
import { BallTriangle } from "react-loader-spinner";

import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Login from './admin/pages/Login';
import Bookings from './admin/pages/Bookings';
import Rooms from './admin/pages/Rooms';
import RepeatGuests from './admin/pages/RepeatGuests';
import RoomCategoryReport from './admin/pages/RoomCategoryReport';
import GuestWiseBookings from './admin/pages/GuestWiseBookings';
import SummaryReport from './admin/pages/SummaryReport.jsx';

// 2. Protected Admin Route Component

const ProtectedAdminRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem("adminToken");
    return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Get the location object from React Router
  const location = useLocation();

  // 3. Update isAdmin logic to use location.pathname
  // This correctly ignores the '/booking/' base path
  const isAdmin = location.pathname.startsWith('/admin');

  const getQueryParam = (name) => {
    let query = window.location.search;
    if (!query && window.location.hash.includes("?")) {
      query = window.location.hash.split("?")[1];
    }
    const params = new URLSearchParams(query);
    return params.get(name);
  };

  const urlParam = getQueryParam("parameter");
  const storedParam = localStorage.getItem("hotelParam");
  const hotelParam = urlParam || storedParam;

  if (urlParam && urlParam !== storedParam) {
    localStorage.setItem("hotelParam", urlParam);
  }

  useEffect(() => {
    if (isAdmin) return;

    const fetchHotelData = async () => {
      if (!hotelParam) {
        setError("Trouble to find hotel.");
        return;
      }

      try {
        setLoading(true);
        if (urlParam) {
          localStorage.setItem("hotelParam", urlParam);
        }

        const data = await getHotelDetails(hotelParam);

        if (data?.result?.[0]) {
          if (data.result[0].Error) {
            setError(` ${data.result[0].Error}`);
          } else {
            setHotelData(data.result[0]);
            setError(null);
          }
        } else {
          setError("Received invalid data format from the hotel details API.");
        }
      } catch (err) {
        console.error("Failed to fetch hotel data:", err);
        setError(err.message || "An unknown network error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [hotelParam, urlParam, isAdmin]);

  if (loading && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold">
        <BallTriangle height={100} width={100} radius={5} color="#3d52f2" visible={true} />
      </div>
    );
  }

  if (error && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!hotelData && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold">
        Please provide a hotel parameter in the URL.
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* 4. Update the Navbar condition to use location.pathname */}
      {!location.pathname.startsWith('/admin') && <Navbar hotelData={hotelData} />}
      
      <div className="h-fit relative">
        <Routes>
            <Route path="/" element={<Home hotelData={hotelData} />} />
            <Route path="/allrooms" element={<AllRooms hotelData={hotelData} room />} />
            <Route path="/booking/new" element={<Booking hotelData={hotelData} />} />
            <Route path="/payment-success" element={<PaySuccess hotelData={hotelData}/>} />
            <Route path="/payment-failure" element={<PayFailure />} />

            <Route path="/admin/login" element={<Login />} />
             
            <Route path="/admin" element={
                <ProtectedAdminRoute>
                    <AdminLayout />
                </ProtectedAdminRoute>
            }>
                <Route index element={<Navigate to="dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="bookings" element={<Bookings />} /> 
                <Route path="rooms" element={<Rooms />} />
                <Route path="guests" element={<RepeatGuests />} />
                <Route path="reports/room-category" element={<RoomCategoryReport />} />
                <Route path="reports/guest-wise" element={<GuestWiseBookings />} />
                <Route path="reports/summary" element={<SummaryReport />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;