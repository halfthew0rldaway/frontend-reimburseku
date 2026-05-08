<script setup>
import { ref } from 'vue'
import { FileText, ChevronLeft, ChevronRight, TrendingUp, Calendar } from 'lucide-vue-next'

const stats = [
  { label: 'Sisa Budget Bulanan', value: 'Rp.5.000.000', isBlue: true },
  { label: 'Total Pengeluaran Hari ini', value: 'Rp.2.000.000', isBlue: false },
]

const chartLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const chartData = [1500000, 2200000, 1800000, 2500000, 3200000, 2800000, 3500000]
const maxVal = 4000000

function getX(i) { return 40 + (i * 120) }
function getY(v) { return 250 - (v / maxVal * 200) }

const polylinePoints = chartData.map((v, i) => `${getX(i)},${getY(v)}`).join(' ')

const history = [
  { id: 1, name: 'Budi Santoso', category: 'Transportasi', amount: 'Rp.300.000', date: '20 Jan 2025', status: 'Menunggu' },
  { id: 2, name: 'Siti Rahayu', category: 'Makanan', amount: 'Rp.85.000', date: '19 Jan 2025', status: 'Selesai' },
  { id: 3, name: 'Ahmad Fauzi', category: 'Parkir', amount: 'Rp.50.000', date: '18 Jan 2025', status: 'Ditolak' },
  { id: 4, name: 'Dewi Kurniawati', category: 'Makanan', amount: 'Rp.150.000', date: '17 Jan 2025', status: 'Selesai' },
  { id: 5, name: 'Rina Maharani', category: 'Transportasi', amount: 'Rp.250.000', date: '16 Jan 2025', status: 'Selesai' },
]

const filters = ['Semua', 'Menunggu', 'Selesai', 'Pembayaran', 'Ditolak']
const activeFilter = ref('Semua')
</script>

