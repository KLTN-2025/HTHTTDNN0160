<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
    router.push("/");
};

const createMeeting = () => {
    router.push("/meetings");
};
</script>

<template>
    <div class="notfound-wrapper">
        <div class="notfound-card">
            <!-- Icon -->
            <div class="icon">
                🎥
            </div>

            <!-- Text -->
            <h2>Không tìm thấy cuộc họp</h2>
            <p>
                Cuộc họp này có thể đã kết thúc,<br />
                hoặc đường liên kết không còn hợp lệ.
            </p>

            <!-- Actions -->
            <div class="actions">
                <button class="btn btn-primary" @click="goHome">
                    Quay về trang chủ
                </button>

                <button class="btn btn-outline" @click="createMeeting">
                    Tạo cuộc họp mới
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.notfound-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
}

.notfound-card {
    text-align: center;
    max-width: 420px;
    padding: 40px 24px;
}

.icon {
    font-size: 64px;
    margin-bottom: 16px;
}

h2 {
    font-size: 22px;
    font-weight: 600;
    color: #202124;
    margin-bottom: 8px;
}

p {
    font-size: 14px;
    color: #5f6368;
    line-height: 1.6;
    margin-bottom: 24px;
}

.actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    padding: 10px 18px;
    font-size: 14px;
    border-radius: 24px;
    cursor: pointer;
    border: none;
}

.btn-primary {
    background: #1a73e8;
    color: #fff;
}

.btn-primary:hover {
    background: #1669c1;
}

.btn-outline {
    background: transparent;
    border: 1px solid #dadce0;
    color: #1a73e8;
}

.btn-outline:hover {
    background: #f1f3f4;
}
</style>
