<script setup>
import IconDeclineCall from '../icons/IconDeclineCall.vue';
import IconArrowUp from '../icons/IconArrowUp.vue';
</script>

<template>
    <div class="option-cancel has-option">
        <button class="btn-cancel">
            <IconDeclineCall></IconDeclineCall>
            <div class="tooltip">Turn On Camera</div>
        </button>
        <button class="btn-cancel-option">
            <IconArrowUp></IconArrowUp>
            <div class="tooltip">Turn On Camera</div>
        </button>
    </div>
</template>