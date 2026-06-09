import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, User } from 'lucide-react';

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10 -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl -z-10 -ml-20 -mb-20" />

        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center px-8 justify-between z-10">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search metrics, products..." 
                className="bg-slate-100/50 border-none rounded-2xl py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 leading-none">Admin Takura</p>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter mt-1">Full Access</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white ring-4 ring-slate-100 group-hover:ring-indigo-50 transition-all">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="p-8 max-w-7xl mx-auto w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
