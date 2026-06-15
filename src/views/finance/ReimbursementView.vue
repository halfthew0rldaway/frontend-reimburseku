<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, X, CheckCircle, XCircle, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-vue-next' // Tambahan icon zoom
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'

const reimbursements = ref([])
const pendingCount = ref(0)

const currentPage = ref(1)
const lastPage = ref(1)
const totalItems = ref(0)
const fromItem = ref(0)
const isLoading = ref(true)
const fetchReimbursements = async (page = 1) => {
  isLoading.value = true
  try {
    const [reimbRes, empRes, catRes] = await Promise.all([
      ApiService.getReimbursements(page), // Passing parameter page ke API
      ApiService.getEmployees(),
      ApiService.getCategories()
    ])

    const listData = reimbRes.data?.data || []

    // Menangkap data pagination dari backend (objek 'meta')
    const metaData = reimbRes.data?.meta || {}
    currentPage.value = metaData.current_page || 1
    lastPage.value = metaData.last_page || 1
    totalItems.value = metaData.total || 0
    fromItem.value = metaData.from || 0

    const employees = empRes.data?.data?.data || empRes.data?.data || []
    const categories = catRes.data?.data?.data || catRes.data?.data || []

    const empMap = employees.reduce((acc, curr) => { acc[curr.id_employees] = curr; return acc }, {})
    const catMap = categories.reduce((acc, curr) => { acc[curr.id_category] = curr; return acc }, {})

    reimbursements.value = listData.map(item => {
      const emp = empMap[item.employees_id] || {}
      const cat = catMap[item.category_id] || {}

      let approvalId = item.id_request;
      let dateSubmitted = item.expense_date;
      let dateApproved = null; // Tambahkan variabel untuk menampung date_approved
      let rawBackendStatus = 'PENDING';
      let receiptUrl = null;
let rejectReasonText = '-';
      if (item.latest_approval) {
        approvalId = item.latest_approval.id_approval;
        dateSubmitted = item.latest_approval.date_submitted || item.expense_date; // Menggunakan date_submitted
        dateApproved = item.latest_approval.date_approved; // Mengambil date_approved
        rawBackendStatus = item.latest_approval.status;
        receiptUrl = item.latest_approval.transfer_receipt;
        rejectReasonText = item.latest_approval.rejection_reason || 'Tidak ada alasan spesifik yang diberikan.';
      }

      const backendStatus = (rawBackendStatus || 'PENDING').toUpperCase();

      let uiStatus = 'menunggu';
      if (backendStatus === 'APPROVED') uiStatus = 'disetujui';
      else if (backendStatus === 'PAID') uiStatus = 'dibayar';
      else if (backendStatus === 'REJECTED') uiStatus = 'ditolak';

      // 1. Format Tanggal Transaksi (Sekarang menggunakan date_approved)
      let transactionDate = '-'; // Fallback jika date_approved masih null
      if (dateApproved) {
        let parseableApproved = dateApproved;
        if (typeof parseableApproved === 'string' && parseableApproved.includes(' ') && !parseableApproved.includes('T')) {
          parseableApproved = parseableApproved.replace(' ', 'T');
        }
        transactionDate = new Date(parseableApproved).toLocaleDateString('id-ID', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
      }

      // 2. Format Tanggal Pengajuan (Sekarang menggunakan date_submitted)
      let parseableDate = dateSubmitted;
      if (typeof parseableDate === 'string' && parseableDate.includes(' ') && !parseableDate.includes('T')) {
        parseableDate = parseableDate.replace(' ', 'T');
      }
      const submitTime = new Date(parseableDate);
      const submitDateStr = submitTime.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      const submitTimeStr = submitTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      return {
        id: item.id_request,
        approvalId: approvalId,
        name: emp.name || 'Unknown',
        date: transactionDate, // Ini akan terisi date_approved atau '-'
        submitTime: `${submitDateStr} - ${submitTimeStr}`, // Ini akan terisi date_submitted
        category: emp.position || 'Employee',
        title: item.description || cat.category_name || 'Reimbursement',
        amount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.amount),
        rawAmount: item.amount,
        file: item.attachment_url ? 'Lihat File' : '-',
        fileUrl: item.attachment_url,
        receiptUrl: receiptUrl,
        rejectionReason: rejectReasonText,
        status: uiStatus,
      }
    })

    pendingCount.value = reimbursements.value.filter(i => i.status === 'menunggu').length
  } catch (error) {
    console.error('Failed to fetch data', error)
  } finally {
    isLoading.value = false // Matikan loading saat selesai (baik sukses maupun error)
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= lastPage.value && page !== currentPage.value) {
    fetchReimbursements(page)
  }
}
onMounted(() => {
  fetchReimbursements(1)
})
const searchQuery = ref('')
const showConfirmModal = ref(false)
const showRejectModal = ref(false)
const showSuccessModal = ref(false)
const selectedItem = ref(null)
const proofFile = ref(null)
const proofName = ref('')
const isMandatory = ref(false)
const rejectReason = ref('')
const rejectError = ref(false)

