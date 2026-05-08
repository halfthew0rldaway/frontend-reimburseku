<script setup>
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, X, Search, ChevronDown } from 'lucide-vue-next'

const roles = ref([
  { id: 1, name: 'Super Admin', slug: 'super-admin', description: 'Akses penuh aplikasi tanpa batasan' },
  { id: 2, name: 'Finance', slug: 'finance', description: 'Akses untuk mengelola data dan reimbursement' },
])

const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)

const form = ref({ id: null, name: '', slug: '', description: '' })

function openAdd() {
  isEditing.value = false
  form.value = { id: null, name: '', slug: '', description: '' }
  showModal.value = true
}

const filteredRoles = computed(() => {
  return roles.value.filter(r => r.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})
</script>

<template>
  <div class="hak-akses-page">
    <div class="page-header">
      <h1 class="page-title">Hak Akses</h1>
    </div>

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
                  <button class="btn-icon edit"><Pencil :size="12" /></button>
                  <button class="btn-icon delete"><Trash2 :size="12" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <div class="pagination">
          <button class="page-btn"><ChevronDown :size="12" style="transform: rotate(90deg)" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn"><ChevronDown :size="12" style="transform: rotate(-90deg)" /></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hak-akses-page { display: flex; flex-direction: column; gap: 1rem; background-color: #f8fafc; height: 100%; overflow: hidden; }

.page-header { margin-bottom: 0.25rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.main-card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }

.header-actions { display: flex; gap: 0.625rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 200px; }
.btn-sort { display: flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.875rem; font-size: 0.75rem; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }
.btn-add { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; padding: 0.4rem 0.875rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }

.table-responsive { overflow-x: auto; max-height: calc(100vh - 220px); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #f8fafc; vertical-align: middle; }

.text-primary-dark { color: #2563eb; font-weight: 700; }
.font-mono { font-family: monospace; font-size: 0.7rem; color: #64748b; }

.action-btns { display: flex; justify-content: center; gap: 0.375rem; }
.btn-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
.btn-icon.edit { background: #f59e0b; color: white; }
.btn-icon.delete { background: #ef4444; color: white; }

.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: center; background: #f8fafc; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
</style>
