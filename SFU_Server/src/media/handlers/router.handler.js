import { mediasoup as mediasoupConfig } from "../mediasoup.config.js";



export const createRouter = async (worker) => {
    const router = {
        workerId: worker.pid,
        router: await worker.createRouter({
            mediaCodecs: mediasoupConfig.mediasoup.router.mediaCodecs
        }),
    };
    return router;
};

export const getRouterRtpCapabilities = async (router) => {
    return router.rtpCapabilities;
};

export const pipeRouters = async (routerA, routerB, producerId) => {
    try {
        const pipe = await routerA.pipeToRouter({
            producerId,
            router: routerB,
        });
        return pipe;
    } catch (err) {
        console.error(`❌ Pipe failed (${routerA.id} → ${routerB.id}):`, err);
        throw err;
    }
};