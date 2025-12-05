<script setup>
// Lib VueJS
import { nextTick, onMounted, ref, watch } from "vue";

// Event JS
import { initEvents } from "@/assets/meeting/meeting_room/event";

// Component: Content
import Video from '@/components/meeting/meeting_room/common/Video.vue';
import VideoShareScreen from "@/components/meeting/meeting_room/common/VideoShareScreen.vue";
import TimeStart from '@/components/meeting/meeting_room/content/TimeStart.vue';
import Title from '@/components/meeting/meeting_room/content/Title.vue';
import Audio from "@/components/meeting/meeting_room/common/Audio.vue";
import EnumerateDevice from "@/components/meeting/meeting_room/common/EnumerateDevice.vue";

// Component: Icon
import IconVerticalLine from '@/components/meeting/meeting_room/icons/IconVerticalLine.vue';

// Component: Button
import ButtonSlideShow from '@/components/meeting/meeting_room/control/ButtonSlideShow.vue';
import ButtonEmoji from '@/components/meeting/meeting_room/control/ButtonEmoji.vue';
import ButtonCaption from '@/components/meeting/meeting_room/control/ButtonCaption.vue';
import ButtonHandUp from '@/components/meeting/meeting_room/control/ButtonHandUp.vue';
import ButtonMore from '@/components/meeting/meeting_room/control/ButtonMore.vue';
import ButtonCancelCall from '@/components/meeting/meeting_room/control/ButtonCancelCall.vue';
import ButtonUsers from '@/components/meeting/meeting_room/control/ButtonUsers.vue';
import ButtonChat from '@/components/meeting/meeting_room/control/ButtonChat.vue';
import ButtonCamera from '@/components/meeting/meeting_room/control/ButtonCamera.vue';
import ButtonMicro from '@/components/meeting/meeting_room/control/ButtonMicro.vue';


import { useMeetingStore } from "@/stores/meeting/useMeetingStore";
import { storeToRefs } from "pinia";
import { useSocketStore } from "@/stores/meeting/useSocketStore";

/**
 * @typedef {Object} User
 * @property {string} socketId
 * @property {string} name
 * @property {boolean} camera
 * @property {boolean} micro
 * @property {{ camera?: MediaStream, microphone?: MediaStream }} streams
 */

/** @type {{ user: User }} */

const meetingStore = useMeetingStore();
const { users, renderVideo, dataShareScreen, emoji } = storeToRefs(meetingStore);
const socketStore = useSocketStore();
const { socket } = storeToRefs(socketStore);

const VideoContainer = ref(null);

onMounted(async () => {
    initEvents();
    await socketStore.connectSocket();
    await meetingStore.joinMeeting();
})


watch(
    () => users.value.length,
    async (length) => {
        await nextTick();
        let row = 0;
        let col = 0;

        const videoSqrt = Math.sqrt(length);
        row = Math.floor(videoSqrt);

        col = Math.ceil(length / row);

        VideoContainer.value.style.gridTemplateColumns = `repeat(${col}, 1fr)`;
        VideoContainer.value.style.gridTemplateRows = `repeat(${row}, 1fr)`;
    }
)

</script>

<template>
    <section class="main-meeting">

        <div class="content-panel">

            <div class="video-main" :class="dataShareScreen.isSharingScreen ? 'present' : ''">

                <Audio v-if="dataShareScreen.isSharingScreen
                    && dataShareScreen.socketId
                    && dataShareScreen.socketId !== socket.id
                    && dataShareScreen.streams?.audio" :stream="dataShareScreen.streams.audio"></Audio>
                <VideoShareScreen :user="dataShareScreen"></VideoShareScreen>

            </div>

            <div ref="VideoContainer" class="video-panel" :class="dataShareScreen.isSharingScreen ? 'present' : ''">
                <Audio v-for="user in users.filter(u => u.socketId !== socket.id)" :key="user.socketId"
                    :stream="user.streams?.micro">
                </Audio>
                <Video v-for="user in renderVideo" :key="user.socketId" :user="user"></Video>
            </div>

            <div class="info-panel">
                <div class="info-content">

                </div>
            </div>
        </div>

        <div class="caption-section"></div>


        <div class="emoji-section">
            <div class="emoji">
                <button @click="meetingStore.showEmoji(value.id)" v-for="value in emoji">
                    <span>{{ value.emoji }}</span>
                </button>
            </div>
        </div>


        <div class="control-panel">
            <div class="info-control-section">
                <TimeStart></TimeStart>
                <IconVerticalLine></IconVerticalLine>
                <Title></Title>
            </div>
            <div class="device-control-section">

                <EnumerateDevice></EnumerateDevice>

                <ButtonMicro></ButtonMicro>

                <ButtonCamera></ButtonCamera>

                <ButtonSlideShow></ButtonSlideShow>

                <ButtonEmoji></ButtonEmoji>

                <ButtonCaption></ButtonCaption>

                <ButtonHandUp></ButtonHandUp>

                <ButtonMore></ButtonMore>

                <ButtonCancelCall></ButtonCancelCall>

            </div>
            <div class="user-control-section">
                <button class="btn-common">
                    <img src="" alt="">
                    <div class="tooltip">Turn On Camera</div>
                </button>
                <ButtonUsers></ButtonUsers>

                <ButtonChat></ButtonChat>

                <button class="btn-common">
                    <img src="" alt="">
                    <div class="tooltip close-edge-right">Turn On Camera</div>
                </button>
            </div>
        </div>

    </section>
</template>

<style src="@/assets/meeting/meeting_room/styles/general.css"></style>
