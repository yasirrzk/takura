// Repair Workshop Service — Manages repair queue from QC NG items
import { _addInventoryInternal as addInventory } from './inventoryService';

const DEFAULT_REPAIRS = [];

const loadRepairs = () => {
  const data = localStorage.getItem('takura_repairs');
  if (!data) {
    localStorage.setItem('takura_repairs', JSON.stringify(DEFAULT_REPAIRS));
    return DEFAULT_REPAIRS;
  }
  return JSON.parse(data);
};

const saveRepairs = (repairs) => {
  localStorage.setItem('takura_repairs', JSON.stringify(repairs));
};

// Get all repair entries
export const getRepairs = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return loadRepairs();
};

// Create a new repair entry (called from QC when NG detected)
export const createRepair = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const repairs = loadRepairs();

  const newRepair = {
    id: repairs.length > 0 ? Math.max(...repairs.map(r => r.id)) + 1 : 1,
    delivery_id: data.delivery_id,
    product_id: data.product_id,
    product_name: data.product_name,
    ng_quantity: data.ng_quantity,
    fixed_quantity: 0,
    damage_notes: '',
    repair_notes: '',
    status: 'Antrean',          // 'Antrean' → 'Sedang Diperbaiki' → 'Selesai Diperbaiki'
    created_date: new Date().toISOString().split('T')[0],
    completed_date: null,
  };

  repairs.push(newRepair);
  saveRepairs(repairs);
  return newRepair;
};

// Update repair status & notes
export const updateRepair = async (id, data) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const repairs = loadRepairs();
  const idx = repairs.findIndex(r => r.id === id);

  if (idx !== -1) {
    repairs[idx] = { ...repairs[idx], ...data };

    // If status is 'Selesai Diperbaiki', auto-add to inventory
    if (data.status === 'Selesai Diperbaiki') {
      const fixedQty = data.fixed_quantity || repairs[idx].fixed_quantity || 0;
      repairs[idx].completed_date = new Date().toISOString().split('T')[0];
      repairs[idx].fixed_quantity = fixedQty;

      if (fixedQty > 0) {
        addInventory(repairs[idx].product_name, fixedQty);
      }
    }

    saveRepairs(repairs);
  }

  return { success: true };
};
