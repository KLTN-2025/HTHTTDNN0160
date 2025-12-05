<script setup>
import { useMeetingStore } from '@/stores/meeting/useMeetingStore';
import IconSlideShow from '../icons/IconSlideShow.vue';
import { useSocketStore } from '@/stores/meeting/useSocketStore';

const meetingStore = useMeetingStore();

</script>



<template>
    <button @click="meetingStore.shareScreen" class="btn-common slide-show">
        <IconSlideShow></IconSlideShow>
        <div class="tooltip">Turn On Camera</div>
    </button>
</template>