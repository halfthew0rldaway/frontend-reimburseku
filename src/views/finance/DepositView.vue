<script setup>
import { ref, computed } from 'vue'
import { Plus, Search, ChevronDown, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const stats = [
  { label: 'SALDO KAS', value: 'Rp.250.000.000', progress: 85, color: '#3b82f6', sub: '85% dari anggaran' },
  { label: 'TELAH DIBAYARKAN', value: 'Rp.84.500.000', progress: 20, color: '#22c55e', sub: '20% dari anggaran' },
  { label: 'MENUNGGU', value: 'Rp.15.800.000', progress: 5, color: '#f59e0b', sub: '5% dari anggaran' },
]

const transactions = ref([
  { id: 1, type: 'Dana Masuk', source: 'Top-up dari Bank BCA pusat', amount: '+Rp.50.000.000', balance: 'Rp.250.000.000', date: '22 Okt 2025', note: 'Inject bulanan' },
  { id: 2, name: 'Budi Santoso', type: 'Dana Keluar', source: 'Reimburse: Budi Santoso', amount: '-Rp.1.500.000', balance: 'Rp.298.500.000', date: '20 Okt 2025', note: 'Pembayaran Belanja Kantor' },
  { id: 3, name: 'Siti Rahayu', type: 'Dana Keluar', source: 'Reimburse: Siti Rahayu', amount: '-Rp.85.000', balance: 'Rp.298.415.000', date: '19 Okt 2025', note: 'Pembayaran Grab Food' },
])

const searchQuery = ref('')
const selectedMonth = ref('Januari 2025')

const filteredTransactions = computed(() => {
  return transactions.value.filter(t => 
    t.source.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    t.type.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const goToTambah = () => router.push('/finance/deposit/tambah')
</script>

<template>
  <div class="finance-deposit">
    <div class="page-header">
      <h1 class="page-title">Deposit</h1>
    </div>

    <!-- Deposit Tracker Section -->
    <div class="card tracker-card">
      <div class="card-head">
        <h3 class="card-title">Deposit Tracker</h3>
        <button class="btn-add-setoran" @click="goToTambah">
          <Plus :size="16" /> Tambah Saldo Kas
        </button>
      </div>
      <div class="stats-row">
        <div v-for="s in stats" :key="s.label" class="tracker-stat">
          <div class="stat-meta">
            <p class="stat-label">{{ s.label }}</p>
            <p class="stat-value">{{ s.value }}</p>
          </div>
          <div class="progress-wrapper">
            <div class="progress-container">
              <div class="progress-bar" :style="{ width: s.progress + '%', backgroundColor: s.color }"></div>
            </div>
            <p class="stat-sub">{{ s.sub }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction List Section -->
    <div class="card table-card">
      <div class="table-header">
        <div class="search-box">
          <Search :size="14" class="search-icon" />
          <input v-model="searchQuery" type="text" placeholder="Cari Riwayat..." class="search-input" />
        </div>
        <div class="sort-dropdown">
          <button class="btn btn-outline btn-sort">
            Urutkan <ChevronDown :size="14" />
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>JENIS TRANSAKSI</th>
              <th>SUMBER / TUJUAN</th>
              <th>NOMINAL</th>
              <th>SALDO AKHIR</th>
              <th>TANGGAL</th>
              <th>KETERANGAN</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in filteredTransactions" :key="t.id">
              <td>
                <span class="type-badge" :class="t.type.replace(' ', '-').toLowerCase()">
                  {{ t.type }}
                </span>
              </td>
              <td>
                <p class="t-source" :class="{ 'text-blue': t.name }">{{ t.source }}</p>
              </td>
              <td class="font-bold" :class="t.type === 'Dana Masuk' ? 'text-green' : 'text-red'">
                {{ t.amount }}
              </td>
              <td class="font-bold">{{ t.balance }}</td>
              <td class="text-muted">{{ t.date }}</td>
              <td class="text-muted">{{ t.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-deposit { display: flex; flex-direction: column; gap: 1rem; background: #f8fafc; height: 100%; overflow: hidden; }

.page-header { margin-bottom: 0.25rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.card { background: white; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
.card-head { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 0.8125rem; font-weight: 700; color: #1e293b; }

/* Tracker */
.btn-add-setoran { background: #3b82f6; color: white; border: none; font-size: 0.7rem; font-weight: 700; padding: 0.4rem 0.875rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.375rem; }

.stats-row { padding: 0 1.25rem 1rem; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
.tracker-stat { padding: 1rem; border: 1px solid #f1f5f9; border-radius: 12px; display: flex; flex-direction: column; gap: 0.5rem; }
.stat-meta { display: flex; flex-direction: column; gap: 0.125rem; }
.stat-label { font-size: 0.55rem; font-weight: 700; color: #94a3b8; }
.stat-value { font-size: 1.125rem; font-weight: 800; color: #1e293b; }

.progress-wrapper { display: flex; flex-direction: column; gap: 0.25rem; }
.progress-container { width: 100%; height: 5px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.progress-bar { height: 100%; border-radius: 10px; }
.stat-sub { font-size: 0.55rem; color: #cbd5e1; font-weight: 700; }

/* Table Section */
.table-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 220px; }

.btn-sort { font-size: 0.7rem; font-weight: 700; color: #64748b; padding: 0.4rem 0.875rem; border-radius: 8px; display: flex; align-items: center; gap: 0.375rem; }

.table-responsive { overflow-x: auto; max-height: calc(100vh - 400px); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.7rem; color: #475569; border-bottom: 1px solid #f8fafc; vertical-align: middle; }

.type-badge { font-size: 0.55rem; font-weight: 700; padding: 0.125rem 0.375rem; border-radius: 4px; }
.type-badge.dana-masuk { background: #f0fdf4; color: #16a34a; }
.type-badge.dana-keluar { background: #fef2f2; color: #ef4444; }

.t-source { font-weight: 700; color: #1e293b; }
.text-blue { color: #3b82f6; }

.text-green { color: #22c55e; }
.text-red { color: #ef4444; }
.text-muted { color: #94a3b8; }
.font-bold { font-weight: 800; }
</style>
