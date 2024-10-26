import { DataMode } from "@/model/data_mode";
import baseUrl from "@/helpers/base_url";
import { Metric } from "@/model/metric";

export async function fetchMetrics(
  dataMode: DataMode,
  expertEvaluationId: string
) {
  const response = await fetch(`${baseUrl}/api/data/${dataMode}/expert_evaluation/${expertEvaluationId}/metrics`);

  return await response.json() as Promise<Metric[]>;
}
