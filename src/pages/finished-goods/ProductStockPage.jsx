import { useState } from 'react';
import { useFinishedGoods } from '../../hooks/useFinishedGoods';
import { Send, PackageCheck, History, X, MapPin, Truck, CheckCircle2, ShieldCheck, Search, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ProductStockPage = () => {
  const { 
    products, 
    isLoading, 
    shipmentHistory, 
    shipProduct, 
    updateShipmentStatus 
  } = useFinishedGoods();
  
  const [activeShipping, setActiveShipping] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [shipFormData, setShipFormData] = useState({ quantity: 0, destination: '' });

  const handleShip = async (e) => {
    e.preventDefault();
    if (shipFormData.quantity > activeShipping.stock) {
      toast.error('Gagal Mengirim', {
        description: `Stok tidak mencukupi! Ketersediaan saat ini hanya ${activeShipping.stock} Pcs.`
      });
      return;
    }

    const promise = shipProduct({ 
      id: activeShipping.id, 
      data: { 
        quantity: shipFormData.quantity, 
        destination: shipFormData.destination 
      } 
    });

    toast.promise(promise, {
      loading: 'Memproses pengiriman...',
      success: () => {
        setActiveShipping(null);
        setShipFormData({ quantity: 0, destination: '' });
        return 'Pengiriman berhasil dicatat dan dalam status In Transit';
      },
      error: 'Gagal memproses pengiriman',
    });
  };

  const handleStatusUpdate = async (id, destination) => {
    const promise = updateShipmentStatus({ id, status: 'Delivered' });

    toast.promise(promise, {
      loading: `Mengonfirmasi pengiriman ke ${destination}...`,
      success: `Pengiriman ke ${destination} dinyatakan sampai (Delivered)`,
      error: 'Gagal memperbarui status pengiriman',
    });
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

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="size-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse">Menyiapkan inventori barang jadi...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 mb-1">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Finished Goods</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gudang Barang Jadi</h1>
          <p className="text-slate-500 mt-1 font-medium">Pantau stok produk siap jual dan catat riwayat pengiriman.</p>
        </div>
        
        <button 
          onClick={() => setShowHistory(true)}
          className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl flex items-center font-bold shadow-sm hover:bg-slate-50 active:translate-y-0 hover:-translate-y-0.5 transition-all"
        >
          <History size={18} className="mr-2 text-indigo-600" />
          Riwayat & Tracking
        </button>
      </div>

      {/* Finished Goods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, idx) => (
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
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Product ID: FG-{product.id.toString().padStart(4, '0')}</p>
            </div>
            
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
              <button 
                onClick={() => {
                  setActiveShipping(product);
                  setShipFormData({ quantity: Math.min(10, product.stock), destination: '' });
                }}
                className="w-full bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white py-3 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center shadow-sm"
              >
                <Send size={16} className="mr-2" />
                Kirim Barang
              </button>
            </div>
          </motion.div>
        ))}
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
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Outbound Shipping</span>
                  <h2 className="text-xl font-bold text-slate-900">Form Pengiriman Barang</h2>
                </div>
                <button onClick={() => setActiveShipping(null)} className="text-slate-400 hover:text-slate-650 bg-white size-8 rounded-full border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleShip} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Produk Jadi</label>
                  <input type="text" disabled value={activeShipping.name} className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-3 text-slate-500 font-bold" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Stok Tersedia</label>
                    <input type="text" disabled value={`${activeShipping.stock} Pcs`} className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-3 text-slate-550 font-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-600 uppercase tracking-widest ml-1">Jumlah Kirim</label>
                    <input 
                      type="number" required min="1" max={activeShipping.stock}
                      value={shipFormData.quantity}
                      onChange={(e) => setShipFormData({...shipFormData, quantity: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3 font-bold outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-indigo-600 uppercase tracking-widest ml-1">Tujuan / Nama Customer</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-650 transition-colors" size={18} />
                    <input 
                      type="text" required
                      placeholder="e.g. PT Maju Sentosa / Toko Baru"
                      value={shipFormData.destination}
                      onChange={(e) => setShipFormData({...shipFormData, destination: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl p-3 pl-12 font-bold outline-none" 
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-slate-950/10 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-4"
                >
                  Konfirmasi & Kirim Sekarang
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History & Tracking Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                <div className="flex items-center space-x-3">
                  <div className="size-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <History size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Riwayat Pengiriman & Tracking</h2>
                    <p className="text-xs text-slate-450 font-bold uppercase tracking-tight">Real-time Delivery Logs</p>
                  </div>
                </div>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-650 bg-white size-8 rounded-full border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk Jadi</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kuantitas</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tujuan Pengiriman</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Logistik</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {shipmentHistory.map((shipment, idx) => (
                      <tr key={shipment.id} className="group hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{shipment.date}</td>
                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">{shipment.product_name}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {shipment.quantity} <span className="opacity-55 font-normal">Pcs</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-650">
                          <div className="flex items-center">
                            <MapPin size={12} className="mr-1 text-slate-400" />
                            {shipment.destination}
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(shipment.status)}</td>
                        <td className="px-6 py-4 text-right">
                          {shipment.status === 'In Transit' && (
                            <button 
                              onClick={() => handleStatusUpdate(shipment.id, shipment.destination)}
                              className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all shadow-sm shadow-green-600/10"
                            >
                              Tandai Sampai
                            </button>
                          )}
                          {shipment.status === 'Delivered' && (
                            <span className="text-xs text-green-500 font-bold bg-green-55/30 border border-green-100 px-2.5 py-1 rounded-xl">
                              Selesai
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {shipmentHistory.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="size-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                              <History className="text-slate-300" size={18} />
                            </div>
                            <p className="text-slate-400 text-sm font-semibold">Belum ada riwayat pengiriman.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductStockPage;
