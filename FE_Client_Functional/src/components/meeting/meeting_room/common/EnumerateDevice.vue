<script setup>
import { onMounted, ref, watch } from 'vue';

import IconMicro from '../icons/IconMicro.vue';
import IconCamera from '../icons/IconCamera.vue';
import IconSpeaker from '../icons/IconSpeaker.vue';
import IconArrowUp from '../icons/IconArrowUp.vue';
import IconSetting from '../icons/IconSetting.vue';
import { useMeetingStore } from '@/stores/meeting/useMeetingStore';
import { storeToRefs } from 'pinia';

const meetingStore = useMeetingStore();
const { typeDevice, enumerateDevices, user } = storeToRefs(meetingStore);

const list = ref({});
const device = ref("");
let typeSwitch = "";
const switching = ref(false);

const showListOption = (type) => {
    typeSwitch = type
    if (type === "camera") {
        list.value = enumerateDevices.value.cams;
        device.value = user.value.cam;
    } else if (type === "micro") {
        list.value = enumerateDevices.value.mics;
        device.value = user.value.mic;
    } else if (type === "speaker") {
        list.value = enumerateDevices.value.speakers;
        device.value = user.value.speaker;
    }
}

const onSwitchDevice = async (deviceId) => {
    if (switching.value) return;
    if (deviceId === device.value) return;

    switching.value = true;

    try {
        const result = await meetingStore.switchDevice({
            deviceId,
            type: typeSwitch
        });

        if (result) {
            device.value = deviceId;
        }
    } finally {
        switching.value = false;
    }
};

</script>
<template>
    <div class="box-option">
        <button @click="showListOption(typeDevice)" class="box-option-item">
            <IconMicro v-if="typeDevice === 'micro'"></IconMicro>
            <IconCamera v-else></IconCamera>
            <span>{{
                typeDevice === 'micro'
                    ? enumerateDevices?.mics.find(v => v.deviceId === user.mic).label
                    : enumerateDevices?.cams.find(v => v.deviceId === user.cam).label
            }}</span>
            <IconArrowUp></IconArrowUp>
        </button>
        <button @click="showListOption('speaker')" class="box-option-item" v-show="typeDevice === 'micro'">
            <IconSpeaker></IconSpeaker>
            <span>{{enumerateDevices?.speakers.find(v => v.deviceId === user.speaker).label}}</span>
            <IconArrowUp></IconArrowUp>
        </button>
        <button class="btn-setting">
            <IconSetting></IconSetting>
        </button>
        <div class="list-option">
            <div @click="onSwitchDevice(value.deviceId)" v-for="value in list" :key="value.deviceId" class="item"
                :style="{ color: value.deviceId === device ? '#5DA9E9' : '' }">
                <div class="icon-tick">
                    <IconCamera v-if="value.kind === 'videoinput'"></IconCamera>
                    <IconSpeaker v-else-if="value.kind === 'audiooutput'"></IconSpeaker>
                    <IconMicro v-else></IconMicro>
                </div>
                <p>{{ value.label }}</p>
            </div>
        </div>
    </div>
</template>