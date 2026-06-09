import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as finishedGoodsService from '../services/finishedGoodsService';

export const useFinishedGoods = () => {
  const queryClient = useQueryClient();

  const finishedGoodsQuery = useQuery({
    queryKey: ['finished-goods'],
    queryFn: finishedGoodsService.getFinishedGoods,
  });

  const shipmentHistoryQuery = useQuery({
    queryKey: ['shipment-history'],
    queryFn: finishedGoodsService.getShipmentHistory,
  });

  const shipMutation = useMutation({
    mutationFn: ({ id, data }) => finishedGoodsService.shipFinishedGoods(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
      queryClient.invalidateQueries({ queryKey: ['shipment-history'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => finishedGoodsService.updateShipmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-history'] });
    },
  });

  return {
    products: finishedGoodsQuery.data || [],
    isLoading: finishedGoodsQuery.isLoading,
    shipmentHistory: shipmentHistoryQuery.data || [],
    isHistoryLoading: shipmentHistoryQuery.isLoading,
    shipProduct: shipMutation.mutateAsync,
    updateShipmentStatus: updateStatusMutation.mutateAsync,
  };
};
