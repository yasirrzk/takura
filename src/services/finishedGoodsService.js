// Mock database for Finished Goods
let finishedGoods = [
  { id: 1, name: 'Ember Plastik 5L', stock: 150 },
  { id: 2, name: 'Kursi Bakso', stock: 75 },
];

// Mock database for Shipment History
let shipmentHistory = [
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

export const getFinishedGoods = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...finishedGoods];
};

export const getShipmentHistory = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...shipmentHistory];
};

export const shipFinishedGoods = async (id, data) => {
  // data: { quantity, destination }
  await new Promise(resolve => setTimeout(resolve, 500));
  const product = finishedGoods.find(p => p.id === id);
  if (product) {
    product.stock -= data.quantity;
    
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
    return newShipment;
  }
  throw new Error('Product not found');
};

export const updateShipmentStatus = async (id, status) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  shipmentHistory = shipmentHistory.map(s => s.id === id ? { ...s, status } : s);
  return { id, status };
};

// Internal helper for production QC trigger
export const _addFinishedGoodsInternal = (name, quantity) => {
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
};
