import os from "os";

const ifaces = os.networkInterfaces();

const getLocalIp = () => {
    let localIp = "127.0.0.1";
    Object.keys(ifaces).forEach((ifname) => {
        for (const iface of ifaces[ifname]) {
            if (iface.family !== "IPv4" || iface.internal !== false) {
                continue;
            }
            localIp = iface.address;
            return;
        }
    });
    console.log(localIp, "localIp");

    return localIp;
};

export const mediasoup = {
    listenIp: "0.0.0.0",
    listenPort: 3000,
    sslCrt: "",
    sslKey: "",
    mediasoup: {
        numberWorkers: Object.keys(os.cpus()).length,
        worker: {
            logLevel: "debug",
            logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
            rtcMinPort: 40000,
            rtcMaxPort: 49999,
        },
        router: {
            mediaCodecs: [
                {
                    kind: "audio",
                    mimeType: "audio/opus",
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: "video",
                    mimeType: "video/VP8",
                    clockRate: 90000,
                    parameters: { "x-google-start-bitrate": 1000 },
                },
            ],
        },
        transport: {
            listenIps: [{ ip: "0.0.0.0", announcedIp: getLocalIp() }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            initialAvailableOutgoingBitrate: 1000000
        },
        maxIncomingBitrate: 1500000,
    },
};
