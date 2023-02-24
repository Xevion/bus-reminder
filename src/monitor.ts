import {env} from "@/env/server.mjs";
import {z} from "zod";

const BASE_URL = `https://cronitor.link/p/${env.CRONITOR_ACCOUNT_ID}/${env.CRONITOR_JOB_ID}`;
const parameterSchema = z.object({
    env: z.string().optional(),
    host: z.string().optional(),
    message: z.string().optional(),
    metric: z.union([
        z.object({count: z.number()}),
        z.object({duration: z.number()}),
        z.object({error_count: z.number()}),
    ]).optional(),
    series: z.string().optional(),
    state: z.enum(["run", "complete", "fail", "ok"]).optional(),
    status_code: z.number().int().optional(),
})

function buildURL(parameters: z.infer<typeof parameterSchema>) {
    const url = new URL(BASE_URL);

    // Definite string properties
    const {env, host, message, series, state} = parameters;
    for (const [key, value] of Object.entries({env, host, message, series, state}).filter(([, value]) => value != undefined))
        url.searchParams.append(key, value!);

    // Extract potentially undefined specified properties
    if (parameters.metric != undefined) {
        const {count, duration, error_count} = parameters.metric as {count?: number, duration?: number, error_count?: number};
        if (count != undefined)
            url.searchParams.append("metric", `count:${count}`);
        else if (duration != undefined)
            url.searchParams.append("metric", `duration:${duration}`);
        else if (error_count != undefined)
            url.searchParams.append("metric", `error_count:${error_count}`);
    }

    return url;
}

/**
 * @returns The duration in seconds between the start and end dates
 */
function getDuration(start: Date, end: Date) {
    return (end.getTime() - start.getTime()) / 1000;
}


/**
 * Executes the given function while providing telemetry to Cronitor
 * @param execute The function to execute
 * @throws Any error thrown by the function will be rethrown. Cronitor will be notified of the failure.
 */
export default async function monitorAsync<T = any>(execute: () => Promise<T>): Promise<T> {
    // Tell Cronitor that the job is running
    const start = new Date();
    await fetch(buildURL({state: "run"}).toString());
    console.log("Cronitor: Job started")

    // Execute the function, provide try/catch
    let result: T | undefined = undefined;
    try {
        result = await execute();
    } catch (error) {
        const duration = getDuration(start, new Date());
        await fetch(buildURL({state: "fail", message: error instanceof Error ? error.message : undefined, metric: {duration}}).toString());
        throw error;
    }

    // Tell Cronitor that the job is complete (success)
    console.log("Cronitor: Job completed")
    const duration = getDuration(start, new Date());
    await fetch(buildURL({state: "complete", metric: {duration}}).toString());

    return result as T;
}