<template>
  <div class="finance-dasbor">
    <div class="page-header">
      <h1 class="page-title">Beranda</h1>
    </div>

    <!-- Top Stats -->
    <div class="stats-row">
      <div v-for="s in stats" :key="s.label" class="stat-card" :class="{ 'card-blue': s.isBlue }">
        <div class="stat-icon-box">
          <Calendar v-if="s.isBlue" :size="18" />
          <TrendingUp v-else :size="18" />
        </div>
        <div class="stat-info">
          <p class="stat-label">{{ s.label }}</p>
          <p class="stat-value">{{ s.value }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Left: Chart -->
      <div class="left-col">
        <div class="card chart-card">
          <div class="card-head">
            <h3 class="card-title">Pengeluaran Seminggu terakhir</h3>
            <div class="month-selector">Januari 2026 <ChevronLeft :size="12" style="transform: rotate(-90deg)" /></div>
          </div>
          <div class="chart-content">
            <svg viewBox="0 0 800 300" class="line-svg">
              <!-- Grid Lines -->
              <line v-for="n in 5" :key="n" x1="40" :y1="50 + (n-1)*50" x2="760" :y2="50 + (n-1)*50" stroke="#f1f5f9" stroke-width="1" />
              <!-- X Axis Labels -->
              <text v-for="(l, i) in chartLabels" :key="i" :x="getX(i)" y="280" text-anchor="middle" font-size="12" fill="#94a3b8">{{ l }}</text>
              <!-- Line Area -->
              <path :d="`M ${getX(0)},250 ${polylinePoints.split(' ').map(p => 'L '+p).join(' ')} L ${getX(6)},250 Z`" fill="url(#grad)" opacity="0.1" />
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#3b82f6" />
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
              </linearGradient>
              <!-- The Line -->
              <polyline :points="polylinePoints" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              <!-- Dots -->
              <circle v-for="(v, i) in chartData" :key="'c'+i" :cx="getX(i)" :cy="getY(v)" r="5" fill="white" stroke="#3b82f6" stroke-width="2" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Right: History -->
      <div class="right-col">
        <div class="card list-card">
          <div class="card-head">
            <h3 class="card-title">Riwayat Reimbursement Hari ini</h3>
          </div>
          <div class="filter-row">
            <button v-for="f in filters" :key="f" class="filter-btn" :class="{ active: activeFilter === f }" @click="activeFilter = f">{{ f }}</button>
          </div>
          <div class="history-list">
            <div v-for="item in history" :key="item.id" class="history-row">
              <div class="h-left">
                <div class="avatar-circle">{{ item.name[0] }}</div>
                <div class="h-info">
                  <p class="h-name">{{ item.name }}</p>
                  <p class="h-cat">{{ item.category }}</p>
                  <p class="h-date">{{ item.date }}</p>
                </div>
              </div>
              <div class="h-right">
                <p class="h-amount">{{ item.amount }}</p>
                <span class="status-pill" :class="item.status.toLowerCase()">{{ item.status }}</span>
              </div>
            </div>
          </div>
          <div class="pagination">
            <button class="p-btn"><ChevronLeft :size="12" /></button>
            <span class="p-num active">1</span>
            <span class="p-num">2</span>
            <span class="p-num">3</span>
            <span class="p-num">4</span>
            <button class="p-btn"><ChevronRight :size="12" /></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-dasbor { display: flex; flex-direction: column; gap: 1rem; background: #f8fafc; height: 100%; overflow: hidden; }

.page-header { margin-bottom: 0.25rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

/* Stats */
.stats-row { display: grid; grid-template-columns: 220px 220px; gap: 1rem; }
.stat-card {
  background: white; border-radius: 12px; padding: 1rem 1.25rem;
  display: flex; align-items: center; gap: 0.875rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;
}
.card-blue { background: #3b82f6; color: white; border-color: #3b82f6; }
.stat-icon-box { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
.card-blue .stat-icon-box { background: rgba(255,255,255,0.2); }
.stat-card:not(.card-blue) .stat-icon-box { background: #f8fafc; color: #f59e0b; }

.stat-label { font-size: 0.65rem; font-weight: 700; margin-bottom: 0.125rem; }
.stat-value { font-size: 1.125rem; font-weight: 700; }
.card-blue .stat-label { color: rgba(255,255,255,0.8); }
.stat-card:not(.card-blue) .stat-label { color: #94a3b8; }

/* Grid */
.dashboard-grid { display: grid; grid-template-columns: 1fr 360px; gap: 1rem; flex: 1; min-height: 0; }
.left-col, .right-col { display: flex; flex-direction: column; min-height: 0; }

.card { background: white; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; display: flex; flex-direction: column; min-height: 0; }
.card-head { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 0.8125rem; font-weight: 700; color: #1e293b; }

/* Chart */
.chart-card { flex: 1; }
.month-selector { font-size: 0.7rem; color: #64748b; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; }
.chart-content { padding: 0 1.25rem 1rem; flex: 1; min-height: 0; }
.line-svg { width: 100%; height: 100%; max-height: 300px; }

/* History */
.list-card { flex: 1; }
.filter-row { padding: 0 1.25rem 0.75rem; display: flex; gap: 0.375rem; overflow-x: auto; scrollbar-width: none; }
.filter-row::-webkit-scrollbar { display: none; }
.filter-btn { background: #f1f5f9; border: none; color: #64748b; font-size: 0.65rem; font-weight: 700; padding: 0.3rem 0.625rem; border-radius: 6px; cursor: pointer; white-space: nowrap; }
.filter-btn.active { background: #3b82f6; color: white; }

.history-list { flex: 1; overflow-y: auto; }
.history-row { padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
.h-left { display: flex; align-items: center; gap: 0.625rem; }
.avatar-circle { width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 700; border: 1px solid #e2e8f0; font-size: 0.7rem; }
.h-info { display: flex; flex-direction: column; }
.h-name { font-size: 0.75rem; font-weight: 700; color: #1e293b; }
.h-cat { font-size: 0.65rem; color: #94a3b8; font-weight: 600; margin: 0.1rem 0; }
.h-date { font-size: 0.6rem; color: #cbd5e1; }

.h-right { text-align: right; }
.h-amount { font-size: 0.75rem; font-weight: 700; color: #1e293b; margin-bottom: 0.125rem; }
.status-pill { font-size: 0.55rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 4px; }
.status-pill.menunggu { background: #fffbeb; color: #f59e0b; }
.status-pill.selesai { background: #f0fdf4; color: #22c55e; }
.status-pill.ditolak { background: #fef2f2; color: #ef4444; }

.pagination { padding: 0.75rem 1.25rem; display: flex; justify-content: center; align-items: center; gap: 0.375rem; border-top: 1px solid #f8fafc; }
.p-btn, .p-num { width: 22px; height: 22px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 600; color: #64748b; cursor: pointer; }
.p-num.active { background: #3b82f6; color: white; border-color: #3b82f6; }
</style>
