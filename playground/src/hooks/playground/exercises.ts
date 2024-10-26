import type { Exercise } from "@/model/exercise";
import type { DataMode } from "@/model/data_mode";

import { UseQueryOptions, useQuery } from "react-query";
import baseUrl from "@/helpers/base_url";
import { useBaseInfo } from "@/hooks/base_info_context";

export async function fetchExercises(dataMode: DataMode) {
  const response = await fetch(`${baseUrl}/api/data/${dataMode}/exercises`);
  return await response.json() as Promise<Exercise[]>;
}

// Fetches Exercises with Submissions and CategorizedFeedbacks
export async function fetchExercisesEager(dataMode: DataMode) {
  const response = await fetch(`${baseUrl}/api/data/${dataMode}/exercises_eager`);
  return await response.json() as Promise<Exercise[]>;
}

export async function fetchExpertEvaluationExercisesEager(
  dataMode: DataMode,
  expertEvaluationId: string
) {

  const response = await fetch(`${baseUrl}/api/data/${dataMode}/expert_evaluation/${expertEvaluationId}/exercises`);
  return await response.json() as Promise<Exercise[]>;
}

/**
 * Fetches the exercises of the playground.
 * 
 * @example
 * const { data, isLoading, error } = useExercises();
 * 
 * @param options The react-query options.
 */
export default function useExercises(
  options: Omit<UseQueryOptions<Exercise[], Error, Exercise[]>, 'queryFn'> & { eager?: boolean } = {},
) {
  const { dataMode } = useBaseInfo();
  const isEager = options.eager ?? false;

  return useQuery({
    queryKey: ["exercises", dataMode],
    queryFn: async () => {
      if (isEager) {
        return await fetchExercisesEager(dataMode);
      }
      return await fetchExercises(dataMode);
    },
    ...options
  });
}
