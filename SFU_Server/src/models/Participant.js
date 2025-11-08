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
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            }
        }
    }

    async connectTransport({ transportId, dtlsParameters }) {
        if (!this.transports.has(transportId)) return false;
        const transport = this.transports.get(transportId);
        const isConnect = await connectTransport(transport, dtlsParameters);
        return isConnect;
    }

    async createProducer({producerTransportId, rtpParameters, kind}) {
        const transport = this.transports.get(producerTransportId);
        
        const producer = await createProducer({ transport, rtpParameters, kind });

        this.producers.set(producer.id, producer);

        producer.on(
            "transportclose", () => {
                producer.close();
                this.producers.delete(producer.id);
            }
        )

        producer.on('close', () => {
            console.log(`Producer ${producer.id} closed`);
        });

        return { producerId: producer.id, routerId: this.routerId };
    }

    async createConsumer({ consumerTransportId, rtpCapabilities, producerId, kind }) {
        const transport = this.transports.get(consumerTransportId);
        const isVideo = kind === "video";
        
        let consumer = null;
        try {
            consumer = await createConsumer({ rtpCapabilities, producerId, isVideo, transport });
            this.consumers.set(consumer.id, consumer);
        } catch (error) {
            return false;
        }

        if (consumer.kind === 'video' && consumer.type === "simulcast") {
            const spatialLayer = 0;
            const temporalLayer = 0;
            const isSetPrefferred =  await setPreferredLayers({ consumer, spatialLayer, temporalLayer });
            console.log(consumer);
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
        });


        return {
            params: {
                producerId: producerId,
                id: consumer.id,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
                type: consumer.type,
            }
        }
    }

    async resumeConsumer({ consumerId }) {
        const consumer = this.consumers.get(consumerId);

        await consumer.resume();
    }

    closeAllTransports() {
        this.transports.forEach(transport => transport.close());
        this.transports.clear();
        this.producers.clear();
        this.consumers.clear();
    }
}