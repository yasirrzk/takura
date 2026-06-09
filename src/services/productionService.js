import { _updateStockInternal as updateMaterialStock } from './materialService';
import { _addFinishedGoodsInternal as addFinishedGoods } from './finishedGoodsService';

// Mock database for Production Plans
let productionPlans = [
  { 
    id: 1, 
    product_name: 'Ember Plastik 5L', 
    target_quantity: 100, 
    material_id: 1, 
    material_requirement: 50,
    status: 'Scheduled' 
  },
  { 
    id: 2, 
    product_name: 'Gayung Biru', 
    target_quantity: 200, 
    material_id: 2, 
    material_requirement: 10,
    status: 'In Progress' 
  },
];

export const getProductionPlans = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...productionPlans];
};

export const createProductionPlan = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newPlan = {
    ...data,
    id: productionPlans.length > 0 ? Math.max(...productionPlans.map(p => p.id)) + 1 : 1
  };
  productionPlans.push(newPlan);
  return newPlan;
};

export const updateProductionStatus = async (id, status) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  productionPlans = productionPlans.map(p => p.id === id ? { ...p, status } : p);
  return { id, status };
};

export const submitQC = async (id, qcData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const plan = productionPlans.find(p => p.id === id);
  if (plan) {
    // Core Logic Trigger:
    // 1. Reduce Material Stock
    updateMaterialStock(plan.material_id, -plan.material_requirement);
    
    // 2. Add to Finished Goods Stock (only OK quantity)
    addFinishedGoods(plan.product_name, qcData.ok_quantity);
    
    // 3. Complete the plan
    plan.status = 'Completed';
    plan.qc_results = qcData;
  }
  
  return { id, success: true };
};
