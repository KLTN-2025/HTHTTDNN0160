import { createRouter, createWebHistory } from "vue-router";


import View_MeetingRoom from "../views/meeting/MeetingRoom.vue";


const routes = [
    {
        path: "/meeting",
        name: "meeting",
        component: View_MeetingRoom,
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
