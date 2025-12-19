import { createRouter, createWebHistory } from "vue-router";


import View_MeetingRoom from "../views/meeting/MeetingRoom.vue";
import View_Default from "../views/admin/Default.vue";

const routes = [
    {
        path: "/",
        name: "admin",
        component: View_Default,
        // children: [
        //     {
        //         path: "",
        //         name: "dashboard",
        //         component: DashboardComponent,
        //     },
        //     {
        //         path: "users",
        //         name: "users",
        //         component: UsersComponent,
        //     },
        //     {
        //         path: "settings",
        //         name: "settings",
        //         component: SettingsComponent,
        //     },
        // ],
    },
    {
        path: "/meeting",
        name: "meeting",
        component: View_MeetingRoom,
    },
]


const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
