import { useMaterials } from '../hooks/useMaterials';
import { useProduction } from '../hooks/useProduction';
import { useFinishedGoods } from '../hooks/useFinishedGoods';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Package, ClipboardList, CheckCircle, AlertCircle } from 'lucide-react';

const DashboardPage = () => {
  const { materials } = useMaterials();
  const { plans } = useProduction();
  const { products } = useFinishedGoods();

  const stats = [
    { label: 'Total Material', value: materials.length, icon: <Package size={24} />, color: 'bg-blue-500' },
    { label: 'Rencana Aktif', value: plans.filter(p => p.status !== 'Completed').length, icon: <ClipboardList size={24} />, color: 'bg-amber-500' },
    { label: 'Stok Barang Jadi', value: products.reduce((acc, p) => acc + p.stock, 0), icon: <CheckCircle size={24} />, color: 'bg-green-500' },
    { label: 'Produksi NG', value: '12', icon: <AlertCircle size={24} />, color: 'bg-red-500' },
  ];

  const chartData = plans.slice(-5).map(p => ({
    name: p.product_name,
    target: p.target_quantity,
  }));

  const pieData = [
    { name: 'Raw Material', value: materials.length },
    { name: 'Finished Goods', value: products.length },
  ];

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Monitoring</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <div className={`${stat.color} p-3 rounded-xl text-white mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Target Produksi Terakhir</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="target" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Komposisi Inventori</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {pieData.map((entry, i) => (
              <div key={i} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[i]}}></div>
                <span className="text-xs text-gray-600 font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
