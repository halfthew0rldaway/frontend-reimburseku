<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, PencilLine, Trash2, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'

const roles = ref([])

const fetchRoles = async () => {
  try {
    const res = await ApiService.getRoles()
    const listData = res.data?.data?.data || res.data?.data || []
    
    roles.value = listData.map(r => {
      const slug = (r.role_name || '').toLowerCase().replace(/ /g, '-')
      const perms = r.permissions || null
      let parsed = initPermissions()
      if (perms && typeof perms === 'object') {
        Object.keys(perms).forEach(mk => {
          if (parsed[mk]) {
            const pv = perms[mk]
            if (typeof pv === 'object') {
              Object.keys(pv).forEach(pk => { if (parsed[mk][pk] !== undefined) parsed[mk][pk] = !!pv[pk] })
            } else if (Array.isArray(pv)) {
              pv.forEach(pk => { if (parsed[mk][pk] !== undefined) parsed[mk][pk] = true })
            }
          }
        })
      }
      return { id: r.id_role, name: r.role_name || '-', description: r.description || '-', slug, permissions: parsed }
    })
  } catch (err) {
    console.error('Failed to load roles', err)
  }
}

onMounted(fetchRoles)

const searchQuery = ref('')


const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formData = ref({ role_name: '', description: '', permissions: {} })

const permissionModules = [
  { key: 'dashboard', label: 'Dashboard', perms: ['Lihat'] },
  { key: 'reimbursement', label: 'Reimbursement', perms: ['Lihat', 'Buat', 'Setujui', 'Tolak'] },
  { key: 'deposit', label: 'Deposit', perms: ['Lihat', 'Buat', 'Setujui'] },
  { key: 'karyawan', label: 'Karyawan', perms: ['Lihat', 'Tambah', 'Edit', 'Hapus'] },
  { key: 'kategori', label: 'Kategori', perms: ['Lihat', 'Tambah', 'Edit', 'Hapus'] },
  { key: 'hak_akses', label: 'Hak Akses', perms: ['Lihat', 'Tambah', 'Edit', 'Hapus'] },
  { key: 'metode_bayar', label: 'Metode Bayar', perms: ['Lihat', 'Tambah', 'Edit', 'Hapus'] },
  { key: 'profil', label: 'Profil', perms: ['Lihat', 'Edit'] }
]

function initPermissions() {
  const perms = {}
  permissionModules.forEach(m => {
    perms[m.key] = {}
    m.perms.forEach(p => { perms[m.key][p] = false })
  })
  return perms
}

function openAdd() {
  isEdit.value = false
  editId.value = null
  formData.value = { role_name: '', description: '', permissions: initPermissions() }
  showModal.value = true
}

function openEdit(r) {
  isEdit.value = true
  editId.value = r.id
  formData.value = { role_name: r.name, description: r.description, permissions: r.permissions ? JSON.parse(JSON.stringify(r.permissions)) : initPermissions() }
  showModal.value = true
}

function togglePerm(moduleKey, perm) {
  formData.value.permissions[moduleKey][perm] = !formData.value.permissions[moduleKey][perm]
}

function toggleAllModule(moduleKey, perms) {
  const allChecked = perms.every(p => formData.value.permissions[moduleKey][p])
  perms.forEach(p => { formData.value.permissions[moduleKey][p] = !allChecked })
}

function closeAdd() {
  showModal.value = false
}

async function submitAdd() {
  try {
    if (isEdit.value) {
      await ApiService.updateRole(editId.value, formData.value)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Hak Akses berhasil diupdate.', showConfirmButton: false, timer: 1500 })
    } else {
      await ApiService.saveRole(formData.value)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Hak Akses berhasil ditambahkan.', showConfirmButton: false, timer: 1500 })
    }
    fetchRoles()
    closeAdd()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan Hak Akses' })
    console.error(err)
  }
}

const deleteRole = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus Hak Akses?',
    text: "Yakin ingin menghapus hak akses ini?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await ApiService.deleteRole(id)
      fetchRoles()
      Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'Hak akses berhasil dihapus.', showConfirmButton: false, timer: 1500 })
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus hak akses' })
      console.error(err)
    }
  }
}

