import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Activity, 
  CheckCircle, 
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useUiStore from '../store/useUiStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const { isSidebarOpen, closeSidebar } = useUiStore();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Material Baku', path: '/raw-material', icon: Package },
    { name: 'PPIC Planning', path: '/ppic', icon: ClipboardList },
    { name: 'Produksi & QC', path: '/production-qc', icon: Activity },
    { name: 'Barang Jadi', path: '/finished-goods', icon: CheckCircle },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-25 lg:hidden"
        />
      )}

      <div className={cn(
        "fixed lg:static top-0 left-0 w-72 bg-slate-950 text-slate-300 h-screen flex flex-col border-r border-slate-800/50 shadow-2xl z-30 transition-transform duration-300 ease-out lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3">
              <span className="text-white font-black text-xl">T</span>
            </div>
            <div>
              <h1 className="text-white font-black tracking-tight text-xl leading-none">TAKURA</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Manufacturing</p>
            </div>
          </div>
          
          {/* Close Sidebar Button (Mobile only) */}
          <button 
            onClick={closeSidebar}
            className="lg:hidden text-slate-400 hover:text-white p-2 rounded-xl border border-slate-800 hover:bg-slate-900 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={cn(
                  "group relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-out overflow-hidden",
                  isActive 
                    ? "bg-indigo-600/10 text-white shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]" 
                    : "hover:bg-slate-900/50 hover:text-slate-100"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                  />
                )}
                <item.icon className={cn(
                  "mr-3 size-5 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="font-medium text-sm tracking-wide">{item.name}</span>
                {isActive && <ChevronRight className="ml-auto size-4 text-indigo-400/50" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-900">
          <div className="bg-slate-900/50 rounded-2xl p-4 mb-4 border border-slate-800/50">
            <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-tighter">Current Role</p>
            <div className="flex items-center space-x-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-200">System Admin</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300 group cursor-pointer"
          >
            <LogOut size={18} className="mr-3 transition-transform group-hover:-translate-x-1" />
            <span className="font-bold text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
