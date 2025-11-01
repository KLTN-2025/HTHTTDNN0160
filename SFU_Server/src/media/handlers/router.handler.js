
export const createRouter = async (worker, optionRouters) => {
    const router = {
        workerId: worker.pid,
        router: await worker.createRouter(optionRouters),
    };
    return router;
};

export const getRouterRtpCapabilities = async (router) => {
    return router.rtpCapabilities;
};

export const pipeRouters = async (routerA, routerB, producerId) => {
    routerA.pipeToRouter(producerId, routerB);
}