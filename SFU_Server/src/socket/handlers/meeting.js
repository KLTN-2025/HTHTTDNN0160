import { meetings } from "../../../server.js";
import { getWorker } from "../../media/handlers/worker.handler.js";
import Meeting from "../../models/Meeting.js";
import { establishSFU } from "./mediasoup.js";
import { Mutex } from "async-mutex";

const meetingLocks = new Map();

function getLock(meetingId) {
    if (!meetingLocks.has(meetingId)) {
        meetingLocks.set(meetingId, new Mutex());
    }
    return meetingLocks.get(meetingId);
}

export const joinMeeting = async ({ meetingId, socketId, user, io }) => {
    const lock = getLock(meetingId);
    const release = await lock.acquire();

    try {
        let meeting;
        if (meetings.has(meetingId)) {
            meeting = meetings.get(meetingId);
        } else {
            meeting = new Meeting();
            meetings.set(meetingId, meeting);
        }

        let currentRouter = meeting.getCurrentRouter();
        const router = await establishSFU({ router: currentRouter });

        if (!currentRouter || currentRouter.id !== router.id) {
            meeting.setRouter(router);
            meeting.setCurrentRouter(router.id);
            const audioLevelObserver = await meeting.createObserverUser(router.id);

            audioLevelObserver.on('volumes', (volumes) => {
                const now = Date.now();

                volumes.forEach(v => {
                    const user = meeting.getDataMeeting().dataUsers.find(u => u.producers.micro === v.producer.id);
                    if (!user) return;

                    if (!meeting.userStats[user.socketId]) {
                        meeting.userStats[user.socketId] = { speakingTime: 0, speakingCount: 0, lastSpeaking: now };
                    }

                    const stats = meeting.userStats[user.socketId];

                    if (v.volume > -50) {
                        stats.speakingTime += 200;
                        stats.lastSpeaking = now;
                        stats.speakingCount += 1;
                    }
                });
            });

        }

        const participant = {
            id: "1",
            socketId,
            name: user.name,
            micro: user.micro,
            isSpeaking: false,
            camera: user.camera,
            emoji: null,
            raiseHand: false,
            lang: user.lang,
            isLive: true,
            producers: { camera: "", micro: "" },
            consumers: { camera: "", micro: "" },
            streams: { camera: null, micro: null }
        };

        meeting.dataMeeting.dataUsers.push(participant);

        meeting.setParticipant(socketId, router.id);

        return {
            participant,
            users: meeting.getDataMeeting()
        };

    } finally {
        release();
    }
};

export const leaveMeeting = async ({ meetingId, socketId }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return;

    const { routerId, size } = await meeting.leaveMeeting(socketId);

    const router = meeting.getRouter(routerId);

    const workerId = router.workerId;

    const worker = getWorker(workerId);

    worker.nums = (worker.nums || 0) - 1;

    if (size === 0) {
        meetings.delete(meetingId);
        for (const [routerId, router] of meeting.routers) {
            router.close();
            meeting.routers.delete(routerId);
        }
    }

}


export const showEmoji = ({ meetingId, id, socketId }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return;

    const dataUsers = meeting.getDataMeeting().dataUsers;

    const user = dataUsers.find(v => v.socketId === socketId);

    if (user) {
        user.emoji = id;
    }
}

export const eraseEmoji = ({ meetingId, id, socketId }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return;

    const dataUsers = meeting.getDataMeeting().dataUsers;

    const user = dataUsers.find(v => v.socketId === socketId);

    if (user) {
        user.emoji = "";
    }
}

export const raiseHand = ({ meetingId, socketId }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return;

    const dataUsers = meeting.getDataMeeting().dataUsers;

    const user = dataUsers.find(v => v.socketId === socketId);

    if (user) {
        user.raiseHand = true;
    }
}

export const lowerHand = ({ meetingId, socketId }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return;

    const dataUsers = meeting.getDataMeeting().dataUsers;

    const user = dataUsers.find(v => v.socketId === socketId);

    if (user) {
        user.raiseHand = false;
    }
}
