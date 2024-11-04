import base_url from "@/helpers/base_url";

export async function authorizeExpertEvaluationManagement(
    secret: string
) {
    const response = await fetch(
        `${base_url}/api/data/evaluation/expert_evaluation/management_authorization`,
        {
            method: "GET",
            headers: {
                Authorization: `${secret}`,
            },
        }
    );

    return response.status;
}