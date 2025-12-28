<script setup>
import axios from "@/service/api/admin/setting.js";
import { onMounted, ref, watch } from "vue";

const rooms = ref([]);

onMounted(() => {
    getData();
})

const getData = () => {

    console.log(axios.defaults.headers.common[
                "Authorization"
            ]);

    axios
        .get("http://127.0.0.1:8000/api/rooms")
        .then((res) => {
            rooms.value = res.data;
        });
};

const createData = () => {
    axios.post(`http://127.0.0.1:8000/api/rooms`, form.value)
        .then(() => {
            form.value = {
                name: "",
                description: "",
                is_private: false,
                password: "",
            }
            showCreate.value = false;
            getData();
        })
}

const updateData = () => {
    if (!form.value.id) return;

    axios
        .put(`http://127.0.0.1:8000/api/rooms/${form.value.id}`, form.value)
        .then(() => {
            form.value = {
                name: "",
                description: "",
                is_private: false,
                password: "",
            };
            getData();

            showEdit.value = false;
        });
};
const deleteData = (id) => {
    if (!confirm("Bạn có chắc muốn xóa không?")) return;

    axios
        .delete(`http://127.0.0.1:8000/api/rooms/${id}`)
        .then(() => {
            getData();

        });
};


const showCreate = ref(false);
const showEdit = ref(false);

const form = ref({
    name: "",
    description: "",
    is_private: false,
    password: "",
});


function openCreate() {
    form.value = {
        name: "",
        description: "",
        is_private: false,
        password: "",
    };
    showCreate.value = true;
}

function openEdit(room) {
    form.value = {
        id: room.id,
        name: room.name,
        description: room.description,
        is_private: room.is_private,
        password: "",
    };
    showEdit.value = true;
}

</script>

<template>
    <div class="container mt-4">
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white d-flex justify-content-between">
                <h5 class="mb-0">Danh sách phòng họp</h5>
                <button class="btn btn-sm btn-light" @click="openCreate">
                    + Tạo phòng
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>#</th>
                            <th>Tên phòng</th>
                            <th>Mã phòng</th>
                            <th>Mô tả</th>
                            <th>Loại</th>
                            <th>Chủ phòng</th>
                            <th class="text-end">Hành động</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="(room, index) in rooms" :key="room.id">
                            <td>{{ index + 1 }}</td>
                            <td>{{ room.name }}</td>
                            <td>
                                <span class="badge bg-secondary">
                                    {{ room.room_code }}
                                </span>
                            </td>
                            <td class="text-muted">
                                {{ room.description }}
                            </td>
                            <td>
                                <span class="badge" :class="room.is_private ? 'bg-warning text-dark' : 'bg-success'">
                                    {{ room.is_private ? 'Private' : 'Public' }}
                                </span>
                            </td>
                            <td>{{ room.owner_name }}</td>
                            <td class="text-end">
                                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(room)">
                                    Sửa
                                </button>
                                <button @click="deleteData(room.id)" class="btn btn-sm btn-outline-danger">
                                    Xóa
                                </button>
                            </td>
                        </tr>

                        <tr v-if="rooms.length === 0">
                            <td colspan="7" class="text-center text-muted py-4">
                                Chưa có phòng họp nào
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- CREATE MODAL -->
    <div class="modal fade show d-block" v-if="showCreate">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Tạo phòng mới</h5>
                    <button class="btn-close" @click="showCreate = false"></button>
                </div>

                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Tên phòng</label>
                        <input v-model="form.name" class="form-control" />
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Mô tả</label>
                        <textarea v-model="form.description" class="form-control"></textarea>
                    </div>

                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" v-model="form.is_private" id="createPrivate" />
                        <label class="form-check-label" for="createPrivate">
                            Phòng riêng tư
                        </label>
                    </div>

                    <div v-if="form.is_private" class="mb-3">
                        <label class="form-label">Mật khẩu phòng</label>
                        <input v-model="form.password" type="password" class="form-control" />
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="showCreate = false">
                        Hủy
                    </button>
                    <button class="btn btn-primary" @click="createData">
                        Tạo phòng
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- UPDATE MODAL -->
    <div class="modal fade show d-block" v-if="showEdit">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Cập nhật phòng</h5>
                    <button class="btn-close" @click="showEdit = false"></button>
                </div>

                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Tên phòng</label>
                        <input v-model="form.name" class="form-control" />
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Mô tả</label>
                        <textarea v-model="form.description" class="form-control"></textarea>
                    </div>

                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" v-model="form.is_private" id="editPrivate" />
                        <label class="form-check-label" for="editPrivate">
                            Phòng riêng tư
                        </label>
                    </div>

                    <div v-if="form.is_private" class="mb-3">
                        <label class="form-label">Mật khẩu mới (nếu đổi)</label>
                        <input v-model="form.password" type="password" class="form-control" />
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="showEdit = false">
                        Hủy
                    </button>
                    <button class="btn btn-primary" @click="updateData">
                        Cập nhật
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- backdrop -->
    <div class="modal-backdrop fade show" v-if="showCreate || showEdit"></div>
</template>
