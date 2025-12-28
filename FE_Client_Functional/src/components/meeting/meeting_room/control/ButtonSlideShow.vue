<script setup>
import { useMeetingStore } from '@/stores/meeting/useMeetingStore';
import IconSlideShow from '../icons/IconSlideShow.vue';
import Tooltip from '../common/Tooltip.vue';
import { useSocketStore } from '@/stores/meeting/useSocketStore';
import { storeToRefs } from 'pinia';

const meetingStore = useMeetingStore();

const { dataShareScreen } = storeToRefs(meetingStore);

</script>



<template>
    <button @click="meetingStore.shareScreen" :style="{ backgroundColor: dataShareScreen.isSharingScreen ? '#a8c7fa' : ''}" class="btn-common slide-show">
        <IconSlideShow></IconSlideShow>
        <Tooltip>Slide Show</Tooltip>
    </button>
</template>