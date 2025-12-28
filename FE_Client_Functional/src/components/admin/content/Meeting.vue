<script setup>
import axios from "@/service/api/admin/setting.js";
import { onMounted, ref, watch } from "vue";

const meetings = ref([]);

onMounted(() => {
    getData();
})

const getData = () => {

            console.log(axios.defaults.headers.common[
                "Authorization"
            ]);


    axios
        .get("http://127.0.0.1:8000/api/meetings")
        .then((res) => {
            meetings.value = res.data;
        });
};

const createData = () => {
    axios.post(`http://127.0.0.1:8000/api/meetings`, form.value)
        .then(() => {
            form.value = {
                room_id: "",
                passcode: "",
                time_start: "",
                time_end: "",
                is_waiting: false,
                is_user_allowed_pass_waiting: false,
            }
            showCreate.value = false;
            getData();
        })
}

const updateData = () => {
    if (!form.value.id) return;

    axios
        .put(`http://127.0.0.1:8000/api/meetings/${form.value.id}`, form.value)
        .then(() => {
            form.value = {
                room_id: "",
                passcode: "",
                time_start: "",
                time_end: "",
                is_waiting: false,
                is_user_allowed_pass_waiting: false,
            };
            getData();

            showEdit.value = false;
        });
};
const deleteData = (id) => {
    if (!confirm("Bạn có chắc muốn xóa không?")) return;

    axios
        .delete(`http://127.0.0.1:8000/api/meetings/${id}`)
        .then(() => {
            getData();

        });
};


const showCreate = ref(false);
const showEdit = ref(false);

const form = ref({
    room_id: "",
    passcode: "",
    time_start: "",
    time_end: "",
    is_waiting: false,
    is_user_allowed_pass_waiting: false,
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

function openEdit(meeting) {
    form.value = {
        id: meeting.id,
        room_id: meeting.room_id,
        passcode: "",
        time_start: meeting.time_start,
        time_end: meeting.time_end,
        is_waiting: meeting.is_waiting,
        is_user_allowed_pass_waiting: meeting.is_user_allowed_pass_waiting,
    };
    showEdit.value = true;
}

</script>

<template>
    <div class="container mt-4">
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white d-flex justify-content-between">
                <h5 class="mb-0">Danh sách cuộc họp</h5>
                <button class="btn btn-sm btn-light" @click="openCreate">
                    + Tạo phòng
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>#</th>
                            <th>Room</th>
                            <th>Bắt đầu</th>
                            <th>Kết thúc</th>
                            <th>Chờ duyệt</th>
                            <th>Cho phép qua phòng chờ</th>
                            <th class="text-end">Hành động</th>
                        </tr>
                    </thead>


                    <tbody>
                        <tr v-for="(meeting, index) in meetings" :key="meeting.id">
                            <td>{{ index + 1 }}</td>


                            <td>{{ meeting.room_name }}</td>

                            <td>
                                {{ meeting.time_start ? new Date(meeting.time_start).toLocaleString() : '-' }}
                            </td>

                            <td>
                                {{ meeting.time_end ? new Date(meeting.time_end).toLocaleString() : '-' }}
                            </td>

                            <td>
                                <span class="badge" :class="meeting.is_waiting ? 'bg-warning text-dark' : 'bg-success'">
                                    {{ meeting.is_waiting ? 'Có' : 'Không' }}
                                </span>
                            </td>

                            <td>
                                <span class="badge"
                                    :class="meeting.is_user_allowed_pass_waiting ? 'bg-success' : 'bg-danger'">
                                    {{ meeting.is_user_allowed_pass_waiting ? 'Cho phép' : 'Không' }}
                                </span>
                            </td>

                            <td class="text-end">
                                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(meeting)">
                                    Sửa
                                </button>
                                <button class="btn btn-sm btn-outline-danger" @click="deleteData(meeting.id)">
                                    Xóa
                                </button>
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
                        <label class="form-label">Phòng</label>
                        <select v-model="form.room_id" class="form-select">
                            <option value="">-- Chọn phòng --</option>
                            <option v-for="room in rooms" :key="room.id" :value="room.id">
                                {{ room.name }}
                            </option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Mật khẩu (nếu có)</label>
                        <input v-model="form.passcode" class="form-control" />
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Thời gian bắt đầu</label>
                            <input type="datetime-local" v-model="form.time_start" class="form-control" />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Thời gian kết thúc</label>
                            <input type="datetime-local" v-model="form.time_end" class="form-control" />
                        </div>
                    </div>

                    <div class="form-check mb-2">
                        <input class="form-check-input" type="checkbox" v-model="form.is_waiting" id="isWaiting" />
                        <label class="form-check-label" for="isWaiting">
                            Bật phòng chờ
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" v-model="form.is_user_allowed_pass_waiting"
                            id="allowPassWaiting" />
                        <label class="form-check-label" for="allowPassWaiting">
                            Cho phép vào thẳng không cần duyệt
                        </label>
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
                        <label class="form-label">Phòng</label>
                        <select v-model="form.room_id" class="form-select">
                            <option value="">-- Chọn phòng --</option>
                            <option v-for="room in rooms" :key="room.id" :value="room.id">
                                {{ room.name }}
                            </option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Mật khẩu (nếu có)</label>
                        <input v-model="form.passcode" class="form-control" />
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Thời gian bắt đầu</label>
                            <input type="datetime-local" v-model="form.time_start" class="form-control" />
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Thời gian kết thúc</label>
                            <input type="datetime-local" v-model="form.time_end" class="form-control" />
                        </div>
                    </div>

                    <div class="form-check mb-2">
                        <input class="form-check-input" type="checkbox" v-model="form.is_waiting" id="isWaiting" />
                        <label class="form-check-label" for="isWaiting">
                            Bật phòng chờ
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" v-model="form.is_user_allowed_pass_waiting"
                            id="allowPassWaiting" />
                        <label class="form-check-label" for="allowPassWaiting">
                            Cho phép vào thẳng không cần duyệt
                        </label>
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
