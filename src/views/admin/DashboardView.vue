<script setup>
import { ref, onMounted } from 'vue'
import { Users, Tag, CreditCard, ShieldCheck, Wallet, TrendingUp } from 'lucide-vue-next'
import axios from 'axios'

const stats = ref([
  { label: 'Total Karyawan', value: '—', icon: Users, color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Kategori', value: '—', icon: Tag, color: '#8b5cf6', bg: '#f5f3ff' },
  { label: 'Metode Bayar', value: '—', icon: CreditCard, color: '#10b981', bg: '#ecfdf5' },
  { label: 'Hak Akses', value: '—', icon: ShieldCheck, color: '#f59e0b', bg: '#fffbeb' },
])

const recentEmployees = ref([])
const loading = ref(true)

function getHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

async function loadData() {
  try {
    const [empRes, catRes, provRes, roleRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/employee', { headers: getHeaders() }),
      axios.get('http://127.0.0.1:8000/api/category', { headers: getHeaders() }),
      axios.get('http://127.0.0.1:8000/api/provider', { headers: getHeaders() }),
      axios.get('http://127.0.0.1:8000/api/role', { headers: getHeaders() }),
    ])
    stats.value[0].value = empRes.data.data?.total ?? empRes.data.data?.length ?? '—'
    stats.value[1].value = catRes.data.data?.length ?? '—'
    stats.value[2].value = provRes.data.data?.length ?? '—'
    stats.value[3].value = roleRes.data.data?.length ?? '—'
    recentEmployees.value = (empRes.data.data?.data ?? empRes.data.data ?? []).slice(0, 5)
  } catch {
    // keep defaults
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Selamat datang di panel administrator</p>
      </div>
    </div>

    <div class="stats-grid">
      <div v-for="s in stats" :key="s.label" class="stat-card">
        <div class="stat-icon" :style="{ background: s.bg, color: s.color }">
          <component :is="s.icon" :size="22" />
        </div>
        <div class="stat-info">
          <p class="stat-label">{{ s.label }}</p>
          <p class="stat-value">{{ s.value }}</p>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-head">
        <h2 class="section-title">Karyawan Terbaru</h2>
        <router-link to="/admin/karyawan" class="see-all">Lihat semua →</router-link>
      </div>

      <div v-if="loading" class="loading-text">Memuat data...</div>

      <table v-else-if="recentEmployees.length" class="data-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Posisi</th>
            <th>Telepon</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in recentEmployees" :key="emp.id">
            <td>
              <div class="name-cell">
                <div class="avatar-sm">{{ emp.name?.[0] }}</div>
                {{ emp.name }}
              </div>
            </td>
            <td>{{ emp.email }}</td>
            <td>{{ emp.position ?? '—' }}</td>
            <td>{{ emp.phone ?? '—' }}</td>
          </tr>
        </tbody>
      </table>

      <p v-else class="empty-text">Belum ada data karyawan.</p>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page { display: flex; flex-direction: column; gap: 1.75rem; }

.page-header { margin-bottom: 0.25rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--color-text-main); }
.page-subtitle { font-size: 0.875rem; color: var(--color-text-muted); margin-top: 0.25rem; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.stat-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-label { font-size: 0.8125rem; color: var(--color-text-muted); margin-bottom: 0.25rem; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: var(--color-text-main); }

.section-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-title { font-size: 1rem; font-weight: 600; }
.see-all { font-size: 0.8125rem; color: var(--color-primary); text-decoration: none; }

.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.data-table th {
  text-align: left;
  padding: 0.625rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}
.data-table td {
  padding: 0.875rem;
  border-bottom: 1px solid #f1f5f9;
  color: var(--color-text-main);
}
.data-table tr:last-child td { border-bottom: none; }

.name-cell {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-weight: 500;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 600;
  flex-shrink: 0;
}

.loading-text, .empty-text {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>
