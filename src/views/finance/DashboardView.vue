<script setup>
import { ref, onMounted, defineAsyncComponent, computed } from 'vue'
import { ChevronLeft, ChevronRight, TrendingUp, Calendar } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
import { formatRupiah, mapStatusToFrontend } from '@/utils/format'

// --- State Dasbor Dasar ---
const stats = ref([
  { label: 'Saldo Kas', value: 'Rp 0', isBlue: true },
  { label: 'Telah Dibayarkan', value: 'Rp 0', isBlue: false },
])

const history = ref([])
const isLoading = ref(true)

// State Pagination Tabel
const currentPage = ref(1)
const lastPage = ref(1)

// --- State Filter Chart ---
const chartMode = ref('weekly') // 'weekly' atau 'monthly'

// Helper untuk Set Default Date (7 hari terakhir)
const today = new Date()
const lastWeek = new Date(today)
lastWeek.setDate(today.getDate() - 6)

const formatDate = (date) => date.toISOString().split('T')[0] // Hasil: YYYY-MM-DD
const formatMonth = (date) => date.toISOString().slice(0, 7)  // Hasil: YYYY-MM

const startDate = ref(formatDate(lastWeek))
const endDate = ref(formatDate(today))
const selectedMonth = ref(formatMonth(today))
const monthInputRef = ref(null)

const openMonthPicker = () => {
  if (monthInputRef.value) {
    // Membuka paksa kalender bawaan browser
    if (typeof monthInputRef.value.showPicker === 'function') {
      monthInputRef.value.showPicker()
    } else {
      monthInputRef.value.focus()
    }
  }
}
const displayMonth = computed(() => {
  if (!selectedMonth.value) return 'Pilih Bulan'
  const [year, month] = selectedMonth.value.split('-')
  const date = new Date(year, parseInt(month) - 1)
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})
// --- Konfigurasi Chart ---
const chartOptions = ref({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'inherit',
    parentHeightOffset: 0,
    sparkline: { enabled: false },
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  colors: ['#3b82f6'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2.5 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.0, stops: [0, 90, 100] }
  },
  xaxis: {
    categories: [], // Akan diisi dinamis dari API
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 }, offsetY: 4 },
    crosshairs: { show: false }
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 },
      formatter: (value) => {
        if(value >= 1000000) return (value / 1000000).toFixed(1) + " Jt"
        if(value >= 1000) return (value / 1000).toFixed(0) + " Rb"
        return value
      },
      offsetX: -10
    }
  },
  grid: {
    borderColor: '#f1f5f9', strokeDashArray: 4, padding: { top: 0, right: 0, bottom: 0, left: 10 }
  }
})

const series = ref([{ name: 'Pengeluaran', data: [] }]) // Akan diisi dinamis dari API

// --- Fungsi Fetch API ---

// 1. Fetch Chart (Dipanggil saat awal dan saat filter diubah)
const fetchChartData = async () => {
  try {
    let res;
    if (chartMode.value === 'weekly') {
      res = await ApiService.getChartWeekly(startDate.value, endDate.value)
    } else {
      const [year, month] = selectedMonth.value.split('-') // Pisahkan "2026-05" menjadi array
      res = await ApiService.getChartMonthly(month, year)
    }

    const data = res.data?.data || {}
    
    // Perbarui Series Data
    series.value = [{ name: 'Pengeluaran', data: data.series || [] }]
    
    // Perbarui Categories (Sumbu X)
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        ...chartOptions.value.xaxis,
        categories: data.categories || []
      }
    }
  } catch (error) {
    console.error('Failed to load chart data', error)
  }
}

