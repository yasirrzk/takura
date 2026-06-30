import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productionService from '../services/productionService';

export const useProduction = () => {
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: ['production-plans'],
    queryFn: productionService.getProductionPlans,
  });

  const createMutation = useMutation({
    mutationFn: productionService.createProductionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-plans'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => productionService.updateProductionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-plans'] });
    },
  });

  const finishMutation = useMutation({
    mutationFn: ({ id, outputQuantity }) => productionService.finishProduction(id, outputQuantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-plans'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] }); // Refresh inventory so DeliveryPage shows the new product
    },
  });

  return {
    plans: plansQuery.data || [],
    isLoading: plansQuery.isLoading,
    createPlan: createMutation.mutateAsync,
    updateStatus: statusMutation.mutateAsync,
    finishProduction: finishMutation.mutateAsync,
  };
};
