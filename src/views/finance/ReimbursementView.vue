<script setup>
import { ref, computed } from 'vue'
import { Search, X, Upload, CheckCircle, XCircle, CreditCard, Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const reimbursements = ref([
  { id: 'RMB-001', name: 'Silviana Rodrigo', date: '24/10/2025', category: 'Staff Software Engineer', title: 'Tiket Bus', amount: 'Rp.300.000', file: 'tiket.jpg', status: 'menunggu' },
  { id: 'RMB-002', name: 'Budi Santoso', date: '23/10/2025', category: 'Product Manager', title: 'Belanja Kantor', amount: 'Rp.1.500.000', file: 'nota.jpg', status: 'menunggu' },
  { id: 'RMB-003', name: 'Dewi Kurniawati', date: '22/10/2025', category: 'UI/UX Designer', title: 'Grab Food Makan Siang', amount: 'Rp.85.000', file: 'struk.jpg', status: 'menunggu' },
  { id: 'RMB-004', name: 'Ahmad Fauzi', date: '21/10/2025', category: 'Data Analyst', title: 'Parkir Kantor', amount: 'Rp.50.000', file: 'karcis.pdf', status: 'dibayar' },
  { id: 'RMB-005', name: 'Rina Wulandari', date: '20/10/2025', category: 'HR Specialist', title: 'Tiket Kereta JKT-BDG', amount: 'Rp.310.000', file: 'invoice.pdf', status: 'menunggu' },
  { id: 'RMB-006', name: 'Dimas Aditya', date: '20/10/2025', category: 'Marketing', title: 'Iklan Facebook Ads', amount: 'Rp.2.500.000', file: 'receipt.png', status: 'menunggu' },
  { id: 'RMB-007', name: 'Sarah Amalia', date: '27/10/2025', category: 'Content Creator', title: 'Sewa Lensa Standar', amount: 'Rp.500.000', file: 'sewa.pdf', status: 'menunggu' },
  { id: 'RMB-008', name: 'Reza Pahlevi', date: '28/10/2025', category: 'Sales Executive', title: 'Tol & Bensin BDG', amount: 'Rp.310.000', file: 'struk_tol.jpg', status: 'dibayar' },
])

const searchQuery = ref('')
const showConfirmModal = ref(false)
const showSuccessModal = ref(false)
const selectedItem = ref(null)
const proofFile = ref(null)
const proofName = ref('')
const isMandatory = ref(false)

const filteredItems = computed(() => {
  return reimbursements.value.filter(item => {
    return !searchQuery.value || 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

const openProses = (item) => {
  selectedItem.value = item
  proofFile.value = null
  proofName.value = ''
  isMandatory.value = false
  showConfirmModal.value = true
}

const openBayar = (item) => {
  selectedItem.value = item
  proofFile.value = null
  proofName.value = ''
  isMandatory.value = true
  showConfirmModal.value = true
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    proofFile.value = file
    proofName.value = file.name
  }
}

const confirmAction = () => {
  if (proofFile.value) {
    selectedItem.value.status = 'dibayar'
    showConfirmModal.value = false
    showSuccessModal.value = true
  } else {
    selectedItem.value.status = 'disetujui'
    showConfirmModal.value = false
  }
}

const closeSuccess = () => {
  showSuccessModal.value = false
  selectedItem.value = null
}
</script>

<template>
  <div class="finance-reimburse">
    <div class="page-header">
      <h1 class="page-title">Reimburse</h1>
    </div>

    <div class="card main-card">
      <div class="card-header">
        <div class="header-left">
          <h2 class="card-header-title">Daftar Reimburse</h2>
          <p class="card-header-sub">Periksa dan setujui pengajuan karyawan</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari nama / keterangan..." class="search-input" />
          </div>
          <div class="count-badge">37 Menunggu</div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>KARYAWAN</th>
              <th>KETERANGAN</th>
              <th>TANGGAL</th>
              <th>FILE PENDUKUNG</th>
              <th>JUMLAH</th>
              <th>STATUS</th>
              <th width="180" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id">
              <td>
                <div class="user-info">
                  <div class="avatar-sm">{{ item.name[0] }}</div>
                  <div class="user-meta">
                    <p class="user-name">{{ item.name }}</p>
                    <p class="user-email">{{ item.category }}</p>
                  </div>
                </div>
              </td>
              <td class="text-dark">{{ item.title }}</td>
              <td class="text-muted">{{ item.date }}</td>
              <td>
                <button class="btn-file">
                  <FileText :size="12" /> {{ item.file }}
                </button>
              </td>
              <td class="font-bold">{{ item.amount }}</td>
              <td>
                <span class="status-pill" :class="item.status">
                  {{ item.status === 'disetujui' ? 'Disetujui' : item.status.charAt(0).toUpperCase() + item.status.slice(1) }}
                </span>
              </td>
              <td class="text-center">
                <div class="action-row">
                  <template v-if="item.status === 'menunggu'">
                    <button class="btn-action tolak">Tolak</button>
                    <button class="btn-action proses" @click="openProses(item)">Proses</button>
                  </template>
                  <template v-else-if="item.status === 'disetujui'">
                    <button class="btn-action bayar-green" @click="openBayar(item)">Bayar</button>
                  </template>
                  <template v-else-if="item.status === 'dibayar'">
                    <button class="btn-action bukti-ghost">Bukti Transfer</button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">menampilkan 4 dari 37 data</p>
        <div class="pagination">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3 class="modal-title">Proses Pembayaran?</h3>
          <button class="close-btn" @click="showConfirmModal = false"><X :size="18" /></button>
        </div>
        <div class="modal-body">
          <p class="confirm-msg">
            Anda akan menyetujui pembayaran sebesar <strong>{{ selectedItem?.amount }}</strong> kepada <strong>{{ selectedItem?.name }}</strong>.
          </p>
          
          <div class="upload-section">
            <label class="upload-label">
              {{ isMandatory ? 'Wajib Sertakan Bukti Transfer' : 'Mohon Sertakan Bukti Transfer' }}
              <span v-if="isMandatory" class="text-red">*</span>
            </label>
            <div class="upload-field" :class="{ 'has-file': proofName }">
              <input type="text" :value="proofName || 'Pilih file...'" readonly class="upload-input-mock" />
              <label class="upload-btn-inner">
                <FileText :size="16" />
                <input type="file" @change="handleFileUpload" class="hidden-input" />
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-modal batal" @click="showConfirmModal = false">Batal</button>
          <button 
            class="btn-modal main-btn" 
            :class="{ 'pay': proofFile || isMandatory, 'approve': !proofFile && !isMandatory }"
            :disabled="isMandatory && !proofFile"
            @click="confirmAction"
          >
            {{ (proofFile || isMandatory) ? 'Bayar' : 'Setujui' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Berhasil -->
    <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccess">
      <div class="modal success-modal">
        <div class="modal-body success-body">
          <div class="success-icon-wrap">
            <CheckCircle :size="56" class="success-icon" />
          </div>
          <h2 class="success-title">Pembayaran Berhasil</h2>
          <button class="btn-back-success" @click="closeSuccess">Kembali</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-reimburse { display: flex; flex-direction: column; gap: 1rem; background: #f8fafc; height: 100%; overflow: hidden; }

.page-header { margin-bottom: 0.25rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }
.card-header-sub { font-size: 0.65rem; color: #94a3b8; margin-top: 0.125rem; font-weight: 500; }

.header-actions { display: flex; gap: 0.75rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 220px; }
.count-badge { background: #fffbeb; color: #f59e0b; font-size: 0.65rem; font-weight: 700; padding: 0.4rem 0.875rem; border-radius: 8px; border: 1px solid #fef3c7; }

.table-responsive { overflow-x: auto; max-height: calc(100vh - 220px); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #94a3b8; background: #fcfdfe; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #64748b; border-bottom: 1px solid #f8fafc; vertical-align: middle; }

.user-info { display: flex; align-items: center; gap: 0.625rem; }
.avatar-sm { width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9; color: #94a3b8; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; border: 1px solid #e2e8f0; }
.user-name { font-weight: 700; color: #1e293b; font-size: 0.75rem; }
.user-email { font-size: 0.65rem; color: #94a3b8; font-weight: 500; }

.text-dark { color: #1e293b; font-weight: 500; }
.text-muted { color: #94a3b8; }
.btn-file { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; gap: 0.25rem; cursor: pointer; }

.status-pill { font-size: 0.6rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; display: inline-block; }
.status-pill.menunggu { background: #fffbeb; color: #f59e0b; }
.status-pill.dibayar { background: #f0fdf4; color: #22c55e; }
.status-pill.disetujui { background: white; color: #3b82f6; border: 1px solid #3b82f6; }

.action-row { display: flex; justify-content: center; gap: 0.375rem; }
.btn-action { border-radius: 6px; font-size: 0.7rem; font-weight: 700; padding: 0.375rem 0.75rem; cursor: pointer; border: none; min-width: 64px; transition: all 0.2s; }
.btn-action.tolak { background: #ef4444; color: white; }
.btn-action.proses { background: #3b82f6; color: white; }
.btn-action.bayar-green { background: #22c55e; color: white; }
.btn-action.bukti-ghost { background: #f1f5f9; color: #64748b; font-weight: 600; border: 1px solid #e2e8f0; }

.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; background: #fcfdfe; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }

.text-xs { font-size: 0.65rem; }

/* Modal Styles stay consistent */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; border-radius: 12px; width: 100%; max-width: 380px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
.modal-header { padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }
.close-btn { color: #94a3b8; background: none; border: none; cursor: pointer; }
.modal-body { padding: 1.25rem; }
.confirm-msg { font-size: 0.75rem; color: #475569; line-height: 1.5; margin-bottom: 1rem; }
.upload-section { display: flex; flex-direction: column; gap: 0.5rem; }
.upload-label { font-size: 0.7rem; font-weight: 700; color: #1e293b; }
.upload-field { display: flex; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; height: 36px; }
.upload-input-mock { flex: 1; border: none; padding: 0 0.875rem; font-size: 0.75rem; color: #94a3b8; background: #fcfdfe; }
.upload-btn-inner { background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; width: 36px; cursor: pointer; position: relative; }
.hidden-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.modal-footer { padding: 0.875rem 1.25rem; display: flex; justify-content: flex-end; gap: 0.625rem; border-top: 1px solid #f1f5f9; }
.btn-modal { padding: 0.5rem 1.25rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; border: none; }
.btn-modal.batal { background: #ef4444; color: white; }
.btn-modal.main-btn { background: #3b82f6; color: white; }

.success-modal { text-align: center; max-width: 300px; }
.success-body { padding: 2rem 1.25rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
.success-title { font-size: 1.25rem; font-weight: 800; color: #22c55e; }
.btn-back-success { background: #3b82f6; color: white; border: none; padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; cursor: pointer; }

.text-red { color: #ef4444; }
.font-bold { font-weight: 700; }
</style>
