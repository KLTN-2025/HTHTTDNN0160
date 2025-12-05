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
const { typeDevice } = storeToRefs(meetingStore);

const list = ref({});

async function getDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const mics = devices.filter(d => d.kind === "audioinput");

    const cams = devices.filter(d => d.kind === "videoinput");

    const speakers = devices.filter(d => d.kind === "audiooutput");

    return { mics, cams, speakers };
}

const enumerateDevices = ref(null);

onMounted(async () => {
    enumerateDevices.value = await getDevices();
    console.log(enumerateDevices.value);
})

const showListOption = (type) => {
    if (type === "cam") {
        list.value = enumerateDevices.value.cams;
    } else if (type === "mic") {
        list.value = enumerateDevices.value.mics;
    } else if (type === "speaker") {
        list.value = enumerateDevices.value.speakers;
    }
}

watch(typeDevice, async () => {
    await getDevices();
})

</script>
<template>
    <div class="box-option">
        <button @click="showListOption(typeDevice)" class="box-option-item">
            <IconMicro v-if="typeDevice === 'mic'"></IconMicro>
            <IconCamera v-else></IconCamera>
            <span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptate</span>
            <IconArrowUp></IconArrowUp>
        </button>
        <button @click="showListOption('speaker')" class="box-option-item" v-show="typeDevice === 'mic'">
            <IconSpeaker></IconSpeaker>
            <span>Lorem ipsum dolor sit amet, consectetur</span>
            <IconArrowUp></IconArrowUp>
        </button>
        <button class="btn-setting">
            <IconSetting></IconSetting>
        </button>
        <div class="list-option">
            <div v-for="value in Object.values(list).filter(v => v.deviceId !== 'default' && v.deviceId !== 'communications')"
                :key="value.deviceId" class="item">
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