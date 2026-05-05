<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Pencil, Trash2, X, Search } from 'lucide-vue-next'
import axios from 'axios'

const employees = ref([])
const loading = ref(true)
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const deleteConfirmId = ref(null)

const form = ref({
  id: null,
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  position: '',
  role_id: '',
  account_payout_id: '',
})

const roles = ref([])

function getHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

async function loadEmployees() {
  loading.value = true
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/employee', { headers: getHeaders() })
    employees.value = res.data.data?.data ?? res.data.data ?? []
  } catch { employees.value = [] }
  finally { loading.value = false }
}

async function loadRoles() {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/role', { headers: getHeaders() })
    roles.value = res.data.data ?? []
  } catch { roles.value = [] }
}

function openAdd() {
  isEditing.value = false
  form.value = { id: null, name: '', email: '', password: '', phone: '', address: '', position: '', role_id: '', account_payout_id: '' }
  showModal.value = true
}

function openEdit(emp) {
  isEditing.value = true
  form.value = {
    id: emp.id,
    name: emp.name,
    email: emp.email,
    password: '',
    phone: emp.phone ?? '',
    address: emp.address ?? '',
    position: emp.position ?? '',
    role_id: emp.role_id ?? '',
    account_payout_id: emp.account_payout_id ?? '',
  }
  showModal.value = true
}

async function saveEmployee() {
  isSaving.value = true
  try {
    const fd = new FormData()
    Object.entries(form.value).forEach(([k, v]) => {
      if (k !== 'id' && v !== '') fd.append(k, v)
    })
    if (isEditing.value) {
      await axios.post(`http://127.0.0.1:8000/api/employee/${form.value.id}`, fd, { headers: getHeaders() })
    } else {
      await axios.post('http://127.0.0.1:8000/api/employee/save', fd, { headers: getHeaders() })
    }
    showModal.value = false
    loadEmployees()
  } catch (err) {
    alert(err.response?.data?.message ?? 'Gagal menyimpan data.')
  } finally {
    isSaving.value = false }
}

async function deleteEmployee() {
  try {
    await axios.delete(`http://127.0.0.1:8000/api/employee/delete/${deleteConfirmId.value}`, { headers: getHeaders() })
    deleteConfirmId.value = null
    loadEmployees()
  } catch (err) {
    alert(err.response?.data?.message ?? 'Gagal menghapus.')
  }
}

const filteredEmployees = () =>
  employees.value.filter(e =>
    e.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

onMounted(() => { loadEmployees(); loadRoles() })
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Data Karyawan</h1>
        <p class="page-sub">Kelola seluruh data karyawan perusahaan</p>
      </div>
      <button class="btn btn-primary" @click="openAdd">
        <Plus :size="16" /> Tambah Karyawan
      </button>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <Search :size="15" class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="Cari nama atau email..." class="search-input" />
      </div>
    </div>

    <div class="table-card">
      <div v-if="loading" class="loading-text">Memuat data...</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Posisi</th>
            <th>Telepon</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredEmployees().length === 0">
            <td colspan="6" class="empty-cell">Tidak ada data karyawan.</td>
          </tr>
          <tr v-for="(emp, i) in filteredEmployees()" :key="emp.id">
            <td class="text-muted">{{ i + 1 }}</td>
            <td>
              <div class="name-cell">
                <div class="avatar-sm">{{ emp.name?.[0]?.toUpperCase() }}</div>
                <div>
                  <div class="font-semibold">{{ emp.name }}</div>
                </div>
              </div>
            </td>
            <td class="text-muted">{{ emp.email }}</td>
            <td>{{ emp.position ?? '—' }}</td>
            <td>{{ emp.phone ?? '—' }}</td>
            <td>
              <div class="action-btns">
                <button class="icon-btn edit-btn" @click="openEdit(emp)" title="Edit">
                  <Pencil :size="14" />
                </button>
                <button class="icon-btn delete-btn" @click="deleteConfirmId = emp.id" title="Hapus">
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Add/Edit -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-head">
          <h3>{{ isEditing ? 'Edit Karyawan' : 'Tambah Karyawan' }}</h3>
          <button class="close-btn" @click="showModal = false"><X :size="18" /></button>
        </div>
        <form @submit.prevent="saveEmployee">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Nama Lengkap <span class="req">*</span></label>
              <input v-model="form.name" type="text" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email <span class="req">*</span></label>
              <input v-model="form.email" type="email" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password {{ isEditing ? '(kosongkan jika tidak diubah)' : '' }}</label>
              <input v-model="form.password" type="password" class="form-control" :required="!isEditing" />
            </div>
            <div class="form-group">
              <label class="form-label">Posisi / Jabatan</label>
              <input v-model="form.position" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Telepon</label>
              <input v-model="form.phone" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Hak Akses (Role ID)</label>
              <input v-model="form.role_id" type="number" class="form-control" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Alamat</label>
            <textarea v-model="form.address" class="form-control" rows="2"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showModal = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="deleteConfirmId" class="modal-overlay" @click.self="deleteConfirmId = null">
      <div class="modal modal-sm">
        <div class="modal-head">
          <h3>Hapus Karyawan?</h3>
          <button class="close-btn" @click="deleteConfirmId = null"><X :size="18" /></button>
        </div>
        <p class="confirm-text">Data karyawan akan dihapus secara permanen.</p>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="deleteConfirmId = null">Batal</button>
          <button class="btn btn-danger" @click="deleteEmployee">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.5rem; }

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title { font-size: 1.375rem; font-weight: 700; color: var(--color-text-main); }
.page-sub { font-size: 0.8125rem; color: var(--color-text-muted); margin-top: 0.25rem; }

.toolbar { display: flex; gap: 0.75rem; }

.search-wrap {
  position: relative;
  flex: 1;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus { border-color: var(--color-primary); }

.table-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f9fafb;
  border-bottom: 1px solid var(--color-border);
}
.data-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: var(--color-text-main);
  vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #fafafa; }

.name-cell { display: flex; align-items: center; gap: 0.625rem; }
.avatar-sm {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--color-primary-light); color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8125rem; font-weight: 600; flex-shrink: 0;
}

.action-btns { display: flex; gap: 0.5rem; }
.icon-btn {
  width: 30px; height: 30px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--color-border);
  background: white; cursor: pointer; transition: all 0.15s;
}
.edit-btn:hover { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
.delete-btn:hover { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

.loading-text, .empty-cell {
  padding: 2.5rem; text-align: center;
  color: var(--color-text-muted); font-size: 0.875rem;
}

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: white; border-radius: 14px; width: 100%; max-width: 600px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15); max-height: 90vh; overflow-y: auto;
}
.modal-sm { max-width: 380px; }
.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-border);
}
.modal-head h3 { font-size: 1rem; font-weight: 600; }
.close-btn { color: var(--color-text-muted); padding: 0.25rem; border-radius: 4px; }
.close-btn:hover { background: #f1f5f9; }

form { padding: 1.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1rem; }
.confirm-text { padding: 1rem 1.5rem; color: var(--color-text-muted); font-size: 0.875rem; }
.req { color: var(--color-danger); }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}

.btn-danger {
  background-color: var(--color-danger);
  color: white;
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1.25rem; border-radius: var(--radius-md);
  font-size: 0.875rem; font-weight: 500;
}
.btn-danger:hover { background-color: #dc2626; }
</style>
