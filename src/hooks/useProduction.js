import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productionService from '../services/productionService';

export const useProduction = () => {
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: ['production-plans'],
    queryFn: productionService.getProductionPlans,
  });

  const rejectedQuery = useQuery({
    queryKey: ['rejected-total'],
    queryFn: productionService.getRejectedTotal,
  });

  const createMutation = useMutation({
    mutationFn: productionService.createProductionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-plans'] });
      queryClient.invalidateQueries({ queryKey: ['rejected-total'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => productionService.updateProductionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-plans'] });
    },
  });

  const qcMutation = useMutation({
    mutationFn: ({ id, qcData }) => productionService.submitQC(id, qcData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-plans'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] }); // Trigger material stock update
      queryClient.invalidateQueries({ queryKey: ['finished-goods'] }); // Trigger product stock update
      queryClient.invalidateQueries({ queryKey: ['rejected-total'] });
    },
  });

  return {
    plans: plansQuery.data || [],
    rejectedTotal: rejectedQuery.data || 0,
    isLoading: plansQuery.isLoading || rejectedQuery.isLoading,
    createPlan: createMutation.mutateAsync,
    updateStatus: statusMutation.mutateAsync,
    submitQC: qcMutation.mutateAsync,
  };
};
