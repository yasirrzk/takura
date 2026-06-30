import { useState, useRef } from 'react';
import { useDelivery } from '../../hooks/useDelivery';
import { useInventory } from '../../hooks/useInventory';
import {
  Send, PackageCheck, History, X, MapPin, Truck,
  CheckCircle2, ShieldCheck, Wrench, FileText, Package2,
  Download, Upload, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const DeliveryPage = () => {
  const { deliveries, isLoading: deliveryLoading, createDelivery, updateDelivery } = useDelivery();
  const { inventory, isLoading: inventoryLoading } = useInventory();

  const [activeShipping, setActiveShipping] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState('all'); // 'all' | 'new' | 'repair'
  const [shipFormData, setShipFormData] = useState({ quantity: 0, destination: '', type: 'NEW' });
  const [activeEditSJ, setActiveEditSJ] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', reject_qty: 0, reject_notes: '' });
  const fileInputRef = useRef(null);

  const handleShip = async (e) => {
    e.preventDefault();
    if (shipFormData.quantity > activeShipping.stock) {
      toast.error('Gagal Mengirim', {
        description: `Stok tidak mencukupi! Ketersediaan saat ini hanya ${activeShipping.stock} Pcs.`
      });
      return;
    }

    const promise = createDelivery({
      productId: activeShipping.id,
      quantity: shipFormData.quantity,
      destination: shipFormData.destination,
      type: shipFormData.type
    });

    toast.promise(promise, {
      loading: `Menerbitkan Surat Jalan ${shipFormData.type === 'REPAIR' ? 'Repair' : 'New Product'}...`,
      success: () => {
        setActiveShipping(null);
        setShipFormData({ quantity: 0, destination: '', type: 'NEW' });
        return `Surat Jalan ${shipFormData.type === 'REPAIR' ? 'Repair' : 'New Product'} berhasil diterbitkan!`;
      },
      error: 'Gagal menerbitkan Surat Jalan',
    });
  };

  const handleStatusUpdate = async (id, destination) => {
    const promise = updateDelivery({ id, data: { status: 'Delivered' } });
    toast.promise(promise, {
      loading: `Mengonfirmasi pengiriman ke ${destination}...`,
      success: `Pengiriman ke ${destination} dinyatakan sampai. QC dapat dilakukan.`,
      error: 'Gagal memperbarui status',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const promise = updateDelivery({ 
      id: activeEditSJ.id, 
      data: { 
        status: editForm.status,
        reject_qty: editForm.reject_qty,
        reject_notes: editForm.reject_notes 
      } 
    });
    toast.promise(promise, {
      loading: 'Menyimpan perubahan Surat Jalan...',
      success: () => {
        setActiveEditSJ(null);
        return 'Surat Jalan berhasil diperbarui!';
      },
      error: 'Gagal memperbarui Surat Jalan',
    });
  };

  const handleExportCSV = () => {
    const headers = ['No. SJ', 'Tipe', 'Produk', 'Quantity', 'Tujuan', 'Tanggal', 'Status', 'Reject Qty', 'Catatan Reject'];
    const rows = filteredDeliveries.map(d => [
      `SJ-${d.id.toString().padStart(4, '0')}`,
      d.type,
      d.product_name,
      d.quantity,
      d.destination,
      d.date,
      d.status,
      d.reject_qty || 0,
      d.reject_notes || ''
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Riwayat_Surat_Jalan_Takura.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File CSV berhasil diunduh!');
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').map(row => row.split(','));
        // Skip header row
        const dataRows = rows.slice(1).filter(r => r.length >= 5 && r[0]);
        
        let count = 0;
        for (const row of dataRows) {
          // Format expected: Product ID, Quantity, Destination, Type (NEW/REPAIR)
          // Simplified import mapping
          const productId = parseInt(row[0].replace(/[^0-9]/g, '') || '1'); 
          const quantity = parseInt(row[1]) || 1;
          const destination = row[2] || 'Unknown';
          const type = row[3]?.trim().toUpperCase() === 'REPAIR' ? 'REPAIR' : 'NEW';

          try {
            await createDelivery({ productId, quantity, destination, type });
            count++;
          } catch (err) {
            console.error(err);
          }
        }
        
        toast.success(`Berhasil mengimpor ${count} Surat Jalan dari CSV!`);
      } catch (err) {
        toast.error('Gagal mengimpor CSV', { description: 'Pastikan format CSV sesuai.' });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Transit':
        return (
          <span className="inline-flex items-center text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider">
            <Truck size={12} className="mr-1.5" /> In Transit
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider">
            <CheckCircle2 size={12} className="mr-1.5" /> Delivered
          </span>
        );
      default: return null;
    }
  };

  const getTypeBadge = (type) => {
    if (type === 'REPAIR') {
      return (
        <span className="inline-flex items-center text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider">
          <Wrench size={11} className="mr-1.5" /> Repair
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider">
        <Package2 size={11} className="mr-1.5" /> New Product
      </span>
    );
  };

  const filteredDeliveries = (deliveries || []).filter(d => {
    if (historyTab === 'new') return d.type !== 'REPAIR';
    if (historyTab === 'repair') return d.type === 'REPAIR';
    return true;
  });

  const newCount = (deliveries || []).filter(d => d.type !== 'REPAIR').length;
  const repairCount = (deliveries || []).filter(d => d.type === 'REPAIR').length;

  if (deliveryLoading || inventoryLoading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="size-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse">Menyiapkan data logistik & distribusi...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 mb-1">
            <Truck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tahap 4</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Distribusi & Surat Jalan</h1>
          <p className="text-slate-500 mt-1 font-medium">Terbitkan Surat Jalan (New Product / Repair) dan pantau logistik pengiriman.</p>
        </div>

        <button
          onClick={() => setShowHistory(true)}
          className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl flex items-center font-bold shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-0 transition-all relative"
        >
          <History size={18} className="mr-2 text-indigo-600" />
          Riwayat Pengiriman
          {(deliveries || []).length > 0 && (
            <span className="ml-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {(deliveries || []).length}
            </span>
          )}
        </button>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory?.map((product, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={product.id}
            className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-emerald-50/80 border border-emerald-100 p-3 rounded-2xl text-emerald-600">
                  <PackageCheck size={24} />
                </div>
                <span className="text-3xl font-black text-slate-900">
                  {product.stock} <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pcs</span>
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{product.name}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">FG-{product.id.toString().padStart(4, '0')}</p>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveShipping(product);
                  setShipFormData({ quantity: Math.min(10, product.stock), destination: '', type: 'NEW' });
                }}
                disabled={product.stock === 0}
                className="bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Package2 size={14} className="mr-1.5" />
                New Product
              </button>
              <button
                onClick={() => {
                  setActiveShipping(product);
                  setShipFormData({ quantity: Math.min(10, product.stock), destination: '', type: 'REPAIR' });
                }}
                disabled={product.stock === 0}
                className="bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Wrench size={14} className="mr-1.5" />
                Repair
              </button>
            </div>
          </motion.div>
        ))}
        {(!inventory || inventory.length === 0) && (
          <div className="col-span-full py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
            <PackageCheck size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Belum ada barang jadi dari produksi.</p>
            <p className="text-xs text-slate-400 mt-1">Selesaikan produksi di Tahap 3 untuk mengisi stok.</p>
          </div>
        )}
      </div>

      {/* Shipping Modal */}
      <AnimatePresence>
        {activeShipping && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className={`p-6 border-b flex justify-between items-center ${shipFormData.type === 'REPAIR' ? 'bg-orange-50/60 border-orange-100' : 'bg-indigo-50/40 border-indigo-100'}`}>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${shipFormData.type === 'REPAIR' ? 'text-orange-500' : 'text-indigo-500'}`}>
                    {shipFormData.type === 'REPAIR' ? '🔧 Surat Jalan Repair' : '📦 Surat Jalan New Product'}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Form Pengiriman — {shipFormData.type === 'REPAIR' ? 'Repair' : 'New Product'}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveShipping(null)}
                  className="text-slate-400 hover:text-slate-600 bg-white size-8 rounded-full border border-slate-200 flex items-center justify-center transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleShip} className="p-8 space-y-5">
                {/* Type Toggle */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tipe Surat Jalan</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setShipFormData({ ...shipFormData, type: 'NEW' })}
                      className={`py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${shipFormData.type === 'NEW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Package2 size={15} className="mr-2" /> New Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setShipFormData({ ...shipFormData, type: 'REPAIR' })}
                      className={`py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${shipFormData.type === 'REPAIR' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Wrench size={15} className="mr-2" /> Repair
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Produk</label>
                  <input type="text" disabled value={activeShipping.name} className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-3 text-slate-500 font-bold" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Stok Tersedia</label>
                    <input type="text" disabled value={`${activeShipping.stock} Pcs`} className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-3 font-black text-slate-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-600 uppercase tracking-widest ml-1">Jumlah Kirim</label>
                    <input
                      type="number" required min="1" max={activeShipping.stock}
                      value={shipFormData.quantity}
                      onChange={(e) => setShipFormData({ ...shipFormData, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3 font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-indigo-600 uppercase tracking-widest ml-1">Tujuan / Nama Customer</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      type="text" required
                      placeholder="e.g. PT Maju Sentosa"
                      value={shipFormData.destination}
                      onChange={(e) => setShipFormData({ ...shipFormData, destination: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3 pl-12 font-bold outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full text-white font-bold py-3.5 rounded-2xl shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all mt-2 ${shipFormData.type === 'REPAIR' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-950/10'}`}
                >
                  Terbitkan Surat Jalan {shipFormData.type === 'REPAIR' ? 'Repair' : 'New Product'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="size-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Riwayat Surat Jalan</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">New Product & Repair — Semua Pengiriman</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleImportCSV} />
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all">
                    <Upload size={14} /> <span>Import</span>
                  </button>
                  <button onClick={handleExportCSV} className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all">
                    <Download size={14} /> <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-slate-400 hover:text-slate-600 bg-white size-8 rounded-full border border-slate-200 flex items-center justify-center transition-all shadow-sm ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Tab Filter */}
              <div className="flex border-b border-slate-100 px-6 bg-white flex-shrink-0">
                <button
                  onClick={() => setHistoryTab('all')}
                  className={`pb-3 pt-4 px-5 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${historyTab === 'all' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <span>Semua</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${historyTab === 'all' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    {(deliveries || []).length}
                  </span>
                </button>
                <button
                  onClick={() => setHistoryTab('new')}
                  className={`pb-3 pt-4 px-5 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${historyTab === 'new' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <Package2 size={14} />
                  <span>New Product</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${historyTab === 'new' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    {newCount}
                  </span>
                </button>
                <button
                  onClick={() => setHistoryTab('repair')}
                  className={`pb-3 pt-4 px-5 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${historyTab === 'repair' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <Wrench size={14} />
                  <span>Repair</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${historyTab === 'repair' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                    {repairCount}
                  </span>
                </button>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No. SJ</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tujuan</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredDeliveries.map((delivery) => (
                      <tr key={delivery.id} className={`group transition-colors hover:bg-slate-50/60 ${delivery.type === 'REPAIR' ? 'border-l-2 border-l-orange-300' : 'border-l-2 border-l-indigo-200'}`}>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-slate-500">SJ-{delivery.id.toString().padStart(4, '0')}</span>
                        </td>
                        <td className="px-6 py-4">{getTypeBadge(delivery.type)}</td>
                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">{delivery.product_name}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {delivery.quantity} <span className="opacity-50 font-normal">Pcs</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">
                          <div className="flex items-center">
                            <MapPin size={12} className="mr-1 text-slate-400 flex-shrink-0" />
                            {delivery.destination}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">{delivery.date}</td>
                        <td className="px-6 py-4">{getStatusBadge(delivery.status)}</td>
                        <td className="px-6 py-4 text-right flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            {delivery.status === 'In Transit' && (
                              <button
                                onClick={() => handleStatusUpdate(delivery.id, delivery.destination)}
                                className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all"
                              >
                                Tandai Sampai
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setActiveEditSJ(delivery);
                                setEditForm({
                                  status: delivery.status,
                                  reject_qty: delivery.reject_qty || 0,
                                  reject_notes: delivery.reject_notes || ''
                                });
                              }}
                              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all flex items-center"
                            >
                              <Edit2 size={12} className="mr-1" /> Edit
                            </button>
                          </div>
                          {delivery.reject_qty > 0 && (
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                              Reject: {delivery.reject_qty} Pcs
                            </span>
                          )}
                          {delivery.status === 'Delivered' && !delivery.reject_qty && (
                            <span className="text-[10px] font-bold text-slate-400 flex justify-end items-center">
                              <ShieldCheck size={14} className="mr-1 text-emerald-500" />
                              Siap di-QC
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {filteredDeliveries.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-16 text-center">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="size-14 bg-slate-50 rounded-full flex items-center justify-center">
                              {historyTab === 'repair'
                                ? <Wrench className="text-slate-300" size={22} />
                                : <FileText className="text-slate-300" size={22} />
                              }
                            </div>
                            <p className="text-slate-400 text-sm font-semibold">
                              {historyTab === 'repair'
                                ? 'Belum ada Surat Jalan Repair.'
                                : historyTab === 'new'
                                  ? 'Belum ada Surat Jalan New Product.'
                                  : 'Belum ada riwayat pengiriman.'
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="border-t border-slate-100 bg-slate-50/60 px-8 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="size-2.5 rounded-full bg-indigo-500" />
                    <span className="font-medium text-slate-600">New Product: <strong className="text-slate-900">{newCount} SJ</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="size-2.5 rounded-full bg-orange-500" />
                    <span className="font-medium text-slate-600">Repair: <strong className="text-slate-900">{repairCount} SJ</strong></span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total: {(deliveries || []).length} Surat Jalan
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit SJ Modal */}
      <AnimatePresence>
        {activeEditSJ && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-1 text-slate-400">
                    Edit Surat Jalan
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    SJ-{activeEditSJ.id.toString().padStart(4, '0')}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveEditSJ(null)}
                  className="text-slate-400 hover:text-slate-600 bg-white size-8 rounded-full border border-slate-200 flex items-center justify-center transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Status Pengiriman</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3 font-bold outline-none text-slate-700"
                  >
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Jumlah Reject / Return</label>
                  <input
                    type="number" min="0" max={activeEditSJ.quantity}
                    value={editForm.reject_qty}
                    onChange={(e) => setEditForm({ ...editForm, reject_qty: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 rounded-2xl p-3 font-bold outline-none"
                  />
                  <p className="text-[10px] text-slate-400 font-medium ml-1">Max: {activeEditSJ.quantity} Pcs</p>
                </div>

                {editForm.reject_qty > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Catatan Reject</label>
                    <textarea
                      required
                      placeholder="e.g. Barang penyok di perjalanan..."
                      value={editForm.reject_notes}
                      onChange={(e) => setEditForm({ ...editForm, reject_notes: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 rounded-2xl p-3 font-medium outline-none resize-none h-24 text-sm"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 text-white font-bold py-3.5 rounded-2xl transition-all mt-4"
                >
                  Simpan Perubahan
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeliveryPage;
