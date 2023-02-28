import type {NextApiRequest, NextApiResponse} from 'next';
import {env} from '@/env/server.mjs';
import {fetchConfiguration} from "@/db";
import {Configuration} from "@/timing";

type StatusData = { status: ResponseStatus };

type ResponseStatus =
    | 'unauthorized'
    | 'failed'
    | 'success';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData | Configuration>
) {
    if (req.query.key != env.API_KEY) {
        // auth failed
        res.status(401).json({status: 'unauthorized'});
        return;
    }

    if (req.method == "GET") {
        try {
            const configuration = await fetchConfiguration();
            res.status(200).json(configuration);
        } catch (e) {
            console.error(e);
            res.status(500).json({status: "failed"});
        }
    } else if (req.method == "POST") {
        res.status(200).json({status: 'success'});
    }
}
