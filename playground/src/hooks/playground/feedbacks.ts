import { UseQueryOptions, useQuery } from "react-query";
import baseUrl from "@/helpers/base_url";
import { Exercise } from "@/model/exercise";
import Feedback from "@/model/feedback";
import { useBaseInfo } from "@/hooks/base_info_context";
import { Submission } from "@/model/submission";

/**
 * Fetches the feedbacks (for an exercise) of the playground.
 * 
 * @example
 * const { data, isLoading, error } = useFeedbacks(exercise);
 * 
 * @param exercise The exercise to fetch the feedbacks for.
 * @param submission The submission to fetch the feedbacks for.
 * @param options The react-query options.
 */
export default function useFeedbacks(
  exercise?: Exercise,
  submission?: Submission,
  options: Omit<UseQueryOptions<Feedback[], Error, Feedback[]>, 'queryFn'> = {}
) {
  const { dataMode } = useBaseInfo();

  return useQuery({
    queryKey: ["feedbacks", dataMode, exercise?.id, submission?.id],
    queryFn: async () => {
      const url = `${baseUrl}/api/mode/${dataMode}/${exercise ? `exercise/${exercise.id}/` : ""}feedbacks`;
      const response = await fetch(url);
      const feedbacks = await response.json() as Feedback[];
      if (submission) {
        return feedbacks.filter((feedback) => feedback.submission_id === submission.id);
      }
      return feedbacks;
    },
    ...options
  });
}