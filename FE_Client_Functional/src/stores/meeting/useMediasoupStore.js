import { defineStore } from "pinia";
import { Device } from "mediasoup-client";
import { useSocketStore } from "./useSocketStore";
import { reactive, ref } from "vue";

/**
 * @typedef {import('mediasoup-client').types.Transport} CustomTransport
 */
/**
 * @typedef {import('mediasoup-client').types.Producer} CustomProducer
 */
/**
 * @typedef {import('mediamediasoup-clientsoup').types.Consumer} CustomConsumer
 */


export const useMediasoupStore = defineStore("mediasoupstore", () => {

    const device = new Device();
    let routerRtpCapabilities = null;
    const socketStore = useSocketStore();
    const optionProducer = {
        // encodings_cam: [
        //     {
        //         rid: "r0",
        //         maxBitrate: 100000,
        //         scaleResolutionDownBy: 4,
        //         scalabilityMode: 'L1T3'
        //     },
        //     {
        //         rid: "r1",
        //         maxBitrate: 300000,
        //         scaleResolutionDownBy: 2,
        //         scalabilityMode: 'L1T3'
        //     },
        //     {
        //         rid: "r2",
        //         maxBitrate: 900000,
        //         scalabilityMode: 'L1T3'
        //     }
        // ],
        encodings_cam: null,
        encodings_screen_share: [
            { maxBitrate: 900000 }
        ],
        codecOptions: { videoGoogleStartBitrate: 1000 },
    };

    const transports = {
        sendTransport: {
            isInit: false,
            producerTransport: null,
            producers: new Map(),
            sendParams: null
        },
        receiveTransport: {
            isInit: false,
            consumerTransport: null,
            consumers: new Map(),
            receiveParams: null,
        }
    };

    const loadDevice = async () => {
        routerRtpCapabilities = await socketStore.getRouterRtpCapabilities();
        await device.load({ routerRtpCapabilities: routerRtpCapabilities });
        return;
    }

    const createWebRTCTransport = async (type) => {
        const params = await socketStore.createWebRTCTransport();

        if (type === "producer") {
            transports.sendTransport.sendParams = params;
        } else {
            transports.receiveTransport.receiveParams = params;
        }
    }

    const createProducerTransport = async () => {

        /** @type {CustomTransport | undefined} */
        transports.sendTransport.producerTransport = await device.createSendTransport(transports.sendTransport.sendParams);

        transports.sendTransport.producerTransport.on("connect", async ({ dtlsParameters }, callback) => {
            await socketStore.connectTransport({ dtlsParameters, transportId: transports.sendTransport.producerTransport.id, callback });
        });

        transports.sendTransport.producerTransport.on("produce", async ({ kind, rtpParameters, appData }, callback) => {
            await socketStore.produce({ kind, rtpParameters, appData, transportId: transports.sendTransport.producerTransport.id, callback });
        })
    }

    const createConsumerTransport = async () => {

        /** @type {CustomTransport | undefined} */
        transports.receiveTransport.consumerTransport = await device.createRecvTransport(transports.receiveTransport.receiveParams);
        transports.receiveTransport.consumerTransport.on("connect", async ({ dtlsParameters }, callback) => {
            await socketStore.connectTransport({ dtlsParameters, transportId: transports.receiveTransport.consumerTransport.id, callback });
        })

    }

    const produce = async ({ track, type, kind }) => {

        if (!transports.sendTransport.isInit) {
            await createWebRTCTransport("producer");
            await createProducerTransport();
            transports.sendTransport.isInit = true;
        }

        let encodings = null;

        if (kind === "video") {
            encodings = type === "camera"
                ? optionProducer.encodings_cam
                : optionProducer.encodings_screen_share;
        }


        /** @type {CustomProducer | undefined} */
        const producer = await transports.sendTransport.producerTransport.produce({
            track,
            codecOptions: optionProducer.codecOptions,
            encodings,
            appData: { source: type }
        });


        const producerId = producer.id;

        transports.sendTransport.producers.set(producerId, producer);

        producer.on('transportclose', () => {

        });

        return producerId;
    }

    /** 
    * @returns {CustomProducer | null} 
    */
    const getProducer = ({ producerId }) => {
        const producer = transports.sendTransport.producers.get(producerId);

        return producer
    }

    const closeProducer = ({ producerId }) => {
        transports.sendTransport.producers.delete(producerId);
    }

    const consume = async ({ producerId, kind, socketId, appData }) => {

        if (!transports.receiveTransport.isInit) {
            await createWebRTCTransport("consumer");
            await createConsumerTransport();
            transports.receiveTransport.isInit = true;
        }

        /** @type {CustomConsumer | undefined} */

        const { id, rtpParameters } = await socketStore.consume({
            producerId,
            rtpCapabilities: device.rtpCapabilities,
            transportId: transports.receiveTransport.consumerTransport.id,
            kind,
            socketId,
            appData
        });

        const consumer = await transports.receiveTransport.consumerTransport.consume({
            id,
            appData,
            kind,
            producerId,
            rtpParameters
        });

        transports.receiveTransport.consumers.set(consumer.id, consumer);

        await socketStore.resume({ consumerId: consumer.id });

        const stream = new MediaStream([consumer.track]);

        return {
            stream,
            consumerId: consumer.id
        };
    }

    const closeConsumer = async ({ consumerId }) => {
        const consumer = transports.receiveTransport.consumers.get(consumerId);

        if (consumer) {
            await consumer.close();
            transports.receiveTransport.consumers.delete(consumerId);
        }
    }

    return {
        routerRtpCapabilities,
        transports,
        loadDevice,
        createWebRTCTransport,
        createProducerTransport,
        createConsumerTransport,
        produce,
        consume,
        getProducer,
        closeProducer,
        closeConsumer
    }
})