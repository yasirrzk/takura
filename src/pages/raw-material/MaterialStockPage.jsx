import { useState } from 'react';
import { useMaterials } from '../../hooks/useMaterials';
import { Plus, Trash2, Edit, Search, Package, MoreVertical, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const MaterialStockPage = () => {
  const { materials, isLoading, createMaterial, deleteMaterial } = useMaterials();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', stock: 0, unit: 'kg' });
  const [search, setSearch] = useState('');

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const promise = createMaterial(formData);
    toast.promise(promise, {
      loading: 'Menambahkan material...',
      success: () => {
        setFormData({ name: '', stock: 0, unit: 'kg' });
        setIsFormOpen(false);
        return 'Material berhasil ditambahkan';
      },
      error: 'Gagal menambahkan material',
    });
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus material ini?')) {
      toast.promise(deleteMaterial(id), {
        loading: 'Menghapus...',
        success: 'Material dihapus',
        error: 'Gagal menghapus',
      });
    }
  };

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="size-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse">Menyiapkan data inventori...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <Package size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Warehouse</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Material Baku</h1>
          <p className="text-slate-500 mt-1 font-medium">Kelola stok dan inventori bahan mentah manufaktur.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Cari material..."
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
            Tambah Baru
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Informasi Material Baru</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Material</label>
                <input 
                  type="text" required
                  placeholder="e.g. Biji Plastik"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Jumlah Stok</label>
                <input 
                  type="number" required
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Satuan</label>
                <select 
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none appearance-none"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="meter">Meter (m)</option>
                  <option value="liter">Liter (L)</option>
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end space-x-3 pt-4 border-t border-slate-50">
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
                  Simpan Material
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ketersediaan</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Manajemen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="text-slate-300" size={24} />
                    </div>
                    <p className="text-slate-400 font-medium">Tidak ada material yang ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredMaterials.map((item, idx) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id} 
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="size-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black mt-0.5 tracking-tighter">ID: MAT-{item.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full rounded-full ${item.stock < 50 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min((item.stock / 1000) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${item.stock < 50 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {item.stock} <span className="opacity-50">{item.unit}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-tighter">{item.unit}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all shadow-sm">
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                    <button className="p-2 text-slate-400 group-hover:hidden">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialStockPage;
