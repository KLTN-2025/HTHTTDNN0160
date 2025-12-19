<script setup>
import IconMicro from '../icons/IconMicro.vue';
import IconMicroSlash from '../icons/IconMicroSlash.vue';
import IconArrowUp from '../icons/IconArrowUp.vue';
import Tooltip from '../common/Tooltip.vue';
import { useMeetingStore } from '@/stores/meeting/useMeetingStore';
import { storeToRefs } from 'pinia';

const meetingStore = useMeetingStore();
const { user } = storeToRefs(meetingStore);


</script>

<template>
    <div id="toogle-mic" class="toggle-device" :class="user.micro ? 'on' : ''">
        <button @click="user.micro ? meetingStore.turnOffDevice({ type: 'micro' }) : meetingStore.turnOnDevice({
            type: 'micro'
        })" class="device-btn">
            <IconMicro v-if="user.micro"></IconMicro>
            <IconMicroSlash v-else></IconMicroSlash>
            <Tooltip>{{ user.micro ? "Turn off micro" : "Turn on micro" }}</Tooltip>
        </button>
        <button @click="meetingStore.showDevice({ type: 'micro' })" class="option-device-btn">
            <IconArrowUp></IconArrowUp>
        </button>
    </div>
</template>