<script setup>
import { useMeetingStore } from '@/stores/meeting/useMeetingStore';
import IconHandUp from '../icons/IconHandUp.vue';
import Tooltip from '../common/Tooltip.vue';
import { useSocketStore } from '@/stores/meeting/useSocketStore';
import { storeToRefs } from 'pinia';

const meetingStore = useMeetingStore();
const { users } = storeToRefs(meetingStore);
const socketStore = useSocketStore();
const { socket } = storeToRefs(socketStore);


</script>

<template>
    <button
        @click="users.find(v => v.socketId === socket.id)?.raiseHand ? meetingStore.lowerhand() : meetingStore.raiseHand()"
        class="btn-common hand-up">
        <IconHandUp></IconHandUp>
        <Tooltip>{{users.find(v => v.socketId === socket.id)?.raiseHand ? "Lower Hand" : "Raise Hand"}}</Tooltip>
    </button>
</template>