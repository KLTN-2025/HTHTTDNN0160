<script setup>
import { useMeetingStore } from '@/stores/meeting/useMeetingStore';
import IconCamera from '../icons/IconCamera.vue';
import IconCameraSlash from '../icons/IconCameraSlash.vue';
import IconMicro from '../icons/IconMicro.vue';
import IconMicroSlash from '../icons/IconMicroSlash.vue';
import { storeToRefs } from 'pinia';


const meetingStore = useMeetingStore();

const { users } = storeToRefs(meetingStore);

</script>

<template>
    <div class="info-content-user">
        <div v-for="value in users" :key="value.socketId" class="user">
            <div class="name">{{ value.name }}</div>
            <div class="devices">
                <div class="mic">
                    <IconMicro v-if="value.micro"></IconMicro>
                    <IconMicroSlash v-else></IconMicroSlash>
                </div>
                <div class="cam">
                    <IconCamera v-if="value.camera"></IconCamera>
                    <IconCameraSlash v-else></IconCameraSlash>
                </div>
            </div>
        </div>
    </div>
</template>