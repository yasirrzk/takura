import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as qcService from '../services/qcService';

export const useQC = () => {
  const queryClient = useQueryClient();

  const qcLogsQuery = useQuery({
    queryKey: ['qc-logs'],
    queryFn: qcService.getQCLogs,
  });

  const submitInspectionMutation = useMutation({
    mutationFn: qcService.submitQCInspection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qc-logs'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['repairs'] }); // NG items create repair entries
    },
  });

  return {
    qcLogs: qcLogsQuery.data || [],
    isLoading: qcLogsQuery.isLoading,
    submitInspection: submitInspectionMutation.mutateAsync,
    isSubmitting: submitInspectionMutation.isPending,
  };
};
