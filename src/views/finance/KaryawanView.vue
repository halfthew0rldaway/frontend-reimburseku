<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, Eye, ChevronLeft, ChevronRight, 
  Download, X, FileText, Table 
} from 'lucide-vue-next'
import ApiService from '@/api/ApiService'

// Import Library Laporan
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const router = useRouter()
const karyawan = ref([])
const isLoading = ref(true)

// State Pagination
const currentPage = ref(1)
const lastPage = ref(1)
const totalItems = ref(0)
const fromItem = ref(0)

// State Export
const showExportModal = ref(false)
const isExporting = ref(false)

const fetchKaryawan = async (page = 1) => {
  isLoading.value = true
  try {
    const res = await ApiService.getEmployees(page)

    const metaData = res.data?.meta || {}
    currentPage.value = metaData.current_page || 1
    lastPage.value = metaData.last_page || 1
    totalItems.value = metaData.total || 0
    fromItem.value = metaData.from || 0

    const listData = res.data?.data || []

    karyawan.value = listData
      .filter(emp => emp.role?.id_role === 1) 
      .map(emp => {
        const payout = emp.account_payout || {}
        const providerData = payout.provider || {}
        const roleData = emp.role || {}
        
        return {
          id: emp.id_employees || emp.id, 
          nama: emp.name || '-',
          email: emp.email || '-',
          jabatan: roleData.role_name || '-', 
          totalPengajuan: emp.total_pengajuan || 0,
          totalAmount: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(emp.total_nominal || 0),
          atasNama: payout.account_holder_name || 'Belum diatur',
          nomorRekening: payout.account_number || '-',
          provider: providerData.provider_name || '-'
        }
      })
  } catch (error) {
    console.error('Failed to load employees', error)
  } finally {
    isLoading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= lastPage.value && page !== currentPage.value) {
    fetchKaryawan(page)
  }
}

onMounted(() => {
  fetchKaryawan(1)
})

const searchQuery = ref('')
const filtered = computed(() => {
  return karyawan.value.filter(k =>
    k.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    k.atasNama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    k.nomorRekening.includes(searchQuery.value)
  )
})

const goToDetail = (id) => {
  if (id) {
    router.push(`/karyawan/${id}`)
  } else {
    console.warn('ID Karyawan tidak ditemukan')
  }
}

