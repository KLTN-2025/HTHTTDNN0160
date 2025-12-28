<script setup>

</script>

<template>


    <div class="leave-body">
        <div class="leave-call-container">
            <!-- Icon điện thoại đỏ giống Google Meet -->
            <div class="icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
                    </path>
                </svg>
            </div>

            <h1>Bạn đã rời cuộc họp</h1>

            <p>
                Cuộc họp đã kết thúc đối với bạn.<br>
                Bạn có thể tham gia lại hoặc quay về trang chủ.
            </p>

            <div class="buttons">
                <router-link to="/" class="button button-secondary">Quay về trang chủ</router-link>
            </div>

            <div class="footer">
                Cảm ơn bạn đã sử dụng!
            </div>
        </div>
    </div>

</template>

<style scoped>
.leave-body {
    background-color: #fff;
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.leave-call-container {
    max-width: 500px;
    width: 100%;
    text-align: center;
}

.leave-call-container .icon-wrapper {
    width: 120px;
    height: 120px;
    background-color: #fdecea;
    border-radius: 50%;
    margin: 0 auto 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.leave-call-container .icon-wrapper svg {
    width: 60px;
    height: 60px;
    color: #d93025;
}

.leave-call-container h1 {
    font-size: 32px;
    font-weight: 500;
    color: #202124;
    margin-bottom: 16px;
}

.leave-call-container p {
    color: #5f6368;
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 48px;
}

.leave-call-container .buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
}

.leave-call-container .button {
    display: inline-block;
    font-weight: 500;
    font-size: 16px;
    padding: 12px 24px;
    border-radius: 100px;
    text-decoration: none;
    transition: all 0.2s;
}

.leave-call-container .button-primary {
    background-color: #1a73e8;
    color: white;
}

.leave-call-container .button-primary:hover {
    background-color: #1765cc;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.leave-call-container .button-secondary {
    background-color: transparent;
    color: #1a73e8;
    border: 1px solid #dadce0;
}

.leave-call-container .button-secondary:hover {
    background-color: #f8f9fa;
}

.leave-call-container .footer {
    margin-top: 60px;
    font-size: 14px;
    color: #9aa0a6;
}
</style>