<script setup>
import IconDeclineCall from '../icons/IconDeclineCall.vue';
import IconArrowUp from '../icons/IconArrowUp.vue';
import { useRouter } from "vue-router";
import { useSocketStore } from '@/stores/meeting/useSocketStore';
import { storeToRefs } from 'pinia';
import { useMeetingStore } from '@/stores/meeting/useMeetingStore';
import { useMediasoupStore } from '@/stores/meeting/useMediasoupStore';

const router = useRouter();

const socketStore = useSocketStore();

const meetingStore = useMeetingStore();

const mediasoupStore = useMediasoupStore();

const { socket } = storeToRefs(socketStore);

const leave = () => {
    window.location.href = '/leave-meeting';
}

</script>

<template>
    <div class="option-cancel has-option">
        <button @click="leave" class="btn-cancel">
            <IconDeclineCall></IconDeclineCall>
            <div class="tooltip">Leave meeting</div>
        </button>
        <button class="btn-cancel-option">
            <IconArrowUp></IconArrowUp>
            <div class="tooltip">Turn On Camera</div>
        </button>
    </div>
</template>