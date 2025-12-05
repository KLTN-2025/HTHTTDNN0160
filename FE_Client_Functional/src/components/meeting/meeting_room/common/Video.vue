<script setup>
import IconMicro from '../icons/IconMicro.vue';
import IconMicroSlash from '../icons/IconMicroSlash.vue';
import IconRaiseHand from '../icons/IconRaiseHand.vue';

import { ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useMeetingStore } from '@/stores/meeting/useMeetingStore';

/**
 * @typedef {Object} User
 * @property {string} socketId
 * @property {string} name
 * @property {boolean} camera
 * @property {boolean} micro
 * @property {{ camera?: MediaStream, microphone?: MediaStream }} streams
 */

/** @type {{ user: User }} */

const props = defineProps({
    user: Object
});

const meetingStore = useMeetingStore();
const { dataShareScreen, emoji } = storeToRefs(meetingStore);

const videoRef = ref(null);

const gradient = ref("");

watch(
    () => props.user?.streams?.camera,
    async (newStream) => {
        await nextTick();
        if (videoRef.value) {
            videoRef.value.srcObject = newStream ?? null;
        }
    }
);

const capitalizeFirstLetter = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
}

const randomColor = () => {
    const hue = Math.floor(Math.random() * 360);

    const saturation = 70;

    const light1 = 60;
    const light2 = 40;
    const light3 = 25;

    const color1 = `hsl(${hue}, ${saturation}%, ${light1}%)`;
    const color2 = `hsl(${hue}, ${saturation}%, ${light2}%)`;
    const color3 = `hsl(${hue}, ${saturation}%, ${light3}%)`;

    return `radial-gradient(circle, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
}

gradient.value = randomColor();

</script>

<template>
    <div class="video-container" :class="dataShareScreen.isSharingScreen ? 'present' : ''">
        <div v-if="user?.camera" class="video">
            <video ref="videoRef" autoplay playsinline></video>
        </div>

        <div v-else class="avatar-placeholder">
            <div class="avatar-background-color" :style="{ background: gradient }">
                <div class="avatar-name-user">{{ capitalizeFirstLetter(user?.name) }}
                </div>
            </div>
        </div>

        <div class="emoji-video">{{emoji.find(v => v.id === user?.emoji)?.emoji}}</div>

        <!-- <div class="host-user"> (Host) {{ user.socketId === soc }}</div> -->

        <div class="name-user">{{ user?.name }}
            <IconRaiseHand v-if="user?.raiseHand" style="margin-left: 20px;"></IconRaiseHand>
        </div>

        <div class="icon-audio-stage">
            <IconMicro v-if="user?.micro"></IconMicro>
            <IconMicroSlash v-else></IconMicroSlash>
        </div>
    </div>
</template>