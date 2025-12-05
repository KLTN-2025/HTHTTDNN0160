<script setup>
import { useSocketStore } from '@/stores/meeting/useSocketStore';
import IconMicro from '../icons/IconMicro.vue';
import IconMicroSlash from '../icons/IconMicroSlash.vue';

import { ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useMeetingStore } from '@/stores/meeting/useMeetingStore';

/**
 * @typedef {Object} User
 * @property {string} socketId
 * @property {boolean} isSharingScreen
 * @property {{ video?: MediaStream, audio?: MediaStream }} streams
 * @property {{ video?: string, audio?: string }} producers
 * 
 */

/** @type {{ user: User }} */
const props = defineProps({
    user: Object
});

const socketStore = useSocketStore();
const { socket } = storeToRefs(socketStore);
const meetingStore = useMeetingStore();
const { dataShareScreen, users } = storeToRefs(meetingStore);

const videoRef = ref(null);

watch(
    () => props.user?.streams?.video,
    async (newStream) => {
        await nextTick();
        if (videoRef.value) {
            videoRef.value.srcObject = newStream ?? null;
        }
    }
);

</script>

<template>
    <div class="video-container">
        <div class="video">
            <video class="video-present" style="object-fit: contain;" ref="videoRef" autoplay playsinline></video>
        </div>

        <!-- <div class="host-user"> (Host) {{ user.socketId === soc }}</div> -->

        <div class="name-user">
            {{users?.find(u => u.socketId === dataShareScreen.socketId)?.name || ""}}
        </div>

        <div class="icon-audio-stage">
            <IconMicro v-if="user?.producers?.audio"></IconMicro>
            <IconMicroSlash v-else></IconMicroSlash>
        </div>
    </div>
</template>
<style scoped>
    
</style>