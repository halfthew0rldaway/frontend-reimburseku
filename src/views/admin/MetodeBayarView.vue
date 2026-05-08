<script setup>
import { ref, computed } from 'vue'
import { Plus, X, Search, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-vue-next'

const methods = ref([
  { id: 1, type: 'E-WALLET', name: 'OVO', code: '3703', status: 'Tidak Aktif' },
  { id: 2, type: 'BANK TRANSFER', name: 'BCA', code: '111', status: 'Aktif' },
  { id: 3, type: 'E-WALLET', name: 'GOPAY', code: '91001', status: 'Aktif' },
  { id: 4, type: 'E-WALLET', name: 'DANA', code: '8900', status: 'Aktif' },
  { id: 5, type: 'BANK TRANSFER', name: 'Mandiri', code: '008', status: 'Tidak Aktif' },
  { id: 6, type: 'BANK TRANSFER', name: 'Bank BNI', code: '009', status: 'Aktif' },
])

const searchQuery = ref('')
const showModal = ref(false)
const isSaving = ref(false)
const showSuccessModal = ref(false)

const form = ref({ type: 'BANK TRANSFER', name: '', code: '' })

function openAdd() {
  form.value = { type: 'BANK TRANSFER', name: '', code: '' }
  showModal.value = true
}

function toggleStatus(id) {
  const m = methods.value.find(x => x.id === id)
  if (m) m.status = m.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif'
}

const filteredMethods = computed(() => {
  return methods.value.filter(m => m.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})
</script>

<template>
  <div class="metode-bayar-page">
    <div class="page-header">
      <h1 class="page-title">Metode Bayar</h1>
    </div>

    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Daftar Metode Bayar</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari metode bayar..." class="search-input" />
          </div>
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort">
              Urutkan <ChevronDown :size="12" />
            </button>
          </div>
          <button class="btn btn-primary btn-add" @click="openAdd">
            <Plus :size="14" /> Tambah Metode
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>BANK / E-WALLET</th>
              <th>NAMA LAYANAN</th>
              <th>KODE LAYANAN</th>
              <th>STATUS</th>
              <th width="140" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in filteredMethods" :key="m.id">
              <td class="text-muted font-bold">{{ m.type }}</td>
              <td class="font-semibold">{{ m.name }}</td>
              <td class="text-muted font-mono">{{ m.code }}</td>
              <td>
                <span class="status-badge" :class="m.status === 'Aktif' ? 'active' : 'inactive'">
                  {{ m.status }}
                </span>
              </td>
              <td class="text-center">
                <button 
                  class="btn btn-xs" 
                  :class="m.status === 'Aktif' ? 'btn-danger-outline' : 'btn-success'"
                  @click="toggleStatus(m.id)"
                >
                  {{ m.status === 'Aktif' ? 'Non-Aktifkan' : 'Aktivasi' }}
                </button>
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
.metode-bayar-page { display: flex; flex-direction: column; gap: 1rem; background-color: #f8fafc; height: 100%; overflow: hidden; }

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

.font-bold { font-weight: 700; }
.font-mono { font-family: monospace; color: #64748b; font-size: 0.7rem; }

.status-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; }
.status-badge.active { background: #dcfce7; color: #15803d; }
.status-badge.inactive { background: #fee2e2; color: #b91c1c; }

.btn-xs { padding: 0.3rem 0.75rem; font-size: 0.7rem; font-weight: 700; border-radius: 6px; cursor: pointer; }
.btn-success { background: #22c55e; color: white; border: none; }
.btn-danger-outline { background: white; color: #ef4444; border: 1px solid #fecaca; }

.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: center; background: #f8fafc; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
</style>
