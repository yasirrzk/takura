import { useState } from 'react';
import { useProduction } from '../../hooks/useProduction';
import { ClipboardCheck, AlertTriangle, CheckCircle } from 'lucide-react';

const ProductionMonitorPage = () => {
  const { plans, isLoading, submitQC } = useProduction();
  const [activeQCPlan, setActiveQCPlan] = useState(null);
  const [qcData, setQcData] = useState({ ok_quantity: 0, ng_quantity: 0 });

  const activePlans = plans.filter(p => p.status === 'In Progress');

  const handleQCSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitQC({ id: activeQCPlan.id, qcData });
      setActiveQCPlan(null);
      setQcData({ ok_quantity: 0, ng_quantity: 0 });
      alert('Data QC berhasil disimpan. Stok telah diperbarui.');
    } catch (error) {
      console.error('Failed to submit QC', error);
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Monitoring Produksi & QC</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Production List */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ClipboardCheck size={20} className="mr-2 text-blue-600" />
            Produksi Berjalan
          </h2>
          <div className="space-y-4">
            {activePlans.length === 0 ? (
              <div className="bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                Tidak ada produksi yang sedang berjalan.
              </div>
            ) : (
              activePlans.map(plan => (
                <div key={plan.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{plan.product_name}</h3>
                      <p className="text-sm text-gray-500">Target: {plan.target_quantity} Pcs</p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                      In Progress
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveQCPlan(plan)}
                    className="w-full mt-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    Input Hasil QC
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* QC Form Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle size={20} className="mr-2 text-green-600" />
            Form Quality Control
          </h2>
          {activeQCPlan ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <p className="text-sm text-gray-500">Input hasil untuk:</p>
                <h3 className="text-xl font-bold text-gray-800">{activeQCPlan.product_name}</h3>
              </div>
              
              <form onSubmit={handleQCSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">Jumlah OK (Lolos)</label>
                    <input 
                      type="number" required
                      value={qcData.ok_quantity}
                      onChange={(e) => setQcData({...qcData, ok_quantity: parseInt(e.target.value)})}
                      className="w-full border border-green-200 bg-green-50 rounded-md p-2 text-green-900 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">Jumlah NG (Gagal)</label>
                    <input 
                      type="number" required
                      value={qcData.ng_quantity}
                      onChange={(e) => setQcData({...qcData, ng_quantity: parseInt(e.target.value)})}
                      className="w-full border border-red-200 bg-red-50 rounded-md p-2 text-red-900 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-start text-sm text-gray-600">
                  <AlertTriangle size={18} className="mr-2 text-amber-500 flex-shrink-0" />
                  <p>Menyimpan hasil QC akan otomatis <strong>mengurangi stok bahan baku</strong> dan <strong>menambah stok barang jadi</strong>.</p>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setActiveQCPlan(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-bold"
                  >
                    Selesaikan Produksi
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-100 p-10 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
              Pilih produksi di sebelah kiri untuk menginput hasil QC.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionMonitorPage;
