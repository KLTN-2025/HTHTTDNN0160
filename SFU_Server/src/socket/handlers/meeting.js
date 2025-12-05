import { meetings } from "../../../server.js";
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

export const joinMeeting = async ({ meetingId, socketId, user }) => {
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

export const leaveMeeting = async ({ meetingId }) => {
    const meeting = meetings.get(meetingId);
    if (!meeting) return;

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