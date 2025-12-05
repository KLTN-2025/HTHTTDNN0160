<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps(['stream']);
const audioRef = ref(null);

const playAudio = async () => {
    if (!audioRef.value) return;

    try {
        const playPromise = audioRef.value.play();
        if (playPromise !== undefined) {
            await playPromise;
        }
    } catch (error) {
        console.error('❌ Audio playback failed:', error.name, error.message);
    }
};

onMounted(async () => {
    if (audioRef.value && props.stream) {
        audioRef.value.srcObject = props.stream;
        await playAudio();
    } else {
        console.warn('   ⚠️ Cannot mount: audioRef or stream missing');
    }
});

watch(() => props.stream, async (newStream, oldStream) => {
    if (!audioRef.value) {
        return;
    }

    audioRef.value.srcObject = newStream ?? null;
    if (newStream) {
        await playAudio();
    }
});
</script>

<template>
    <audio ref="audioRef" autoplay playsinline></audio>
</template>
