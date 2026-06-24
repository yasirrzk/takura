import { useState } from 'react';
import { useProduction } from '../../hooks/useProduction';
import { useMaterials } from '../../hooks/useMaterials';
import { Plus, Clock, Play, CheckCircle2, ClipboardList, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ProductionPlanPage = () => {
  const { plans, isLoading: plansLoading, createPlan, updateStatus } = useProduction();
  const { materials, isLoading: materialsLoading } = useMaterials();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ 
    product_name: '', 
    target_quantity: 0, 
    material_id: '',
    material_requirement: 0
  });

  const filteredPlans = plans.filter(p => 
    p.product_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Check if material stock is enough
    const selectedMaterial = materials.find(m => m.id === parseInt(formData.material_id));
    if (selectedMaterial && selectedMaterial.stock < formData.material_requirement) {
      toast.error('Stok Bahan Baku Kurang', {
        description: `Stok ${selectedMaterial.name} tidak mencukupi! (Tersedia: ${selectedMaterial.stock} ${selectedMaterial.unit})`
      });
      return;
    }

    const promise = createPlan({
      ...formData,
      status: 'Scheduled'
    });

    toast.promise(promise, {
      loading: 'Menjadwalkan rencana produksi baru...',
      success: () => {
        setFormData({ product_name: '', target_quantity: 0, material_id: '', material_requirement: 0 });
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
      success: `Produksi ${productName} resmi dimulai`,
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
      case 'Completed': 
        return (
          <span className="flex items-center w-fit text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
            <CheckCircle2 size={12} className="mr-1.5" /> Completed
          </span>
        );
      default: return null;
    }
  };

  if (plansLoading || materialsLoading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="size-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse">Menyiapkan perencanaan produksi...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <ClipboardList size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">PPIC Department</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Perencanaan Produksi</h1>
          <p className="text-slate-500 mt-1 font-medium">Jadwalkan dan kelola alur konversi material baku menjadi barang jadi.</p>
        </div>
        
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
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl flex items-center font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <Plus size={18} className="mr-2" />
            Buat Rencana
          </button>
        </div>
      </div>

      {/* Form Section */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Informasi Rencana Produksi Baru</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Produk Jadi</label>
                <input 
                  type="text" required
                  placeholder="e.g. Ember Plastik 5L"
                  value={formData.product_name}
                  onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Target Produksi (Pcs)</label>
                <input 
                  type="number" required min="1"
                  placeholder="e.g. 100"
                  value={formData.target_quantity || ''}
                  onChange={(e) => setFormData({...formData, target_quantity: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Bahan Baku Utama</label>
                <select 
                  required
                  value={formData.material_id}
                  onChange={(e) => setFormData({...formData, material_id: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none appearance-none"
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
                  onChange={(e) => setFormData({...formData, material_requirement: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-4 flex justify-end space-x-3 pt-4 border-t border-slate-50">
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

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk Target</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Jumlah Target</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kebutuhan Bahan Baku</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredPlans.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <ClipboardList className="text-slate-300" size={24} />
                    </div>
                    <p className="text-slate-400 font-medium">Tidak ada rencana produksi aktif.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPlans.map((plan, idx) => {
                const requiredMaterial = materials.find(m => m.id === plan.material_id);
                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={plan.id} 
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="size-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {plan.product_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{plan.product_name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black mt-0.5 tracking-tighter">ID: PLN-{plan.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-black text-slate-950 bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-150">
                        {plan.target_quantity} <span className="text-[10px] font-bold text-slate-400 uppercase">Pcs</span>
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{requiredMaterial?.name || 'Unknown Material'}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Kebutuhan: <span className="font-bold text-indigo-600">{plan.material_requirement} {requiredMaterial?.unit || 'kg'}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {getStatusBadge(plan.status)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {plan.status === 'Scheduled' && (
                          <button 
                            onClick={() => handleStartProduction(plan.id, plan.product_name)}
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center shadow-sm"
                          >
                            <Play size={12} className="mr-1.5" /> Mulai Produksi
                          </button>
                        )}
                        {plan.status === 'In Progress' && (
                          <span className="text-xs text-indigo-500 font-bold bg-indigo-50/50 border border-indigo-150 px-3.5 py-2 rounded-xl flex items-center">
                            <span className="size-1.5 bg-indigo-600 rounded-full animate-ping mr-2" />
                            Dalam Proses
                          </span>
                        )}
                        {plan.status === 'Completed' && (
                          <span className="text-xs text-emerald-500 font-bold bg-emerald-50/30 border border-emerald-100 px-3.5 py-2 rounded-xl flex items-center">
                            <CheckCircle2 size={12} className="text-emerald-500 mr-1.5" />
                            Selesai & QC
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
  );
};

export default ProductionPlanPage;
