<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, ChevronDown, ChevronLeft, ChevronRight, PencilLine } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'

const methods = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const formData = ref({
  id: null,
  provider_type: '',
  provider_name: '',
  code_provider: ''
})

const fetchProviders = async () => {
  try {
    const res = await ApiService.getProviders()
    const listData = res.data?.data?.data || res.data?.data || []
    
    methods.value = listData.map(m => ({
      id: m.id_provider,
      type: m.provider_name.toLowerCase().includes('bank') ? 'BANK TRANSFER' : 'E-WALLET',
      name: m.provider_name || '-',
      code: m.provider_code || '-',
      status: m.status || 'Aktif'
    }))
  } catch (err) {
    console.error('Failed to load providers', err)
  }
}

onMounted(fetchProviders)

const searchQuery = ref('')

function openAdd() {
  isEdit.value = false
  formData.value = { id: null, provider_type: '', provider_name: '', code_provider: '' }
  showModal.value = true
}

function openEdit(m) {
  isEdit.value = true
  formData.value = {
    id: m.id,
    provider_type: m.type,
    provider_name: m.name,
    code_provider: m.code
  }
  showModal.value = true
}

function closeAdd() {
  showModal.value = false
}

function submitAdd() {
  closeAdd()
}

async function toggleStatus(id) {
  const m = methods.value.find(x => x.id === id)
  if (m) {
    // Assuming backend endpoint /provider/{id} handles partial updates or status toggles
    try {
      const newStatus = m.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif'
      await ApiService.updateProvider(id, {
        provider_name: m.name,
        provider_code: m.code,
        status: newStatus
      })
      m.status = newStatus
    } catch (err) {
      alert('Gagal mengubah status')
    }
  }
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
                  style="margin-right: 0.25rem;"
                >
                  {{ m.status === 'Aktif' ? 'Non-Aktifkan' : 'Aktivasi' }}
                </button>
                <button class="btn btn-xs btn-primary-outline" @click="openEdit(m)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">Menampilkan {{ filteredMethods.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filteredMethods.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filteredMethods.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah/Edit Metode Bayar -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeAdd">
      <div class="modal-panel">
        <div class="modal-panel-header">
          <div class="modal-header-icon">
            <component :is="isEdit ? PencilLine : Plus" :size="18" />
          </div>
          <div>
            <h3>{{ isEdit ? 'Edit Metode Bayar' : 'Tambah Metode Bayar Baru' }}</h3>
            <p class="modal-header-sub">{{ isEdit ? 'Perbarui informasi metode pembayaran' : 'Tambahkan metode pembayaran baru' }}</p>
          </div>
        </div>
        <div class="modal-panel-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group col-span-2">
            <label>Tipe Layanan <span class="required">*</span></label>
            <select v-model="formData.provider_type" class="form-control">
              <option value="">Pilih tipe layanan</option>
              <option value="BANK TRANSFER">Bank Transfer</option>
              <option value="E-WALLET">E-Wallet</option>
            </select>
          </div>
          <div class="form-group">
            <label>Nama Layanan <span class="required">*</span></label>
            <input v-model="formData.provider_name" type="text" class="form-control" placeholder="Contoh: Bank BCA / GoPay" />
          </div>
          <div class="form-group">
            <label>Kode Layanan <span class="required">*</span></label>
            <input v-model="formData.code_provider" type="text" class="form-control" placeholder="Contoh: BCA / GOPAY" />
          </div>
        </div>
        <div class="modal-panel-footer">
          <button class="btn btn-outline" @click="closeAdd">Batal</button>
          <button class="btn btn-primary btn-save" @click="submitAdd">
            <component :is="isEdit ? PencilLine : Plus" :size="14" />
            {{ isEdit ? 'Simpan Perubahan' : 'Tambah Metode Bayar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metode-bayar-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }

.page-header { margin-bottom: 0; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.main-card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; display: flex; flex-direction: column; flex: 1; min-height: 0; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; flex-shrink: 0; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }

.header-actions { display: flex; gap: 0.625rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 200px; }
.btn-sort { display: flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.875rem; font-size: 0.75rem; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }
.btn-add { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; padding: 0.4rem 0.875rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }

.table-responsive { overflow-x: auto; overflow-y: auto; flex: 1; }
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

.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-top: 1px solid #f1f5f9; flex-shrink: 0; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
</style>
