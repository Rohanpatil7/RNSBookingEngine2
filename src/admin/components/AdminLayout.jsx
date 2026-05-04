import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  Search 
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  // State for Desktop (Collapsible)
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  // State for Mobile (Drawer)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-sans text-slate-900 overflow-hidden selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* Sidebar Component */}
      <AdminSidebar 
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        
        {/* Top Header (Glassmorphism style) */}
        <header className="h-18 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                    <Menu size={20} />
                </button>
                
                {/* Contextual Title based on route */}
                <h2 className="text-lg font-semibold text-slate-800 capitalize">
                  {location.pathname.split('/').pop() || 'Dashboard'}
                </h2>
            </div>
            
            <div className="flex items-center gap-4">
                 {/* Search Bar (Fake) */}
                 {/* <div className="hidden md:flex items-center bg-slate-100/80 px-3 py-2 rounded-lg border border-transparent focus-within:border-indigo-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all w-64">
                    <Search size={16} className="text-slate-400 mr-2" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="bg-transparent border-none outline-none text-sm text-slate-600 w-full placeholder:text-slate-400"
                    />
                 </div> */}

                {/* <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button> */}
            </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8F9FC] p-6 scroll-smooth">
            <div className="max-w-[1600px] mx-auto animate-fade-in">
                <Outlet />
            </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;