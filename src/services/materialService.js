// Mock database for Materials
let materials = [
  { id: 1, name: 'Biji Plastik HDPE', stock: 500, unit: 'kg' },
  { id: 2, name: 'Pewarna Biru', stock: 50, unit: 'kg' },
  { id: 3, name: 'Kardus Packing', stock: 1000, unit: 'pcs' },
];

export const getMaterials = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...materials];
};

export const createMaterial = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newMaterial = {
    ...data,
    id: materials.length > 0 ? Math.max(...materials.map(m => m.id)) + 1 : 1
  };
  materials.push(newMaterial);
  return newMaterial;
};

export const updateMaterial = async (id, data) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  materials = materials.map(m => m.id === id ? { ...m, ...data } : m);
  return { id, ...data };
};

export const deleteMaterial = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  materials = materials.filter(m => m.id !== id);
  return { success: true };
};

// Internal helper for other mock services to simulate stock changes
export const _updateStockInternal = (id, change) => {
  const material = materials.find(m => m.id === id);
  if (material) {
    material.stock += change;
  }
};
