import { useState } from 'react';
import { useRepair } from '../../hooks/useRepair';
import { useDelivery } from '../../hooks/useDelivery';
import {
  Wrench, AlertTriangle, CheckCircle2, Clock, Play, X,
  FileText, Package2, ClipboardList, ArrowRight, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const RepairWorkshopPage = () => {
  const { repairs, isLoading, updateRepair, isUpdating } = useRepair();
  const { createDelivery } = useDelivery();
  const [activeRepair, setActiveRepair] = useState(null);
  const [repairForm, setRepairForm] = useState({
    fixed_quantity: 0,
    damage_notes: '',
    repair_notes: '',
  });

  const statusConfig = {
    'Antrean': { color: 'amber', icon: Clock, label: 'Antrean Perbaikan' },
    'Sedang Diperbaiki': { color: 'blue', icon: Wrench, label: 'Sedang Diperbaiki' },
    'Selesai Diperbaiki': { color: 'emerald', icon: CheckCircle2, label: 'Selesai Diperbaiki' },
  };

  const getStatusBadge = (status) => {
    const conf = statusConfig[status];
    if (!conf) return null;
    const Icon = conf.icon;
    const colorClasses = {
      amber: 'text-amber-600 bg-amber-50 border-amber-200',
      blue: 'text-blue-600 bg-blue-50 border-blue-200 animate-pulse',
      emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${colorClasses[conf.color]}`}>
        <Icon size={12} className="mr-1.5" /> {conf.label}
      </span>
    );
  };

  const handleStartRepair = async (repair) => {
    const promise = updateRepair({
      id: repair.id,
      data: { status: 'Sedang Diperbaiki' }
    });
    toast.promise(promise, {
      loading: `Memulai perbaikan ${repair.product_name}...`,
      success: `Perbaikan ${repair.product_name} dimulai. Tim teknis sedang bekerja.`,
      error: 'Gagal memulai perbaikan',
    });
  };

  const handleFinishRepair = async (e) => {
    e.preventDefault();
    const fixedQty = parseInt(repairForm.fixed_quantity) || 0;

    if (fixedQty <= 0) {
      toast.error('Jumlah tidak valid', { description: 'Masukkan jumlah produk yang berhasil diperbaiki.' });
      return;
    }
    if (fixedQty > activeRepair.ng_quantity) {
      toast.error('Melebihi jumlah NG', {
        description: `Jumlah yang diperbaiki (${fixedQty}) tidak boleh melebihi total NG (${activeRepair.ng_quantity}).`
      });
      return;
    }

    const promise = updateRepair({
      id: activeRepair.id,
      data: {
        status: 'Selesai Diperbaiki',
        fixed_quantity: fixedQty,
        damage_notes: repairForm.damage_notes,
        repair_notes: repairForm.repair_notes,
      }
    });

    toast.promise(promise, {
      loading: 'Menyelesaikan perbaikan...',
      success: () => {
        setActiveRepair(null);
        return `${fixedQty} pcs ${activeRepair.product_name} berhasil diperbaiki dan masuk Inventory. Siap dikirim dengan SJ Repair.`;
      },
      error: 'Gagal menyelesaikan perbaikan',
    });
  };

  const handleCreateSJRepair = async (repair) => {
    // We assume product_id is saved. If missing from old localStorage data, fallback to 1.
    const promise = createDelivery({
      productId: repair.product_id || 1, 
      quantity: repair.fixed_quantity,
      destination: 'Customer Repair',
      type: 'REPAIR'
    });

    toast.promise(promise, {
      loading: 'Menerbitkan SJ Repair otomatis...',
      success: `SJ Repair untuk ${repair.fixed_quantity} pcs ${repair.product_name} berhasil diterbitkan!`,
      error: 'Gagal menerbitkan SJ Repair',
    });
  };

  const antreanCount = repairs.filter(r => r.status === 'Antrean').length;
  const inProgressCount = repairs.filter(r => r.status === 'Sedang Diperbaiki').length;
  const doneCount = repairs.filter(r => r.status === 'Selesai Diperbaiki').length;

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="size-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse">Menyiapkan Repair Workshop...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 text-orange-600 mb-1">
            <Wrench size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tahap 5.1 — Sub-Fitur QC</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Repair Workshop</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Kelola perbaikan produk <span className="font-black text-slate-700">cacat/gagal (NG)</span> dari hasil QC. Setelah selesai, produk masuk Inventory untuk pengiriman ulang.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-3">
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Antrean</p>
            <p className="text-2xl font-black text-amber-500">{antreanCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Proses</p>
            <p className="text-2xl font-black text-blue-600">{inProgressCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Selesai</p>
            <p className="text-2xl font-black text-emerald-600">{doneCount}</p>
          </div>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-center space-x-3 overflow-x-auto">
        <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-xs font-black">
          <Clock size={14} /> <span>Antrean</span>
        </div>
        <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />
        <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-xs font-black">
          <Wrench size={14} /> <span>Sedang Diperbaiki</span>
        </div>
        <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />
        <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-black">
          <CheckCircle2 size={14} /> <span>Selesai Diperbaiki</span>
        </div>
        <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />
        <div className="flex items-center space-x-2 text-indigo-600 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-xs font-black">
          <Package2 size={14} /> <span>Kirim SJ Repair</span>
        </div>
      </div>

      {/* Repair List */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <ClipboardList className="mr-3 text-orange-500" size={22} />
            Daftar Perbaikan
          </h2>
          <span className="text-xs font-bold text-slate-400">{repairs.length} total item</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Repair</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asal SJ</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Jumlah NG</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Diperbaiki</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {repairs.map((repair) => (
              <tr key={repair.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <span className="text-xs font-black text-slate-500">RPR-{repair.id.toString().padStart(4, '0')}</span>
                </td>
                <td className="px-8 py-5 font-bold text-slate-800">{repair.product_name}</td>
                <td className="px-8 py-5 text-xs font-medium text-slate-500">
                  SJ-{String(repair.delivery_id).padStart(4, '0')}
                </td>
                <td className="px-8 py-5 text-center">
                  <span className="text-xs font-black text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-xl">
                    {repair.ng_quantity} pcs
                  </span>
                </td>
                <td className="px-8 py-5 text-center">
                  {repair.fixed_quantity > 0 ? (
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl">
                      {repair.fixed_quantity} pcs
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-300">—</span>
                  )}
                </td>
                <td className="px-8 py-5">{getStatusBadge(repair.status)}</td>
                <td className="px-8 py-5 text-right">
                  {repair.status === 'Antrean' && (
                    <button
                      onClick={() => handleStartRepair(repair)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ml-auto"
                    >
                      <Play size={12} className="mr-1.5" /> Mulai Perbaikan
                    </button>
                  )}
                  {repair.status === 'Sedang Diperbaiki' && (
                    <button
                      onClick={() => {
                        setActiveRepair(repair);
                        setRepairForm({
                          fixed_quantity: repair.ng_quantity,
                          damage_notes: repair.damage_notes || '',
                          repair_notes: repair.repair_notes || '',
                        });
                      }}
                      className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ml-auto"
                    >
                      <CheckCircle2 size={12} className="mr-1.5" /> Selesai Perbaikan
                    </button>
                  )}
                  {repair.status === 'Selesai Diperbaiki' && (
                    <button
                      onClick={() => handleCreateSJRepair(repair)}
                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ml-auto border border-indigo-100"
                    >
                      <Send size={12} className="mr-1.5" /> Kirim SJ Repair 🚀
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {repairs.length === 0 && (
              <tr>
                <td colSpan="7" className="py-20 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <Wrench size={28} className="text-slate-200" />
                    </div>
                    <p className="text-slate-500 font-semibold">Belum ada produk yang perlu diperbaiki.</p>
                    <p className="text-xs text-slate-400 max-w-xs">Produk NG dari hasil QC akan otomatis muncul di sini sebagai antrean perbaikan.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Finish Repair Modal */}
      <AnimatePresence>
        {activeRepair && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6 border-b bg-emerald-50/60 border-emerald-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Selesai Perbaikan</span>
                  <h2 className="text-xl font-bold text-slate-900">{activeRepair.product_name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">RPR-{activeRepair.id.toString().padStart(4, '0')} &bull; {activeRepair.ng_quantity} pcs NG</p>
                </div>
                <button
                  onClick={() => setActiveRepair(null)}
                  className="text-slate-400 hover:text-slate-600 bg-white size-8 rounded-full border border-slate-200 flex items-center justify-center transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleFinishRepair} className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 flex items-center">
                    <CheckCircle2 size={15} className="text-emerald-500 mr-2" />
                    Jumlah Berhasil Diperbaiki
                  </label>
                  <input
                    type="number" min="1" max={activeRepair.ng_quantity} required
                    value={repairForm.fixed_quantity}
                    onChange={(e) => setRepairForm({ ...repairForm, fixed_quantity: e.target.value })}
                    className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-lg"
                  />
                  <p className="text-xs text-slate-400 mt-1 ml-1">Maksimal: {activeRepair.ng_quantity} pcs (total NG)</p>
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 flex items-center">
                    <AlertTriangle size={15} className="text-orange-500 mr-2" />
                    Catatan Kerusakan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Misal: Retak di bagian handle, warna pudar, dsb."
                    value={repairForm.damage_notes}
                    onChange={(e) => setRepairForm({ ...repairForm, damage_notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 flex items-center">
                    <FileText size={15} className="text-indigo-500 mr-2" />
                    Catatan Perbaikan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Misal: Sudah di-casting ulang, cat ulang, dsb."
                    value={repairForm.repair_notes}
                    onChange={(e) => setRepairForm({ ...repairForm, repair_notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm resize-none"
                  />
                </div>

                {/* Preview */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3">
                  <Package2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-black text-emerald-800">Setelah dikonfirmasi:</p>
                    <p className="text-emerald-700 mt-0.5">
                      <strong>{repairForm.fixed_quantity} pcs</strong> akan masuk <strong>Inventory</strong> dan siap dikirim kembali ke customer dengan <strong>Surat Jalan Repair</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center"
                >
                  {isUpdating ? (
                    <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Menyimpan...</>
                  ) : (
                    <><CheckCircle2 size={16} className="mr-2" /> Konfirmasi Selesai Perbaikan</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RepairWorkshopPage;
