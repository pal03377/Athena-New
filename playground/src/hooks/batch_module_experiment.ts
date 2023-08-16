import type { Feedback } from "@/model/feedback";
import type { Submission } from "@/model/submission";
import type { Experiment } from "@/components/view_mode/evaluation_mode/define_experiment";

import { useEffect, useState } from "react";
import { useSendFeedbacks } from "./athena/send_feedbacks";
import useRequestSubmissionSelection from "./athena/request_submission_selection";
import useRequestFeedbackSuggestions from "./athena/request_feedback_suggestions";
import useSendSubmissions from "./athena/send_submissions";

export type ExperimentStep =
  | "sendingSubmissions"
  | "sendingTrainingFeedbacks"
  | "generatingFeedbackSuggestions"
  | "finished";

type BatchModuleExperimentState = {
  // The current step of the experiment
  step: ExperimentStep | undefined;
  // Submissions that have been sent to Athena
  didSendSubmissions: boolean;
  // Tutor feedbacks for training submissions that have been sent to Athena
  sentTrainingSubmissions: number[];
  // Feedback suggestions for evaluation submissions that have been generated by Athena
  // SubmissionId -> { suggestions: Feedback[]; meta: any;} where meta is the metadata of the request
  submissionsWithFeedbackSuggestions: Map<
    number,
    { suggestions: Feedback[]; meta: any }
  >;
};

