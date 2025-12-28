<script setup>
import IconCamera from '@/components/meeting/meeting_room/icons/IconCamera.vue';
import axios from "@/service/api/admin/setting.js";
import { useRouter } from "vue-router";

import { ref, onMounted, onUnmounted } from "vue"

const router = useRouter();


const dropdown = ref(null)
const btn = ref(null)

const link = ref("");

const isShow = ref(false)

const toggle = () => {

    isShow.value = !isShow.value

    console.log(isShow.value);

}

const handleClickOutside = (e) => {
    if (dropdown.value && !dropdown.value.contains(e.target) && !btn.value.contains(e.target)) {
        isShow.value = false
    }
}

onMounted(() => {
    document.addEventListener("click", handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside)
})

const createMeeting = async () => {
    axios.post(`http://127.0.0.1:8000/api/meetings-now`)
        .then( async (res) => {
            router.push(`/meeting/${res.data.id}`);
        })
}

const join = () => {
    window.location.href = link.value;
}

</script>

<template>
    <div class="container">
        <header>
            <h1>Tính năng họp và gọi video<br>dành cho tất cả mọi người</h1>
            <p>Kết nối, cộng tác và ăn mừng ở mọi nơi với Meeting Pro</p>

            <div class="action-bar">
                <div style="position: relative;">
                    <button class="btn-primary" ref="btn" @click="toggle" id="new-meeting-btn">
                        <IconCamera style="height: 30px; filter: brightness(0) invert(1);"></IconCamera> Cuộc họp mới
                    </button>

                    <!-- Dropdown card giống ảnh bạn gửi -->
                    <div class="dropdown-card" ref="dropdown" :class="{ show: isShow }" id="dropdown-card">
                        <router-link to="/meetings">
                            <div class="option-item d-flex align-items-center justify-content-center text-center">
                                <div class="option-text">
                                    <div class="fw-semibold">
                                        Tạo một cuộc họp để sử dụng sau
                                    </div>
                                    <small class="text-muted">
                                        Nhận mã hoặc đường liên kết
                                    </small>
                                </div>
                            </div>
                        </router-link>
                        <div @click="createMeeting" class="option-item d-flex align-items-center justify-content-center text-center">
                            <div class="option-text">
                                <div class="fw-semibold">Bắt đầu một cuộc họp tức thì</div>
                                <small class="text-muted">Tham gia ngay lập tức</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="join-input-wrapper">
                    <span class="material-icons" style="padding:0 12px; color:#5f6368;">keyboard</span>
                    <input v-model="link" type="text" class="join-input" placeholder="Nhập mã hoặc đường liên kết" id="join-code">
                    <button @click="join" class="join-btn">Tham gia</button>
                </div>
            </div>

            <div class="quick-result" id="quick-result"></div>
        </header>

        <!-- Phần còn lại giống trước -->
        <div class="info-section">
            <h2>Nhận đường liên kết bạn có thể chia sẻ</h2>
            <p>Nhấp vào Cuộc họp mới để nhận đường liên kết mà bạn có thể gửi cho những người mình muốn họp cùng</p>
        </div>

        <footer>
            <a href="#">Tìm hiểu thêm về Meeting Pro</a>
        </footer>
    </div>
</template>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Roboto', sans-serif;
    background-color: #fff;
    color: #3c4043;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    text-align: center;
    padding: 60px 20px 20px;
}

header h1 {
    font-size: 2.8rem;
    font-weight: 500;
    margin-bottom: 16px;
    color: #202124;
}

header p {
    font-size: 1.4rem;
    color: #5f6368;
    margin-bottom: 40px;
}

.action-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-bottom: 40px;
    flex-wrap: wrap;
    position: relative;
}

.btn-primary {
    background-color: #1a73e8;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 1rem;
    border-radius: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: all 0.2s;
    position: relative;
    font-weight: 500;
}

.btn-primary:hover {
    background-color: #1765cc;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-primary:focus {
    box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.3);
}

.join-input-wrapper {
    display: flex;
    align-items: center;
    border: 1px solid #dadce0;
    border-radius: 50px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    max-width: 500px;
    flex: 1;
}

.join-input {
    flex: 1;
    padding: 12px 20px;
    border: none;
    font-size: 1rem;
}

.join-input:focus {
    outline: none;
}

.join-btn {
    background-color: transparent;
    color: #1a73e8;
    border: none;
    padding: 12px 24px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
}

.join-btn:hover {
    background-color: rgba(26, 115, 232, 0.05);
}

/* Dropdown card giống Google Meet thật nhất */
.dropdown-card {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    width: 360px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    z-index: 1000;
}

.dropdown-card.show {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(4px);
}

.option-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 16px 24px;
    cursor: pointer;
    transition: background 0.15s;
    font-size: 1rem;
}

.option-item:hover {
    background: #f8f9fa;
}

.option-icon {
    color: #5f6368;
    font-size: 24px;
}

.option-text {
    color: #202124;
    font-weight: 500;
}

.option-text small {
    display: block;
    color: #5f6368;
    font-weight: normal;
    font-size: 0.9rem;
    margin-top: 4px;
}

/* Kết quả tạo nhanh */
.quick-result {
    margin-top: 40px;
    text-align: center;
    display: none;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.quick-result strong {
    font-size: 1.3rem;
    color: #1a73e8;
    word-break: break-all;
    display: block;
    margin: 12px 0;
}

.carousel {
    position: relative;
    max-width: 800px;
    margin: 80px auto;
    text-align: center;
}

.carousel img {
    width: 100%;
    max-width: 600px;
    border-radius: 50%;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.9);
    border: none;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    font-size: 2rem;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nav-arrow.left {
    left: -60px;
}

.nav-arrow.right {
    right: -60px;
}

.info-section {
    text-align: center;
    max-width: 700px;
    margin: 80px auto;
    color: #5f6368;
}

.info-section h2 {
    font-size: 1.8rem;
    margin-bottom: 16px;
    color: #202124;
}

.dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
}

.dot {
    width: 10px;
    height: 10px;
    background: #dadce0;
    border-radius: 50%;
}

.dot.active {
    background: #1a73e8;
}

footer {
    text-align: center;
    padding: 40px 20px;
    color: #1a73e8;
    font-size: 1rem;
}

@media (max-width: 768px) {
    header h1 {
        font-size: 2.2rem;
    }

    header p {
        font-size: 1.2rem;
    }

    .action-bar {
        flex-direction: column;
        align-items: stretch;
    }

    .join-input-wrapper {
        width: 100%;
        max-width: none;
    }

    .dropdown-card {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
    }

    .dropdown-card.show {
        transform: translate(-50%, -50%);
    }

    .nav-arrow {
        display: none;
    }
}
</style>