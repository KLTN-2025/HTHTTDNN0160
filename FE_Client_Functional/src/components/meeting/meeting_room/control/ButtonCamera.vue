<script setup>
import IconCamera from '../icons/IconCamera.vue';
import IconCameraSlash from '../icons/IconCameraSlash.vue';
import IconArrowUp from '../icons/IconArrowUp.vue';
import Tooltip from '../common/Tooltip.vue';
import { useMeetingStore } from '@/stores/meeting/useMeetingStore';
import { useSocketStore } from '@/stores/meeting/useSocketStore';
import { storeToRefs } from 'pinia';

const meetingStore = useMeetingStore();
const { user } = storeToRefs(meetingStore);


</script>

<template>
    <div class="toggle-device cam" :class="user.camera ? 'on' : ''">
        <button @click="user.camera ? meetingStore.turnOffDevice({ type: 'camera' }) : meetingStore.turnOnDevice({
            type: 'camera' })" class="device-btn">
            <IconCamera v-if="user.camera"></IconCamera>
            <IconCameraSlash v-else></IconCameraSlash>
            <Tooltip>{{ user.camera ? "Turn off camera" : "Turn on camera" }}</Tooltip>
        </button>
        <button @click="meetingStore.showDevice({ type: 'camera' })" class="option-device-btn">
            <IconArrowUp></IconArrowUp>
        </button>   
    </div>
</template>