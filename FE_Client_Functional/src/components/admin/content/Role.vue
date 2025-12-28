<script setup>

</script>

<template>
    <div class="container mt-4">
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Danh sách người dùng</h5>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>#</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th class="text-end">Hành động</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Nguyễn Văn A</td>
                            <td>a@gmail.com</td>
                            <td><span class="badge bg-info">Admin</span></td>
                            <td><span class="badge bg-success">Active</span></td>
                            <td class="text-end">
                                <button class="btn btn-sm btn-outline-primary">Sửa</button>
                                <button class="btn btn-sm btn-outline-danger">Xóa</button>
                            </td>
                        </tr>

                        <tr>
                            <td>2</td>
                            <td>Trần Thị B</td>
                            <td>b@gmail.com</td>
                            <td><span class="badge bg-secondary">User</span></td>
                            <td><span class="badge bg-warning text-dark">Pending</span></td>
                            <td class="text-end">
                                <button class="btn btn-sm btn-outline-primary">Sửa</button>
                                <button class="btn btn-sm btn-outline-danger">Xóa</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</template>