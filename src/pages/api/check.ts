import type {NextApiRequest, NextApiResponse} from 'next';
import {env} from '@/env/server.mjs';

type StatusData = { status: ResponseStatus };

type ResponseStatus =
    | 'unauthorized'
    | 'success';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData>
) {
    if (req.query.key != env.API_KEY) {
        // auth failed
        res.status(401).json({ status: 'unauthorized' });
        return;
    }

    res.status(200).json({ status: 'success'});
}
