import { connectTransport, createConsumer, createProducer, createWebRtcTransport, setPreferredLayers } from "../media/handlers/transport.handler.js";


export default class Participant {
    routerId = "";
    transports = new Map();
    producers = new Map();
    consumers = new Map();

    constructor(routerId) {
        this.routerId = routerId;
    }

    async checkRouter(routerId) {
        return routerId === this.routerId;
    }

    async createWebRtcTransport(router) {
        const transport = await createWebRtcTransport(router);

        transport.on(
            'dtlsstatechange',
            (dtlsState) => {
                if (dtlsState === 'failed' || dtlsState === 'closed') {
                    transport.close();
                }
            }
        )

        transport.on('icestatechange', (state) => {
            if (state === 'failed' || state === 'closed') {
                transport.close();
            }
        });

        transport.on('iceselectedtuplechange', (tuple) => {
            // console.log(`[ICE SELECTED] ${transport.id}`, tuple);
        });

        transport.on('close', () => {
            console.log(`Transport ${transport.id} closed`);
            this.transports.delete(transport.id);
        });

        this.transports.set(transport.id, transport);

        return {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters
        }
    }

    async connectTransport({ transportId, dtlsParameters }) {
        if (!this.transports.has(transportId)) return false;
        const transport = this.transports.get(transportId);
        const isConnect = await connectTransport(transport, dtlsParameters);
        return isConnect;
    }

    /**
 * @param {{ socket: import("socket.io").Socket }} options
 */
    async createProducer({ transportId, rtpParameters, kind, appData, socket }) {
        const transport = this.transports.get(transportId);

        const producer = await createProducer({
            transport,
            rtpParameters,
            kind,
            appData
        });


        this.producers.set(producer.id, producer);

        producer.on(
            "transportclose", () => {
                producer.close();
                this.producers.delete(producer.id);
            }
        )

        producer.on('close', () => {
            this.producers.delete(producer.id);
            socket.emit("this-participant-close-producer", { producerId: producer.id })
        });


        return producer;
    }

    /**
     * @typedef {import('mediasoup').types.Producer} CustomProducer
    */
    /**
     * @param {{ producerId: string }} param0
    */
    async closeProducer({ producerId }) {
        const producer = /** @type {CustomProducer} */ (
            this.producers.get(producerId)
        );

        if (!producer) {
            return {
                isSuccess: false,
                type: "not found"
            };
        }

        if (!producer.closed) {
            await producer.close();
        }

        return {
            isSuccess: true,
            type: producer.appData
        };
    }

    async createConsumer({ transportId, rtpCapabilities, producerId, kind, appData, socket, socketId, anotherId }) {
        const transport = this.transports.get(transportId);
        const isVideo = kind === "video";

        let consumer = null;
        try {

            consumer = await createConsumer({
                rtpCapabilities,
                producerId,
                isVideo,
                transport,
                appData
            });

            this.consumers.set(consumer.id, consumer);
        } catch (error) {
            console.log(error);
        }

        if (consumer.kind === 'video' && consumer.type === "simulcast") {
            const spatialLayer = 0;
            const temporalLayer = 0;
            const isSetPrefferred = await setPreferredLayers({ consumer, spatialLayer, temporalLayer });
        }

        consumer.on('transportclose', () => {
            if (!consumer.closed) {
                console.log('Consumer transport closed');
                consumer.close();
            }
            this.consumers.delete(consumer.id);
        });

        consumer.on('producerclose', () => {

            if (!consumer.closed) {
                console.log('Producer closed');
                consumer.close();
            }

            this.consumers.delete(consumer.id);

            if (socket) {
                socket.emit("producer-closed", { producerId, anotherId, appData });
            }

        });

        return {
            producerId: producerId,
            id: consumer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            type: consumer.type,
            appData
        }
    }

    async resumeConsumer({ consumerId }) {
        const consumer = this.consumers.get(consumerId);
        await consumer.resume();
    }

    closeAllTransports() {
        this.transports.forEach(transport => {
            if (transport && !transport.closed) transport.close();
        });
        this.transports.clear();

        this.producers.forEach(producer => {
            if (producer && !producer.closed) producer.close();
        });
        this.producers.clear();

        this.consumers.forEach(consumer => {
            if (consumer && !consumer.closed) consumer.close();
        });
        this.consumers.clear();
    }

}