// --- FUNGSI EKSPOR DATA KARYAWAN ---
const processExport = async (formatType) => {
  isExporting.value = true
  
  try {
    let allData = []
    let currentFetchPage = 1
    let lastFetchPage = 1

    // 1. Loop ambil semua data dari API
    do {
      const res = await ApiService.getEmployees(currentFetchPage)
      const data = res.data?.data || []
      const meta = res.data?.meta || {}
      
      allData = [...allData, ...data]
      lastFetchPage = meta.last_page || 1
      currentFetchPage++
    } while (currentFetchPage <= lastFetchPage)

    // 2. Filter & Mapping Data
    const exportData = allData
      .filter(emp => emp.role?.id_role === 1)
      .map((emp, index) => {
        const payout = emp.account_payout || {}
        const providerData = payout.provider || {}
        const roleData = emp.role || {}
        
        return {
          'No': index + 1,
          'Nama Karyawan': emp.name || '-',
          'Email': emp.email || '-',
          'Jabatan': roleData.role_name || '-',
          'Bank / Provider': providerData.provider_name || '-',
          'Atas Nama': payout.account_holder_name || '-',
          'No. Rekening': payout.account_number || '-',
          'Total Pengajuan': emp.total_pengajuan || 0,
          'Total Nominal (Rp)': emp.total_nominal || 0,
          'Total_Format': new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
          }).format(emp.total_nominal || 0)
        }
      })

    if (exportData.length === 0) {
      alert('Tidak ada data karyawan aktif untuk diekspor.')
      isExporting.value = false
      return
    }

    // 3. Proses Excel
    if (formatType === 'excel') {
      const excelData = exportData.map(d => ({
        'No': d.No,
        'Nama Karyawan': d['Nama Karyawan'],
        'Email': d.Email,
        'Jabatan': d.Jabatan,
        'Bank / Provider': d['Bank / Provider'],
        'Atas Nama': d['Atas Nama'],
        'No. Rekening': d['No. Rekening'],
        'Total Pengajuan': d['Total Pengajuan'],
        'Total Nominal (Rp)': d['Total Nominal (Rp)']
      }))

      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Karyawan")
      XLSX.writeFile(workbook, `Data_Karyawan_${Date.now()}.xlsx`)
    } 
    // 4. Proses PDF
    else if (formatType === 'pdf') {
      // Gunakan orientasi 'l' (landscape) agar tabel muat banyak kolom
      const doc = new jsPDF('l', 'mm', 'a4')
      doc.setFontSize(14)
      doc.text(`Laporan Data Karyawan Aktif`, 14, 15)
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22)

      const tableColumn = ["No", "Nama Karyawan", "Jabatan", "Bank/E-Wallet", "No. Rekening", "Atas Nama", "Pengajuan", "Total Nilai"]
      const tableRows = exportData.map(d => [
        d.No, 
        d['Nama Karyawan'], 
        d.Jabatan, 
        d['Bank / Provider'], 
        d['No. Rekening'], 
        d['Atas Nama'], 
        d['Total Pengajuan'], 
        d['Total_Format']
      ])

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 },
      })

      doc.save(`Data_Karyawan_${Date.now()}.pdf`)
    }
    
    showExportModal.value = false
  } catch (error) {
    console.error("Gagal mengekspor laporan:", error)
    alert("Terjadi kesalahan saat menarik data dari server.")
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="finance-karyawan">
    <div class="page-header">
      <h1 class="page-title">Karyawan</h1>
      
      <!-- Tombol Ekspor -->
      <div class="quick-actions">
        <button class="qa-btn qa-outline" @click="showExportModal = true">
          <Download :size="16" />
          <span>Ekspor Data</span>
        </button>
      </div>
    </div>

    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Data Karyawan</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari Nama / Rekening..." class="search-input" />
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>NAMA KARYAWAN</th>
              <th>JABATAN</th>
              <th>INFO PEMBAYARAN</th>
              <th class="text-center">TOTAL PENGAJUAN</th>
              <th>TOTAL NILAI</th>
              <th width="100" class="text-center">AKSI</th>
            </tr>
          </thead>

          <tbody v-if="isLoading">
            <tr>
              <td colspan="6" class="text-center loading-state">
                <div class="loader-spinner"></div>
                <p class="loading-text">Memuat data karyawan...</p>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="filtered.length === 0">
            <tr>
              <td colspan="6" class="text-center py-8">
                <p class="text-muted">Tidak ada data karyawan yang ditemukan.</p>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="k in filtered" :key="k.id">
              <td>
                <div class="user-info">
                  <div class="avatar-sm">{{ k.nama[0] }}</div>
                  <div class="user-meta">
                    <p class="user-name">{{ k.nama }}</p>
                    <p class="user-email">{{ k.email }}</p>
                  </div>
                </div>
              </td>
              <td class="text-muted">{{ k.jabatan }}</td>
              <td>
                <div class="payout-info">
                  <p class="payout-name">{{ k.atasNama }}</p>
                  <p class="payout-detail">{{ k.provider }} &bull; {{ k.nomorRekening }}</p>
                </div>
              </td>
              <td class="text-center font-semibold">{{ k.totalPengajuan }}</td>
              <td class="font-bold text-success">{{ k.totalAmount }}</td>
              <td class="text-center">
                <button class="btn-icon detail" title="Lihat Detail" @click="goToDetail(k.id)">
                  <Eye :size="12" />
                </button>
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
          <button v-for="page in lastPage" :key="page" class="page-btn" :class="{ active: currentPage === page }" @click="changePage(page)">
            {{ page }}
          </button>
          <button class="page-btn" :disabled="currentPage === lastPage" @click="changePage(currentPage + 1)">
            <ChevronRight :size="12" />
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL EKSPOR (Simple) -->
    <div v-if="showExportModal" class="modal-backdrop" @click.self="showExportModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">Ekspor Data Karyawan</h3>
          <button class="close-btn" @click="showExportModal = false"><X :size="20" /></button>
        </div>
        
        <div class="modal-body text-center">
          <p class="export-desc">Pilih format file untuk mengunduh rekapitulasi seluruh data karyawan aktif beserta informasi pembayaran.</p>
          
          <div class="export-actions-centered">
            <button 
              class="btn-download btn-pdf" 
              :disabled="isExporting"
              @click="processExport('pdf')"
            >
              <FileText :size="18" />
              <span>{{ isExporting ? 'Memproses...' : 'Ekspor PDF' }}</span>
            </button>
            
            <button 
              class="btn-download btn-excel" 
              :disabled="isExporting"
              @click="processExport('excel')"
            >
              <Table :size="18" />
              <span>{{ isExporting ? 'Memproses...' : 'Ekspor Excel' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detail Karyawan -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-panel">
        <div class="modal-panel-header">
          <h3>Detail Karyawan</h3>
          <button class="btn-close" @click="closeDetail">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedEmp">
          <div class="detail-row">
            <span class="detail-label">Nama:</span>
            <span class="detail-value font-bold">{{ selectedEmp.nama }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">{{ selectedEmp.email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Jabatan:</span>
            <span class="detail-value">{{ selectedEmp.jabatan }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Departemen:</span>
            <span class="detail-value dept-badge">{{ selectedEmp.departemen }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Total Pengajuan:</span>
            <span class="detail-value font-semibold">{{ selectedEmp.totalPengajuan }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Total Nilai Reimburse:</span>
            <span class="detail-value text-success font-bold">{{ selectedEmp.totalAmount }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="closeDetail">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-karyawan { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }

/* HEADER & QUICK ACTIONS */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
.quick-actions { display: flex; gap: 0.75rem; align-items: center; }
.qa-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
.qa-outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
.qa-outline:hover { background: #f1f5f9; color: #0f172a; border-color: #94a3b8; }

.card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); overflow: hidden; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }
.header-actions { display: flex; gap: 0.625rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 220px; }
.table-responsive { overflow-x: auto; max-height: calc(100vh - 220px); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.user-info { display: flex; align-items: center; gap: 0.625rem; }
.avatar-sm { width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; border: 1px solid #e2e8f0; }
.user-meta { display: flex; flex-direction: column; }
.user-name { font-weight: 700; color: #1e293b; font-size: 0.75rem; }
.user-email { font-size: 0.65rem; color: #94a3b8; }
.payout-info { display: flex; flex-direction: column; gap: 0.125rem; }
.payout-name { font-weight: 600; color: #1e293b; font-size: 0.7rem; }
.payout-detail { font-size: 0.65rem; color: #64748b; }
.text-center { text-align: center; }
.text-success { color: #16a34a !important; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.text-muted { color: #94a3b8; margin: 0; }
.py-8 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
.btn-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
.btn-icon.detail { background: #f1f5f9; color: #64748b; }
.btn-icon.detail:hover { background: #e2e8f0; color: #1e293b; }
.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.text-xs { font-size: 0.65rem; }
.loading-state, .empty-state { padding: 3rem 1rem !important; }
.loader-spinner { width: 32px; height: 32px; border: 3px solid #f1f5f9; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
.loading-text { margin-top: 0.75rem; font-size: 0.75rem; color: #64748b; font-weight: 500; }
@keyframes spin { to { transform: rotate(360deg); } }

/* MODAL EKSPOR */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.4); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal-box { background: white; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); overflow: hidden; display: flex; flex-direction: column; }
.modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
.modal-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
.close-btn { background: transparent; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
.close-btn:hover { color: #ef4444; }
.modal-body { padding: 1.5rem 1.5rem 2rem 1.5rem; }
.export-desc { font-size: 0.8125rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; }
.export-actions-centered { display: flex; gap: 1rem; justify-content: center; }
.btn-download { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border-radius: 12px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; border: none; color: white; transition: all 0.2s; width: 120px;}
.btn-pdf { background: #ef4444; }
.btn-pdf:hover:not(:disabled) { background: #dc2626; transform: translateY(-2px); box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25); }
.btn-excel { background: #10b981; }
.btn-excel:hover:not(:disabled) { background: #059669; transform: translateY(-2px); box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25); }
.btn-download:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