const filteredRoles = computed(() => {
  return roles.value.filter(r => r.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})
</script>

<template>
  <div class="hak-akses-page">
    

    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Hak Akses</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari hak akses..." class="search-input" />
          </div>
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort">
              Urutkan <ChevronDown :size="12" />
            </button>
          </div>
          <button class="btn btn-primary btn-add" @click="openAdd">
            <Plus :size="14" /> Tambah Hak Akses
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="20%">NAMA HAK</th>
              <th width="20%">SLUG</th>
              <th>DESKRIPSI</th>
              <th width="120" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in filteredRoles" :key="role.id">
              <td class="font-semibold text-primary-dark">{{ role.name }}</td>
              <td class="text-muted font-mono">{{ role.slug }}</td>
              <td class="text-muted">{{ role.description }}</td>
              <td class="text-center">
                <div class="action-btns">
                  <button class="btn-icon edit" @click="openEdit(role)"><PencilLine :size="12" /></button>
                  <button class="btn-icon delete" @click="deleteRole(role.id)"><Trash2 :size="12" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">Menampilkan {{ filteredRoles.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filteredRoles.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filteredRoles.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Hak Akses -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeAdd">
      <div class="modal-panel modal-wide">
        <div class="modal-panel-header">
          <div class="modal-header-icon">
            <component :is="isEdit ? PencilLine : Plus" :size="18" />
          </div>
          <div>
            <h3>{{ isEdit ? 'Edit Hak Akses' : 'Tambah Hak Akses Baru' }}</h3>
            <p class="modal-header-sub">{{ isEdit ? 'Perbarui informasi dan hak akses role' : 'Tentukan nama role dan hak akses yang diperlukan' }}</p>
          </div>
        </div>
        <div class="modal-panel-body">
          <div class="form-row-2">
            <div class="form-group">
              <label>Nama Hak Akses <span class="required">*</span></label>
              <input v-model="formData.role_name" type="text" class="form-control" placeholder="Contoh: Admin / Finance / Staff" />
            </div>
            <div class="form-group">
              <label>Deskripsi</label>
              <input v-model="formData.description" type="text" class="form-control" placeholder="Singkatnya tentang role ini" />
            </div>
          </div>

          <!-- Access Permissions Section -->
          <div class="perm-section">
            <div class="perm-section-header">
              <div class="perm-section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div>
                <span class="perm-section-title">Hak Akses</span>
                <span class="perm-section-sub">Pilih modul dan izin yang dapat diakses role ini</span>
              </div>
            </div>

            <div class="perm-grid">
              <div v-for="mod in permissionModules" :key="mod.key" class="perm-card">
                <div class="perm-card-header">
                  <label class="perm-check perm-check-all">
                    <input type="checkbox" :checked="mod.perms.every(p => formData.permissions[mod.key]?.[p])" @change="toggleAllModule(mod.key, mod.perms)" />
                    <span class="perm-module-name">{{ mod.label }}</span>
                  </label>
                </div>
                <div class="perm-card-body">
                  <label v-for="perm in mod.perms" :key="perm" class="perm-check">
                    <input type="checkbox" :checked="formData.permissions[mod.key]?.[perm]" @change="togglePerm(mod.key, perm)" />
                    <span>{{ perm }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-panel-footer">
          <button class="btn btn-outline" @click="closeAdd">Batal</button>
          <button class="btn btn-primary btn-save" @click="submitAdd" :disabled="!formData.role_name.trim()">
            <component :is="isEdit ? PencilLine : Plus" :size="14" />
            {{ isEdit ? 'Simpan Perubahan' : 'Tambah Hak Akses' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hak-akses-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }

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

.table-responsive { overflow-x: auto; overflow-y: auto; flex: 1; }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }

.text-primary-dark { color: #2563eb; font-weight: 700; }
.font-mono { font-family: monospace; font-size: 0.7rem; color: #64748b; }

.action-btns { display: flex; justify-content: center; gap: 0.375rem; }
.btn-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
.btn-icon.edit { background: #f59e0b; color: white; }
.btn-icon.delete { background: #ef4444; color: white; }

.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: center; background: #f8fafc; border-top: 1px solid #f1f5f9; flex-shrink: 0; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }

/* Modal */
.modal-wide { width: 680px; max-width: 95vw; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { text-align: left; }
.form-group label { display: block; margin-bottom: 0.375rem; font-size: 0.8125rem; font-weight: 600; color: #475569; }
.required { color: #ef4444; }
.form-control { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; font-size: 0.8125rem; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
.form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
textarea.form-control { resize: vertical; min-height: 80px; }

/* Permissions Section */
.perm-section { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.perm-section-header { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.perm-section-icon { width: 32px; height: 32px; border-radius: 8px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.perm-section-title { font-size: 0.8125rem; font-weight: 700; color: #1e293b; display: block; }
.perm-section-sub { font-size: 0.6875rem; color: #94a3b8; display: block; margin-top: 0.0625rem; }
.perm-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0; }
.perm-card { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; }
.perm-card:nth-child(odd) { border-right: 1px solid #f1f5f9; }
.perm-card:nth-last-child(-n+2) { border-bottom: none; }
.perm-card-header { margin-bottom: 0.5rem; }
.perm-card-body { display: flex; flex-wrap: wrap; gap: 0.5rem 0.75rem; }
.perm-check { display: inline-flex; align-items: center; gap: 0.375rem; cursor: pointer; font-size: 0.75rem; color: #475569; user-select: none; }
.perm-check input[type="checkbox"] { width: 14px; height: 14px; accent-color: #3b82f6; cursor: pointer; border-radius: 3px; }
.perm-check-all { font-weight: 600; color: #1e293b; }
.perm-module-name { font-size: 0.8125rem; }

.btn-outline { background: white; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.8125rem; color: #475569; transition: all 0.15s; }
.btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-save { display: inline-flex; align-items: center; gap: 0.375rem; background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.8125rem; transition: all 0.15s; }
.btn-save:hover { background: #2563eb; }
.btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
</style>
