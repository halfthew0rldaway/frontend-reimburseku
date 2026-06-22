<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Car, UtensilsCrossed, ParkingMeter, MoreHorizontal, ChevronLeft, ChevronRight, Calendar, Check, X, Clock, CheckCircle2, Zap, XCircle, Bell, ChevronDown } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { formatRupiah, mapStatusToFrontend } from '@/utils/format'
import ApiService from '@/api/ApiService'
import { useAuthStore } from '@/stores/auth'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const router = useRouter()
const authStore = useAuthStore()

// 1. Set Default Filter ke Bulan & Tahun Saat Ini
const dateNow = new Date()
const currentYear = dateNow.getFullYear()
const currentMonth = dateNow.getMonth() + 1

const filterAktif = ref('semua')
const filterBulan = ref(`${currentYear}-${currentMonth.toString().padStart(2, '0')}`)
const showModalBulan = ref(false)
const tempBulan = ref(currentMonth)
const tempTahun = ref(currentYear)
const isLoading = ref(true)

const filterList = [
  { key: 'semua',    label: 'Semua',   warna: '' },
  { key: 'menunggu', label: 'Menunggu', warna: '#f59e0b' },
  { key: 'diterima', label: 'Diterima', warna: '#3b82f6' },
  { key: 'ditolak',  label: 'Tolak',   warna: '#ef4444' },
  { key: 'dibayar',  label: 'Dibayar', warna: '#22c55e' },
]

// Data State
const semuaData = ref([])
const halamanAktif = ref(1)
const totalHalaman = ref(1)

// === STATE & FUNGSI MENU EKSPOR ===
const showExportMenu = ref(false)

const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value
  if (showExportMenu.value) showNotifMenu.value = false 
}

const exportToExcel = () => {
  showExportMenu.value = false 
  if (semuaData.value.length === 0) return alert('Tidak ada data untuk diekspor pada bulan ini.')

  const exportData = semuaData.value.map((item, index) => ({
    'No': index + 1,
    'Tanggal': item.tanggal,
    'Kategori': item.kategori,
    'Judul Pengajuan': item.judul,
    'Status': item.status,
    'Catatan': item.catatan,
    'Jumlah (Rp)': item.jumlahAsli
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Reimbursement")

  const fileName = `Laporan_Reimbursement_${labelBulanTampil.value.replace(' ', '_')}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

const exportToPDF = () => {
  showExportMenu.value = false 
  if (semuaData.value.length === 0) return alert('Tidak ada data untuk diekspor pada bulan ini.')

  const doc = new jsPDF('p', 'mm', 'a4')
  doc.setFontSize(16)
  doc.text(`Laporan Reimbursement`, 14, 20)
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Periode: ${labelBulanTampil.value} | Karyawan: Staff`, 14, 28)

  const tableColumn = ["No", "Tanggal", "Kategori", "Judul", "Status", "Jumlah"]
  const tableRows = []

  semuaData.value.forEach((item, index) => {
    tableRows.push([index + 1, item.tanggal, item.kategori, item.judul, item.status, item.jumlah])
  })

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
  })

  const fileName = `Laporan_Reimbursement_${labelBulanTampil.value.replace(' ', '_')}.pdf`
  doc.save(fileName)
}

// === STATE & FUNGSI MENU NOTIFIKASI ===
const showNotifMenu = ref(false)
const notifications = ref([]) 
const hasUnread = ref(false) 

const toggleNotifMenu = () => {
  showNotifMenu.value = !showNotifMenu.value
  if (showNotifMenu.value) showExportMenu.value = false
}