// State khusus untuk Bukti Transfer Viewer
const showReceiptModal = ref(false)
const selectedReceiptUrl = ref('')
const zoomLevel = ref(1)

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

const openTolak = (item) => {
  selectedItem.value = item
  rejectReason.value = ''
  rejectError.value = false
  showRejectModal.value = true
}
const showReasonModal = ref(false)

const openReason = (item) => {
  selectedItem.value = item
  showReasonModal.value = true
}
// === Fungsi Bukti Transfer Viewer ===
const openReceipt = (item) => {
  if (item.receiptUrl) {
    selectedReceiptUrl.value = item.receiptUrl
    zoomLevel.value = 1 // Reset zoom saat buka baru
    showReceiptModal.value = true
  } else {
    Swal.fire({
      icon: 'info',
      title: 'Tidak Ada Bukti',
      text: 'Bukti transfer belum diunggah atau tidak ditemukan.',
      confirmButtonColor: '#3b82f6'
    })
  }
}

const closeReceipt = () => {
  showReceiptModal.value = false
  selectedReceiptUrl.value = ''
  zoomLevel.value = 1
}

const zoomIn = () => { if (zoomLevel.value < 3) zoomLevel.value += 0.25 }
const zoomOut = () => { if (zoomLevel.value > 0.5) zoomLevel.value -= 0.25 }
const resetZoom = () => { zoomLevel.value = 1 }
// ===================================

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    proofFile.value = file
    proofName.value = file.name
  }
}

const uploadShake = ref(false)

const confirmAction = async () => {
  if (!selectedItem.value) return

  if (isMandatory.value && !proofFile.value) {
    uploadShake.value = true
    setTimeout(() => uploadShake.value = false, 500)
    Swal.fire({
      icon: 'warning',
      title: 'Perhatian',
      text: 'Mohon unggah bukti transfer (PNG/JPG/PDF) terlebih dahulu!',
      confirmButtonColor: '#3b82f6'
    })
    return
  }

  try {
    if (proofFile.value) {
      const formData = new FormData()
      formData.append('status', 'APPROVED')
      formData.append('transfer_receipt', proofFile.value)

      await ApiService.actionApproveOrReject(selectedItem.value.approvalId, formData)

      selectedItem.value.status = 'dibayar'
      showConfirmModal.value = false
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Reimbursement berhasil dibayar!',
        showConfirmButton: false,
        timer: 1500
      })
    } else {
      const formData = new FormData()
      formData.append('status', 'APPROVED')
      await ApiService.actionApproveOrReject(selectedItem.value.approvalId, formData)

      selectedItem.value.status = 'disetujui'
      showConfirmModal.value = false
      Swal.fire({
        icon: 'success',
        title: 'Disetujui',
        text: 'Reimbursement berhasil disetujui.',
        showConfirmButton: false,
        timer: 1500
      })
    }
    fetchReimbursements()
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal memproses'
    })
  }
}

