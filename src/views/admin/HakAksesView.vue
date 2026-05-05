<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Pencil, Trash2, X } from 'lucide-vue-next'
import axios from 'axios'

const roles = ref([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const deleteConfirmId = ref(null)

const form = ref({ id: null, role_name: '', description: '' })

function getHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

async function loadRoles() {
  loading.value = true
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/role', { headers: getHeaders() })
    roles.value = res.data.data ?? []
  } catch { roles.value = [] }
  finally { loading.value = false }
}

function openAdd() {
  isEditing.value = false
  form.value = { id: null, role_name: '', description: '' }
  showModal.value = true
}

function openEdit(r) {
  isEditing.value = true
  form.value = { id: r.id, role_name: r.role_name ?? '', description: r.description ?? '' }
  showModal.value = true
}

async function save() {
  isSaving.value = true
  try {
    const fd = new FormData()
    fd.append('role_name', form.value.role_name)
    if (form.value.description) fd.append('description', form.value.description)
    if (isEditing.value) {
      await axios.post(`http://127.0.0.1:8000/api/role/${form.value.id}`, fd, { headers: getHeaders() })
    } else {
      await axios.post('http://127.0.0.1:8000/api/role/save', fd, { headers: getHeaders() })
    }
    showModal.value = false
    loadRoles()
  } catch (err) {
    alert(err.response?.data?.message ?? 'Gagal menyimpan.')
  } finally { isSaving.value = false }
}

async function deleteRole() {
  try {
    await axios.delete(`http://127.0.0.1:8000/api/role/delete/${deleteConfirmId.value}`, { headers: getHeaders() })
    deleteConfirmId.value = null
    loadRoles()
  } catch (err) {
    alert(err.response?.data?.message ?? 'Gagal menghapus.')
  }
}

onMounted(loadRoles)
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Hak Akses</h1>
        <p class="page-sub">Kelola role / hak akses pengguna sistem</p>
      </div>
      <button class="btn btn-primary" @click="openAdd">
        <Plus :size="16" /> Tambah Role
      </button>
    </div>

    <div class="table-card">
      <div v-if="loading" class="loading-text">Memuat data...</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Role</th>
            <th>Deskripsi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="roles.length === 0">
            <td colspan="4" class="empty-cell">Belum ada role.</td>
          </tr>
          <tr v-for="(r, i) in roles" :key="r.id">
            <td class="text-muted">{{ i + 1 }}</td>
            <td>
              <span class="role-badge">{{ r.role_name }}</span>
            </td>
            <td class="text-muted">{{ r.description ?? '—' }}</td>
            <td>
              <div class="action-btns">
                <button class="icon-btn edit-btn" @click="openEdit(r)"><Pencil :size="14" /></button>
                <button class="icon-btn delete-btn" @click="deleteConfirmId = r.id"><Trash2 :size="14" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-head">
          <h3>{{ isEditing ? 'Edit Role' : 'Tambah Role' }}</h3>
          <button class="close-btn" @click="showModal = false"><X :size="18" /></button>
        </div>
        <form @submit.prevent="save" style="padding: 1.5rem;">
          <div class="form-group">
            <label class="form-label">Nama Role <span class="req">*</span></label>
            <input v-model="form.role_name" type="text" class="form-control" required />
          </div>
          <div class="form-group">
            <label class="form-label">Deskripsi</label>
            <textarea v-model="form.description" class="form-control" rows="3"></textarea>
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
          <h3>Hapus Role?</h3>
          <button class="close-btn" @click="deleteConfirmId = null"><X :size="18" /></button>
        </div>
        <p class="confirm-text">Role ini akan dihapus secara permanen.</p>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="deleteConfirmId = null">Batal</button>
          <button class="btn btn-danger" @click="deleteRole">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.5rem; }
.page-head { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 1.375rem; font-weight: 700; color: var(--color-text-main); }
.page-sub { font-size: 0.8125rem; color: var(--color-text-muted); margin-top: 0.25rem; }

.table-card {
  background: white; border: 1px solid var(--color-border);
  border-radius: 12px; box-shadow: var(--shadow-sm); overflow: hidden;
}
.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.data-table th {
  text-align: left; padding: 0.75rem 1rem;
  font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.05em;
  background: #f9fafb; border-bottom: 1px solid var(--color-border);
}
.data-table td {
  padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9;
  color: var(--color-text-main); vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #fafafa; }

.role-badge {
  display: inline-block;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-btns { display: flex; gap: 0.5rem; }
.icon-btn {
  width: 30px; height: 30px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--color-border); background: white;
  cursor: pointer; transition: all 0.15s;
}
.edit-btn:hover { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
.delete-btn:hover { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

.loading-text, .empty-cell {
  padding: 2.5rem; text-align: center;
  color: var(--color-text-muted); font-size: 0.875rem;
}

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: white; border-radius: 14px; width: 100%; max-width: 480px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
.modal-sm { max-width: 360px; }
.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-border);
}
.modal-head h3 { font-size: 1rem; font-weight: 600; }
.close-btn { color: var(--color-text-muted); padding: 0.25rem; border-radius: 4px; }
.close-btn:hover { background: #f1f5f9; }
.confirm-text { padding: 1rem 1.5rem; color: var(--color-text-muted); font-size: 0.875rem; }
.req { color: var(--color-danger); }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}
.btn-danger {
  background-color: var(--color-danger); color: white;
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1.25rem; border-radius: var(--radius-md);
  font-size: 0.875rem; font-weight: 500;
}
.btn-danger:hover { background-color: #dc2626; }
</style>
