import { createRouter, createWebHistory } from "vue-router";
import axios from "@/service/api/admin/setting.js";


import View_MeetingRoom from "../views/meeting/MeetingRoom.vue";
import View_Default from "../views/admin/Default.vue";
import View_Meeting from "@/components/admin/content/Meeting.vue";
import View_Room from "@/components/admin/content/Room.vue";
import View_Role from "@/components/admin/content/Role.vue";
import View_User from "@/components/admin/content/User.vue";
import View_Login from "@/views/admin/Login.vue";
import View_CreateMeeting from "../views/meeting/CreateMeetingRoom.vue";
import View_Register from "@/views/admin/Register.vue";
import View_404 from "@/views/admin/404.vue";
import View_Leave from "@/views/admin/Leave.vue";

const routes = [
    {
        path: "/",
        name: "create meeting",
        component: View_CreateMeeting,
    },
    {
        path: "/",
        name: "default",
        component: View_Default,
        children: [
            {
                path: "meetings",
                name: "meetings",
                component: View_Meeting,
            },
            {
                path: "rooms",
                name: "rooms",
                component: View_Room,
            },
        ],
    },
    {
        path: "/admin",
        name: "admin",
        component: View_Default,
        children: [
            {
                path: "users",
                name: "users",
                component: View_User,
            },
            {
                path: "roles",
                name: "roles",
                component: View_Role,
            }
        ]
    },
    {
        path: "/login",
        name: "login",
        component: View_Login,
    },
    {
        path: "/register",
        name: "register",
        component: View_Register,
    },
    {
        path: "/meeting/:id",
        name: "meeting",
        component: View_MeetingRoom,
        beforeEnter: async (to) => {
            try {
                console.log(to.params.id);
                
                const meeting = await axios.get(`http://127.0.0.1:8000/api/meetings/${to.params.id}`);

                if (meeting) {
                    return true;
                } else {
                    return { name: "not-found" };
                }

            } catch (e) {
                console.log(e);
                
            }
        },
    },
    {
        path: "/404",
        name: "not-found",
        component: View_404,
    },
    {
        path: "/leave-meeting",
        name: "leave",
        component: View_Leave,
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/404",
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