const confirmTolak = async () => {
  if (!selectedItem.value) return

  if (!rejectReason.value.trim()) {
    rejectError.value = true
    setTimeout(() => rejectError.value = false, 500)
    return
  }

  try {
    const formData = new FormData()
    formData.append('status', 'REJECTED')
    formData.append('rejection_reason', rejectReason.value)

    await ApiService.actionApproveOrReject(selectedItem.value.approvalId, formData)

    selectedItem.value.status = 'ditolak'
    showRejectModal.value = false
    Swal.fire({
      icon: 'success',
      title: 'Ditolak',
      text: 'Reimbursement telah ditolak.',
      showConfirmButton: false,
      timer: 1500
    })
    fetchReimbursements()
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal menolak'
    })
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
          <div class="count-badge">{{ pendingCount }} Menunggu</div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>KARYAWAN</th>
              <th>KETERANGAN</th>
              <th>TGL TRANSAKSI</th>
              <th>DIAJUKAN PADA</th>
              <th>FILE PENDUKUNG</th>
              <th>JUMLAH</th>
              <th>STATUS</th>
              <th width="180" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody v-if="isLoading">
            <tr>
              <td colspan="8" class="text-center loading-state">
                <div class="loader-spinner"></div>
                <p class="loading-text">Memuat data pengajuan...</p>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="filteredItems.length === 0">
            <tr>
              <td colspan="8" class="text-center empty-state">
                <p class="text-muted">Tidak ada data reimburse yang ditemukan.</p>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
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
              <td class="text-muted" style="font-size: 0.85rem;">{{ item.submitTime }}</td>
              <td>
                <a v-if="item.fileUrl" :href="item.fileUrl" target="_blank" class="btn-file">
                  <FileText :size="12" /> Lihat File
                </a>
                <span v-else>-</span>
              </td>
              <td class="font-bold">{{ item.amount }}</td>
              <td>
                <span class="status-pill" :class="item.status">
                  {{ item.status === 'disetujui' ? 'Disetujui' : item.status.charAt(0).toUpperCase() +
                    item.status.slice(1) }}
                </span>
              </td>
              <td class="text-center">
                <div class="action-row">
                  <template v-if="item.status === 'menunggu'">
                    <button class="btn-action tolak" @click="openTolak(item)">Tolak</button>
                    <button class="btn-action proses" @click="openProses(item)">Proses</button>
                  </template>
                  <template v-else-if="item.status === 'disetujui'">
                    <button class="btn-action bayar-green" @click="openBayar(item)">Bayar</button>
                  </template>
                  <template v-else-if="item.status === 'dibayar'">
                    <button class="btn-action bukti-ghost" @click="openReceipt(item)">Bukti Transfer</button>
                  </template>
           <template v-else-if="item.status === 'ditolak'">
    <button class="btn-action tolak-ghost" @click="openReason(item)">Lihat Alasan</button>
  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">
          menampilkan {{ fromItem }} dari {{ totalItems }} data
        </p>

        <div class="pagination" v-if="lastPage > 1">
          <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            <ChevronLeft :size="12" />
          </button>

          <button v-for="page in lastPage" :key="page" class="page-btn" :class="{ active: currentPage === page }"
            @click="changePage(page)">
            {{ page }}
          </button>

          <button class="page-btn" :disabled="currentPage === lastPage" @click="changePage(currentPage + 1)">
            <ChevronRight :size="12" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3 class="modal-title">Proses Pembayaran?</h3>
          <button class="close-btn" @click="showConfirmModal = false">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p class="confirm-msg">
            Anda akan menyetujui pembayaran sebesar <strong>{{ selectedItem?.amount }}</strong> kepada <strong>{{
              selectedItem?.name }}</strong>.
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
          <button class="btn-modal main-btn"
            :class="{ 'pay': proofFile || isMandatory, 'approve': !proofFile && !isMandatory }"
            :disabled="isMandatory && !proofFile" @click="confirmAction">
            {{ (proofFile || isMandatory) ? 'Bayar' : 'Setujui' }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="showReceiptModal" class="modal-overlay" @click.self="closeReceipt">
      <div class="modal receipt-modal">
        <div class="modal-header">
          <h3 class="modal-title">Bukti Transfer</h3>

          <div class="zoom-controls">
            <button class="zoom-btn" @click="zoomOut" title="Zoom Out">
              <ZoomOut :size="14" />
            </button>
            <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
            <button class="zoom-btn" @click="zoomIn" title="Zoom In">
              <ZoomIn :size="14" />
            </button>
            <div class="divider-vertical"></div>
            <button class="zoom-btn reset" @click="resetZoom" title="Reset Zoom">
              <RotateCcw :size="14" />
            </button>
          </div>

          <button class="close-btn" @click="closeReceipt">
            <X :size="18" />
          </button>
        </div>

        <div class="modal-body image-viewer-body">
          <div class="image-container">
            <img :src="selectedReceiptUrl" alt="Bukti Transfer" class="zoomable-image"
              :style="{ transform: `scale(${zoomLevel})` }" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="showRejectModal" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3 class="modal-title text-red">Tolak Pengajuan?</h3>
          <button class="close-btn" @click="showRejectModal = false">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p class="confirm-msg">
            Anda akan menolak pengajuan sebesar <strong>{{ selectedItem?.amount }}</strong> dari <strong>{{
              selectedItem?.name }}</strong>.
          </p>

          <div class="upload-section">
            <label class="upload-label">
              Alasan Penolakan <span class="text-red">*</span>
            </label>
            <!-- Text area untuk alasan tolak -->
            <textarea v-model="rejectReason" class="reject-textarea" :class="{ 'shake error-border': rejectError }"
              placeholder="Contoh: Nota tidak jelas / nominal tidak sesuai..." rows="3"></textarea>
            <span v-if="rejectError" class="error-text">Alasan penolakan wajib diisi!</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-modal batal-outline" @click="showRejectModal = false">Batal</button>
          <button class="btn-modal tolak-btn" @click="confirmTolak">Tolak Pengajuan</button>
        </div>
      </div>
    </div>
    <div v-if="showReasonModal" class="modal-overlay" @click.self="showReasonModal = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3 class="modal-title text-red">Alasan Penolakan</h3>
          <button class="close-btn" @click="showReasonModal = false">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p class="confirm-msg">
            Pengajuan dari <strong>{{ selectedItem?.name }}</strong> sebesar <strong>{{ selectedItem?.amount }}</strong> ditolak dengan alasan:
          </p>
          <div class="upload-section">
            <textarea 
              class="reject-textarea" 
              rows="4" 
              readonly
              :value="selectedItem?.rejectionReason"
              style="background-color: #f8fafc; cursor: not-allowed; color: #475569;"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer" style="justify-content: center;">
          <button class="btn-modal batal-outline" @click="showReasonModal = false" style="width: 100%;">Tutup</button>
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
.finance-reimburse {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8fafc;
  height: 100%;
  overflow: hidden;
}

.page-header {
  margin-bottom: 0.25rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f8fafc;
}

.card-header-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
}

