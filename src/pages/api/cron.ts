// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getDistance } from "@/location";
import { env } from "@/env/server.mjs";

type ResponseData = {
  name: string;
};

const center = { latitude: env.CENTER_LATITUDE, longitude: env.CENTER_LONGITUDE };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  
  if (req.query.key != env.API_KEY) {
    // auth failed
    res.status(401).json({ name: "Unauthorized" });
    return;
  }

  const diff = await getDistance();

  // auth passed
  res.setHeader('Cache-Control', 'max-age=0, s-maxage=60, stale-while-revalidate');
  // @ts-ignore
  res.status(200).json({ diff, inRange: diff < env.MAX_DISTANCE });
}
