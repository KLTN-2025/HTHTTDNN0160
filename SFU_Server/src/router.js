import { mediasoup } from "./mediasoup.config.js";
import util from "util";

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

export const createWebRtcTransport = async (router) => {
    const { maxIncomingBitrate } = mediasoup;
    const transport = await router.createWebRtcTransport(mediasoup.mediasoup.transport);
    if (maxIncomingBitrate) {
        try {
            await transport.setMaxIncomingBitrate(maxIncomingBitrate);
        } catch (error) {
            console.log("Can't set maxIncomingBitrate");
        }
    }

    return transport;
};

export const connectTransport = async (transport, dtlsParameters) => {
    try {
        await transport.connect({ dtlsParameters });
    } catch (error) {
        return false;
    }
    return true;
};

export const createProducer = async ({ transport, rtpParameters, kind }) => {
    const producer = await transport.produce({ rtpParameters, kind });

    return producer;
};

export const createConsumer = async ({ transport, producerId, rtpCapabilities, isVideo }) => {
    const consumer = await transport.consume({
        producerId: producerId,
        rtpCapabilities,
        paused: isVideo
    });


    return consumer;
};


export const setPreferredLayers = async ({ consumer, spatialLayer, temporalLayer }) => {
    try {
        await consumer.setPreferredLayers({
            spatialLayer: spatialLayer,
            temporalLayer: temporalLayer
        })
    } catch (error) {
        return false
    }

    return true;
}