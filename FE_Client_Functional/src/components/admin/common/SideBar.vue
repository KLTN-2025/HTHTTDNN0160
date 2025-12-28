<script setup>

</script>

<template>
    <nav class="pc-sidebar">
        <div class="navbar-wrapper">
            <div class="m-header">
                <a href="../dashboard/index.html" class="b-brand text-primary d-flex">
                    <!-- ========   Change your logo from here   ============ -->
                    <img src="@/assets/admin/images/app-icon.png" style="height: 60px;" class="img-fluid logo-lg"
                        alt="logo">
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-left: 20px;
                        font-size: x-large;
                        font-weight: bold;
                    ">MeetUp</div>
                </a>
            </div>
            <div class="navbar-content">
                <ul class="pc-navbar">
                    <li class="pc-item">
                        <RouterLink to="/rooms" class="pc-link">
                            <span class="pc-micon">
                                <i class="ti ti-typography"></i>
                            </span>
                            <span class="pc-mtext">Phòng họp</span>
                        </RouterLink>
                    </li>

                    <li class="pc-item">
                        <RouterLink to="/meetings" class="pc-link">
                            <span class="pc-micon">
                                <i class="ti ti-color-swatch"></i>
                            </span>
                            <span class="pc-mtext">Cuộc họp</span>
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>