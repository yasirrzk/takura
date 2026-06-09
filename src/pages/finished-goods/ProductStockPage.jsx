import { useState } from 'react';
import { useFinishedGoods } from '../../hooks/useFinishedGoods';
import { Send, PackageCheck, History, X, MapPin, Truck, CheckCircle2 } from 'lucide-react';

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
      alert('Jumlah pengiriman melebihi stok yang ada!');
      return;
    }

    try {
      await shipProduct({ 
        id: activeShipping.id, 
        data: { 
          quantity: shipFormData.quantity, 
          destination: shipFormData.destination 
        } 
      });
      setActiveShipping(null);
      setShipFormData({ quantity: 0, destination: '' });
      alert('Pengiriman berhasil dicatat dan sedang dalam perjalanan.');
    } catch (error) {
      console.error('Failed to ship product', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Transit': 
        return <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold uppercase"><Truck size={14} className="mr-1"/> In Transit</span>;
      case 'Delivered': 
        return <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold uppercase"><CheckCircle2 size={14} className="mr-1"/> Delivered</span>;
      default: return null;
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gudang Barang Jadi</h1>
        <button 
          onClick={() => setShowHistory(true)}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition shadow-sm"
        >
          <History size={18} className="mr-2 text-blue-600" />
          Riwayat & Tracking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                  <PackageCheck size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{product.stock} <span className="text-sm font-normal text-gray-500 uppercase">Pcs</span></span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Stok siap kirim</p>
              
              <button 
                onClick={() => setActiveShipping(product)}
                className="w-full bg-blue-50 text-blue-600 border border-blue-100 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition font-semibold flex items-center justify-center"
              >
                <Send size={18} className="mr-2" />
                Kirim Barang
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping Modal */}
      {activeShipping && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Form Pengiriman</h2>
              <button onClick={() => setActiveShipping(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleShip} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produk</label>
                <input type="text" disabled value={activeShipping.name} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tersedia</label>
                  <input type="text" disabled value={`${activeShipping.stock} Pcs`} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Kirim</label>
                  <input 
                    type="number" required min="1"
                    value={shipFormData.quantity}
                    onChange={(e) => setShipFormData({...shipFormData, quantity: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan / Nama Customer</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type="text" required
                    placeholder="Contoh: Toko Berkah"
                    value={shipFormData.destination}
                    onChange={(e) => setShipFormData({...shipFormData, destination: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition mt-4"
              >
                Konfirmasi & Kirim Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History & Tracking Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center">
                <History className="text-blue-600 mr-2" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Riwayat Pengiriman & Tracking</h2>
              </div>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white border-b border-gray-200">
                  <tr>
                    <th className="pb-3 text-sm font-semibold text-gray-500">Tanggal</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500">Produk</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500">Jumlah</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500">Tujuan</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500">Status</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shipmentHistory.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="py-4 text-sm text-gray-600">{shipment.date}</td>
                      <td className="py-4 font-medium text-gray-800">{shipment.product_name}</td>
                      <td className="py-4 text-sm text-gray-600">{shipment.quantity} Pcs</td>
                      <td className="py-4 text-sm text-gray-600">
                        <div className="flex items-center italic">
                          <MapPin size={14} className="mr-1 text-gray-400" />
                          {shipment.destination}
                        </div>
                      </td>
                      <td className="py-4">{getStatusBadge(shipment.status)}</td>
                      <td className="py-4 text-right">
                        {shipment.status === 'In Transit' && (
                          <button 
                            onClick={() => updateShipmentStatus({ id: shipment.id, status: 'Delivered' })}
                            className="bg-green-600 text-white text-xs font-bold py-1 px-3 rounded hover:bg-green-700 transition"
                          >
                            Tandai Sampai
                          </button>
                        )}
                        {shipment.status === 'Delivered' && (
                          <span className="text-xs text-green-600 font-medium">Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {shipmentHistory.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-gray-400">Belum ada riwayat pengiriman.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductStockPage;
