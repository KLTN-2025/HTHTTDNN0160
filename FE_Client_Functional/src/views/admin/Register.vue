<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "@/service/api/admin/setting.js";


const router = useRouter();

const loading = ref(false);
const error = ref("");

const form = ref({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
});

const register = async () => {
    error.value = "";
    loading.value = true;

    try {
        const res = await axios.post("http://127.0.0.1:8000/api/register", form.value);

        // Lưu token & user giống login
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        router.push("/");
    } catch (err) {
        error.value =
            err.response?.data?.message || "Đăng ký thất bại, thử lại!";
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="auth-main">
        <div class="auth-wrapper v3">
            <div class="auth-form">
                <div class="card my-5">
                    <div class="card-body">

                        <div class="d-flex justify-content-between align-items-end mb-4">
                            <h3 class="mb-0"><b>Sign up</b></h3>
                            <RouterLink to="/login" class="link-primary">
                                Already have an account?
                            </RouterLink>
                        </div>

                        <!-- ERROR -->
                        <div v-if="error" class="alert alert-danger py-2">
                            {{ error }}
                        </div>

                        <!-- NAME -->
                        <div class="form-group mb-3">
                            <label class="form-label">Name*</label>
                            <input v-model="form.name" type="text" class="form-control" placeholder="Your name" />
                        </div>

                        <!-- EMAIL -->
                        <div class="form-group mb-3">
                            <label class="form-label">Email Address*</label>
                            <input v-model="form.email" type="email" class="form-control" placeholder="Email Address" />
                        </div>

                        <!-- PASSWORD -->
                        <div class="form-group mb-3">
                            <label class="form-label">Password*</label>
                            <input v-model="form.password" type="password" class="form-control"
                                placeholder="Password" />
                        </div>

                        <!-- CONFIRM -->
                        <div class="form-group mb-3">
                            <label class="form-label">Confirm Password*</label>
                            <input v-model="form.password_confirmation" type="password" class="form-control"
                                placeholder="Confirm Password" />
                        </div>

                        <p class="mt-4 text-sm text-muted">
                            By Signing up, you agree to our
                            <a href="#" class="text-primary">Terms</a> &
                            <a href="#" class="text-primary">Privacy Policy</a>
                        </p>

                        <div class="d-grid mt-3">
                            <button class="btn btn-primary" :disabled="loading" @click="register">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                Create Account
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