const tandaiSemuaDibaca = () => {
  hasUnread.value = false 
  if (notifications.value.length > 0) {
    const latestId = notifications.value[0].id
    localStorage.setItem('last_read_notif_id', String(latestId))
  }
}

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  if (seconds < 60) return `Baru saja`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit yang lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam yang lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari yang lalu`
}

const determineNotifType = (title, message) => {
  const text = `${title || ''} ${message || ''}`.toLowerCase()
  if (text.includes('transfer') || text.includes('dana') || text.includes('cair')) return 'dibayar'
  if (text.includes('setuju') || text.includes('terima')) return 'diterima'
  if (text.includes('tolak') || text.includes('gagal')) return 'ditolak'
  return 'info'
}

const fetchNotifications = async (page = 1) => {
  try {
    const res = await ApiService.getMyReimbursementsMessages(page)
    const responseBody = res.data

    if (responseBody.success && responseBody.data) {
      notifications.value = responseBody.data.map(item => ({
        id: item.id_message,
        title: item.title || 'Pemberitahuan',
        message: item.message_content,
        time: formatTimeAgo(item.created_at),
        type: determineNotifType(item.title, item.message_content)
      }))
      
      if (notifications.value.length > 0) {
        const latestIdFromApi = notifications.value[0].id 
        const storedLatestId = localStorage.getItem('last_read_notif_id') 
        
        if (String(latestIdFromApi) !== storedLatestId) {
          hasUnread.value = true
        } else {
          hasUnread.value = false 
        }
      } else {
        hasUnread.value = false
      }
    }
  } catch (err) {
    console.error('Gagal mengambil data notifikasi:', err)
  }
}

const getNotifIcon = (type) => {
  if (type === 'dibayar') return Zap
  if (type === 'diterima') return CheckCircle2
  if (type === 'ditolak') return XCircle
  return Bell
}

const getNotifIconBgClass = (type) => {
  if (type === 'dibayar') return 'bg-success-light text-success'
  if (type === 'diterima') return 'bg-primary-light text-primary'
  if (type === 'ditolak') return 'bg-danger-light text-danger'
  return 'bg-info-light text-info' 
}

// Fetch Data API Reimbursement
const fetchReimbursements = async (page = 1) => {
  isLoading.value = true
  try {
    const res = await ApiService.getMyReimbursementsByMonth(page, filterBulan.value)
    
    const responseData = res.data?.data || [] 
    const metaData = res.data?.meta || {}

    semuaData.value = responseData.map(item => ({
      id: item.id_request,
      kategori: item.category_name || 'Lain-lain',
      judul: item.description || item.category_name || 'Pengajuan Reimburse',
      status: mapStatusToFrontend(item.last_status),
      catatan: item.rejection_reason || item.description || '',
      jumlahAsli: item.amount, 
      jumlah: formatRupiah(item.amount),
      tanggal: new Date(item.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      tanggalIso: item.expense_date

    }))

    halamanAktif.value = metaData.current_page || 1
    totalHalaman.value = metaData.last_page || 1

  } catch (err) {
    console.error('Failed to fetch reimbursements:', err)
  } finally {
    isLoading.value = false 
  }
}

const pengajuanTerakhir = computed(() => {
  if (semuaData.value.length === 0) return null

  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const tanggalHariIni = `${yyyy}-${mm}-${dd}`

  const dataHariIni = semuaData.value.find(item => item.tanggalIso === tanggalHariIni)

  return dataHariIni || null
})

const timelineSteps = computed(() => {
  if (!pengajuanTerakhir.value) return []
  
  const status = pengajuanTerakhir.value.status.toLowerCase()
  
  return [
    { 
      label: 'Diajukan', 
      desc: 'Berhasil dikirim ke sistem', 
      isComplete: true, 
      isCurrent: status === 'menunggu', 
      isRejected: false 
    },
    { 
      label: 'Menunggu Persetujuan', 
      desc: status === 'ditolak' ? 'Pengajuan ditolak' : ['diterima', 'disetujui', 'dibayar'].includes(status) ? 'Telah disetujui' : 'Menunggu antrean', 
      isComplete: ['diterima', 'disetujui', 'dibayar'].includes(status) || status === 'ditolak', 
      isCurrent: status === 'menunggu', 
      isRejected: status === 'ditolak' 
    },
    { 
      label: 'Proses Keuangan', 
      desc: status === 'dibayar' ? 'Selesai diverifikasi' : status === 'ditolak' ? 'Dibatalkan' : ['diterima', 'disetujui'].includes(status) ? 'Sedang diproses Finance' : 'Menunggu tahap sebelumnya', 
      isComplete: status === 'dibayar', 
      isCurrent: ['diterima', 'disetujui'].includes(status), 
      isRejected: status === 'ditolak'
    },
    { 
      label: 'Dana Cair', 
      desc: status === 'dibayar' ? 'Transfer berhasil dilakukan' : status === 'ditolak' ? 'Gagal' : 'Menunggu pencairan', 
      isComplete: status === 'dibayar', 
      isCurrent: status === 'dibayar', 
      isRejected: status === 'ditolak'
    }
  ]
})

onMounted(() => {
  fetchReimbursements(halamanAktif.value)
  fetchNotifications() 
})

const dataFiltered = computed(() => {
  if (filterAktif.value === 'semua') return semuaData.value
  return semuaData.value.filter(d => d.status === filterAktif.value)
})

const ringkasanBulanIni = computed(() => {
  let pengajuan = 0, disetujui = 0, ditolak = 0
  semuaData.value.forEach(item => {
    pengajuan += item.jumlahAsli
    const s = item.status.toLowerCase()
    if (s === 'diterima' || s === 'disetujui' || s === 'dibayar') disetujui += item.jumlahAsli
    else if (s === 'ditolak') ditolak += item.jumlahAsli
  })
  return { pengajuan: formatRupiah(pengajuan), disetujui: formatRupiah(disetujui), ditolak: formatRupiah(ditolak) }
})

const kategoriStats = computed(() => {
  const stats = {
    'Transportasi': { label: 'Transportasi', total: 0, ikon: Car, bg: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)' },
    'Makanan': { label: 'Makanan', total: 0, ikon: UtensilsCrossed, bg: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)' },
    'Parkir': { label: 'Parkir', total: 0, ikon: ParkingMeter, bg: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)' },
    'Lain-lain': { label: 'Dan lain-lain', total: 0, ikon: MoreHorizontal, bg: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)' }
  }
  dataFiltered.value.forEach(item => {
    const namaKategori = item.kategori.toLowerCase()
    if (namaKategori.includes('transport')) stats['Transportasi'].total += item.jumlahAsli
    else if (namaKategori.includes('makan') || namaKategori.includes('minum')) stats['Makanan'].total += item.jumlahAsli
    else if (namaKategori.includes('parkir')) stats['Parkir'].total += item.jumlahAsli
    else stats['Lain-lain'].total += item.jumlahAsli
  })
  return Object.values(stats).map(s => ({ label: s.label, jumlah: formatRupiah(s.total), ikon: s.ikon, bg: s.bg }))
})

function gantiHalaman(h) { if (h >= 1 && h <= totalHalaman.value) fetchReimbursements(h) }

const namaBulanLengkap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const labelBulanTampil = computed(() => {
  const [thn, bln] = filterBulan.value.split('-')
  return `${namaBulanLengkap[parseInt(bln) - 1]} ${thn}`
})
const bulanModalList = [
  { val: 1, label: 'Jan' }, { val: 2, label: 'Feb' }, { val: 3, label: 'Mar' }, { val: 4, label: 'Apr' },
  { val: 5, label: 'Mei' }, { val: 6, label: 'Jun' }, { val: 7, label: 'Jul' }, { val: 8, label: 'Agt' },
  { val: 9, label: 'Sep' }, { val: 10, label: 'Okt' }, { val: 11, label: 'Nov' }, { val: 12, label: 'Des' }
]

function bukaModalBulan() {
  const [thn, bln] = filterBulan.value.split('-')
  tempTahun.value = parseInt(thn); tempBulan.value = parseInt(bln)
  showModalBulan.value = true
}

function terapkanFilterBulan() {
  filterBulan.value = `${tempTahun.value}-${tempBulan.value.toString().padStart(2, '0')}`
  showModalBulan.value = false; fetchReimbursements(1)
}

function getLabelStatus(status) {
  const map = { dibayar: 'Dibayar', ditolak: 'Ditolak', menunggu: 'Menunggu', diterima: 'Diterima' }
  return map[status.toLowerCase()] || status
}

const getStatusIcon = (status) => {
  const s = status.toLowerCase()
  if (s === 'menunggu') return Clock
  if (s === 'diterima' || s === 'disetujui') return CheckCircle2
  if (s === 'dibayar') return Zap
  if (s === 'ditolak') return X
  return Clock
}

const getStatusPillClass = (status) => {
  const s = status.toLowerCase()
  if (s === 'menunggu') return 'pill-warning'
  if (s === 'diterima' || s === 'disetujui') return 'pill-info'
  if (s === 'dibayar') return 'pill-success'
  if (s === 'ditolak') return 'pill-danger'
  return ''
}

const getBorderColor = (kategori) => {
  if (!kategori) return '#3B82F6'
  const name = kategori.toLowerCase()
  if (name.includes('transport')) return '#22c55e'
  if (name.includes('makan') || name.includes('minum')) return '#ec4899'
  if (name.includes('parkir')) return '#a855f7'
  return '#3B82F6'
}
</script>

<template>
  <div class="dasbor-staf">
    
    <div class="header-utama">
      <h2 class="judul-halaman">Dashboard Staff</h2>
      <button class="btn btn-primary tombol-tambah" @click="router.push('/staf/reimbursement/tambah')">
        <Plus :size="16" /> Tambah Reimbursement
      </button>
    </div>

    <div class="grid-dasbor">
      <div class="kolom-kiri">
        <div class="section-title-row title-with-filters">
          <h3 class="judul-seksi">Riwayat Reimbursement</h3>
        </div>

        <div class="filter-kiri-wrap">
          <div class="filter-chip-row">
            <button
              v-for="f in filterList"
              :key="f.key"
              class="filter-chip"
              :class="{ 'filter-chip-aktif': filterAktif === f.key }"
              @click="filterAktif = f.key"
            >
              <span v-if="f.warna" class="titik-warna" :style="{ background: f.warna }"></span>
              {{ f.label }}
            </button>
          </div>

          <button class="btn-tanggal-full" @click="bukaModalBulan">
            <span>{{ labelBulanTampil }}</span>
            <Calendar :size="18" class="ikon-kalender" />
          </button>
        </div>

        <div class="daftar-container">
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-container">
            <div class="global-spinner"></div>
            <p>Memuat riwayat...</p>
          </div>
          </div>

          <div v-else-if="dataFiltered.length === 0" class="kosong-teks">
            Tidak ada data untuk filter ini.
          </div>

          <template v-else>
            <div class="daftar-list reimbursement-cards">
              <div
                v-for="item in dataFiltered"
                :key="item.id"
                class="reimbursement-card"
                :style="{ borderRightColor: getBorderColor(item.kategori) }"
                @click="router.push('/staf/reimbursement/' + item.id)"
              >
                <div class="card-content">
                  <div class="card-info">
                    <h3 class="card-title">{{ item.judul }}</h3>
                    
                    <div class="status-badge-container">
                      <span class="status-pill" :class="getStatusPillClass(item.status)">
                        <component :is="getStatusIcon(item.status)" :size="12" class="status-icon" />
                        {{ getLabelStatus(item.status) }}
                      </span>
                      <span v-if="item.catatan && item.status.toLowerCase() === 'ditolak'" class="status-reason">{{ item.catatan }}</span>
                    </div>
                    
                    <div class="amount">{{ item.jumlah }}</div>
                  </div>
                  <div class="date">{{ item.tanggal }}</div>
                </div>
              </div>
            </div>

            <div class="paginasi">
              <button class="btn-paging" @click="gantiHalaman(halamanAktif - 1)" :disabled="halamanAktif === 1">
                <ChevronLeft :size="16" />
              </button>
              <button
                v-for="h in totalHalaman"
                :key="h"
                class="btn-paging"
                :class="{ 'paging-aktif': halamanAktif === h }"
                @click="gantiHalaman(h)"
              >{{ h }}</button>
              <button class="btn-paging" @click="gantiHalaman(halamanAktif + 1)" :disabled="halamanAktif === totalHalaman">
                <ChevronRight :size="16" />
              </button>
            </div>
          </template>
        </div>
      </div>

      <div class="kolom-kanan">
        <h2 class="judul-seksi">Statistik dan Laporan</h2>
     <div class="grid-statistik">
  <div v-for="s in kategoriStats" :key="s.label" class="kartu-stat" :style="{ backgroundColor: s.bg }">
    <div class="stat-ikon">
      <component :is="s.ikon" :size="28" />
    </div>
    <div class="stat-info">
      <p class="stat-label">{{ s.label }}</p>
      <p class="stat-jumlah">{{ s.jumlah }}</p>
    </div>
  </div>
</div>
      </div>
    </div>

    <div v-if="showModalBulan" class="modal-backdrop" @click.self="showModalBulan = false">
      <div class="modal-box">
        <h3 class="modal-judul">Pilih Bulan</h3>
        <div class="modal-tahun-kontrol">
          <button class="btn-kontrol-tahun" @click="tempTahun--"><ChevronLeft :size="18"/></button>
          <span class="label-tahun">{{ tempTahun }}</span>
          <button class="btn-kontrol-tahun" @click="tempTahun++"><ChevronRight :size="18"/></button>
        </div>
        <div class="grid-bulan">
          <button
            v-for="b in bulanModalList"
            :key="b.val"
            class="btn-bulan-item"
            :class="{ 'aktif': tempBulan === b.val }"
            @click="tempBulan = b.val"
          >
            {{ b.label }}
          </button>
        </div>
        <div class="modal-aksi">
          <button class="btn-batal" @click="showModalBulan = false">Batal</button>
          <button class="btn-terapkan" @click="terapkanFilterBulan">Terapkan</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Struktur Baru Filter Kiri */
.filter-kiri-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

/* Tombol Tanggal Sesuai UI Foto */
.btn-tanggal-full {
  width: 100%;
  display: flex;
  align-items: center;
  background-color: white;
  border: 1.5px solid #60a5fa; /* Biru terang sesuai foto */
  color: #3b82f6;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-tanggal-full:hover {
  background-color: #eff6ff;
  border-color: #3b82f6;
}

.ikon-kalender {
  color: #60a5fa;
}

/* --- MODAL BULAN --- */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-box {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 340px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.notif-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 360px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.notif-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.btn-clear {
  background: transparent;
  border: none;
  font-size: 0.8125rem;
  color: #3b82f6;
  font-weight: 500;
  cursor: pointer;
}
.btn-clear:hover { text-decoration: underline; }

.notif-list {
  max-height: 380px;
  overflow-y: auto;
}

/* Custom Scrollbar untuk list notifikasi */
.notif-list::-webkit-scrollbar { width: 4px; }
.notif-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

.notif-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background-color 0.2s;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background-color: #f8fafc; }

.notif-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Warna Latar & Teks Ikon Notifikasi */
.bg-success-light { background-color: #dcfce7; }
.text-success { color: #16a34a; }
.bg-primary-light { background-color: #dbeafe; }
.text-primary { color: #2563eb; }
.bg-danger-light { background-color: #fee2e2; }
.text-danger { color: #dc2626; }
.bg-info-light { background-color: #f1f5f9; }
.text-info { color: #64748b; }

.notif-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.notif-content h5 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}
.notif-content p {
  margin: 0;
  font-size: 0.8125rem;
  color: #475569;
  line-height: 1.4;
}
.notif-time {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.notif-footer {
  padding: 0.75rem;
  text-align: center;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}
.notif-footer button {
  background: transparent;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
}
.notif-footer button:hover { color: #0f172a; }

/* --- RINGKASAN FINANSIAL (HIGHLIGHT CARDS) --- */
.ringkasan-finansial {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}
.rf-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.primary-card { background-color: #3b82f6; color: white; border-color: #3b82f6; }
.rf-icon-wrapper { margin-bottom: 0.75rem; opacity: 0.8; }
.rf-icon-wrapper.success { color: #10B981; }
.rf-icon-wrapper.danger { color: #EF4444; }
.rf-label { font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; opacity: 0.9; }
.rf-card:not(.primary-card) .rf-label { color: #64748b; }
.rf-value { font-size: 1.5rem; font-weight: 700; margin: 0; }

/* Grid utama */
.grid-dasbor {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 1rem;
  align-items: stretch;
  flex: 1;
  min-height: 0;
}

.header-utama {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.judul-halaman {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.judul-seksi {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 1rem;
}

/* ─── Kolom kiri ─── */
.kolom-kiri {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Filter chip */
.filter-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.875rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.875rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: white;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.filter-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-chip-aktif {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.titik-warna {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

/* Input bulan */
.pilih-bulan {
  margin-bottom: 0;
}
.reimbursement-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.card-content { padding: 1.25rem 1.5rem; flex: 1; display: flex; justify-content: space-between; align-items: flex-end; }
.card-info { display: flex; flex-direction: column; gap: 0.6rem; }
.card-title { margin: 0; font-size: 0.95rem; font-weight: 600; color: #111827; }
.status-badge-container { display: flex; align-items: center; gap: 0.75rem; }
.status-pill {
  display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; border: 1px solid transparent;
}
.pill-success { background-color: #ECFDF5; color: #10B981; border-color: #A7F3D0; }
.pill-danger { background-color: #FEF2F2; color: #EF4444; border-color: #FECACA; }
.pill-warning { background-color: #FFFBEB; color: #F59E0B; border-color: #FDE68A; }
.pill-info { background-color: #EFF6FF; color: #3B82F6; border-color: #BFDBFE; }
.status-reason { font-size: 0.8rem; color: #9CA3AF; }
.amount { font-size: 1rem; font-weight: 700; color: #111827; }
.date { font-size: 0.75rem; color: #9CA3AF; white-space: nowrap; }

.paginasi {
  display: flex; justify-content: center; align-items: center; gap: 0.375rem; padding: 1rem; border-top: 1px solid #f1f5f9; margin-bottom: 0; background: white; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;
}
.btn-paging {
  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.8125rem; font-weight: 500; background: white; border: 1px solid #e2e8f0; color: #64748b; cursor: pointer; transition: all 0.15s;
}

.daftar-container {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  position: relative; 
  min-height: 300px; /* Menjaga tinggi kotak agar tidak menyusut saat loading */
  display: flex;
  flex-direction: column;
}
.judul-tracker {
  margin-top: 1.75rem;
}
.tracker-card {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.tracker-header-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 0.75rem;
  margin-bottom: 1.25rem;
}
.tracker-judul-klaim {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  max-width: 70%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tracker-harga-klaim {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #3b82f6;
}

/* Base Line Vertikal */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  max-height: 550px;
  overflow-y: auto;
}

/* Custom Scrollbar */
.reimbursement-cards::-webkit-scrollbar {
  width: 6px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 13px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background-color: #f1f5f9;
  z-index: 1;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  position: relative;
  z-index: 2;
}
.timeline-badge-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
.timeline-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #cbd5e1;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.timeline-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.timeline-content h5 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}
.timeline-content p {
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Modifikasi State Timeline (Complete, Current, Rejected) */
.timeline-item.complete .timeline-badge {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}
.timeline-item.complete .timeline-content h5 {
  color: #1e293b;
}

.timeline-item.current .timeline-badge {
  border-color: #3b82f6;
  color: #3b82f6;
  background-color: #eff6ff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}
.timeline-item.current .timeline-content h5 {
  color: #3b82f6;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid transparent;
}

.pill-success {
  background-color: #ECFDF5;
  color: #10B981;
  border-color: #A7F3D0;
}

.pill-danger {
  background-color: #FEF2F2;
  color: #EF4444;
  border-color: #FECACA;
}

.pill-warning {
  background-color: #FFFBEB;
  color: #F59E0B;
  border-color: #FDE68A;
}

.pill-info {
  background-color: #EFF6FF;
  color: #3B82F6;
  border-color: #BFDBFE;
}

.status-reason {
  font-size: 0.8rem;
  color: #9CA3AF;
}

.amount {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.dropdown-wrapper {
  position: relative;
  display: inline-block;
  height: 100%;
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 180px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0.5rem 0;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.dropdown-item:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

/* ─── Kolom kanan: Statistik ─── */
.kolom-kanan {
  display: flex;
  flex-direction: column;
}

.grid-statistik {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.kartu-stat {
  border-radius: 14px;
  padding: 1rem;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.04);
  transition: all 0.25s ease;
  position: relative;
}

.kartu-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.stat-ikon {
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.22);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 0.2rem;
}

.stat-jumlah {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* Responsive */
@media (max-width: 1100px) {
  .grid-dasbor {
    grid-template-columns: 1fr;
  }
  .grid-statistik {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-statistik {
    grid-template-columns: 1fr 1fr;
  }

}
</style>