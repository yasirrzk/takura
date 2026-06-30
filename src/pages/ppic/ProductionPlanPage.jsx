import { useState, useEffect, useRef } from 'react';
import { useProduction } from '../../hooks/useProduction';
import { useMaterials } from '../../hooks/useMaterials';
import {
  Plus, Clock, Play, CheckCircle2, ClipboardList, Search,
  Brain, TrendingUp, TrendingDown, ShoppingBag, Calendar,
  CalendarClock, Bell, Mail, AlertTriangle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ==========================================
// SIMULASI EMAIL NOTIFICATION SERVICE
// (Swap ke EmailJS ketika backend siap)
// ==========================================
const sendProductionDoneNotification = (plan) => {
  console.log('[EMAIL SIM] Produksi selesai sesuai jadwal:', plan.product_name);
  
  toast(
    <div className="flex flex-col space-y-2 py-1">
      <div className="flex items-center space-x-2">
        <Mail size={16} className="text-emerald-500 flex-shrink-0" />
        <span className="font-black text-slate-800 text-sm">✉️ Email Notifikasi Terkirim</span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">
        <strong>Ke:</strong> admin@pttakura.com<br />
        <strong>Subjek:</strong> [PPIC] Produksi &quot;{plan.product_name}&quot; Selesai Sesuai Jadwal ✓<br />
        <span className="text-emerald-600 font-semibold">Produksi {plan.target_quantity} Pcs telah selesai sesuai jadwal ({plan.start_date} s/d {plan.end_date}). Silakan input hasil produksi aktual.</span>
      </p>
    </div>,
    {
      duration: 8000,
      style: {
        border: '1px solid #d1fae5',
        background: '#f0fdf4',
        borderRadius: '16px',
        maxWidth: '440px',
      },
    }
  );
};

const ProductionPlanPage = () => {
  const { plans, isLoading: plansLoading, createPlan, updateStatus } = useProduction();
  const { materials, isLoading: materialsLoading } = useMaterials();

  const [activeTab, setActiveTab] = useState('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [detailPlan, setDetailPlan] = useState(null); // untuk popup detail

  const [formData, setFormData] = useState({
    product_name: '',
    target_quantity: 0,
    material_id: '',
    material_requirement: 0,
    start_date: '',
    end_date: '',
  });

  // AI Forecasting
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  useEffect(() => {
    if (materials.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(materials[0].id.toString());
    }
  }, [materials, selectedMaterialId]);

  // ==========================================
  // CEK JADWAL SELESAI & AUTO UPDATE STATUS
  // Dijalankan setiap kali halaman PPIC dibuka
  // ==========================================
  const notifiedPlanIds = useRef(new Set(JSON.parse(sessionStorage.getItem('takura_notified_plans') || '[]')));

  useEffect(() => {
    if (plans.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    plans.forEach(async (plan) => {
      if (plan.status !== 'In Progress') return;
      if (!plan.end_date) return;
      if (notifiedPlanIds.current.has(plan.id)) return;

      const endDate = new Date(plan.end_date);
      endDate.setHours(0, 0, 0, 0);

      const isDone = endDate <= today;

      if (isDone) {
        notifiedPlanIds.current.add(plan.id);
        sessionStorage.setItem('takura_notified_plans', JSON.stringify([...notifiedPlanIds.current]));

        // 1. Auto-update status ke "Selesai Dijadwalkan"
        await updateStatus({ id: plan.id, status: 'Selesai Dijadwalkan' });

        // 2. Kirim simulasi notifikasi email
        sendProductionDoneNotification(plan);
      }
    });
  }, [plans, updateStatus]);

  const filteredPlans = plans.filter(p =>
    p.product_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.start_date || !formData.end_date) {
      toast.error('Tanggal Wajib Diisi', { description: 'Harap isi Tanggal Mulai dan Estimasi Selesai.' });
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error('Tanggal Tidak Valid', { description: 'Estimasi Selesai harus setelah Tanggal Mulai.' });
      return;
    }

    const selectedMaterial = materials.find(m => m.id === parseInt(formData.material_id));
    if (selectedMaterial && selectedMaterial.stock < formData.material_requirement) {
      toast.error('Stok Bahan Baku Kurang', {
        description: `Stok ${selectedMaterial.name} tidak mencukupi! (Tersedia: ${selectedMaterial.stock} ${selectedMaterial.unit})`
      });
      return;
    }

    const promise = createPlan({ ...formData, status: 'Scheduled' });

    toast.promise(promise, {
      loading: 'Menjadwalkan rencana produksi baru...',
      success: () => {
        setFormData({ product_name: '', target_quantity: 0, material_id: '', material_requirement: 0, start_date: '', end_date: '' });
        setIsFormOpen(false);
        return 'Rencana produksi berhasil dijadwalkan';
      },
      error: 'Gagal menjadwalkan rencana',
    });
  };

  const handleStartProduction = async (id, productName) => {
    const promise = updateStatus({ id, status: 'In Progress' });
    toast.promise(promise, {
      loading: `Memulai produksi ${productName}...`,
      success: `Produksi ${productName} resmi dimulai. Sistem akan memantau deadline.`,
      error: 'Gagal memulai produksi',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return (
          <span className="flex items-center w-fit text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
            <Clock size={12} className="mr-1.5" /> Scheduled
          </span>
        );
      case 'In Progress':
        return (
          <span className="flex items-center w-fit text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider animate-pulse">
            <Play size={12} className="mr-1.5" /> In Progress
          </span>
        );
      case 'Selesai Dijadwalkan':
        return (
          <span className="flex items-center w-fit text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
            <CalendarClock size={12} className="mr-1.5" /> Selesai Dijadwalkan
          </span>
        );
      case 'Completed':
        return (
          <span className="flex items-center w-fit text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
            <CheckCircle2 size={12} className="mr-1.5" /> Completed
          </span>
        );
      default: return null;
    }
  };

  const getLeadTimeDays = (start, end) => {
    if (!start || !end) return null;
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getRemainingDays = (endDate) => {
    if (!endDate) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const end = new Date(endDate); end.setHours(0, 0, 0, 0);
    return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  };

  // ==========================================
  // AI FORECASTING LOGIC (LINEAR REGRESSION)
  // ==========================================
  const generateForecastData = () => {
    if (!selectedMaterialId || materials.length === 0) return null;

    const activeMaterial = materials.find(m => m.id === parseInt(selectedMaterialId));
    if (!activeMaterial) return null;

    const currentActualUsage = plans
      .filter(p => p.status === 'Completed' && p.material_id === activeMaterial.id)
      .reduce((acc, p) => acc + p.material_requirement, 0);

    let baselineVal = 100;
    if (activeMaterial.id === 1) baselineVal = 450;
    else if (activeMaterial.id === 2) baselineVal = 40;
    else if (activeMaterial.id === 3) baselineVal = 900;

    const historicalPoints = [
      { x: 1, label: 'Maret', y: Math.round(baselineVal * 0.82) },
      { x: 2, label: 'April', y: Math.round(baselineVal * 0.90) },
      { x: 3, label: 'Mei', y: Math.round(baselineVal * 0.96) },
      { x: 4, label: 'Juni (Kini)', y: baselineVal + currentActualUsage }
    ];

    const N = historicalPoints.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    historicalPoints.forEach(p => { sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumXX += p.x * p.x; });

    const slopeNumerator = (N * sumXY) - (sumX * sumY);
    const slopeDenominator = (N * sumXX) - (sumX * sumX);
    const slope = slopeDenominator === 0 ? 0 : slopeNumerator / slopeDenominator;
    const intercept = (sumY - slope * sumX) / N;

    const projectValue = (x) => { const val = Math.round(slope * x + intercept); return val < 0 ? 0 : val; };

    const predictedJuli = projectValue(5);
    const predictedAgustus = projectValue(6);
    const predictedSeptember = projectValue(7);
    const total3MonthsProjected = predictedJuli + predictedAgustus + predictedSeptember;

    const chartData = [
      { month: 'Maret', 'Konsumsi Aktual': historicalPoints[0].y, 'Proyeksi AI': null },
      { month: 'April', 'Konsumsi Aktual': historicalPoints[1].y, 'Proyeksi AI': null },
      { month: 'Mei', 'Konsumsi Aktual': historicalPoints[2].y, 'Proyeksi AI': null },
      { month: 'Juni (Kini)', 'Konsumsi Aktual': historicalPoints[3].y, 'Proyeksi AI': historicalPoints[3].y },
      { month: 'Juli', 'Konsumsi Aktual': null, 'Proyeksi AI': predictedJuli },
      { month: 'Agustus', 'Konsumsi Aktual': null, 'Proyeksi AI': predictedAgustus },
      { month: 'September', 'Konsumsi Aktual': null, 'Proyeksi AI': predictedSeptember },
    ];

    return { chartData, material: activeMaterial, slope, predictedJuli, predictedAgustus, predictedSeptember, total3MonthsProjected };
  };

  const forecastResult = generateForecastData();

  if (plansLoading || materialsLoading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="size-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse">Menyiapkan perencanaan produksi...</p>
    </div>
  );

  const donePlans = plans.filter(p => p.status === 'Selesai Dijadwalkan');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Produksi Selesai Sesuai Jadwal Banner */}
      <AnimatePresence>
        {donePlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 flex items-center space-x-4"
          >
            <div className="size-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-black text-emerald-700 text-sm">
                {donePlans.length} Produksi Selesai Sesuai Jadwal!
              </p>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">
                {donePlans.map(p => p.product_name).join(', ')} — Email notifikasi sudah dikirim. Silakan input hasil produksi aktual di halaman <strong>Hasil Produksi</strong>.
              </p>
            </div>
            <span className="text-xs font-black text-emerald-500 bg-emerald-100 px-3 py-1 rounded-full">
              Email Terkirim ✓
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <ClipboardList size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tahap 1 — PPIC Department</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Perencanaan Produksi</h1>
          <p className="text-slate-500 mt-1 font-medium">Jadwalkan rencana produksi dengan tanggal mulai & estimasi selesai. Sistem memantau deadline otomatis.</p>
        </div>

        {activeTab === 'list' && (
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Cari rencana produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm w-64 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl flex items-center font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <Plus size={18} className="mr-2" />
              Buat Rencana
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-3 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${activeTab === 'list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Daftar Perencanaan
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center ${activeTab === 'ai' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Brain size={16} className="mr-2 text-indigo-500" />
          AI Demand Forecasting
        </button>
      </div>

      {/* TAB 1: LIST PERENCANAAN */}
      {activeTab === 'list' && (
        <div className="space-y-8">
          {/* Create Plan Form */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Buat Rencana Produksi Baru</h2>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Produk Jadi</label>
                      <input
                        type="text" required
                        placeholder="e.g. Ember Plastik 5L"
                        value={formData.product_name}
                        onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Target Produksi (Pcs)</label>
                      <input
                        type="number" required min="1"
                        placeholder="e.g. 100"
                        value={formData.target_quantity || ''}
                        onChange={(e) => setFormData({ ...formData, target_quantity: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Bahan Baku Utama</label>
                      <select
                        required
                        value={formData.material_id}
                        onChange={(e) => setFormData({ ...formData, material_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none appearance-none font-medium"
                      >
                        <option value="">-- Pilih Material --</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name} (Stok: {m.stock} {m.unit})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kebutuhan Bahan</label>
                      <input
                        type="number" required min="1"
                        placeholder="e.g. 50"
                        value={formData.material_requirement || ''}
                        onChange={(e) => setFormData({ ...formData, material_requirement: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Date Section */}
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <CalendarClock size={18} className="text-indigo-600" />
                      <h3 className="font-black text-slate-800 text-sm">Jadwal Produksi & Lead Time</h3>
                      <span className="text-xs font-bold text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">Wajib Diisi</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-indigo-700 uppercase tracking-widest ml-1 flex items-center">
                          <Calendar size={12} className="mr-1" /> Tanggal Mulai Produksi
                        </label>
                        <input
                          type="date" required
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="w-full bg-white border border-indigo-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium text-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-indigo-700 uppercase tracking-widest ml-1 flex items-center">
                          <CheckCircle2 size={12} className="mr-1" /> Estimasi Selesai Produksi
                        </label>
                        <input
                          type="date" required
                          min={formData.start_date || undefined}
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="w-full bg-white border border-indigo-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium text-slate-700"
                        />
                      </div>
                    </div>
                    {formData.start_date && formData.end_date && (
                      <div className="mt-4 flex items-center space-x-2 text-xs font-bold text-indigo-700">
                        <Bell size={14} />
                        <span>
                          Lead Time: {getLeadTimeDays(formData.start_date, formData.end_date)} hari — Sistem akan mengirim notifikasi email pada {new Date(formData.end_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-2 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all"
                    >
                      Jadwalkan Rencana
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk Target</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Target</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jadwal Produksi</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bahan Baku</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPlans.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <ClipboardList className="text-slate-300" size={24} />
                        </div>
                        <p className="text-slate-400 font-medium">Tidak ada rencana produksi aktif.</p>
                        <p className="text-xs text-slate-300 mt-1">Klik "Buat Rencana" untuk memulai perencanaan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPlans.map((plan, idx) => {
                    const requiredMaterial = materials.find(m => m.id === plan.material_id || m.id === parseInt(plan.material_id));
                    const remaining = plan.status === 'In Progress' ? getRemainingDays(plan.end_date) : null;
                    const leadTime = getLeadTimeDays(plan.start_date, plan.end_date);

                    return (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        key={plan.id}
                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => setDetailPlan(plan)}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-4">
                            <div className="size-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {plan.product_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{plan.product_name}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-black mt-0.5 tracking-tighter">PLN-{plan.id.toString().padStart(4, '0')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="text-sm font-black text-slate-900 bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-150">
                            {plan.target_quantity} <span className="text-[10px] font-bold text-slate-400">Pcs</span>
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {plan.start_date && plan.end_date ? (
                            <div>
                              <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                                <Calendar size={12} className="text-slate-400" />
                                <span>{new Date(plan.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                <span className="text-slate-300">→</span>
                                <span className="font-black text-slate-800">{new Date(plan.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                {leadTime && (
                                  <span className="text-[10px] font-bold text-slate-400">Lead Time: {leadTime} hari</span>
                                )}
                                {plan.status === 'In Progress' && remaining !== null && (
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${remaining < 0 ? 'text-red-600 bg-red-50' : remaining <= 3 ? 'text-orange-600 bg-orange-50' : 'text-emerald-600 bg-emerald-50'}`}>
                                    {remaining < 0 ? `${Math.abs(remaining)} hari overdue` : remaining === 0 ? 'Deadline hari ini!' : `Sisa ${remaining} hari`}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 italic">Belum dijadwalkan</span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{requiredMaterial?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              Kebutuhan: <span className="font-bold text-indigo-600">{plan.material_requirement} {requiredMaterial?.unit || 'kg'}</span>
                            </p>
                          </div>
                        </td>
                        <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                          {getStatusBadge(plan.status)}
                        </td>
                        <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-2">
                            {plan.status === 'Scheduled' && (
                              <button
                                onClick={() => handleStartProduction(plan.id, plan.product_name)}
                                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center shadow-sm cursor-pointer"
                              >
                                <Play size={12} className="mr-1.5" /> Mulai Produksi
                              </button>
                            )}
                            {plan.status === 'In Progress' && (
                              <span className="text-xs text-blue-500 font-bold border border-blue-100 bg-blue-50/30 px-3.5 py-2 rounded-xl flex items-center">
                                <span className="size-1.5 bg-blue-600 rounded-full animate-ping mr-2" />
                                Dalam Proses
                              </span>
                            )}
                            {plan.status === 'Selesai Dijadwalkan' && (
                              <span className="text-xs text-teal-600 font-bold border border-teal-200 bg-teal-50/30 px-3.5 py-2 rounded-xl flex items-center">
                                <CalendarClock size={12} className="mr-1.5" />
                                Input Hasil →
                              </span>
                            )}
                            {plan.status === 'Completed' && (
                              <span className="text-xs text-emerald-500 font-bold border border-emerald-100 bg-emerald-50/30 px-3.5 py-2 rounded-xl flex items-center">
                                <CheckCircle2 size={12} className="text-emerald-500 mr-1.5" />
                                Selesai
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AI DEMAND FORECASTING */}
      {activeTab === 'ai' && forecastResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col justify-between min-h-[480px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Prediksi Kebutuhan Material (3 Bulan Kedepan)</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-0.5">Analisis Regresi Linear Berbasis Konsumsi Bulanan</p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Pilih Bahan:</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="bg-slate-50 border-none rounded-xl text-xs font-bold px-3 py-2 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  {materials.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                </select>
              </div>
            </div>
            <div className="h-80 w-full flex-1 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastResult.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} dy={8} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="Konsumsi Aktual" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="Proyeksi AI" stroke="#f43f5e" strokeWidth={3} strokeDasharray="6 6" dot={{ r: 5, fill: '#f43f5e', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Arah Tren Konsumsi</span>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">Analisis Garis Linear</h3>
                {forecastResult.slope >= 0 ? (
                  <span className="flex items-center text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl"><TrendingUp size={14} className="mr-1" /> Naik</span>
                ) : (
                  <span className="flex items-center text-xs font-black text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-xl"><TrendingDown size={14} className="mr-1" /> Turun</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Kemiringan kurva adalah <strong className="text-slate-800">{forecastResult.slope.toFixed(2)}</strong>.{' '}
                {forecastResult.slope >= 0
                  ? `Konsumsi ${forecastResult.material.name} diproyeksikan meningkat.`
                  : `Konsumsi ${forecastResult.material.name} diproyeksikan melandai.`
                }
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Proyeksi AI Bulanan</span>
              <div className="space-y-2">
                {[
                  { label: 'Juli (Prediksi)', value: forecastResult.predictedJuli },
                  { label: 'Agustus (Prediksi)', value: forecastResult.predictedAgustus },
                  { label: 'September (Prediksi)', value: forecastResult.predictedSeptember },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                    <span className="font-semibold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-900">{item.value} {forecastResult.material.unit}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 text-sm font-black text-indigo-600">
                  <span>Total 3 Bulan</span>
                  <span>{forecastResult.total3MonthsProjected} {forecastResult.material.unit}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-300 p-6 rounded-[2rem] shadow-lg shadow-slate-900/10">
              <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                <Brain size={18} className="animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">Rekomendasi AI</span>
              </div>
              <h3 className="text-white font-black text-base mb-3 flex items-center">
                <ShoppingBag size={16} className="mr-2" /> Procurement Advice
              </h3>
              <div className="text-xs leading-relaxed space-y-2">
                <p>Stok saat ini: <strong className="text-white">{forecastResult.material.stock} {forecastResult.material.unit}</strong></p>
                <p>Proyeksi kebutuhan: <strong className="text-white">{forecastResult.total3MonthsProjected} {forecastResult.material.unit}</strong></p>
                <div className="h-px bg-slate-800 my-3" />
                {forecastResult.material.stock >= forecastResult.total3MonthsProjected ? (
                  <p className="text-emerald-400 font-bold">✓ Stok AMAN. Tidak perlu re-order mendesak untuk 3 bulan kedepan.</p>
                ) : (
                  <p className="text-amber-400 font-bold">⚠ Stok KURANG! Rekomendasikan re-order minimum {forecastResult.total3MonthsProjected - forecastResult.material.stock} {forecastResult.material.unit}.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {detailPlan && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Detail Rencana Produksi</span>
                  <h2 className="text-xl font-bold text-slate-900">{detailPlan.product_name}</h2>
                </div>
                <button onClick={() => setDetailPlan(null)} className="text-slate-400 hover:text-slate-600 bg-white size-8 rounded-full border border-slate-200 flex items-center justify-center transition-all">
                  <X size={16} />
                </button>
              </div>
              <div className="p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan ID</p>
                    <p className="font-black text-slate-800 mt-1">PLN-{detailPlan.id.toString().padStart(4, '0')}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target</p>
                    <p className="font-black text-slate-800 mt-1">{detailPlan.target_quantity} Pcs</p>
                  </div>
                  <div className="bg-indigo-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center"><Calendar size={11} className="mr-1" />Mulai</p>
                    <p className="font-black text-slate-800 mt-1">
                      {detailPlan.start_date ? new Date(detailPlan.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center"><CheckCircle2 size={11} className="mr-1" />Estimasi Selesai</p>
                    <p className="font-black text-slate-800 mt-1">
                      {detailPlan.end_date ? new Date(detailPlan.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                    </p>
                  </div>
                </div>

                {detailPlan.start_date && detailPlan.end_date && (
                  <div className="bg-slate-100 rounded-2xl p-4 flex items-center space-x-3">
                    <CalendarClock size={20} className="text-slate-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-500">Lead Time Produksi</p>
                      <p className="font-black text-slate-800">{getLeadTimeDays(detailPlan.start_date, detailPlan.end_date)} hari</p>
                    </div>
                    {detailPlan.status === 'In Progress' && (() => {
                      const rem = getRemainingDays(detailPlan.end_date);
                      return (
                        <div className="ml-auto text-right">
                          <p className="text-xs font-bold text-slate-500">Sisa Waktu</p>
                          <p className={`font-black ${rem < 0 ? 'text-red-600' : rem <= 3 ? 'text-orange-500' : 'text-emerald-600'}`}>
                            {rem < 0 ? `${Math.abs(rem)} hari overdue` : rem === 0 ? 'Deadline hari ini!' : `${rem} hari lagi`}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs font-medium text-amber-700">
                  <Bell size={16} className="flex-shrink-0" />
                  <span>Notifikasi email otomatis akan dikirim ke admin ketika estimasi selesai tercapai.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductionPlanPage;
