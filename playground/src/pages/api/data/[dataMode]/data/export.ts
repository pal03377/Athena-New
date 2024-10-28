import type { NextApiRequest, NextApiResponse } from "next";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { getDataModeParts } from "@/helpers/get_data";
import { config } from "dotenv";

config({ path: process.cwd() }); // Load .env variables

const EXPORT_DIR = path.join(process.cwd(), "data");
const SENSITIVE_PATHS = [
  path.join(EXPORT_DIR, "expert_evaluation"),
  // Add more sensitive paths as needed
];

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { dataMode } = req.query as { dataMode: string };
  const directoryPath = path.join(EXPORT_DIR, ...getDataModeParts(dataMode));
  const filename = `${dataMode}.zip`;

  await exportHandler(req, res, directoryPath, filename);
}

export async function exportHandler(req: NextApiRequest, res: NextApiResponse, directoryPath: string, filename: string) {
  const requiresAuth = SENSITIVE_PATHS.some(sensitivePath =>
    directoryPath.startsWith(sensitivePath) || sensitivePath.startsWith(directoryPath)
  );

  if (requiresAuth) {
    const authHeader = req.headers.authorization;
    if (authHeader !== process.env.PLAYGROUND_SECRET) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
  }

  if (!fs.existsSync(directoryPath)) {
    return res.status(404).json({ error: "Directory not found" });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (err) => res.status(500).send({ error: err.message }));
  archive.pipe(res);

  archive.directory(directoryPath, false);
  await archive.finalize();
}

export default handler;
