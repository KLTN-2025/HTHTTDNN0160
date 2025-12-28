<script setup>
import { ref } from "vue";
import axios from "@/service/api/admin/setting.js";

import { useRouter } from "vue-router";

const router = useRouter();

const form = ref({
    email: "",
    password: "",
    remember: true,
});

const loading = ref(false);
const error = ref("");

const login = () => {
    if (loading.value) return;

    loading.value = true;
    error.value = "";

    axios
        .post("http://127.0.0.1:8000/api/login", form.value)
        .then((res) => {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${res.data.token}`;

            console.log(axios.defaults.headers.common[
                "Authorization"
            ], "login");
            

            router.push("/");

        })
        .catch((err) => {
            error.value =
                err.response?.data?.message ||
                "Email hoặc mật khẩu không đúng";
        })
        .finally(() => {
            loading.value = false;
        });
};
</script>
<template>
    <div class="auth-main">
        <div class="auth-wrapper v3">
            <div class="auth-form">
                <div class="card my-5">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-end mb-4">
                            <h3 class="mb-0"><b>Login</b></h3>
                        </div>

                        <!-- ERROR -->
                        <div v-if="error" class="alert alert-danger">
                            {{ error }}
                        </div>

                        <div class="form-group mb-3">
                            <label class="form-label">Email Address</label>
                            <input v-model="form.email" type="email" class="form-control" placeholder="Email Address">
                        </div>

                        <div class="form-group mb-3">
                            <label class="form-label">Password</label>
                            <input v-model="form.password" type="password" class="form-control" placeholder="Password">
                        </div>

                        <div class="d-flex mt-1 justify-content-between">
                            <div class="form-check">
                                <input v-model="form.remember" class="form-check-input input-primary" type="checkbox"
                                    id="remember">
                                <label class="form-check-label text-muted" for="remember">
                                    Keep me sign in
                                </label>
                            </div>
                        </div>

                        <div class="d-grid mt-4">
                            <button type="button" class="btn btn-primary" :disabled="loading" @click="login">
                                {{ loading ? "Logging in..." : "Login" }}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
