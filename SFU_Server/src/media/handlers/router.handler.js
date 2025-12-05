import { mediasoup as mediasoupConfig } from "../mediasoup.config.js";

/**
 * @typedef {import('mediasoup').types.Router & { workerId: string }} CustomRouter
 * @typedef {import('mediasoup').types.Worker & { nums: number }} CustomWorker
 */
/**
 * @param {CustomWorker} worker
 * @returns {Promise<CustomRouter>}
 */

export const createRouter = async (worker) => {
    /** @type {CustomRouter} */
    console.log();
    
    const router = await worker.createRouter({
        mediaCodecs: mediasoupConfig.mediasoup.router.mediaCodecs
    });

    router.workerId = worker.pid;

    return router;
};

export const getRouterRtpCapabilities = async (router) => {
    return router.rtpCapabilities;
};


export const pipeToRouter = async (routerA, routerB, producerId, pipes) => {
    try {
        const pipe = await routerA.pipeToRouter({
            producerId,
            router: routerB,
        });

        return pipe;
    } catch (err) {
        console.error(`❌ Pipe failed (${routerA.id} → ${routerB.id}):`, err);
        console.log(pipes);
        throw err;
    }
};
