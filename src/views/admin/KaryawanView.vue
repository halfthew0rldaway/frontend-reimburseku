<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, PencilLine, Trash2, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'

const employees = ref([])
const rolesMap = { 1: 'Admin', 2: 'Finance', 3: 'Staff' }

onMounted(async () => {
  fetchEmployees()
})

async function fetchEmployees() {
  try {
    const res = await ApiService.getEmployees()
    const listData = res.data?.data?.data || res.data?.data || []
    
    employees.value = listData.map((emp, i) => ({
      id: emp.id_employees,
      account_id: emp.account_number || '-',
      name: emp.name || '-',
      email: emp.email || '-',
      gender: emp.gender || '-',
      dob: emp.date_of_birth ? new Date(emp.date_of_birth).toLocaleDateString('id-ID') : '-',
      address: emp.address || '-',
      position: emp.position || '-',
      role: rolesMap[emp.roles_id] || 'Staff'
    }))
  } catch (error) {
    console.error('Failed to load employees', error)
  }
}

const searchQuery = ref('')

const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formData = ref({
  name: '', email: '', password: '', phone: '', address: '', position: '', roles_id: 3, account_payout_id: ''
})

function openAdd() {
  isEdit.value = false
  editId.value = null
  formData.value = { name: '', email: '', password: '', phone: '', address: '', position: '', roles_id: 3, account_payout_id: '' }
  showModal.value = true
}

function openEdit(emp) {
  isEdit.value = true
  editId.value = emp.id
  formData.value = { 
    name: emp.name, 
    email: emp.email, 
    password: '', 
    phone: emp.phone || '', 
    address: emp.address, 
    position: emp.position, 
    roles_id: Object.keys(rolesMap).find(key => rolesMap[key] === emp.role) || 3, 
    account_payout_id: emp.account_id !== '-' ? emp.account_id : ''
  }
  showModal.value = true
}

function closeAdd() {
  showModal.value = false
}

async function submitAdd() {
  try {
    if (isEdit.value) {
      await ApiService.updateEmployee(editId.value, formData.value)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Karyawan diupdate.', showConfirmButton: false, timer: 1500 })
    } else {
      await ApiService.saveEmployee(formData.value)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Karyawan ditambahkan.', showConfirmButton: false, timer: 1500 })
    }
    fetchEmployees()
    closeAdd()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan karyawan. Pastikan ID Rekening valid.' })
    console.error(err)
  }
}

async function deleteEmp(id) {
  const result = await Swal.fire({
    title: 'Hapus Karyawan?',
    text: "Yakin ingin menghapus karyawan ini?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await ApiService.deleteEmployee(id)
      fetchEmployees()
      Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'Karyawan berhasil dihapus.', showConfirmButton: false, timer: 1500 })
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus karyawan' })
      console.error(err)
    }
  }
}

