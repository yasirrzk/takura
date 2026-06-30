import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as materialService from '../services/materialService';

export const useMaterials = () => {
  const queryClient = useQueryClient();

  const materialsQuery = useQuery({
    queryKey: ['materials'],
    queryFn: materialService.getMaterials,
  });

  const createMutation = useMutation({
    mutationFn: materialService.createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => materialService.updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: materialService.deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const createLogMutation = useMutation({
    mutationFn: materialService.createMaterialLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  return {
    materials: materialsQuery.data || [],
    isLoading: materialsQuery.isLoading,
    isError: materialsQuery.isError,
    createMaterial: createMutation.mutateAsync,
    updateMaterial: updateMutation.mutateAsync,
    deleteMaterial: deleteMutation.mutateAsync,
    createMaterialLog: createLogMutation.mutateAsync,
  };
};
