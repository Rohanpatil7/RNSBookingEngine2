import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  BarChart3,
  LogOut, 
  ChevronLeft,
  ChevronRight,
  User,
  X
} from 'lucide-react';

const AdminSidebar = ({ 
  isSidebarOpen, 
  setSidebarOpen, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  handleLogout 
}) => {

  // ✅ Read dynamic values
  const hotelName = localStorage.getItem("hotelName") || "Hotel";
  const adminId = sessionStorage.getItem("adminToken");

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200
          shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)]
          transition-all duration-300 ease-in-out flex flex-col
          w-60 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 
          ${isSidebarOpen ? 'md:w-70' : 'md:w-[80px]'}
        `}
      >
        {/* Header */}
        <div className="h-18 flex items-center px-4 py-6 mb-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="font-bold text-white text-lg">
                {hotelName.charAt(0)}
              </span>
            </div>

            <div className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
              <h1 className="font-bold text-slate-800 text-lg truncate">
                {hotelName}
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Admin Panel
              </p>
            </div>
          </div>

          {/* Mobile Close */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden ml-auto text-slate-400 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        </div>

        {/* Desktop Toggle */}
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)} 
          className="hidden md:flex absolute -right-3 top-8 bg-white text-slate-400 hover:text-indigo-600 p-1.5 rounded-full shadow-md border z-50 cursor-pointer"
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          <SidebarSection title="Overview" isOpen={isSidebarOpen} />

          <SidebarLink to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" isOpen={isSidebarOpen} />
          <SidebarLink to="/admin/reports/summary" icon={BarChart3} label="Summary Report" isOpen={isSidebarOpen} />
          <SidebarLink to="/admin/bookings" icon={CalendarCheck} label="Bookings" isOpen={isSidebarOpen} />
          <SidebarLink to="/admin/reports/guest-wise" icon={User} label="Guest Wise Report" isOpen={isSidebarOpen} />
          <SidebarLink to="/admin/reports/room-category" icon={BarChart3} label="Category Wise Report" isOpen={isSidebarOpen} />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'md:justify-center'}`}>
            <div className="w-9 h-9 rounded-full bg-white border flex items-center justify-center">
              <User size={18} />
            </div>

            {isSidebarOpen && (
              <>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">
                    {hotelName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Admin ID: {adminId}
                  </p>
                </div>

                <button 
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

/* ---------- Reusable Components ---------- */

const SidebarSection = ({ title, isOpen }) => (
  <div className={`px-4 mb-2 mt-4 ${!isOpen ? 'md:hidden' : ''}`}>
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
      {title}
    </p>
  </div>
);

const SidebarLink = ({ to, icon: Icon, label, isOpen }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      group flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg
      transition-all font-medium
      ${isActive 
        ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
      ${!isOpen && 'md:justify-center md:px-2'}
    `}
  >
    <Icon size={20} />
    <span className={`${!isOpen ? 'md:hidden' : 'block'}`}>{label}</span>

    {!isOpen && (
      <div className="hidden md:block absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </NavLink>
);

export default AdminSidebar;