// 2. Fetch Tabel & Stats
const fetchDashboardData = async (page = 1) => {
  isLoading.value = true
  try {
    const [statsRes, reimburseRes] = await Promise.all([
      ApiService.getBalanceStats(),
      ApiService.getReimbursements(page)
    ])
    
    const statsData = statsRes.data?.data || {}
    stats.value[0].value = formatRupiah(statsData.saldo_kas || 0)
    stats.value[1].value = formatRupiah(statsData.telah_dibayarkan || 0)

    const metaData = reimburseRes.data?.meta || {}
    currentPage.value = metaData.current_page || 1
    lastPage.value = metaData.last_page || 1

    const listData = reimburseRes.data?.data || []

    // --- LOGIKA FILTER HARI INI ---
    // Mendapatkan tanggal hari ini format YYYY-MM-DD sesuai zona waktu lokal
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Filter data yang expense_date-nya sama dengan hari ini
    const todayListData = listData.filter(item => {
      const itemDate = item.expense_date ? item.expense_date.substring(0, 10) : '';
      return itemDate === todayStr;
    });
    // ------------------------------
    
    history.value = todayListData.map(item => {
      const rawStatus = item.latest_approval?.status || 'PENDING'
      return {
        id: item.id_request,
        name: item.employees_name || 'Unknown',
        category: item.category_name || 'Lain-lain',
        amount: formatRupiah(item.amount),
        date: new Date(item.expense_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        status: mapStatusToFrontend(rawStatus) 
      }
    })
  } catch (error) {
    console.error('Failed to load dashboard table', error)
  } finally {
    isLoading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= lastPage.value && page !== currentPage.value) {
    fetchDashboardData(page)
  }
}

onMounted(() => {
  fetchDashboardData(1)
  fetchChartData() // Panggil fetch chart saat komponen dimuat
})

// --- State Filter Tabel ---
const filters = ['Semua', 'Menunggu', 'Dibayar', 'Ditolak']
const activeFilter = ref('Semua')

const filteredHistory = computed(() => {
  if (activeFilter.value === 'Semua') return history.value
  return history.value.filter(item => 
    item.status.toLowerCase() === activeFilter.value.toLowerCase()
  )
})
</script>

<template>
  <div class="finance-dasbor">
    <div class="page-header">
      <h1 class="page-title">Beranda</h1>
    </div>

    <div class="stats-row">
      <div v-for="s in stats" :key="s.label" class="stat-card" :class="{ 'card-blue': s.isBlue }">
        <div class="stat-icon-box">
          <Calendar v-if="s.isBlue" :size="20" />
          <TrendingUp v-else :size="20" />
        </div>
        <div class="stat-info">
          <p class="stat-label">{{ s.label }}</p>
          <p class="stat-value">{{ s.value }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card chart-card">
        <div class="card-head">
          <h3 class="card-title">Grafik Pengeluaran</h3>
          
      <div class="chart-header-actions">
            <select v-model="chartMode" @change="fetchChartData" class="custom-input">
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>

            <div v-if="chartMode === 'weekly'" class="date-range-wrap">
              <input type="date" v-model="startDate" @change="fetchChartData" class="custom-input" />
              <span class="range-divider">-</span>
              <input type="date" v-model="endDate" @change="fetchChartData" class="custom-input" />
            </div>

        <div v-else class="month-wrap relative">
              <div class="month-selector custom-input" @click="openMonthPicker">
                {{ displayMonth }} <ChevronDown :size="14" style="margin-left: 4px;" />
              </div>
              
              <input 
                ref="monthInputRef"
                type="month" 
                v-model="selectedMonth" 
                @change="fetchChartData" 
                class="hidden-picker" 
              />
            </div>
          </div>

        </div>
        <div class="chart-content">
          <VueApexCharts :key="chartMode" type="area" height="100%" :options="chartOptions" :series="series" />
        </div>
      </div>

      <div class="card list-card">
        <div class="card-head">
          <h3 class="card-title">Riwayat Reimbursement Hari Ini</h3>
        </div>
        <div class="filter-row">
          <button v-for="f in filters" :key="f" class="filter-btn" :class="{ active: activeFilter === f }" @click="activeFilter = f">{{ f }}</button>
        </div>
        
        <div class="history-list">
          <div v-if="isLoading" class="empty-state">
            Memuat riwayat...
          </div>
          <div v-else-if="filteredHistory.length === 0" class="empty-state">
            Belum ada riwayat untuk filter ini.
          </div>
          <template v-else>
            <div v-for="item in filteredHistory" :key="item.id" class="history-row">
              <div class="h-left">
                <div class="avatar-circle">{{ item.name[0] }}</div>
                <div class="h-info">
                  <p class="h-name">{{ item.name }}</p>
                  <p class="h-meta">{{ item.category }} &bull; {{ item.date }}</p>
                </div>
              </div>
              <div class="h-right">
                <p class="h-amount">{{ item.amount }}</p>
                <span class="status-pill" :class="item.status.toLowerCase()">{{ item.status }}</span>
              </div>
            </div>
          </template>
        </div>
        
        <div class="pagination" v-if="lastPage > 1">
          <button class="p-btn" aria-label="Halaman Sebelumnya" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            <ChevronLeft :size="14" />
          </button>
          <span v-for="page in lastPage" :key="page" class="p-num" :class="{ active: currentPage === page }" @click="changePage(page)">
            {{ page }}
          </span>
          <button class="p-btn" aria-label="Halaman Selanjutnya" :disabled="currentPage === lastPage" @click="changePage(currentPage + 1)">
            <ChevronRight :size="14" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-dasbor { display: flex; flex-direction: column; gap: 1.5rem; background: #f8fafc; height: calc(100vh - 64px - 3rem); overflow: hidden; padding-bottom: 0.5rem; }

.page-header { margin-bottom: 0; }
.page-title { font-size: 1.35rem; font-weight: 700; color: #0f172a; letter-spacing: -0.01em; }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; max-width: 600px; }
.stat-card {
  background: white; border-radius: 16px; padding: 1.25rem 1.5rem;
  display: flex; align-items: center; gap: 1rem; 
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02); 
  border: 1px solid #f1f5f9;
}
.card-blue { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2); }
.stat-icon-box { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
.card-blue .stat-icon-box { background: rgba(255,255,255,0.2); color: white; }
.stat-card:not(.card-blue) .stat-icon-box { background: #fef3c7; color: #f59e0b; }

.stat-label { font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; }
.card-blue .stat-label { color: rgba(255,255,255,0.9); }
.stat-card:not(.card-blue) .stat-label { color: #64748b; }
.stat-card:not(.card-blue) .stat-value { color: #0f172a; }

/* Grid */
.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr); gap: 1.5rem; flex: 1; min-height: 0; }

@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 1fr; overflow-y: auto; }
  .chart-card { min-height: 400px; }
  .list-card { min-height: 500px; }
}

.card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.card-head { padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; flex-wrap: wrap; gap: 0.75rem;}
.card-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0;}

/* Chart Header Controls */
.chart-header-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.custom-input { font-family: inherit; font-size: 0.7rem; color: #475569; font-weight: 600; cursor: pointer; padding: 0.35rem 0.5rem; border-radius: 6px; border: 1px solid #e2e8f0; background: white; outline: none; transition: border-color 0.2s; }
.custom-input:focus { border-color: #3b82f6; }
.date-range-wrap { display: flex; align-items: center; gap: 0.3rem; }
.range-divider { color: #94a3b8; font-weight: 600; font-size: 0.8rem; }

.chart-content { padding: 1rem 1.5rem 0.5rem 0.5rem; flex: 1; min-height: 300px; width: 100%; position: relative; }

/* History */
.list-card { flex: 1; display: flex; flex-direction: column; }
.filter-row { padding: 1rem 1.5rem; display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 0.5rem; scrollbar-width: none; -ms-overflow-style: none; border-bottom: 1px solid #f8fafc; }
.filter-row::-webkit-scrollbar { display: none; }
.filter-btn { background: #f8fafc; border: 1px solid #f1f5f9; color: #475569; font-size: 0.7rem; font-weight: 600; padding: 0.4rem 0.875rem; border-radius: 20px; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: all 0.2s; }
.filter-btn:hover { background: #f1f5f9; color: #334155; }
.filter-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2); }

.history-list { flex: 1; overflow-y: auto; padding: 0.5rem 0; }
.history-list::-webkit-scrollbar { width: 6px; }
.history-list::-webkit-scrollbar-track { background: transparent; }
.history-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.history-list::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.empty-state { padding: 2rem; text-align: center; color: #64748b; font-size: 0.8rem; font-weight: 500; }
.history-row { padding: 0.875rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; transition: background 0.2s; cursor: default; }
.history-row:hover { background: #fcfdfe; }
.history-row:last-child { border-bottom: none; }

.h-left { display: flex; align-items: center; gap: 0.875rem; }
.avatar-circle { width: 36px; height: 36px; border-radius: 50%; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; border: 1px solid #dbeafe; }
.h-info { display: flex; flex-direction: column; gap: 0.125rem; }
.h-name { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.h-meta { font-size: 0.7rem; color: #64748b; font-weight: 500; }

.h-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
.h-amount { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
.status-pill { font-size: 0.6rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 6px; letter-spacing: 0.02em; text-transform: uppercase; }
.status-pill.menunggu { background: #fffbeb; color: #f59e0b; border: 1px solid #fef3c7; }
.status-pill.disetujui { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }
.status-pill.selesai { background: #f0fdf4; color: #22c55e; border: 1px solid #dcfce7; }
.status-pill.dibayar { background: #f0fdf4; color: #22c55e; border: 1px solid #dcfce7; }
.status-pill.ditolak { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }

.pagination { padding: 1rem 1.5rem; display: flex; justify-content: center; align-items: center; gap: 0.5rem; border-top: 1px solid #f1f5f9; background: #fcfdfe; }
.p-btn, .p-num { width: 28px; height: 28px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
.p-btn:hover:not(:disabled), .p-num:hover:not(.active) { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
.p-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.p-num.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2); }
.month-wrap.relative {
  position: relative;
  display: inline-block;
}
.month-selector {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.hidden-picker {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none; /* Mencegah input ini memblokir klik */
  border: none;
}
</style>