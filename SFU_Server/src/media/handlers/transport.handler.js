import { mediasoup } from "../mediasoup.config.js";

/**
 * @typedef {import('mediasoup').types.Transport} CustomTransport
 */
/**
 * @typedef {import('mediasoup').types.Producer} CustomProducer
 */
/**
 * @typedef {import('mediasoup').types.Consumer} CustomConsumer
 */

/** 
 * @returns {CustomTransport | undefined} 
 */
export const createWebRtcTransport = async (router) => {
    const { maxIncomingBitrate } = mediasoup;
    /** @type {CustomTransport} */
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

/** 
 * @returns {CustomProducer | undefined} 
 */
export const createProducer = async ({ transport, rtpParameters, kind, appData }) => {
    /** @type {CustomProducer} */
    const producer = await transport.produce({ rtpParameters, kind, appData });

    return producer;
};

/** 
 * @returns {CustomConsumer | undefined} 
 */
export const createConsumer = async ({ transport, producerId, rtpCapabilities, isVideo, appData }) => {
    /** @type {CustomConsumer} */
    const consumer = await transport.consume({
        producerId: producerId,
        rtpCapabilities,
        paused: false,
        appData
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