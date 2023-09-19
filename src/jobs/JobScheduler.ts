import schedule from "node-schedule";
import { ImportEventFormJob } from "./ImportEventForm";

export type Job = {
    cron: string,
    handler: () => void
}

const Jobs: Job[] = [
    ImportEventFormJob
]

/**
 * Schedules all jobs in the Job array.
 */
export function scheduleJobs() {
    Jobs.forEach(({cron, handler}) =>  {
        console.log("Scheduled job with cron: " + cron)
        schedule.scheduleJob(cron, handler)
    })
}