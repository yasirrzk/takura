// Mock database for Finished Goods and Shipments with localStorage persistence
const DEFAULT_FINISHED_GOODS = [
  { id: 1, name: 'Ember Plastik 5L', stock: 150 },
  { id: 2, name: 'Kursi Bakso', stock: 75 },
];

const DEFAULT_SHIPMENT_HISTORY = [
  { 
    id: 101, 
    product_name: 'Ember Plastik 5L', 
    quantity: 50, 
    destination: 'Toko Maju Jaya', 
    status: 'Delivered', 
    date: '2026-06-01' 
  },
  { 
    id: 102, 
    product_name: 'Kursi Bakso', 
    quantity: 25, 
    destination: 'CV Berkah', 
    status: 'In Transit', 
    date: '2026-06-08' 
  },
];

const loadFinishedGoods = () => {
  const data = localStorage.getItem('takura_finished_goods');
  if (!data) {
    localStorage.setItem('takura_finished_goods', JSON.stringify(DEFAULT_FINISHED_GOODS));
    return DEFAULT_FINISHED_GOODS;
  }
  return JSON.parse(data);
};

const loadShipmentHistory = () => {
  const data = localStorage.getItem('takura_shipment_history');
  if (!data) {
    localStorage.setItem('takura_shipment_history', JSON.stringify(DEFAULT_SHIPMENT_HISTORY));
    return DEFAULT_SHIPMENT_HISTORY;
  }
  return JSON.parse(data);
};

let finishedGoods = loadFinishedGoods();
let shipmentHistory = loadShipmentHistory();

const saveFinishedGoods = () => {
  localStorage.setItem('takura_finished_goods', JSON.stringify(finishedGoods));
};

const saveShipmentHistory = () => {
  localStorage.setItem('takura_shipment_history', JSON.stringify(shipmentHistory));
};

export const getFinishedGoods = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  finishedGoods = loadFinishedGoods();
  return [...finishedGoods];
};

export const getShipmentHistory = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  shipmentHistory = loadShipmentHistory();
  return [...shipmentHistory];
};

export const shipFinishedGoods = async (id, data) => {
  // data: { quantity, destination }
  await new Promise(resolve => setTimeout(resolve, 300));
  finishedGoods = loadFinishedGoods();
  shipmentHistory = loadShipmentHistory();

  const product = finishedGoods.find(p => p.id === id);
  if (product) {
    product.stock -= data.quantity;
    saveFinishedGoods();
    
    // Record in history
    const newShipment = {
      id: shipmentHistory.length > 0 ? Math.max(...shipmentHistory.map(s => s.id)) + 1 : 101,
      product_name: product.name,
      quantity: data.quantity,
      destination: data.destination || 'Customer',
      status: 'In Transit',
      date: new Date().toISOString().split('T')[0]
    };
    shipmentHistory.unshift(newShipment);
    saveShipmentHistory();
    return newShipment;
  }
  throw new Error('Product not found');
};

export const updateShipmentStatus = async (id, status) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  shipmentHistory = loadShipmentHistory();
  shipmentHistory = shipmentHistory.map(s => s.id === id ? { ...s, status } : s);
  saveShipmentHistory();
  return { id, status };
};

// Internal helper for production QC trigger
export const _addFinishedGoodsInternal = (name, quantity) => {
  finishedGoods = loadFinishedGoods();
  const existing = finishedGoods.find(p => p.name === name);
  if (existing) {
    existing.stock += quantity;
  } else {
    finishedGoods.push({
      id: finishedGoods.length > 0 ? Math.max(...finishedGoods.map(p => p.id)) + 1 : 1,
      name,
      stock: quantity
    });
  }
  saveFinishedGoods();
};
