import { _updateStockInternal as updateMaterialStock } from './materialService';
import { _addFinishedGoodsInternal as addFinishedGoods } from './finishedGoodsService';

// Mock database for Production Plans with localStorage persistence and rich mock data
const DEFAULT_PRODUCTION_PLANS = [
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
  { 
    id: 3, 
    product_name: 'Kursi Bakso', 
    target_quantity: 120, 
    material_id: 3, 
    material_requirement: 120,
    status: 'Completed',
    qc_results: {
      ok_quantity: 115,
      ng_quantity: 5
    }
  }
];

const loadProductionPlans = () => {
  const data = localStorage.getItem('takura_production_plans');
  if (!data) {
    localStorage.setItem('takura_production_plans', JSON.stringify(DEFAULT_PRODUCTION_PLANS));
    return DEFAULT_PRODUCTION_PLANS;
  }
  return JSON.parse(data);
};

let productionPlans = loadProductionPlans();

const saveProductionPlans = () => {
  localStorage.setItem('takura_production_plans', JSON.stringify(productionPlans));
};

export const getProductionPlans = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  productionPlans = loadProductionPlans();
  return [...productionPlans];
};

export const getRejectedTotal = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  productionPlans = loadProductionPlans();
  return productionPlans.reduce((acc, p) => acc + (p.qc_results?.ng_quantity || 0), 0);
};

export const createProductionPlan = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  productionPlans = loadProductionPlans();
  const newPlan = {
    ...data,
    id: productionPlans.length > 0 ? Math.max(...productionPlans.map(p => p.id)) + 1 : 1
  };
  productionPlans.push(newPlan);
  saveProductionPlans();
  return newPlan;
};

export const updateProductionStatus = async (id, status) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  productionPlans = loadProductionPlans();
  productionPlans = productionPlans.map(p => p.id === id ? { ...p, status } : p);
  saveProductionPlans();
  return { id, status };
};

export const submitQC = async (id, qcData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  productionPlans = loadProductionPlans();
  
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
    
    saveProductionPlans();
  }
  
  return { id, success: true };
};
