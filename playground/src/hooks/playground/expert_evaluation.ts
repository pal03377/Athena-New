import base_url from "@/helpers/base_url";
import { useMutation, UseMutationOptions } from "react-query";

export default function useDownloadExpertEvaluationData(
  options: Omit<
    UseMutationOptions<Blob, { status: number; message: string }, { configId: string; secret: string }>,
    "mutationFn"
  > = {}
) {
  return useMutation({
    mutationFn: async ({ configId, secret }) => {
      const response = await fetch(
        `${base_url}/api/data/evaluation/expert_evaluation/${configId}/export`,
        {
          method: "GET",
          headers: {
            Authorization: `${secret}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw { status: response.status, message: errorData.error || "Failed to download data" };
      }

      return response.blob();
    },
    ...options,
  });
}