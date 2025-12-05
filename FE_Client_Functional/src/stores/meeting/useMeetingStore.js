import { defineStore, storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { useSocketStore } from "./useSocketStore";
import { useMediasoupStore } from "./useMediasoupStore";
import { getStreamDevice, getStreamMedia } from "@/utils/meeting";

export const useMeetingStore = defineStore("meetingstore", () => {

    const user = ref({
        id: 1,
        name: "Phuc",
        micro: false,
        camera: true
    });

    const emoji = ref([
        { id: 1, emoji: "💖" },
        { id: 2, emoji: "👍" },
        { id: 3, emoji: "🎉" },
        { id: 4, emoji: "👋" },
        { id: 5, emoji: "😂" },
        { id: 6, emoji: "😮" },
        { id: 7, emoji: "😥" },
        { id: 8, emoji: "🤔" },
        { id: 9, emoji: "👎" },
    ]);

    /**
 * @typedef {Object} ShareScreenData
 * @property {boolean} isSharingScreen
 * @property {string} socketId
 * @property {{ video: string|null, audio: string|null }} producers
 * @property {{ video: string|null, audio: string|null }} consumers
 * @property {{ video: MediaStream|null, audio: MediaStream|null }} streams
 */

    /** @type {import('vue').Ref<ShareScreenData>} */
    const dataShareScreen = ref({
        isSharingScreen: false,
        socketId: null,
        producers: { video: null, audio: null },
        consumers: { video: null, audio: null },
        streams: { video: null, audio: null },
    });

    const meetingId = "123";

    const socketStore = useSocketStore();
    const mediasoupstore = useMediasoupStore();
    const { socket } = storeToRefs(socketStore);

    const typeDevice = ref("");

    const showDevice = ({ type }) => {
        typeDevice.value = type;
    }


    const renderVideo = computed(() => {
        return users.value.slice().sort((a, b) => {

            // Ưu tiên chính mình lên đầu
            const isMeA = a.socketId === socket.value.id;
            const isMeB = b.socketId === socket.value.id;

            if (isMeA && !isMeB) return -1;
            if (!isMeA && isMeB) return 1;

            // Ưu tiên người đang nói
            if (a.isSpeaking && !b.isSpeaking) return -1;
            if (!a.isSpeaking && b.isSpeaking) return 1;

            const nameA = a.name?.toString() || "";
            const nameB = b.name?.toString() || "";

            // Ưu tiên tên bắt đầu bằng số
            const startsWithNumberA = /^[0-9]/.test(nameA);
            const startsWithNumberB = /^[0-9]/.test(nameB);

            if (startsWithNumberA && !startsWithNumberB) return -1;
            if (!startsWithNumberA && startsWithNumberB) return 1;

            // Cuối cùng sắp theo alphabet
            return nameA.localeCompare(nameB, "en", { sensitivity: "base" });
        });
    });

    /**
     * @typedef {Object} Users
     * @property {string|null} id
     * @property {string} socketId
     * @property {string} name
     * @property {boolean} isSpeaking
     * @property {number|null} emoji
     * @property {boolean} raiseHand
     * @property {boolean} camera
     * @property {boolean} micro
     * @property {Record<'camera'|'micro', MediaStream|null>} [streams]
     * @property {Record<'camera'|'micro', string|null>} [producers]  
     * @property {Record<'camera'|'micro', string|null>} [consumers]  
     */

    /** @type {import('vue').Ref<Users[]>} */
    const users = ref([]);

    const joinMeeting = async () => {
        const { dataUsers, shareScreen } = await socketStore.joinMeeting({
            meetingId,
            user: { ...user.value, micro: false, camera: false }
        });

        users.value = dataUsers;

        dataShareScreen.value = shareScreen;

        await mediasoupstore.loadDevice();

        if (user.value.camera) {
            await turnOnDevice({ type: "camera" });
        }

        if (user.value.micro) {
            await turnOnDevice({ type: "micro" });
        }

        for (const user of users.value) {
            if (user.socketId === socket.value.id) continue;

            if (user.camera) {
                await new Promise(r => setTimeout(r, 70));
                await newProducer({
                    producerId: user.producers.camera,
                    kind: "video",
                    socketId: user.socketId,
                    appData: { source: "camera" }
                });
            }

            if (user.micro) {
                await new Promise(r => setTimeout(r, 70));
                await newProducer({
                    producerId: user.producers.micro,
                    kind: "audio",
                    socketId: user.socketId,
                    appData: { source: "micro" }
                });
            }

        }

        if (dataShareScreen.value.isSharingScreen && dataShareScreen.value.producers.video) {
            await new Promise(r => setTimeout(r, 50));

            await newProducer({
                producerId: dataShareScreen.value.producers.video,
                kind: "video",
                socketId: dataShareScreen.value.socketId,
                appData: { source: "screen-video" }
            });
        }

        if (dataShareScreen.value.isSharingScreen && dataShareScreen.value.producers.audio) {
            await new Promise(r => setTimeout(r, 50));

            await newProducer({
                producerId: dataShareScreen.value.producers.audio,
                kind: "audio",
                socketId: dataShareScreen.value.socketId,
                appData: { source: "screen-audio" }
            });
        }

    }

    const newProducer = async ({ producerId, kind, socketId, appData }) => {

        const { stream, consumerId } = await mediasoupstore.consume({ producerId, kind, socketId, appData });

        const user = users.value.find(user => user.socketId === socketId);

        if (user) {
            switch (appData.source) {
                case "camera":
                    user.streams.camera = stream;
                    user.consumers.camera = consumerId;
                    user.producers.camera = producerId;
                    user.camera = true;
                    break;
                case "micro":
                    user.streams.micro = stream;
                    user.consumers.micro = consumerId;
                    user.producers.micro = producerId;
                    user.micro = true;
                    break;
                case "screen-video":
                    dataShareScreen.value.streams.video = stream;
                    dataShareScreen.value.consumers.video = consumerId;
                    dataShareScreen.value.producers.video = producerId;
                    dataShareScreen.value.socketId = socketId;
                    dataShareScreen.value.isSharingScreen = true;
                    break;
                case "screen-audio":
                    dataShareScreen.value.streams.audio = stream;
                    dataShareScreen.value.consumers.audio = consumerId;
                    dataShareScreen.value.producers.audio = producerId;
                    dataShareScreen.value.socketId = socketId;
                    dataShareScreen.value.isSharingScreen = true;
                    break;
                default:
                    break;
            }
        }
    }

    const turnOnDevice = async ({ type }) => {

        const stream = await getStreamDevice({ type });

        if (stream === "reject" || stream === "timeout") {
            if (type === "camera") {
                user.value.camera = false;
            } else {
                user.value.micro = false;
            }
            return;
        }

        const track = type === "camera" ? await stream.getVideoTracks()[0] : await stream.getAudioTracks()[0];

        const producerId = await mediasoupstore.produce({ track, type, kind: track.kind });

        const thisUser = users.value.find(user => user.socketId === socket.value.id);

        if (thisUser) {
            if (type === "camera") {
                thisUser.camera = true;
                thisUser.streams.camera = stream;
                thisUser.producers.camera = producerId;
                user.value.camera = true;
            } else {
                thisUser.micro = true;
                thisUser.streams.micro = null;
                thisUser.producers.micro = producerId;
                user.value.micro = true;
            }
        }
    }

    const turnOffDevice = async ({ type }) => {

        const thisUser = users.value.find(user => user.socketId === socket.value.id);

        if (type === "camera") {
            const producer = mediasoupstore.getProducer({ producerId: thisUser.producers.camera });
            producer.track.stop();
            await producer.close();
            mediasoupstore.transports.sendTransport.producers.delete(thisUser.producers.camera);
            socketStore.closeProducer({ producerId: thisUser.producers.camera });
            thisUser.camera = false;
            thisUser.producers.camera = "";
            thisUser.streams.camera = null;
            user.value.camera = false;
        } else {
            const producer = mediasoupstore.getProducer({ producerId: thisUser.producers.micro });
            producer.track.stop();
            await producer.close();
            mediasoupstore.transports.sendTransport.producers.delete(thisUser.producers.micro);
            socketStore.closeProducer({ producerId: thisUser.producers.micro });
            thisUser.micro = false;
            thisUser.producers.micro = "";
            thisUser.streams.micro = null;
            user.value.micro = false;
        }

    }

    const shareScreen = async () => {
        const stream = await getStreamMedia();

        dataShareScreen.value.isSharingScreen = true;

        if (stream.getVideoTracks().length) {
            const videoTrack = stream.getVideoTracks()[0];
            const producerIdVideo = await mediasoupstore.produce({
                track: videoTrack,
                type: "screen-video",
                kind: "video"
            });
            dataShareScreen.value.producers.video = producerIdVideo;
            dataShareScreen.value.streams.video = new MediaStream([videoTrack]);

            videoTrack.addEventListener("ended", async () => {
                const producer = mediasoupstore.getProducer({ producerId: producerIdVideo });
                producer.track.stop();
                await producer.close();
                mediasoupstore.transports.sendTransport.producers.delete(producerIdVideo);
                socketStore.closeProducer({ producerId: producerIdVideo });
                dataShareScreen.value.isSharingScreen = false;
                dataShareScreen.value.producers.video = "";
                dataShareScreen.value.streams.video = null;
            });
        }

        // Audio
        if (stream.getAudioTracks().length) {
            const audioTrack = stream.getAudioTracks()[0];
            // small delay để tránh MID conflict
            await new Promise(r => setTimeout(r, 50));
            const producerIdAudio = await mediasoupstore.produce({
                track: audioTrack,
                type: "screen-audio",
                kind: "audio"
            });
            dataShareScreen.value.producers.audio = producerIdAudio;
            dataShareScreen.value.streams.audio = new MediaStream([audioTrack]);

            audioTrack.addEventListener("ended", async () => {
                const producer = mediasoupstore.getProducer({ producerId: producerIdAudio });
                producer.track.stop();
                await producer.close();
                mediasoupstore.transports.sendTransport.producers.delete(producerIdAudio);
                socketStore.closeProducer({ producerId: producerIdAudio });
                dataShareScreen.value.isSharingScreen = false;
                dataShareScreen.value.producers.audio = "";
                dataShareScreen.value.streams.audio = null;
            });
        }

    }

    const newParticipant = async ({ participant }) => {
        users.value.push(participant);
    }

    const producerClosed = async ({ producerId, anotherId, appData }) => {
        const user = users.value.find(user => user.socketId === anotherId);

        if (appData.source === "camera") {
            user.camera = false;
            const consumerId = user.consumers.camera;
            await mediasoupstore.closeConsumer({ consumerId });
            user.consumers.camera = "";
            user.producers.camera = "";
            user.streams.camera = null;
        } else if (appData.source === "micro") {
            user.micro = false;
            const consumerId = user.consumers.micro;
            await mediasoupstore.closeConsumer({ consumerId });
            user.consumers.micro = "";
            user.producers.micro = "";
            user.streams.micro = null;
        } else if (appData.source === "screen-video") {
            const consumerId = dataShareScreen.value.consumers.video;
            await mediasoupstore.closeConsumer({ consumerId });
            dataShareScreen.value.consumers.video = "";
            dataShareScreen.value.producers.video = "";
            dataShareScreen.value.socketId = "";
            dataShareScreen.value.isSharingScreen = false;
            dataShareScreen.value.streams.video = null;
        } else if (appData.source === "screen-audio") {
            const consumerId = dataShareScreen.value.consumers.audio;
            await mediasoupstore.closeConsumer({ consumerId });
            dataShareScreen.value.consumers.audio = "";
            dataShareScreen.value.producers.audio = "";
            dataShareScreen.value.socketId = "";
            dataShareScreen.value.isSharingScreen = false;
            dataShareScreen.value.streams.audio = null;
        }

    }

    const showEmoji = (id) => {
        const data = emoji.value.find(v => v.id === id);

        const thisUser = users.value.find(v => v.socketId === socket.value.id);

        if (thisUser) {
            thisUser.emoji = data.id;
        }

        socketStore.showEmoji(id);

        setTimeout(() => {
            if (thisUser.emoji === id) {
                thisUser.emoji = "";
                socketStore.eraseEmojiSend();
            }

        }, 7000)
    }

    const receiveEmoji = ({ socketId, id }) => {
        const user = users.value.find(v => v.socketId === socketId);
        user.emoji = id;
    }

    const eraseEmoji = ({ socketId, id }) => {
        const user = users.value.find(v => v.socketId === socketId);
        user.emoji = "";
    }

    const raiseHand = () => {
        const user = users.value.find(v => v.socketId === socket.value.id);
        user.raiseHand = true;
        socketStore.raiseHand();
    }

    const raiseHandReceive = ({ socketId }) => {
        const user = users.value.find(v => v.socketId === socketId);
        user.raiseHand = true;
    }

    const lowerhand = () => {
        const user = users.value.find(v => v.socketId === socket.value.id);
        user.raiseHand = false;
        socketStore.lowerHand();
    }

    const lowerhandReceive = ({ socketId }) => {
        const user = users.value.find(v => v.socketId === socketId);
        user.raiseHand = false;
    }


    return {
        user,
        users,
        joinMeeting,
        newProducer,
        turnOnDevice,
        shareScreen,
        newParticipant,
        turnOffDevice,
        producerClosed,
        renderVideo,
        dataShareScreen,
        showDevice,
        typeDevice,
        emoji,
        showEmoji,
        receiveEmoji,
        eraseEmoji,
        raiseHandReceive,
        lowerhand,
        raiseHand,
        lowerhandReceive
    }
})