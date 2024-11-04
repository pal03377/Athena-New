import {NextApiRequest, NextApiResponse} from "next";
import {validateDataModeMiddleware} from "@/helpers/validate_data_mode_middleware";

function handler(req: NextApiRequest, res: NextApiResponse) {
    const authHeader = req.headers.authorization;
    const host = req.headers.host;

    let isLocal = false;
    if (host) {
        isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    }

    if (!isLocal && authHeader !== process.env.PLAYGROUND_SECRET) {
            return res.status(401).json({error: "Unauthorized access"});
    }

    return res.status(200).json({error: "Authorization successful!"});
}

export default function handlerWithMiddleware(
    req: NextApiRequest,
    res: NextApiResponse
) {
    validateDataModeMiddleware(req, res, () => handler(req, res));
}
