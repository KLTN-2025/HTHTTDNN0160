<script setup>
import IconUsers from '../icons/IconUsers.vue';
import Tooltip from '../common/Tooltip.vue';

const emit = defineEmits(['turn']);

const props = defineProps(['isUser']);


</script>

<template>
    <button @click="emit('turn')" id="btn-user" class="btn-common user" :style="{ backgroundColor : isUser ? '#a8c7fa' : '' }">
        <IconUsers></IconUsers>
        <div class="count">
            9+
        </div>
        <Tooltip>Participants</Tooltip>
    </button>
</template>