.card-header-sub {
  font-size: 0.65rem;
  color: #94a3b8;
  margin-top: 0.125rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  padding: 0.4rem 0.75rem 0.4rem 2.125rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.75rem;
  outline: none;
  width: 220px;
}

.count-badge {
  background: #fffbeb;
  color: #f59e0b;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.4rem 0.875rem;
  border-radius: 8px;
  border: 1px solid #fef3c7;
}

.table-responsive {
  overflow-x: auto;
  max-height: calc(100vh - 220px);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  text-align: left;
  padding: 0.75rem 1.25rem;
  font-size: 0.6rem;
  font-weight: 600;
  color: #94a3b8;
  background: #fcfdfe;
  border-bottom: 1px solid #f1f5f9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modern-table td {
  padding: 0.75rem 1.25rem;
  font-size: 0.75rem;
  color: #64748b;
  border-bottom: 1px solid #f8fafc;
  vertical-align: middle;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid #e2e8f0;
}

.user-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.75rem;
}

.user-email {
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 500;
}

.text-dark {
  color: #1e293b;
  font-weight: 500;
}

.text-muted {
  color: #94a3b8;
}

.btn-file {
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #dbeafe;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.status-pill {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  display: inline-block;
}

.status-pill.menunggu {
  background: #fffbeb;
  color: #f59e0b;
}

.status-pill.dibayar {
  background: #f0fdf4;
  color: #22c55e;
}

