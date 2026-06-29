// Mock database for Materials with localStorage persistence
const DEFAULT_MATERIALS = [
  { id: 1, name: 'Biji Plastik HDPE', stock: 500, unit: 'kg' },
  { id: 2, name: 'Pewarna Biru', stock: 50, unit: 'kg' },
  { id: 3, name: 'Kardus Packing', stock: 1000, unit: 'pcs' },
];

const loadMaterials = () => {
  const data = localStorage.getItem('takura_materials');
  if (!data) {
    localStorage.setItem('takura_materials', JSON.stringify(DEFAULT_MATERIALS));
    return DEFAULT_MATERIALS;
  }
  return JSON.parse(data);
};

let materials = loadMaterials();

const saveMaterials = () => {
  localStorage.setItem('takura_materials', JSON.stringify(materials));
};

export const getMaterials = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  materials = loadMaterials(); // reload to get latest updates
  return [...materials];
};

export const createMaterial = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  materials = loadMaterials();
  const newMaterial = {
    ...data,
    id: materials.length > 0 ? Math.max(...materials.map(m => m.id)) + 1 : 1
  };
  materials.push(newMaterial);
  saveMaterials();
  return newMaterial;
};

export const updateMaterial = async (id, data) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  materials = loadMaterials();
  materials = materials.map(m => m.id === id ? { ...m, ...data } : m);
  saveMaterials();
  return { id, ...data };
};

export const deleteMaterial = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  materials = loadMaterials();
  materials = materials.filter(m => m.id !== id);
  saveMaterials();
  return { success: true };
};

// Internal helper for other mock services to simulate stock changes
export const _updateStockInternal = (id, change) => {
  materials = loadMaterials();
  const material = materials.find(m => m.id === id);
  if (material) {
    material.stock += change;
    saveMaterials();
  }
};
