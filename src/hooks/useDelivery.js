import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as deliveryService from '../services/deliveryService';

export const useDelivery = () => {
  const queryClient = useQueryClient();

  const deliveriesQuery = useQuery({
    queryKey: ['deliveries'],
    queryFn: deliveryService.getDeliveries,
  });

  const createMutation = useMutation({
    mutationFn: deliveryService.createDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => deliveryService.updateDelivery(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });

  return {
    deliveries: deliveriesQuery.data || [],
    isLoading: deliveriesQuery.isLoading,
    createDelivery: createMutation.mutateAsync,
    updateDelivery: updateMutation.mutateAsync,
  };
};
