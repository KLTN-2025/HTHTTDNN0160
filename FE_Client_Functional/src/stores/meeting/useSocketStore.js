import { defineStore } from "pinia";
import { io } from "socket.io-client";
import { ref } from "vue";
import { useMeetingStore } from "./useMeetingStore";
import { useMediasoupStore } from "./useMediasoupStore";


export const useSocketStore = defineStore("socketstore", () => {

    const socket = ref(null);
    const isConnected = ref(false);
    const meetingstore = useMeetingStore();
    const mediasoupstore = useMediasoupStore();


    const connectSocket = () => {
        if (socket.value) return;

        socket.value = io("http://127.0.0.1:3000");

        socket.value.on("connect", () => {
            isConnected.value = true;
            listeningEvents();
            console.log("Socket connected!");
        })

        socket.value.on("connect_error", (err) => {
            isConnected.value = false;
            console.log("Connect error:", err.message);
        })

        socket.value.on("disconnect", () => {
            isConnected.value = false;
            console.log("Disconnected");
        })
    }

    const listeningEvents = () => {
        socket.value.on("new-participant", ({ participant }) => {
            meetingstore.newParticipant({ participant });
        });

        socket.value.on("new-producer", async ({ socketId, appData, producerId, kind }) => {
            meetingstore.newProducer({ socketId, appData, producerId, kind });
        });

        socket.value.on("this-participant-close-producer", async ({ producerId }) => {
            mediasoupstore.closeProducer({ producerId });
        });

        socket.value.on("producer-closed", async ({ producerId, anotherId, appData }) => {
            meetingstore.producerClosed({ producerId, anotherId, appData })
        });

        socket.value.on("show-emoji-receive", async ({ socketId, id }) => {
            meetingstore.receiveEmoji({ socketId, id })
        });

        socket.value.on("erase-emoji-receive", async ({ socketId }) => {
            meetingstore.eraseEmoji({ socketId })
        });

        socket.value.on("raise-hand-receive", async ({ socketId }) => {
            meetingstore.raiseHandReceive({ socketId })
        });

        socket.value.on("lower-hand-receive", async ({ socketId }) => {
            meetingstore.lowerhandReceive({ socketId })
        });

        socket.value.on("receive-message", ({ message, socketId, time, translated }) => {
            meetingstore.receiveMessage({ message, socketId, time, translated })
        });

        socket.value.on("caption-message-receive", ({ socketId, caption }) => {
            meetingstore.receiveCaption({ socketId, caption })
        });

        socket.value.on("speaking", (speakingProducers) => {
            meetingstore.speaking(speakingProducers);
        });

        socket.value.on("leave-room", ({ socketId }) => {
            meetingstore.leaveRoomMessage({ socketId });
        });
    }

    const disconnectSocket = async () => {
        if (socket.value) {
            await socket.value.disconnect();
            socket.value = null;
        }
    }

    const joinMeeting = async ({ meetingId, user }) => {
        return new Promise(resolve => {
            socket.value.emit("join-meeting", { meetingId, user }, (data) => {
                resolve(data);
            });
        })
    }

    const getRouterRtpCapabilities = async () => {
        return new Promise(resolve => {
            socket.value.emit("getRouterRtpCapabilities", null, (routerRtpCapabilities) => {
                resolve(routerRtpCapabilities);
            });
        })
    }

    const createWebRTCTransport = async () => {
        return new Promise(resolve => {
            socket.value.emit("createWebRTCTransport", null, (params) => {
                resolve(params);
            });
        })
    }

    const connectTransport = ({ dtlsParameters, transportId, callback }) => {
        socket.value.emit("connectTransport", { dtlsParameters, transportId }, () => {
            callback();
        });
    }

    const produce = async ({ kind, rtpParameters, appData, callback, transportId }) => {
        socket.value.emit("produce", { kind, rtpParameters, appData, transportId }, (producerId) => {
            callback({ id: producerId });
        });
    }

    const consume = async ({ producerId, rtpCapabilities, transportId, kind, socketId, appData }) => {
        return new Promise(resolve => {
            socket.value.emit("consume", { producerId, rtpCapabilities, transportId, kind, socketId, appData }, (params) => {
                resolve(params);
            });
        })
    }

    const closeProducer = ({ producerId }) => {
        socket.value.emit("close-producer", { producerId });
    }

    const resume = async ({ consumerId }) => {
        socket.value.emit("resume", { consumerId });
    }

    const showEmoji = (id) => {
        socket.value.emit("show-emoji", id);
    }

    const eraseEmojiSend = () => {
        socket.value.emit("erase-emoji");
    }

    const raiseHand = () => {
        socket.value.emit("raise-hand");
    }

    const lowerHand = () => {
        socket.value.emit("lower-hand");
    }

    const sendMessage = (message, time, sourceLang) => {
        socket.value.emit("send-message", message, time, sourceLang);
    }

    const sendCaption = ({ caption, sourceLang }) => {
        socket.value.emit("caption-message-send", { caption, sourceLang });
    }

    const switchLang = (newLang, oldLang) => {
        socket.value.emit("switch-lang", newLang, oldLang);
    }

    return {
        socket,
        isConnected,
        // Mediasoup side
        connectSocket,
        disconnectSocket,
        getRouterRtpCapabilities,
        createWebRTCTransport,
        connectTransport,
        produce,
        consume,
        resume,
        // Meeting side
        joinMeeting,
        closeProducer,
        showEmoji,
        eraseEmojiSend,
        raiseHand,
        lowerHand,
        sendMessage,
        sendCaption,
        switchLang,
    }
})