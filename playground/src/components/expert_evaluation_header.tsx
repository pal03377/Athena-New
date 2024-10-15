import React from 'react';
import { useRouter } from 'next/router';

function ExpertEvaluation() {
  const router = useRouter();

  const handleGoToExpertView = () => {
    router.push('/23ccfc06-92bb-47de-a221-1c18b1d716cf/1/expert_view'); //TODO
  };

  return (
    <div className="bg-white rounded-md p-4 mb-8 space-y-2">
      <h3 className="text-2xl font-bold">Define Experiment</h3>
      <button
        onClick={handleGoToExpertView}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Go to expert view
      </button>
    </div>
  );
}

export default ExpertEvaluation;