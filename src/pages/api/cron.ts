// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getDistance } from "@/location";
import { env } from "@/env/server.mjs";
import monitorAsync from "@/monitor";

type ResponseData = {
  diff: number;
  inRange: boolean;
};

type StatusData = { status: string };

const center = {
  latitude: env.CENTER_LATITUDE,
  longitude: env.CENTER_LONGITUDE,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<(ResponseData & StatusData) | StatusData>
) {
  if (req.query.key != env.API_KEY) {
    // auth failed
    res.status(401).json({ status: "Unauthorized" });
    return;
  }

  await monitorAsync(async function () {
    const diff = await getDistance();
    // auth passed
    res.setHeader(
      "Cache-Control",
      `max-age=0, s-maxage=${env.EDGE_CACHE_TIME_SECONDS}, stale-while-revalidate`
    );
    res
      .status(200)
      .json({ diff, inRange: diff < env.MAX_DISTANCE, status: "Authorized" });
  });
}
