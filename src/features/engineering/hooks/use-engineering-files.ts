import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { engineeringApi } from '../api/engineering.api';
import { EngineeringFile } from '../types/engineering-file';

const LIST_KEY = ['engineering-files'];

export const useEngineeringFiles = () => {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: ({ signal }) => engineeringApi.list(signal),
    staleTime: 1000 * 60 * 5,
    refetchInterval: (query) => {
      const data = query.state.data as EngineeringFile[] | undefined;
      const hasProcessing = data?.some((f) => f.status === 'PROCESSING');
      return hasProcessing ? 2000 : false;
    },
  });
};

export const useUploadEngineeringFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: engineeringApi.upload,
    onSuccess: (newFile) => {
      queryClient.setQueryData(LIST_KEY, (old: EngineeringFile[] = []) => [
        newFile,
        ...old,
      ]);
    },
  });
};

export const useDeleteEngineeringFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: engineeringApi.remove,
    onSuccess: (_data, id) => {
      queryClient.setQueryData(LIST_KEY, (old: EngineeringFile[] = []) =>
        old.filter((f) => f.id !== id),
      );
    },
  });
};