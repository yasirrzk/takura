import { useState } from 'react';
import { useProduction } from '../../hooks/useProduction';
import { useMaterials } from '../../hooks/useMaterials';
import { Plus, Clock, Play, CheckCircle2 } from 'lucide-react';

const ProductionPlanPage = () => {
  const { plans, isLoading: plansLoading, createPlan, updateStatus } = useProduction();
  const { materials, isLoading: materialsLoading } = useMaterials();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    product_name: '', 
    target_quantity: 0, 
    material_id: '',
    material_requirement: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Check if material stock is enough
    const selectedMaterial = materials.find(m => m.id === parseInt(formData.material_id));
    if (selectedMaterial && selectedMaterial.stock < formData.material_requirement) {
      alert(`Stok ${selectedMaterial.name} tidak mencukupi! (Tersedia: ${selectedMaterial.stock})`);
      return;
    }

    try {
      await createPlan({
        ...formData,
        status: 'Scheduled'
      });
      setFormData({ product_name: '', target_quantity: 0, material_id: '', material_requirement: 0 });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to create plan', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold uppercase">Scheduled</span>;
      case 'In Progress': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">In Progress</span>;
      case 'Completed': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Completed</span>;
      default: return null;
    }
  };

  if (plansLoading || materialsLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">PPIC Planning</h1>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" />
          Buat Rencana Baru
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">Buat Rencana Produksi</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Produk Jadi</label>
              <input 
                type="text" required
                value={formData.product_name}
                onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Produksi (Pcs)</label>
              <input 
                type="number" required
                value={formData.target_quantity}
                onChange={(e) => setFormData({...formData, target_quantity: parseInt(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pilih Bahan Baku</label>
              <select 
                required
                value={formData.material_id}
                onChange={(e) => setFormData({...formData, material_id: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">-- Pilih --</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.name} (Stok: {m.stock})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kebutuhan Bahan</label>
              <input 
                type="number" required
                value={formData.material_requirement}
                onChange={(e) => setFormData({...formData, material_requirement: parseInt(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Simpan Rencana
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Produk</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Target</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Bahan Baku</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {plans.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Belum ada rencana produksi.</td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{plan.product_name}</td>
                  <td className="px-6 py-4">{plan.target_quantity} Pcs</td>
                  <td className="px-6 py-4">
                    {materials.find(m => m.id === plan.material_id)?.name || 'Unknown'} 
                    <span className="text-gray-400 text-xs ml-1">({plan.material_requirement})</span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(plan.status)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {plan.status === 'Scheduled' && (
                      <button 
                        onClick={() => updateStatus({ id: plan.id, status: 'In Progress' })}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center text-sm font-medium"
                      >
                        <Play size={16} className="mr-1" /> Mulai
                      </button>
                    )}
                    {plan.status === 'In Progress' && (
                      <span className="text-gray-400 text-sm italic">Dalam Produksi...</span>
                    )}
                    {plan.status === 'Completed' && (
                      <CheckCircle2 size={18} className="text-green-600 ml-auto" />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductionPlanPage;
