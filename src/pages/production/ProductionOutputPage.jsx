import { useState } from 'react';
import { useProduction } from '../../hooks/useProduction';
import { ClipboardCheck, CheckCircle2, Activity, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ProductionOutputPage = () => {
  const { plans, isLoading, finishProduction } = useProduction();
  const [activePlan, setActivePlan] = useState(null);
  const [outputQuantity, setOutputQuantity] = useState(0);

  // Show In Progress, Selesai Dijadwalkan, and Rework plans
  const activePlans = plans.filter(p => p.status === 'In Progress' || p.status === 'Selesai Dijadwalkan');

  const handleFinishSubmit = async (e) => {
    e.preventDefault();
    if (outputQuantity <= 0) {
      toast.error('Jumlah Tidak Valid', {
        description: 'Jumlah produk yang dihasilkan harus lebih dari 0.'
      });
      return;
    }

    const promise = finishProduction({ id: activePlan.id, outputQuantity: parseInt(outputQuantity) });
    toast.promise(promise, {
      loading: 'Menyimpan hasil Produksi...',
      success: () => {
        setActivePlan(null);
        setOutputQuantity(0);
        return 'Produksi selesai. Produk otomatis diserahkan ke divisi pengiriman (Delivery).';
      },
      error: 'Gagal menyimpan hasil produksi',
    });
  };

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="size-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse">Menyiapkan dashboard Produksi...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex items-center space-x-2 text-indigo-600 mb-1">
          <Activity size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tahap 3</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hasil Produksi Pabrik</h1>
        <p className="text-slate-500 mt-1 font-medium">Catat output barang yang telah selesai dibuat dari mesin, langsung diteruskan ke distribusi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                <p className="text-slate-450 text-sm font-semibold">Tidak ada mesin beroperasi saat ini.</p>
                <p className="text-xs text-slate-400 mt-1">Jadwalkan & mulai rencana produksi di PPIC.</p>
              </div>
            ) : (
              activePlans.map(plan => {
                const isSelected = activePlan?.id === plan.id;
                return (
                  <motion.div
                    layout
                    key={plan.id}
                    className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'ring-2 border-transparent shadow-xl ' + (plan.type === 'REWORK' ? 'ring-orange-400 shadow-orange-100/50 bg-orange-50/30' : 'ring-indigo-500 shadow-indigo-100/50 bg-white')
                        : 'border-slate-200/60 shadow-sm hover:shadow-md ' + (plan.type === 'REWORK' ? 'bg-orange-50/20' : 'bg-white')
                    }`}
                    onClick={() => {
                      setActivePlan(plan);
                      setOutputQuantity(plan.target_quantity);
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{plan.product_name}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mt-1">PLN-{plan.id.toString().padStart(4, '0')}</p>
                      </div>
                      {plan.type === 'REWORK' ? (
                        <span className="flex items-center text-xs font-black bg-orange-100 text-orange-600 border border-orange-200 px-3 py-1 rounded-xl uppercase tracking-wider">
                          <RefreshCw size={10} className="mr-1.5 animate-spin" style={{ animationDuration: '3s' }} />
                          Rework
                        </span>
                      ) : plan.status === 'Selesai Dijadwalkan' ? (
                        <span className="flex items-center text-xs font-black bg-teal-50 text-teal-600 border border-teal-200 px-3 py-1 rounded-xl uppercase tracking-wider">
                          <CheckCircle2 size={10} className="mr-1.5" />
                          Selesai Dijadwalkan
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-black bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-xl uppercase tracking-wider animate-pulse">
                          In Progress
                        </span>
                      )}
                    </div>

                    {plan.type === 'REWORK' && (
                      <div className="mb-3 flex items-center space-x-2 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-2 rounded-xl">
                        <RefreshCw size={12} />
                        <span>Produksi ulang dari QC NG — SJ #{plan.rework_from_delivery}</span>
                      </div>
                    )}

                    <div className="bg-slate-50 rounded-2xl p-4 mb-2 border border-slate-100 flex justify-between items-center text-sm font-medium">
                      <div>
                        <span className="text-xs text-slate-400 uppercase tracking-tighter block font-bold">{plan.type === 'REWORK' ? 'Target Rework' : 'Target PPIC'}</span>
                        <span className="text-slate-900 font-bold text-base">{plan.target_quantity} Pcs</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div>
                        <span className="text-xs text-slate-400 uppercase tracking-tighter block font-bold">Bahan Baku</span>
                        <span className="text-indigo-600 font-bold text-base">{plan.material_requirement} /kg</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center">
            <TrendingUp size={20} className="mr-2.5 text-indigo-600" />
            Catat Output Hasil
          </h2>
          
          <AnimatePresence mode="wait">
            {activePlan ? (
              <motion.div 
                key={activePlan.id}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
              >
                <div className="mb-6 pb-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Input Barang Selesai Mesin</p>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{activePlan.product_name}</h3>
                  </div>
                </div>
                
                <form onSubmit={handleFinishSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1 block">
                      Jumlah Produk Jadi (Final Output)
                    </label>
                    <input 
                      type="number" required min="1"
                      value={outputQuantity}
                      onChange={(e) => setOutputQuantity(parseInt(e.target.value) || 0)}
                      className="w-full border-2 border-slate-200 focus:border-indigo-500 bg-slate-50 rounded-2xl p-4 text-slate-900 text-xl font-black transition-all outline-none"
                    />
                    <p className="text-xs text-slate-500 font-medium ml-1">
                      Target awal PPIC adalah {activePlan.target_quantity} pcs. Input jumlah aktual yang berhasil dibuat.
                    </p>
                  </div>
                  
                  <div className="bg-indigo-50/60 border border-indigo-100 p-5 rounded-2xl flex items-start text-xs leading-relaxed">
                    <AlertCircle size={18} className="mr-3 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-indigo-900 mb-0.5">Automasi Sistem Terpicu:</p>
                      <p className="text-indigo-800">Menekan Selesai akan secara otomatis <strong>memotong stok Gudang Bahan Baku</strong> dan meneruskan produk ini ke <strong>Divisi Pengiriman (Delivery)</strong>.</p>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setActivePlan(null)}
                      className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all border border-slate-200"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center"
                    >
                      <CheckCircle2 size={18} className="mr-2" />
                      Konfirmasi Selesai
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-50 p-16 rounded-[2.5rem] border border-dashed border-slate-200 text-center flex flex-col items-center justify-center text-slate-400 h-[380px]"
              >
                <div className="size-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <Activity size={28} className="text-slate-300" />
                </div>
                <h4 className="font-bold text-slate-600 text-base">Pilih Mesin / Produksi</h4>
                <p className="text-xs text-slate-400 mt-1.5 max-w-xs">Klik salah satu jadwal In Progress di kiri untuk menginput hasil.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProductionOutputPage;
