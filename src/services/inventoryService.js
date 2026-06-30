const DEFAULT_INVENTORY = [];

const loadInventory = () => {
  const data = localStorage.getItem('takura_inventory');
  if (!data) {
    localStorage.setItem('takura_inventory', JSON.stringify(DEFAULT_INVENTORY));
    return DEFAULT_INVENTORY;
  }
  return JSON.parse(data);
};

let inventory = loadInventory();

const saveInventory = () => {
  localStorage.setItem('takura_inventory', JSON.stringify(inventory));
};

export const _addInventoryInternal = (name, quantity) => {
  inventory = loadInventory();
  const existing = inventory.find(i => i.name === name);
  if (existing) {
    existing.stock += quantity;
  } else {
    inventory.push({
      id: inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1,
      name,
      stock: quantity
    });
  }
  saveInventory();
};

export const _reduceInventoryInternal = (id, quantity) => {
  inventory = loadInventory();
  const item = inventory.find(i => i.id === id);
  if (item && item.stock >= quantity) {
    item.stock -= quantity;
    saveInventory();
    return true;
  }
  return false;
};

export const getInventory = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  inventory = loadInventory();
  return [...inventory];
};
