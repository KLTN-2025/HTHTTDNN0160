<script setup>
import IconChat from '../icons/IconChat.vue';
import Tooltip from '../common/Tooltip.vue';

const emit = defineEmits(['turn']);

const props = defineProps(['isChat']);

</script>

<template>
    <button @click="emit('turn')" id="btn-chat" class="btn-common chat" :style="{ backgroundColor : isChat ? '#a8c7fa' : '' }">
        <IconChat></IconChat>
        <div class="count">
            9+
        </div>
        <Tooltip>Chat</Tooltip>
    </button>
</template>