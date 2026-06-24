import { useState } from 'react';
import { useMaterials } from '../../hooks/useMaterials';
import { Plus, Trash2, Edit, Search, Package, ArrowUpRight, ArrowDownRight, X, Layers, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const MaterialStockPage = () => {
  const { materials, isLoading, createMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Form states
  const [newMaterialData, setNewMaterialData] = useState({ name: '', stock: 0, unit: 'kg' });
  const [editMaterialData, setEditMaterialData] = useState({ id: null, name: '', stock: 0, unit: 'kg' });
  const [adjustData, setAdjustData] = useState({ material_id: '', type: 'IN', quantity: 0, notes: '' });

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const promise = createMaterial(newMaterialData);
    toast.promise(promise, {
      loading: 'Menambahkan material...',
      success: () => {
        setNewMaterialData({ name: '', stock: 0, unit: 'kg' });
        setIsCreateOpen(false);
        return 'Material baru berhasil didaftarkan';
      },
      error: 'Gagal menambahkan material',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const promise = updateMaterial({ 
      id: editMaterialData.id, 
      data: { name: editMaterialData.name, stock: editMaterialData.stock, unit: editMaterialData.unit } 
    });
    toast.promise(promise, {
      loading: 'Menyimpan perubahan...',
      success: () => {
        setIsEditOpen(false);
        return 'Informasi material berhasil diperbarui';
      },
      error: 'Gagal memperbarui material',
    });
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    const targetMaterial = materials.find(m => m.id === parseInt(adjustData.material_id));
    if (!targetMaterial) {
      toast.error('Material tidak ditemukan');
      return;
    }

    let nextStock = targetMaterial.stock;
    if (adjustData.type === 'IN') {
      nextStock += adjustData.quantity;
    } else {
      if (targetMaterial.stock < adjustData.quantity) {
        toast.error('Penyesuaian Gagal', {
          description: `Stok keluar melebihi stok tersedia (${targetMaterial.stock} ${targetMaterial.unit}).`
        });
        return;
      }
      nextStock -= adjustData.quantity;
    }

    const promise = updateMaterial({
      id: targetMaterial.id,
      data: { ...targetMaterial, stock: nextStock }
    });

    toast.promise(promise, {
      loading: 'Memproses transaksi stok...',
      success: () => {
        setIsAdjustOpen(false);
        setAdjustData({ material_id: '', type: 'IN', quantity: 0, notes: '' });
        return `Berhasil mencatat stok ${adjustData.type === 'IN' ? 'masuk' : 'keluar'} sebanyak ${adjustData.quantity} ${targetMaterial.unit}`;
      },
      error: 'Gagal menyesuaikan stok',
    });
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Hapus material "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      toast.promise(deleteMaterial(id), {
        loading: 'Menghapus material...',
        success: 'Material berhasil dihapus',
        error: 'Gagal menghapus material',
      });
    }
  };

  const getStockBadge = (stock) => {
    if (stock < 50) {
      return <span className="bg-red-50 border border-red-100 text-red-650 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">Kritis / Habis</span>;
    } else if (stock < 200) {
      return <span className="bg-amber-50 border border-amber-100 text-amber-650 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">Menipis</span>;
    } else {
      return <span className="bg-green-50 border border-green-100 text-green-650 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">Aman</span>;
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <Package size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Warehouse & Supply</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Material Baku</h1>
          <p className="text-slate-500 mt-1 font-medium">Kelola inventori bahan mentah dan catat penyesuaian stok masuk/keluar.</p>
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
            onClick={() => setIsAdjustOpen(true)}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl flex items-center font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Layers size={16} className="mr-2 text-indigo-500" />
            Transaksi Stok
          </button>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <Plus size={18} className="mr-1.5" />
            Tambah Baru
          </button>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Material</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status Stok</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tersedia</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Satuan</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Manajemen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="text-slate-350" size={24} />
                    </div>
                    <p className="text-slate-450 font-medium">Tidak ada material yang ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredMaterials.map((item, idx) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  key={item.id} 
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="size-10 bg-indigo-55/10 text-indigo-650 rounded-xl flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-450 uppercase font-black mt-0.5 tracking-tighter">ID: MAT-{item.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {getStockBadge(item.stock)}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full rounded-full ${item.stock < 50 ? 'bg-red-500' : item.stock < 200 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min((item.stock / 1000) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-800">
                        {item.stock} <span className="text-slate-450 font-bold">{item.unit}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-black text-slate-550 uppercase tracking-wide">{item.unit}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditMaterialData(item);
                          setIsEditOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100 bg-slate-50 md:bg-transparent"
                      >
                        <Edit size={15} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 text-slate-400 hover:text-red-650 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100 bg-slate-50 md:bg-transparent"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE NEW MATERIAL MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">New Inventory Item</span>
                  <h2 className="text-xl font-bold text-slate-900">Tambah Material Baru</h2>
                </div>
                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-650 bg-white size-8 rounded-full border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Material</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Biji Plastik HDPE"
                    value={newMaterialData.name}
                    onChange={(e) => setNewMaterialData({...newMaterialData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3 font-bold outline-none" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Stok Awal</label>
                    <input 
                      type="number" required min="0"
                      value={newMaterialData.stock}
                      onChange={(e) => setNewMaterialData({...newMaterialData, stock: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3 font-bold outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Satuan</label>
                    <select 
                      value={newMaterialData.unit}
                      onChange={(e) => setNewMaterialData({...newMaterialData, unit: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3.5 font-bold outline-none" 
                    >
                      <option value="kg">kg (Kilogram)</option>
                      <option value="pcs">pcs (Pieces)</option>
                      <option value="meter">m (Meter)</option>
                      <option value="liter">L (Liter)</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-slate-950/10 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-4"
                >
                  Simpan Material Baru
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MATERIAL DETAILS MODAL */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Modify Item Info</span>
                  <h2 className="text-xl font-bold text-slate-900">Ubah Detail Material</h2>
                </div>
                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-650 bg-white size-8 rounded-full border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Material</label>
                  <input 
                    type="text" required
                    value={editMaterialData.name}
                    onChange={(e) => setEditMaterialData({...editMaterialData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3 font-bold outline-none" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Jumlah Stok</label>
                    <input 
                      type="number" required min="0"
                      value={editMaterialData.stock}
                      onChange={(e) => setEditMaterialData({...editMaterialData, stock: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3 font-bold outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Satuan</label>
                    <select 
                      value={editMaterialData.unit}
                      onChange={(e) => setEditMaterialData({...editMaterialData, unit: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3.5 font-bold outline-none" 
                    >
                      <option value="kg">kg (Kilogram)</option>
                      <option value="pcs">pcs (Pieces)</option>
                      <option value="meter">m (Meter)</option>
                      <option value="liter">L (Liter)</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-indigo-650/10 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-4"
                >
                  Simpan Perubahan
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRANSACTION ADJUSTMENT MODAL (STOCK IN / OUT) */}
      <AnimatePresence>
        {isAdjustOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Material In / Material Out</span>
                  <h2 className="text-xl font-bold text-slate-900">Transaksi Aliran Stok</h2>
                </div>
                <button onClick={() => setIsAdjustOpen(false)} className="text-slate-400 hover:text-slate-650 bg-white size-8 rounded-full border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Jenis Transaksi</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setAdjustData({...adjustData, type: 'IN'})}
                      className={`py-3 rounded-2xl font-bold text-sm tracking-wide transition-all border flex items-center justify-center ${adjustData.type === 'IN' ? 'bg-emerald-50 border-emerald-355 text-emerald-700 ring-2 ring-emerald-500/20' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                    >
                      <ArrowUp size={14} className="mr-1.5" /> Stok Masuk (IN)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAdjustData({...adjustData, type: 'OUT'})}
                      className={`py-3 rounded-2xl font-bold text-sm tracking-wide transition-all border flex items-center justify-center ${adjustData.type === 'OUT' ? 'bg-rose-50 border-rose-355 text-rose-700 ring-2 ring-rose-500/20' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                    >
                      <ArrowDown size={14} className="mr-1.5" /> Stok Keluar (OUT)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Pilih Material</label>
                  <select 
                    required
                    value={adjustData.material_id}
                    onChange={(e) => setAdjustData({...adjustData, material_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3.5 font-bold outline-none appearance-none" 
                  >
                    <option value="">-- Pilih Material --</option>
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name} (Tersedia: {m.stock} {m.unit})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Jumlah Transaksi</label>
                  <input 
                    type="number" required min="1"
                    placeholder="e.g. 100"
                    value={adjustData.quantity || ''}
                    onChange={(e) => setAdjustData({...adjustData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3 font-bold outline-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Keterangan / Supplier</label>
                  <input 
                    type="text"
                    placeholder="e.g. Kiriman Supplier Makmur / Koreksi Stok Cacat"
                    value={adjustData.notes}
                    onChange={(e) => setAdjustData({...adjustData, notes: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3 font-bold outline-none" 
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-slate-950/10 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-4"
                >
                  Eksekusi Transaksi Stok
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaterialStockPage;
