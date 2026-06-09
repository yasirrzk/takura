import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Activity, 
  CheckCircle, 
  LogOut 
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Sidebar = () => {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Gudang Bahan Baku', path: '/raw-material', icon: <Package size={20} /> },
    { name: 'PPIC Planning', path: '/ppic', icon: <ClipboardList size={20} /> },
    { name: 'Produksi & QC', path: '/production-qc', icon: <Activity size={20} /> },
    { name: 'Gudang Barang Jadi', path: '/finished-goods', icon: <CheckCircle size={20} /> },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-gray-800">
        Takura Admin
      </div>
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 transition-colors ${
              location.pathname === item.path 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-6 border-t border-gray-800">
        <button 
          onClick={logout}
          className="w-full flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
