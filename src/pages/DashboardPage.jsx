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
  ShieldCheck,
  Percent,
} from "lucide-react";
import { motion } from "framer-motion";

const DashboardPage = () => {
  const { materials } = useMaterials();
  const { plans, rejectedTotal } = useProduction();
  const { products } = useFinishedGoods();

  const activePlansCount = plans.filter((p) => p.status !== "Completed").length;
  const finishedGoodsCount = products.reduce((acc, p) => acc + p.stock, 0);

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
      value: activePlansCount,
      icon: ClipboardList,
      color: "amber",
      trend: "-2%",
    },
    {
      label: "Stok Barang Jadi",
      value: finishedGoodsCount,
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

  // 1. Material usage chart data calculation
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

  // 2. Asset allocation pie data calculation
  const pieData = [
    { name: "Bahan Baku", value: materials.length },
    { name: "Rencana Aktif", value: activePlansCount },
    { name: "Barang Jadi", value: finishedGoodsCount },
  ];
  const ASSET_COLORS = ["#6366f1", "#f59e0b", "#10b981"]; // Indigo, Amber, Emerald

  // 3. QC quality yield doughnut data calculation
  const totalOK = plans
    .filter((p) => p.status === "Completed" && p.qc_results)
    .reduce((acc, p) => acc + (p.qc_results.ok_quantity || 0), 0);
  
  const totalNG = rejectedTotal;
  const totalProduced = totalOK + totalNG;
  const yieldRate = totalProduced > 0 ? ((totalOK / totalProduced) * 100).toFixed(1) : "0.0";

  const qcPieData = [
    { name: "Produk OK (Lolos)", value: totalOK },
    { name: "Produk NG (Reject)", value: totalNG },
  ];
  const QC_COLORS = ["#10b981", "#f43f5e"]; // Emerald (OK), Rose (NG/Reject)

  return (
    <div className="space-y-10">
      {/* Executive Header */}
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Dashboard Eksekutif
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Pantauan langsung performa manufaktur secara real-time.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            key={i}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/60 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all duration-500`}
              >
                <stat.icon size={22} />
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

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Material Usage Chart (Spans 8 columns) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col justify-between min-h-[480px]"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Analisis Konsumsi Material
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-0.5">Alokasi bahan baku dalam proses produksi aktif</p>
            </div>
            <select className="bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-2.5 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500/20">
              <option>Total Penggunaan</option>
              <option>Berdasarkan Prioritas</option>
            </select>
          </div>
          
          <div className="h-80 w-full flex-1">
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
                  dy={10}
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

        {/* Right: Stacked Asset Allocation & QC Status (Spans 4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-8 min-h-[480px]">
          
          {/* Card 1: Asset Allocation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex-1 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">Alokasi Aset</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Rasio Penyebaran Item</p>
              </div>
              <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">Assets</span>
            </div>
            
            <div className="h-28 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ASSET_COLORS[index % ASSET_COLORS.length]}
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

            <div className="grid grid-cols-3 gap-2 mt-2">
              {pieData.map((entry, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter block truncate">{entry.name}</span>
                  <span className="text-xs font-black text-slate-900 mt-0.5 block">{entry.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 2: QC Yield Doughnut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex-1 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">Kualitas QC (Yield Rate)</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Rasio Lolos vs Reject</p>
              </div>
              <span className="text-[10px] font-black text-emerald-650 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg flex items-center">
                <ShieldCheck size={10} className="mr-1" /> Quality
              </span>
            </div>

            {totalProduced > 0 ? (
              <div className="h-28 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qcPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={6}
                      dataKey="value"
                    >
                      {qcPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={QC_COLORS[index % QC_COLORS.length]}
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
                
                {/* Yield percentage absolute display in center of doughnut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                  <span className="text-[10px] font-bold text-slate-450 uppercase leading-none tracking-tight">Yield</span>
                  <span className="text-sm font-black text-emerald-600 leading-none mt-0.5">{yieldRate}%</span>
                </div>
              </div>
            ) : (
              <div className="h-28 w-full flex flex-col items-center justify-center text-slate-400">
                <Percent size={20} className="text-slate-300 mb-1" />
                <span className="text-[10px] font-bold">Menunggu Data QC...</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-center">
                <span className="text-[9px] text-emerald-600 font-black uppercase tracking-tighter block">Lolos (OK)</span>
                <span className="text-xs font-black text-slate-900 mt-0.5 block">{totalOK} <span className="text-[9px] text-slate-400">Pcs</span></span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-center">
                <span className="text-[9px] text-rose-500 font-black uppercase tracking-tighter block">Cacat (NG)</span>
                <span className="text-xs font-black text-slate-900 mt-0.5 block">{totalNG} <span className="text-[9px] text-slate-400">Pcs</span></span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
