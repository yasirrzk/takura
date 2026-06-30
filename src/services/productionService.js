import { _updateStockInternal as updateMaterialStock } from './materialService';
import { _addInventoryInternal as addInventory } from './inventoryService';

const DEFAULT_PRODUCTION_PLANS = [];

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
  // We can just return a dummy 0 or calculate it from QC if we want
  return 0;
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

export const finishProduction = async (id, outputQuantity) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  productionPlans = loadProductionPlans();
  
  const plan = productionPlans.find(p => p.id === id);
  if (plan) {
    // 1. Cut material stock
    updateMaterialStock(plan.material_id, -plan.material_requirement);
    
    // 2. Add to Inventory (Finished Goods)
    addInventory(plan.product_name, outputQuantity);
    
    // 3. Update status to completed
    plan.status = 'Completed';
    plan.final_output = outputQuantity;
    saveProductionPlans();
  }
  
  return { success: true };
};
