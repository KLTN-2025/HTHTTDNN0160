<script setup>
import IconSend from "@/components/meeting/meeting_room/icons/IconSend.vue";
import { useMeetingStore } from "@/stores/meeting/useMeetingStore";
import { useSocketStore } from "@/stores/meeting/useSocketStore";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";

const meetingStore = useMeetingStore();
const { messages, users } = storeToRefs(meetingStore);

const socketStore = useSocketStore();
const { socket } = storeToRefs(socketStore);

const message = ref("");



const shouldShowTime = (index) => {
    if (index === 0) return false

    const prev = messages.value[index - 1]

    const curr = messages.value[index]

    if (prev.socketId !== curr.socketId) return true

    return toMinutes(prev.time) !== toMinutes(curr.time)
}

const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}

const isTranslated = ref(true);

</script>


<template>
    <div class="btns-translator">
        <button @click="isTranslated = false" :style="{ backgroundColor: !isTranslated ? '#A8C7FA' : '' }">Bản
            gốc</button>
        <button @click="isTranslated = true" :style="{ backgroundColor: isTranslated ? '#A8C7FA' : '' }">Bản
            dịch</button>
    </div>
    <div class="info-content-chat">
        <div class="messages">
            <template v-for="(value, index) in messages">
                <div v-if="value.socketId !== socket.id" class="user">
                    <span class="name">{{users.find(v => v.socketId === value.socketId).name}}</span>
                    <span class="message">{{ isTranslated ? value.translated : value.message }}</span>
                </div>
                <div v-if="value.socketId === socket.id" class="me">{{ value.message }}</div>
                <div v-if="shouldShowTime(index)" class="time">{{ value.time }}</div>
            </template>
        </div>
        <div class="chat-input">
            <input @keydown.enter="meetingStore.sendMessage(message.trim()); message = ''" v-model="message" type="text">
            <button @click="meetingStore.sendMessage(message.trim()); message = ''">
                <IconSend style="height: 25px"></IconSend>
            </button>
        </div>
    </div>

</template>

<style scoped>
.btns-translator {
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
    gap: 5px;
}

.btns-translator button {
    flex: 1;
    height: 100%;
    border-radius: 8px;
    border: none;
    outline: none;
    cursor: pointer;
    background-color: #E7E7E7;
}

.btns-translator button:hover {
    background-color: rgb(197, 197, 197);
    border: 1px solid rgba(173, 173, 173, 0.5);
}
</style>