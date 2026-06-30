import { _reduceInventoryInternal as reduceInventory } from './inventoryService';

const DEFAULT_DELIVERIES = [];

const loadDeliveries = () => {
  const data = localStorage.getItem('takura_deliveries');
  if (!data) {
    localStorage.setItem('takura_deliveries', JSON.stringify(DEFAULT_DELIVERIES));
    return DEFAULT_DELIVERIES;
  }
  return JSON.parse(data);
};

let deliveries = loadDeliveries();

const saveDeliveries = () => {
  localStorage.setItem('takura_deliveries', JSON.stringify(deliveries));
};

export const getDeliveries = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  deliveries = loadDeliveries();
  return [...deliveries];
};

export const getDeliveryById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  deliveries = loadDeliveries();
  return deliveries.find(d => d.id === id);
};

export const createDelivery = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  deliveries = loadDeliveries();
  
  // Cut inventory first
  const success = reduceInventory(data.productId, data.quantity);
  if (!success) {
    throw new Error('Stok tidak mencukupi');
  }

  // Then we need to find the product name (dirty way just for mock)
  const inventory = JSON.parse(localStorage.getItem('takura_inventory') || '[]');
  const product = inventory.find(i => i.id === data.productId) || { name: 'Unknown Product' };

  const newDelivery = {
    id: deliveries.length > 0 ? Math.max(...deliveries.map(d => d.id)) + 1 : 101,
    product_id: data.productId,
    product_name: product.name,
    quantity: data.quantity,
    destination: data.destination,
    status: 'In Transit',
    type: data.type || 'NEW',
    date: new Date().toISOString().split('T')[0]
  };

  deliveries.unshift(newDelivery);
  saveDeliveries();
  return newDelivery;
};

export const updateDelivery = async (id, data) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  deliveries = loadDeliveries();
  deliveries = deliveries.map(d => d.id === id ? { ...d, ...data } : d);
  saveDeliveries();
  return { id, ...data };
};
