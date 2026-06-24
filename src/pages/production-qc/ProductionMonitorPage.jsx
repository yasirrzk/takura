import { useState } from 'react';
import { useProduction } from '../../hooks/useProduction';
import { ClipboardCheck, CheckCircle2, AlertTriangle, Activity, PackageCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ProductionMonitorPage = () => {
  const { plans, isLoading, submitQC } = useProduction();
  const [activeQCPlan, setActiveQCPlan] = useState(null);
  const [qcData, setQcData] = useState({ ok_quantity: 0, ng_quantity: 0 });

  const activePlans = plans.filter(p => p.status === 'In Progress');

  const handleQCSubmit = async (e) => {
    e.preventDefault();
    if (qcData.ok_quantity < 0 || qcData.ng_quantity < 0) {
      toast.error('Jumlah Tidak Valid', {
        description: 'Jumlah OK dan NG tidak boleh kurang dari 0.'
      });
      return;
    }

    const promise = submitQC({ id: activeQCPlan.id, qcData });
    toast.promise(promise, {
      loading: 'Menyimpan hasil Quality Control...',
      success: () => {
        setActiveQCPlan(null);
        setQcData({ ok_quantity: 0, ng_quantity: 0 });
        return 'Hasil QC berhasil disimpan. Stok bahan baku & barang jadi telah diperbarui.';
      },
      error: 'Gagal menyimpan hasil QC',
    });
  };

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="size-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse">Menyiapkan dashboard QC...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-600 mb-1">
          <Activity size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">QC & Production</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Monitoring Produksi & QC</h1>
        <p className="text-slate-500 mt-1 font-medium">Kawal proses manufaktur berjalan dan verifikasi kualitas produk akhir.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Production List */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-lg font-black text-slate-900 flex items-center">
            <ClipboardCheck size={20} className="mr-2.5 text-indigo-600" />
            Produksi Berjalan
          </h2>
          
          <div className="space-y-4">
            {activePlans.length === 0 ? (
              <div className="bg-white p-12 rounded-[2rem] border border-dashed border-slate-300 text-center flex flex-col items-center justify-center">
                <div className="size-14 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Activity className="text-slate-350" size={22} />
                </div>
                <p className="text-slate-450 text-sm font-semibold">Tidak ada produksi berjalan.</p>
                <p className="text-xs text-slate-400 mt-1">Jadwalkan & mulai rencana produksi di PPIC.</p>
              </div>
            ) : (
              activePlans.map(plan => {
                const isSelected = activeQCPlan?.id === plan.id;
                return (
                  <motion.div 
                    layout
                    key={plan.id} 
                    className={`bg-white p-6 rounded-3xl border transition-all duration-300 ${isSelected ? 'ring-2 ring-indigo-500 border-transparent shadow-xl shadow-indigo-100/50' : 'border-slate-200/60 shadow-sm hover:shadow-md'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{plan.product_name}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mt-1">Plan ID: PLN-{plan.id.toString().padStart(4, '0')}</p>
                      </div>
                      <span className="flex items-center text-xs font-black bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-xl uppercase tracking-wider animate-pulse">
                        In Progress
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100 flex justify-between items-center text-sm font-medium">
                      <div>
                        <span className="text-xs text-slate-450 uppercase tracking-tighter block font-bold">Target Produksi</span>
                        <span className="text-slate-900 font-bold text-base">{plan.target_quantity} Pcs</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div>
                        <span className="text-xs text-slate-450 uppercase tracking-tighter block font-bold">Estimasi Bahan</span>
                        <span className="text-indigo-650 font-bold text-base">{plan.material_requirement} Pcs/Kg</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setActiveQCPlan(plan);
                        setQcData({ ok_quantity: plan.target_quantity, ng_quantity: 0 });
                      }}
                      className={`w-full py-3 rounded-2xl font-bold text-sm tracking-wide transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                      {isSelected ? 'Sedang Di-QC' : 'Input Hasil QC'}
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* QC Form Section */}
        <div className="lg:col-span-7">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center">
            <CheckCircle2 size={20} className="mr-2.5 text-emerald-600" />
            Form Quality Control
          </h2>
          
          <AnimatePresence mode="wait">
            {activeQCPlan ? (
              <motion.div 
                key={activeQCPlan.id}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
              >
                <div className="mb-6 pb-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hasil Verifikasi Kualitas</p>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{activeQCPlan.product_name}</h3>
                  </div>
                  <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <PackageCheck size={24} />
                  </div>
                </div>
                
                <form onSubmit={handleQCSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-emerald-600 uppercase tracking-widest ml-1">Jumlah OK (Lolos QC)</label>
                      <input 
                        type="number" required min="0"
                        value={qcData.ok_quantity}
                        onChange={(e) => setQcData({...qcData, ok_quantity: parseInt(e.target.value) || 0})}
                        className="w-full border-2 border-emerald-100 focus:border-emerald-500 bg-emerald-50/20 rounded-2xl p-4 text-emerald-950 font-bold transition-all outline-none"
                      />
                      <span className="text-[10px] text-slate-400 block ml-1">Kuantitas produk yang layak dijual / masuk gudang.</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-rose-600 uppercase tracking-widest ml-1">Jumlah NG (Not Good / Reject)</label>
                      <input 
                        type="number" required min="0"
                        value={qcData.ng_quantity}
                        onChange={(e) => setQcData({...qcData, ng_quantity: parseInt(e.target.value) || 0})}
                        className="w-full border-2 border-rose-100 focus:border-rose-500 bg-rose-50/20 rounded-2xl p-4 text-rose-950 font-bold transition-all outline-none"
                      />
                      <span className="text-[10px] text-slate-400 block ml-1">Kuantitas produk cacat / rusak.</span>
                    </div>
                  </div>
                  
                  {/* Warning Box */}
                  <div className="bg-amber-50/60 border border-amber-200/60 p-5 rounded-2xl flex items-start text-xs leading-relaxed text-amber-850">
                    <AlertTriangle size={18} className="mr-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900 mb-0.5">Konsekuensi Transaksi Stok:</p>
                      <p className="text-amber-800">Menyelesaikan QC akan memotong stok bahan baku sebesar <strong>-{activeQCPlan.material_requirement} unit</strong> dan menambahkan stok barang jadi sebesar <strong>+{qcData.ok_quantity} Pcs</strong> secara real-time.</p>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2 border-t border-slate-50">
                    <button 
                      type="button" 
                      onClick={() => setActiveQCPlan(null)}
                      className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center"
                    >
                      <CheckCircle2 size={16} className="mr-2" />
                      Selesaikan Produksi
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-100/40 p-16 rounded-[2.5rem] border border-dashed border-slate-350 text-center flex flex-col items-center justify-center text-slate-450 h-[380px]"
              >
                <div className="size-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-slate-300">
                  <AlertCircle size={28} />
                </div>
                <h4 className="font-bold text-slate-700 text-base">Menunggu Pilihan Produksi</h4>
                <p className="text-xs text-slate-400 mt-1.5 max-w-sm">Pilih salah satu item produksi berjalan di panel sebelah kiri untuk memproses Quality Control.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProductionMonitorPage;
