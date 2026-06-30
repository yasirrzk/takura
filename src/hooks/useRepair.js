import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as repairService from '../services/repairService';

export const useRepair = () => {
  const queryClient = useQueryClient();

  const repairsQuery = useQuery({
    queryKey: ['repairs'],
    queryFn: repairService.getRepairs,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => repairService.updateRepair(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] }); // Fixed items go to inventory
    },
  });

  return {
    repairs: repairsQuery.data || [],
    isLoading: repairsQuery.isLoading,
    updateRepair: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
