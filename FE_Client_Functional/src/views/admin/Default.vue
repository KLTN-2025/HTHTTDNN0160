<script setup>
import Footer from '@/components/admin/common/Footer.vue';
import SideBar from '@/components/admin/common/SideBar.vue';
import Header from '@/components/admin/common/Header.vue';

import '@/assets/admin/css/style.css';
import '@/assets/admin/css/style-preset.css';
import '@/assets/admin/fonts/tabler-icons.min.css';
import '@/assets/admin/fonts/feather.css';
import '@/assets/admin/fonts/fontawesome.css';
import '@/assets/admin/fonts/material.css';

</script>


<template>

    <SideBar></SideBar>

    <Header></Header>

    <!-- [ Main Content ] start -->
    <div class="pc-container">
        <div class="pc-content">
            <router-view></router-view>
        </div>
    </div>

    <!-- [ Main Content ] end -->

    <Footer></Footer>

</template>