export default function useBatchModuleExperiment(experiment: Experiment) {
  // State of the module experiment
  const [data, setData] = useState<BatchModuleExperimentState>({
    step: undefined, // Not started
    didSendSubmissions: false,
    sentTrainingSubmissions: [],
    submissionsWithFeedbackSuggestions: new Map(),
  });

  const [processingStep, setProcessingStep] = useState<
    ExperimentStep | undefined
  >(undefined);

  const startExperiment = () => {
    // Skip if the experiment has already started
    if (data.step !== undefined) {
      return;
    }

    setData((prevState) => ({
      ...prevState,
      step: "sendingSubmissions",
    }));
  };

  // Module requests
  const sendSubmissions = useSendSubmissions();
  const sendFeedbacks = useSendFeedbacks();
  const requestSubmissionSelection = useRequestSubmissionSelection();
  const requestFeedbackSuggestions = useRequestFeedbackSuggestions();

  // 1. Send submissions to Athena
  const stepSendSubmissions = () => {
    setProcessingStep("sendingSubmissions");
    console.log("Sending submissions to Athena...");
    sendSubmissions.mutate(
      {
        exercise: experiment.exercise,
        submissions: [
          ...(experiment.trainingSubmissions ?? []),
          ...experiment.evaluationSubmissions,
        ],
      },
      {
        onSuccess: () => {
          console.log("Sending submissions done!");
          setData((prevState) => ({
            ...prevState,
            step: "sendingTrainingFeedbacks", // next step
            didSendSubmissions: true,
          }));
        },
        onError: (error) => {
          console.error("Error while sending submissions to Athena:", error);
          // TODO: Recover?
        },
      }
    );
  };

  // 2. Send tutor feedbacks for training submissions to Athena
  const stepSendTrainingFeedbacks = async () => {
    setProcessingStep("sendingTrainingFeedbacks");
    // Skip if there are no training submissions
    if (!experiment.trainingSubmissions) {
      console.log("No training submissions, skipping");
      setData((prevState) => ({
        ...prevState,
        step: "generatingFeedbackSuggestions",
      }));
      return;
    }

    console.log("Sending training feedbacks to Athena...");

    const submissionsToSend = experiment.trainingSubmissions.filter(
      (submission) => !data.sentTrainingSubmissions.includes(submission.id)
    );

    let num = 0;
    for (const submission of submissionsToSend) {
      num += 1;
      const submissionFeedbacks = experiment.tutorFeedbacks.filter(
        (feedback) => feedback.submission_id === submission?.id
      );
      if (submissionFeedbacks.length === 0) {
        continue;
      }

      console.log(
        `Sending training feedbacks to Athena... (${num}/${submissionsToSend.length})`
      );

      try {
        await sendFeedbacks.mutateAsync({
          exercise: experiment.exercise,
          submission,
          feedbacks: submissionFeedbacks,
        });
        setData((prevState) => ({
          ...prevState,
          sentTrainingSubmissions: [
            ...prevState.sentTrainingSubmissions,
            submission.id,
          ],
        }));
      } catch (error) {
        console.error(
          `Sending training feedbacks for submission ${submission.id} failed with error:`,
          error
        );
      }
    }

    setData((prevState) => ({
      ...prevState,
      step: "generatingFeedbackSuggestions",
    }));
  };

  // 3. Generate feedback suggestions
  const stepGenerateFeedbackSuggestions = async () => {
    setProcessingStep("generatingFeedbackSuggestions");
    console.log("Generating feedback suggestions...");

    let remainingSubmissions = experiment.evaluationSubmissions.filter(
      (submission) =>
        !data.submissionsWithFeedbackSuggestions.has(submission.id)
    );

    while (remainingSubmissions.length > 0) {
      const infoPrefix = `Generating feedback suggestions... (${
        experiment.evaluationSubmissions.length -
        remainingSubmissions.length +
        1
      }/${experiment.evaluationSubmissions.length})`;

      console.log(`${infoPrefix} - Requesting feedback suggestions...`);

      let submissionIndex = -1;
      try {
        const response = await requestSubmissionSelection.mutateAsync({
          exercise: experiment.exercise,
          submissions: remainingSubmissions,
        });
        console.log("Received submission selection:", response.data);

        if (response.data !== -1) {
          submissionIndex = remainingSubmissions.findIndex(
            (submission) => submission.id === response.data
          );
        }
      } catch (error) {
        console.error("Error while requesting submission selection:", error);
      }

      if (submissionIndex === -1) {
        // Select random submission
        submissionIndex = Math.floor(
          Math.random() * remainingSubmissions.length
        );
      }

      const submission = remainingSubmissions[submissionIndex];
      remainingSubmissions = [
        ...remainingSubmissions.slice(0, submissionIndex),
        ...remainingSubmissions.slice(submissionIndex + 1),
      ];

      console.log(
        `${infoPrefix} - Requesting feedback suggestions for submission ${submission.id}...`
      );

      try {
        const response = await requestFeedbackSuggestions.mutateAsync({
          exercise: experiment.exercise,
          submission,
        });
        console.log("Received feedback suggestions:", response.data);
        setData((prevState) => ({
          ...prevState,
          submissionsWithFeedbackSuggestions: new Map(
            prevState.submissionsWithFeedbackSuggestions.set(submission.id, {
              suggestions: response.data,
              meta: response.meta,
            })
          ),
        }));
      } catch (error) {
        console.error(
          `Error while generating feedback suggestions for submission ${submission.id}:`,
          error
        );
      }
    }

    setData((prevState) => ({
      ...prevState,
      step: "finished",
    }));
  };

  useEffect(() => {
    if (experiment.executionMode !== "batch") {
      console.error("Using useBatchModuleExperiment in non-batch experiment!");
      return;
    }

    console.log("Step changed");
    if (
      data.step === "sendingSubmissions" &&
      processingStep !== "sendingSubmissions"
    ) {
      stepSendSubmissions();
    } else if (
      data.step === "sendingTrainingFeedbacks" &&
      processingStep !== "sendingTrainingFeedbacks"
    ) {
      stepSendTrainingFeedbacks();
    } else if (
      data.step === "generatingFeedbackSuggestions" &&
      processingStep !== "generatingFeedbackSuggestions"
    ) {
      stepGenerateFeedbackSuggestions();
    }
    // TODO: Add automatic evaluation step here
    // Note: Evaluate tutor feedback more globally to not do it multiple times
    // Note 2: Actually, I probably want to have it in parallel with the feedback suggestions for the interactive mode!
  }, [data.step]);

  return {
    data,
    startExperiment,
    moduleRequests: {
      sendSubmissions,
      sendFeedbacks,
      requestSubmissionSelection,
      requestFeedbackSuggestions,
    },
  };
}