const filteredEmployees = computed(() => {
  return employees.value.filter(e => 
    e.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="karyawan-page">
    

    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Karyawan</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari karyawan..." class="search-input" />
          </div>
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort">
              Urutkan <ChevronDown :size="12" />
            </button>
          </div>
          <button class="btn btn-primary btn-add" @click="openAdd">
            <Plus :size="14" /> Tambah Karyawan
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>NO</th>
              <th>NO REKENING / ID</th>
              <th>NAMA</th>
              <th>EMAIL</th>
              <th>JENIS KELAMIN</th>
              <th>TANGGAL LAHIR</th>
              <th>ALAMAT</th>
              <th>JABATAN</th>
              <th>HAK AKSES</th>
              <th class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(emp, i) in filteredEmployees" :key="emp.id">
              <td>{{ i + 1 }}</td>
              <td class="text-muted font-mono">{{ emp.account_id }}</td>
              <td class="font-semibold">{{ emp.name }}</td>
              <td class="text-muted">{{ emp.email }}</td>
              <td>{{ emp.gender }}</td>
              <td>{{ emp.dob }}</td>
              <td class="address-cell" :title="emp.address">{{ emp.address }}</td>
              <td>{{ emp.position }}</td>
              <td>
                <span class="role-badge" :class="emp.role.toLowerCase()">{{ emp.role }}</span>
              </td>
              <td class="text-center">
                <div class="action-btns">
                  <button class="btn-icon edit" @click="openEdit(emp)"><PencilLine :size="12" /></button>
                  <button class="btn-icon delete" @click="deleteEmp(emp.id)"><Trash2 :size="12" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">Menampilkan {{ filteredEmployees.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filteredEmployees.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filteredEmployees.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Karyawan -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeAdd">
      <div class="modal-panel">
        <div class="modal-panel-header">
          <div class="modal-header-icon">
            <component :is="isEdit ? PencilLine : Plus" :size="18" />
          </div>
          <div>
            <h3>{{ isEdit ? 'Edit Karyawan' : 'Tambah Karyawan Baru' }}</h3>
            <p class="modal-header-sub">{{ isEdit ? 'Perbarui data karyawan' : 'Isi data karyawan yang ingin ditambahkan' }}</p>
          </div>
        </div>
        <div class="modal-panel-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group col-span-2">
            <label>Nama <span class="required">*</span></label>
            <input v-model="formData.name" type="text" class="form-control" placeholder="Nama lengkap karyawan" />
          </div>
          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input v-model="formData.email" type="email" class="form-control" placeholder="email@perusahaan.com" />
          </div>
          <div class="form-group">
            <label>Password <span class="required">*</span></label>
            <input v-model="formData.password" type="password" class="form-control" placeholder="Minimal 8 karakter" />
          </div>
          <div class="form-group">
            <label>Nomor HP</label>
            <input v-model="formData.phone" type="text" class="form-control" placeholder="08xxxxxxxxxx" />
          </div>
          <div class="form-group">
            <label>Jabatan</label>
            <input v-model="formData.position" type="text" class="form-control" placeholder="Contoh: Staff Marketing" />
          </div>
          <div class="form-group col-span-2">
            <label>Alamat</label>
            <textarea v-model="formData.address" class="form-control" rows="2" placeholder="Alamat lengkap karyawan"></textarea>
          </div>
          <div class="form-group">
            <label>Hak Akses (Role) <span class="required">*</span></label>
            <select v-model="formData.roles_id" class="form-control">
              <option :value="1">Admin</option>
              <option :value="2">Finance</option>
              <option :value="3">Staff</option>
            </select>
          </div>
          <div class="form-group">
            <label>ID Rekening (Account Payout ID)</label>
            <input v-model="formData.account_payout_id" type="number" class="form-control" placeholder="Masukkan ID dari tabel account_payout" />
          </div>
        </div>
        <div class="modal-panel-footer">
          <button class="btn btn-outline" @click="closeAdd">Batal</button>
          <button class="btn btn-primary btn-save" @click="submitAdd">
            <component :is="isEdit ? PencilLine : Plus" :size="14" />
            {{ isEdit ? 'Simpan Perubahan' : 'Tambah Karyawan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.karyawan-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }

.page-header { margin-bottom: 0; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.main-card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; display: flex; flex-direction: column; flex: 1; min-height: 0; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; flex-shrink: 0; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }

.header-actions { display: flex; gap: 0.625rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 200px; }
.btn-sort { display: flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.875rem; font-size: 0.75rem; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }
.btn-add { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; padding: 0.4rem 0.875rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }

/* Table */
.table-responsive { overflow-x: auto; overflow-y: auto; flex: 1; }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }

.font-mono { font-family: monospace; font-size: 0.7rem; }
.address-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.7rem; }

.role-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; }
.role-badge.staff { background: #f1f5f9; color: #475569; }
.role-badge.finance { background: #eff6ff; color: #2563eb; }
.role-badge.admin { background: #fef3c7; color: #92400e; }

.action-btns { display: flex; justify-content: center; gap: 0.375rem; }
.btn-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
.btn-icon.edit { background: #f59e0b; color: white; }
.btn-icon.delete { background: #ef4444; color: white; }

/* Footer / Pagination */
.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: center; background: #f8fafc; border-top: 1px solid #f1f5f9; flex-shrink: 0; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }

/* Modal */
.form-group { text-align: left; }
.form-group label { display: block; margin-bottom: 0.375rem; font-size: 0.8125rem; font-weight: 600; color: #475569; }
.required { color: #ef4444; }
.col-span-2 { grid-column: span 2; }
.form-control { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; font-size: 0.8125rem; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
.form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
textarea.form-control { resize: vertical; min-height: 60px; }
.btn-outline { background: white; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.8125rem; color: #475569; transition: all 0.15s; }
.btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-save { display: inline-flex; align-items: center; gap: 0.375rem; background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.8125rem; transition: all 0.15s; }
.btn-save:hover { background: #2563eb; }
</style>
