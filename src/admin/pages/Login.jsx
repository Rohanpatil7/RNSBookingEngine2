import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../apis/admin_api';

const Login = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await adminLogin(user, pass);
      console.log("LOGIN API RESPONSE:", res);

      const row = res?.result?.[0] || res?.[0];
     
      // ✅ SUCCESS: only when Userid exists
      if (row && row.Userid) {
        // Changed to localStorage to match the persistent route protection
        localStorage.setItem("adminToken", row.Userid);
        localStorage.setItem("hotelName", row.HotelName);

        // // ⭐ IMPORTANT — dynamic hotel param, handling case sensitivity
        // const hotelParamValue = row.parameter || row.Parameter;
        // if (hotelParamValue) {
        //   localStorage.setItem("hotelParam", hotelParamValue);
        // } else {
        //   console.warn("⚠️ API didn't return hotel parameter");
        // }

        navigate("/admin/dashboard");
      
      }
      // ❌ API returned error message (e.g., "Account Disabled", "Invalid Password")
      else if (row?.Error) {
        alert(row.Error);
      }
      // ❌ fallback safety
      else {
        alert("Invalid username or password");
      }

    } catch (err) {
      console.error("Login Error:", err);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
      
      {/* Login Card */}
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-200 w-full max-w-[440px]">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg mb-4 flex items-center justify-center shadow-indigo-200 shadow-lg">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="text-slate-500 mt-2">
            to access the Admin Dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transform active:scale-[0.98] transition-all shadow-md mt-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Signing in...' : 'Continue'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Xpress Hotel POS
          </p>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="mt-6 flex gap-4 text-sm text-slate-500">
        <span className="hover:text-indigo-600 cursor-pointer">Help</span>
        <span className="hover:text-indigo-600 cursor-pointer">Privacy</span>
        <span className="hover:text-indigo-600 cursor-pointer">Terms</span>
      </div>
    </div>
  );
};

export default Login;