.status-pill.disetujui {
  background: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.status-pill.ditolak {
  background: #fef2f2;
  color: #ef4444;
}

.action-row {
  display: flex;
  justify-content: center;
  gap: 0.375rem;
}

.btn-action {
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  border: none;
  min-width: 64px;
  transition: all 0.2s;
}

.btn-action.tolak {
  background: #ef4444;
  color: white;
}
.btn-action.tolak-ghost {
  background: #fef2f2;
  color: #ef4444;
  font-weight: 600;
  border: 1px solid #fecaca;
}
.btn-action.tolak-ghost:hover {
  background: #fee2e2;
}
.btn-action.proses {
  background: #3b82f6;
  color: white;
}

.btn-action.bayar-green {
  background: #22c55e;
  color: white;
}

.btn-action.bukti-ghost {
  background: #f1f5f9;
  color: #64748b;
  font-weight: 600;
  border: 1px solid #e2e8f0;
}

.table-footer {
  padding: 0.75rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fcfdfe;
}

.pagination {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
}

.page-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.text-xs {
  font-size: 0.65rem;
}

/* Modal Styles stay consistent */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
}

.modal-body {
  padding: 1.25rem;
}

.confirm-msg {
  font-size: 0.75rem;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #1e293b;
}

.upload-field {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  height: 36px;
  transition: all 0.2s;
}

.upload-field.shake {
  animation: shake 0.5s;
  border-color: #ef4444 !important;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  50% {
    transform: translateX(5px);
  }

  75% {
    transform: translateX(-5px);
  }
}

.upload-input-mock {
  flex: 1;
  border: none;
  padding: 0 0.875rem;
  font-size: 0.75rem;
  color: #94a3b8;
  background: #fcfdfe;
}

.upload-btn-inner {
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  cursor: pointer;
  position: relative;
}

.hidden-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.modal-footer {
  padding: 0.875rem 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
  border-top: 1px solid #f1f5f9;
}

.btn-modal {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
}

.btn-modal.batal {
  background: #ef4444;
  color: white;
}

.btn-modal.main-btn {
  background: #3b82f6;
  color: white;
}

.success-modal {
  text-align: center;
  max-width: 300px;
}

.success-body {
  padding: 2rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.success-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #22c55e;
}

.btn-back-success {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

.text-red {
  color: #ef4444;
}

.font-bold {
  font-weight: 700;
}

.reject-textarea {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.75rem;
  color: #475569;
  outline: none;
  resize: none;
  font-family: inherit;
  transition: all 0.2s;
  box-sizing: border-box;
}

.reject-textarea:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-border {
  border-color: #ef4444 !important;
}

.error-text {
  font-size: 0.65rem;
  color: #ef4444;
  font-weight: 500;
}

.btn-modal.batal-outline {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-modal.tolak-btn {
  background: #ef4444;
  color: white;
}

.text-red {
  color: #ef4444;
}

.shake {
  animation: shake 0.5s;
}

.receipt-modal {
  max-width: 850px;
  /* Sebelumnya 600px. Semakin besar angkanya, semakin lebar */
  width: 95%;
  /* Lebar relatif agar tetap aman di layar kecil */
  display: flex;
  flex-direction: column;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.zoom-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.zoom-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.zoom-level {
  font-size: 0.65rem;
  font-weight: 700;
  color: #475569;
  min-width: 32px;
  text-align: center;
}

.divider-vertical {
  width: 1px;
  height: 16px;
  background: #cbd5e1;
  margin: 0 0.25rem;
}

.image-viewer-body {
  padding: 0;
  background: #cbd5e1;
  height: 80vh;
  /* Sebelumnya 60vh. vh = viewport height (persentase tinggi layar ponsel/monitor) */
  overflow: hidden;
  display: flex;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.image-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  /* Memunculkan scroll otomatis jika gambar melewati wadah setelah di-zoom */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.zoomable-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease-in-out;
  transform-origin: center center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.loading-state,
.empty-state {
  padding: 3rem 1rem !important;
}

.loader-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f5f9;
  border-top-color: #3b82f6;
  /* Warna biru primary */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.loading-text {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

</style>
