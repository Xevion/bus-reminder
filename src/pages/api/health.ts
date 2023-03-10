// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "@/env/server.mjs";

type ResponseData = {
  now: number;
  status: string;
  timezone: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.status(200).json({
    now: new Date().getTime(),
    status: req.query.key == env.API_KEY ? "Authorized" : "Unauthorized",
    timezone: env.TIMEZONE
  });
}
