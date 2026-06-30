import { useQuery } from '@tanstack/react-query';
import { getInventory } from '../services/inventoryService';

export const useInventory = () => {
  const inventoryQuery = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventory,
  });

  return {
    inventory: inventoryQuery.data || [],
    isLoading: inventoryQuery.isLoading,
  };
};
