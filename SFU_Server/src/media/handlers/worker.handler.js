import { mediasoup as mediasoupConfig } from "../mediasoup.config.js";
import mediasoup from "mediasoup";

export const workers = [];

const MAX_USERS_WORKER = 1;

export const createWorkers = async () => {
    for (let i = 0; i < mediasoupConfig.mediasoup.numberWorkers; i++) {
        let worker = await mediasoup.createWorker(mediasoupConfig.mediasoup.worker);

        worker.on("died", () => {
            console.error('Mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid)
            setTimeout(() => process.exit(1), 2000);
        });

        workers.push({
            worker: worker,
            numUsers: 0,
        });
    }
}

export const getWorker = (workerId) => {
    return workers.find(worker => worker.worker.pid === workerId);
}

export const findWorkerFeasible = async () => {
    const leastLoaded = workers.reduce((min, curr) => {
        return curr.numUsers < min.numUsers ? curr : min;
    });
    return leastLoaded;
};

export const checkWorkerCurrentUsaged = (workerId) => {
    const worker = workers.find(worker => worker.worker.pid === workerId);
    if (worker.numUsers >= MAX_USERS_WORKER) {
        return false;
    } 
}