import { updateDelivery } from './deliveryService';
import { createRepair } from './repairService';

const DEFAULT_QC_LOGS = [];

const loadQCLogs = () => {
  const data = localStorage.getItem('takura_qc_logs');
  if (!data) {
    localStorage.setItem('takura_qc_logs', JSON.stringify(DEFAULT_QC_LOGS));
    return DEFAULT_QC_LOGS;
  }
  return JSON.parse(data);
};

const saveQCLogs = (logs) => {
  localStorage.setItem('takura_qc_logs', JSON.stringify(logs));
};

export const getQCLogs = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return loadQCLogs();
};

export const submitQCInspection = async (data) => {
  // data: { deliveryId, okQuantity, ngQuantity }
  await new Promise(resolve => setTimeout(resolve, 300));

  // 1. Get delivery info
  const deliveries = JSON.parse(localStorage.getItem('takura_deliveries') || '[]');
  const delivery = deliveries.find(d => d.id === data.deliveryId) || {};

  // 2. Mark delivery as QC Done
  await updateDelivery(data.deliveryId, {
    qc_status: 'Completed',
    ok_qty: data.okQuantity,
    ng_qty: data.ngQuantity
  });

  // 3. If there are NG items → create a Repair entry in Repair Workshop
  if (data.ngQuantity > 0) {
    await createRepair({
      delivery_id: data.deliveryId,
      product_id: delivery.product_id,
      product_name: delivery.product_name,
      ng_quantity: data.ngQuantity,
    });
  }

  // 4. Save QC log
  const logs = loadQCLogs();
  const newLog = {
    id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
    delivery_id: data.deliveryId,
    product_name: delivery.product_name,
    ok_quantity: data.okQuantity,
    ng_quantity: data.ngQuantity,
    date: new Date().toISOString().split('T')[0]
  };
  logs.push(newLog);
  saveQCLogs(logs);

  return { success: true, repairCreated: data.ngQuantity > 0 };
};
