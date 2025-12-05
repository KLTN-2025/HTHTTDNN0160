import { mediasoup as mediasoupConfig } from "../mediasoup.config.js";
import mediasoup from "mediasoup";

export const workers = [];

const MAX_USERS_WORKER = 2;
/**
 * @typedef {import('mediasoup').types.Worker & {
 *   nums: number
 * }} CustomWorker
 */
export const createWorkers = async () => {
    for (let i = 0; i < mediasoupConfig.mediasoup.numberWorkers; i++) {

        /** @type {CustomWorker} */
        let worker = await mediasoup.createWorker(mediasoupConfig.mediasoup.worker);

        worker.on("died", () => {
            console.error('Mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid)
            setTimeout(() => process.exit(1), 2000);
        });

        worker.nums = 0;

        workers.push(worker);
    }
}

/** 
 * @returns {CustomWorker | undefined} 
 */
export const getWorker = (workerId) => {
    return workers.find(worker => worker.pid === workerId);
}
/** 
 * @returns {CustomWorker | undefined} 
 */
export const findWorkerFeasible = () => {
    const leastLoaded = workers.reduce((min, curr) => {
        return curr.nums < min.nums ? curr : min;
    });
    return leastLoaded;
};

/** @returns {CustomWorker | undefined} */
export const checkWorkerCurrentUsaged = (workerId) => {
    const worker = workers.find(worker => worker.pid === workerId);
    if (worker.nums >= MAX_USERS_WORKER) {
        return false;
    }

    return true;
}