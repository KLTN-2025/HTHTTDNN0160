<script setup>
import { useMeetingStore } from '@/stores/meeting/useMeetingStore';
import IconSlideShow from '../icons/IconSlideShow.vue';
import Tooltip from '../common/Tooltip.vue';
import { useSocketStore } from '@/stores/meeting/useSocketStore';

const meetingStore = useMeetingStore();

</script>



<template>
    <button @click="meetingStore.shareScreen" class="btn-common slide-show">
        <IconSlideShow></IconSlideShow>
        <Tooltip>Slide Show</Tooltip>
    </button>
</template>