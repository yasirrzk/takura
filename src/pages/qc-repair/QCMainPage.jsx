import { useState } from 'react';
import { useQC } from '../../hooks/useQC';
import { useDelivery } from '../../hooks/useDelivery';
import { useRepair } from '../../hooks/useRepair';
import {
  ShieldCheck, Search, AlertTriangle, CheckCircle2,
  PackageCheck, X, ClipboardList, RefreshCw, History,
  Truck, Send, ArrowRight, Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const QCMainPage = () => {
  const [activeTab, setActiveTab] = useState('input');
  const { deliveries, isLoading: deliveryLoading } = useDelivery();
  const { qcLogs, isLoading: qcLoading, submitInspection, isSubmitting } = useQC();
  const { repairs, isLoading: repairsLoading } = useRepair();

  const [activeDelivery, setActiveDelivery] = useState(null);
  const [qcData, setQcData] = useState({ ok_quantity: '', ng_quantity: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Only show Delivered deliveries that haven't been QC'd yet
  const qcDoneIds = new Set(qcLogs.map(l => l.delivery_id));
  const pendingDeliveries = (deliveries || [])
    .filter(d => d.status === 'Delivered' && !qcDoneIds.has(d.id))
    .filter(d =>
      d.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(d.id).includes(searchQuery)
    );

  const okTotal = qcLogs.reduce((s, l) => s + (l.ok_quantity || 0), 0);
  const ngTotal = qcLogs.reduce((s, l) => s + (l.ng_quantity || 0), 0);
  const reworkLogs = qcLogs.filter(l => l.ng_quantity > 0);

  // ==========================================
  // TRACKING REWORK: Cross-reference data
  // ==========================================
  const buildReworkTracking = () => {
    return reworkLogs.map(log => {
      // Find the Repair entry triggered by this QC NG
      const repairEntry = (repairs || []).find(
        r => r.delivery_id === log.delivery_id
      );

      // Find any REPAIR delivery that was sent after rework
      const repairDelivery = (deliveries || []).find(
        d => d.type === 'REPAIR' && d.product_name === log.product_name
      );

      // Determine step statuses
      const step1 = 'done'; // QC NG always done if we're here
      const step2 = repairEntry
        ? repairEntry.status === 'Selesai Diperbaiki' ? 'done' : 'active'
        : 'waiting';
      const step3 = repairDelivery
        ? repairDelivery.status === 'Delivered' ? 'done' : 'active'
        : 'waiting';
      const step4 = step3 === 'done' ? 'done' : 'waiting';

      return {
        ...log,
        repairEntry,
        repairDelivery,
        steps: [
          { label: 'QC NG Terdeteksi', status: step1, icon: AlertTriangle, detail: `${log.ng_quantity} pcs NG` },
          { label: 'Proses Perbaikan', status: step2, icon: RefreshCw, detail: repairEntry ? `RPR-${repairEntry.id.toString().padStart(4, '0')} — ${repairEntry.status}` : 'Menunggu' },
          { label: 'Kirim SJ Repair', status: step3, icon: Send, detail: repairDelivery ? `SJ-${repairDelivery.id.toString().padStart(4, '0')} — ${repairDelivery.status}` : 'Belum dikirim' },
          { label: 'Selesai', status: step4, icon: CheckCircle2, detail: step4 === 'done' ? 'Terkirim ke customer' : 'Menunggu' },
        ],
      };
    });
  };

  const reworkTrackingData = buildReworkTracking();

  const handleQCSubmit = async (e) => {
    e.preventDefault();
    const ok = parseInt(qcData.ok_quantity) || 0;
    const ng = parseInt(qcData.ng_quantity) || 0;

    if (ok + ng === 0) {
      toast.error('Jumlah Tidak Valid', { description: 'Total OK dan NG tidak boleh 0.' });
      return;
    }
    if (ok + ng > activeDelivery.quantity) {
      toast.error('Melebihi Jumlah Kirim', {
        description: `Total QC (${ok + ng}) melebihi jumlah pengiriman (${activeDelivery.quantity} pcs).`
      });
      return;
    }

    try {
      await submitInspection({
        deliveryId: activeDelivery.id,
        okQuantity: ok,
        ngQuantity: ng,
      });

      if (ng > 0) {
        toast.success('QC Selesai — Perbaikan Dibuat Otomatis', {
          description: `${ok} pcs OK ✓ — ${ng} pcs NG → Masuk Repair Workshop. Pantau di tab "Tracking Rework".`,
          duration: 6000,
        });
      } else {
        toast.success('QC Selesai — Semua Produk Lolos!', {
          description: `${ok} pcs dinyatakan OK dan sukses terdistribusi.`,
        });
      }

      setActiveDelivery(null);
      setQcData({ ok_quantity: '', ng_quantity: '' });
    } catch {
      toast.error('Gagal menyimpan hasil QC');
    }
  };

  const isLoading = deliveryLoading || qcLoading || repairsLoading;

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="size-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse">Menyiapkan modul QC...</p>
    </div>
  );

  // ==========================================
  // STEP INDICATOR COMPONENT
  // ==========================================
  const StepIndicator = ({ steps }) => (
    <div className="flex items-center w-full">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const colorMap = {
          done: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200', line: 'bg-emerald-300' },
          active: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200', line: 'bg-slate-200' },
          waiting: { bg: 'bg-slate-100', text: 'text-slate-400', border: 'border-slate-200', line: 'bg-slate-200' },
        };
        const c = colorMap[step.status];

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative group">
              <div className={`size-10 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center transition-all ${step.status === 'active' ? 'ring-2 ring-indigo-300 ring-offset-2' : ''}`}>
                <Icon size={16} className={c.text} />
              </div>
              <p className={`text-[10px] font-bold mt-2 text-center leading-tight max-w-[80px] ${step.status === 'waiting' ? 'text-slate-400' : 'text-slate-700'}`}>
                {step.label}
              </p>
              <p className={`text-[9px] mt-0.5 font-medium text-center max-w-[90px] ${step.status === 'waiting' ? 'text-slate-300' : 'text-slate-500'}`}>
                {step.detail}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 flex items-center px-1 -mt-8">
                <div className={`h-0.5 w-full rounded-full ${step.status === 'done' ? c.line : 'bg-slate-200'}`} />
                <ArrowRight size={12} className={`-ml-1 flex-shrink-0 ${step.status === 'done' ? 'text-emerald-400' : 'text-slate-300'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tahap 5 — Post-Delivery</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Quality Control</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Inspeksi kualitas <span className="font-black text-slate-700">setelah barang diterima customer</span>. Produk NG otomatis masuk Repair Workshop.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">OK</p>
            <p className="text-2xl font-black text-emerald-600">{okTotal}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">NG</p>
            <p className="text-2xl font-black text-red-500">{ngTotal}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Rework</p>
            <p className="text-2xl font-black text-orange-500">{reworkLogs.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('input')}
          className={`flex items-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'input' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <ShieldCheck size={16} className="mr-2" />
          Input QC
          {pendingDeliveries.length > 0 && (
            <span className="ml-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {pendingDeliveries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <History size={16} className="mr-2" />
          Riwayat QC
        </button>
        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex items-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'tracking' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <RefreshCw size={16} className="mr-2" />
          Tracking Rework
          {reworkLogs.length > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {reworkLogs.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* =============================== */}
        {/* TAB 1: INPUT QC                 */}
        {/* =============================== */}
        {activeTab === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Delivery List */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <PackageCheck className="mr-3 text-indigo-500" size={22} />
                  Pengiriman Menunggu Inspeksi
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                  <input
                    type="text"
                    placeholder="Cari produk / ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all w-52 outline-none border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {pendingDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    onClick={() => {
                      setActiveDelivery(delivery);
                      setQcData({ ok_quantity: delivery.quantity, ng_quantity: 0 });
                    }}
                    className={`group flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all ${activeDelivery?.id === delivery.id
                      ? 'border-indigo-300 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`size-11 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${activeDelivery?.id === delivery.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                        SJ
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{delivery.product_name}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          SJ-{String(delivery.id).padStart(4, '0')} &bull; Qty: <span className="font-bold text-slate-700">{delivery.quantity} pcs</span> &bull; {delivery.destination}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-black border border-emerald-100 shrink-0">
                      Delivered
                    </span>
                  </div>
                ))}

                {pendingDeliveries.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    <ShieldCheck size={36} className="mx-auto mb-3 text-slate-200" />
                    <p className="font-semibold text-sm">Tidak ada pengiriman yang menunggu QC.</p>
                    <p className="text-xs mt-1">Tandai pengiriman sebagai &quot;Delivered&quot; di halaman Pengiriman terlebih dahulu.</p>
                  </div>
                )}
              </div>
            </div>

            {/* QC Form Panel */}
            <div>
              <AnimatePresence mode="wait">
                {activeDelivery ? (
                  <motion.div
                    key={activeDelivery.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-indigo-100 sticky top-8"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-slate-800">Input Hasil Inspeksi</h2>
                      <button onClick={() => setActiveDelivery(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-all">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-1">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Surat Jalan</p>
                      <p className="font-black text-slate-800 text-base">{activeDelivery.product_name}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        SJ-{String(activeDelivery.id).padStart(4, '0')} &bull; Total Kirim: <span className="font-bold text-indigo-600">{activeDelivery.quantity} pcs</span>
                      </p>
                    </div>

                    <form onSubmit={handleQCSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-black text-slate-700 mb-2 flex items-center">
                          <CheckCircle2 size={15} className="text-emerald-500 mr-2" />
                          Produk OK — Lolos Inspeksi
                        </label>
                        <input
                          type="number" min="0" required
                          value={qcData.ok_quantity}
                          onChange={(e) => setQcData({ ...qcData, ok_quantity: e.target.value })}
                          className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-lg"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black text-slate-700 mb-2 flex items-center">
                          <AlertTriangle size={15} className="text-red-500 mr-2" />
                          Produk NG — Cacat / Gagal
                        </label>
                        <input
                          type="number" min="0" required
                          value={qcData.ng_quantity}
                          onChange={(e) => setQcData({ ...qcData, ng_quantity: e.target.value })}
                          className="w-full bg-red-50/50 border border-red-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none text-lg"
                          placeholder="0"
                        />
                      </div>

                      {parseInt(qcData.ng_quantity) > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start space-x-3"
                        >
                          <RefreshCw size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                          <div className="text-xs leading-relaxed">
                            <p className="font-black text-orange-800">Antrean Perbaikan Otomatis!</p>
                            <p className="text-orange-700 mt-0.5">
                              <strong>{qcData.ng_quantity} pcs</strong> NG akan masuk <strong>Repair Workshop</strong>. Pantau progresnya di tab <strong>Tracking Rework</strong>.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Menyimpan...</>
                        ) : (
                          <><ShieldCheck size={16} className="mr-2" /> Simpan Hasil QC</>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/60 border border-dashed border-slate-200 rounded-[2rem] min-h-[400px] flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <ShieldCheck size={32} className="text-slate-300" />
                    </div>
                    <h3 className="font-bold text-slate-600 mb-2">Pilih Pengiriman</h3>
                    <p className="text-sm text-slate-400 font-medium max-w-[200px]">Klik salah satu pengiriman di sebelah kiri untuk memulai inspeksi QC.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* =============================== */}
        {/* TAB 2: RIWAYAT QC               */}
        {/* =============================== */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <ClipboardList className="mr-3 text-slate-500" size={22} />
                Riwayat Hasil Inspeksi QC
              </h2>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No. SJ</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">OK</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">NG</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {qcLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 text-xs font-medium text-slate-500">{log.date}</td>
                    <td className="px-8 py-4 text-xs font-black text-slate-500">SJ-{String(log.delivery_id).padStart(4, '0')}</td>
                    <td className="px-8 py-4 font-bold text-slate-800">{log.product_name}</td>
                    <td className="px-8 py-4 text-center">
                      <span className="inline-flex items-center space-x-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-xl text-xs font-black">
                        <CheckCircle2 size={12} />
                        <span>{log.ok_quantity} pcs</span>
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      {log.ng_quantity > 0 ? (
                        <span className="inline-flex items-center space-x-1 bg-red-50 border border-red-100 text-red-600 px-3 py-1 rounded-xl text-xs font-black">
                          <AlertTriangle size={12} />
                          <span>{log.ng_quantity} pcs</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-8 py-4">
                      {log.ng_quantity > 0 ? (
                        <button
                          onClick={() => setActiveTab('tracking')}
                          className="inline-flex items-center text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-xl text-xs font-black hover:bg-orange-100 transition-all cursor-pointer"
                        >
                          <RefreshCw size={11} className="mr-1.5" />
                          Lihat Tracking →
                        </button>
                      ) : (
                        <span className="inline-flex items-center text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl text-xs font-black">
                          <CheckCircle2 size={11} className="mr-1.5" />
                          Semua OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {qcLogs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <ClipboardList size={32} className="text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-semibold">Belum ada riwayat inspeksi QC.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* =============================== */}
        {/* TAB 3: TRACKING REWORK           */}
        {/* =============================== */}
        {activeTab === 'tracking' && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Tracking Info */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl px-6 py-4 flex items-center space-x-4">
              <div className="size-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <RefreshCw size={18} className="text-orange-600" />
              </div>
              <div>
                <p className="font-black text-orange-800 text-sm">Tracking Produk Rework</p>
                <p className="text-xs text-orange-600 font-medium mt-0.5">
                  Pantau perjalanan barang NG dari QC → Produksi Ulang → Pengiriman Repair → Selesai. Semua dalam satu halaman.
                </p>
              </div>
            </div>

            {reworkTrackingData.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 py-20 text-center">
                <RefreshCw size={36} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-semibold">Belum ada barang NG yang di-tracking.</p>
                <p className="text-xs text-slate-400 mt-1">Input hasil QC dengan produk NG untuk memulai tracking rework.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {reworkTrackingData.map((item, idx) => {
                  const allDone = item.steps.every(s => s.status === 'done');
                  const activeStepIdx = item.steps.findIndex(s => s.status === 'active');

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      key={item.id}
                      className={`bg-white rounded-[2rem] border overflow-hidden transition-all ${allDone ? 'border-emerald-200' : 'border-slate-200/60 shadow-sm'}`}
                    >
                      {/* Card Header */}
                      <div className={`px-8 py-5 flex items-center justify-between ${allDone ? 'bg-emerald-50/50' : 'bg-slate-50/60'} border-b border-slate-100`}>
                        <div className="flex items-center space-x-4">
                          <div className={`size-11 rounded-xl flex items-center justify-center font-black text-sm ${allDone ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                            {allDone ? <CheckCircle2 size={18} /> : <RefreshCw size={18} />}
                          </div>
                          <div>
                            <h3 className="font-black text-slate-800">{item.product_name}</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              SJ Asal: SJ-{String(item.delivery_id).padStart(4, '0')} &bull; {item.ng_quantity} pcs NG &bull; QC Tanggal: {item.date}
                            </p>
                          </div>
                        </div>
                        {allDone ? (
                          <span className="text-xs font-black text-emerald-600 bg-emerald-100 border border-emerald-200 px-4 py-1.5 rounded-xl">
                            ✓ Selesai
                          </span>
                        ) : (
                          <span className="text-xs font-black text-orange-600 bg-orange-100 border border-orange-200 px-4 py-1.5 rounded-xl">
                            Step {(activeStepIdx !== -1 ? activeStepIdx : 0) + 1} / 4
                          </span>
                        )}
                      </div>

                      {/* Step Progress */}
                      <div className="px-8 py-8">
                        <StepIndicator steps={item.steps} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QCMainPage;
