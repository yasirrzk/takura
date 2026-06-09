import { useMaterials } from "../hooks/useMaterials";
import { useProduction } from "../hooks/useProduction";
import { useFinishedGoods } from "../hooks/useFinishedGoods";
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
  Cell,
} from "recharts";
import {
  Package,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion } from "framer-motion";

const DashboardPage = () => {
  const { materials } = useMaterials();
  const { plans, rejectedTotal } = useProduction();
  const { products } = useFinishedGoods();

  const stats = [
    {
      label: "Total Material",
      value: materials.length,
      icon: Package,
      color: "indigo",
      trend: "+12%",
    },
    {
      label: "Rencana Aktif",
      value: plans.filter((p) => p.status !== "Completed").length,
      icon: ClipboardList,
      color: "amber",
      trend: "-2%",
    },
    {
      label: "Stok Barang Jadi",
      value: products.reduce((acc, p) => acc + p.stock, 0),
      icon: CheckCircle,
      color: "emerald",
      trend: "+18%",
    },
    {
      label: "Produksi Reject",
      value: rejectedTotal,
      icon: AlertCircle,
      color: "rose",
      trend: "+0.5%",
    },
  ];

  const materialUsageData = materials
    .map((m) => {
      const usage = plans
        .filter((p) => p.material_id === m.id)
        .reduce((acc, p) => acc + p.material_requirement, 0);
      return {
        name: m.name,
        usage: usage,
      };
    })
    .filter((m) => m.usage > 0);

  const pieData = [
    { name: "Bahan Baku", value: materials.length },
    {
      name: "Rencana Aktif",
      value: plans.filter((p) => p.status !== "Completed").length,
    },
    {
      name: "Barang Jadi",
      value: products.reduce((acc, p) => acc + p.stock, 0),
    },
  ];

  // Mengubah susunan warna: Indigo (Bahan Baku), Amber (Rencana Aktif), Emerald (Barang Jadi)
  const COLORS = ["#6366f1", "#f59e0b", "#10b981"];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Dashboard Eksekutif
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Pantauan langsung performa manufaktur secara real-time.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/60 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all duration-500`}
              >
                <stat.icon size={24} />
              </div>
              <div
                className={`flex items-center space-x-1 text-xs font-black ${stat.trend.startsWith("+") ? "text-emerald-500" : "text-rose-500"}`}
              >
                {stat.trend.startsWith("+") ? (
                  <ArrowUp size={12} />
                ) : (
                  <ArrowDown size={12} />
                )}
                <span>{stat.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Production Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-900">
              Analisis Konsumsi Material
            </h2>
            <select className="bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-2 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500/20">
              <option>Total Penggunaan</option>
              <option>Berdasarkan Prioritas</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materialUsageData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                    padding: "12px",
                  }}
                />
                <Bar
                  dataKey="usage"
                  fill="#6366f1"
                  radius={[10, 10, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Inventory Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col"
        >
          <h2 className="text-xl font-black text-slate-900 mb-8">
            Alokasi Aset
          </h2>
          <div className="h-64 w-full flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {pieData.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: COLORS[i] }}
                  ></div>
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-tighter">
                    {entry.name}
                  </span>
                </div>
                <span className="text-sm font-black text-slate-900">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
