import type { ProgrammingSubmission } from "@/model/submission";
import { getOnFeedbackChange, type Feedback, getFeedbackReferenceType } from "@/model/feedback";

import CodeView from "@/components/details/code_view";
import InlineFeedback from "@/components/details/code_view/inline_feedback";

type ProgrammingSubmissionDetailProps = {
  submission: ProgrammingSubmission;
  feedbacks?: Feedback[];
  onFeedbacksChange?: (feedback: Feedback[]) => void;
};

export default function ProgrammingSubmissionDetail({
  submission,
  feedbacks,
  onFeedbacksChange,
}: ProgrammingSubmissionDetailProps) {
  const unreferencedFeedbacks = feedbacks?.filter((feedback) => getFeedbackReferenceType(feedback) === "unreferenced");
  return (
    <>
      <CodeView
        repository_url={submission.repository_url}
        feedbacks={feedbacks}
        onFeedbacksChange={onFeedbacksChange}
      />
      {((unreferencedFeedbacks && unreferencedFeedbacks.length > 0) || onFeedbacksChange) && (
        <div className="space-y-2 mt-5">
          <h3 className="ml-2 text-lg font-medium">Unreferenced Feedback</h3>
          {feedbacks?.map((feedback, index) => (
            getFeedbackReferenceType(feedback) === "unreferenced" && (
            <InlineFeedback
              key={feedback.id}
              feedback={feedback}
              onFeedbackChange={
                onFeedbacksChange &&
                getOnFeedbackChange(feedbacks, index, onFeedbacksChange)
              }
            />)
          ))}
          {onFeedbacksChange && (
            <button
              className="mx-2 my-1 border-2 border-primary-300 border-dashed text-primary-500 hover:text-primary-600 hover:bg-primary-50 hover:border-primary-400 rounded-lg font-medium max-w-3xl w-full py-2"
              onClick={() => {
                console.log("TODO: Add feedback");
              }}
            >
              Add feedback
            </button>
          )}
        </div>
      )}
    </>
  );
}
