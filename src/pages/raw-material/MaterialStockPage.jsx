import { useState } from 'react';
import { useMaterials } from '../../hooks/useMaterials';
import { Plus, Trash2, Edit } from 'lucide-react';

const MaterialStockPage = () => {
  const { materials, isLoading, createMaterial, deleteMaterial } = useMaterials();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', stock: 0, unit: 'kg' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaterial(formData);
      setFormData({ name: '', stock: 0, unit: 'kg' });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to create material', error);
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gudang Bahan Baku</h1>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" />
          Tambah Material
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">Tambah Material Baru</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Material</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stok Awal</label>
              <input 
                type="number" 
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Satuan</label>
              <select 
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="kg">kg</option>
                <option value="pcs">pcs</option>
                <option value="meter">meter</option>
                <option value="liter">liter</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
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
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Nama Material</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase text-center">Stok</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Satuan</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {materials.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">Belum ada data material.</td>
              </tr>
            ) : (
              materials.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.unit}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => deleteMaterial(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
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

export default MaterialStockPage;
