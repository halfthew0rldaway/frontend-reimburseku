<script setup>
import { ref } from 'vue'
import { FileText, Clock, CheckCircle, CreditCard } from 'lucide-vue-next'

const stats = ref([
  { label: 'Total Pengajuan', value: '15', icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Menunggu', value: '5', icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Disetujui', value: '7', icon: CheckCircle, color: '#10b981', bg: '#ecfdf5' },
  { label: 'Telah Dibayar', value: '3', icon: CreditCard, color: '#8b5cf6', bg: '#f5f3ff' },
])

const recentReimbursements = ref([
  { id: 'RMB-001', name: 'Silviana Rodrigo', date: '27 Apr 2026', title: 'Taksi meeting client', amount: 'Rp 150.000', status: 'menunggu' },
  { id: 'RMB-002', name: 'Budi Santoso', date: '25 Apr 2026', title: 'Makan siang tim', amount: 'Rp 85.000', status: 'disetujui' },
  { id: 'RMB-003', name: 'Andi Wijaya', date: '22 Apr 2026', title: 'Hotel dinas luar kota', amount: 'Rp 1.200.000', status: 'dibayar' },
])

const getStatusBadgeClass = (status) => {
  switch(status) {
    case 'menunggu': return 'badge-warning'
    case 'disetujui': return 'badge-info'
    case 'dibayar': return 'badge-success'
    case 'ditolak': return 'badge-danger'
    default: return ''
  }
}
</script>

<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard Finance</h1>
        <p class="page-subtitle">Selamat datang di panel finance reimburseKu</p>
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
        <h2 class="section-title">Pengajuan Terbaru</h2>
        <router-link to="/finance/reimbursement" class="see-all">Lihat semua →</router-link>
      </div>

      <table v-if="recentReimbursements.length" class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Karyawan</th>
            <th>Judul</th>
            <th>Jumlah</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rmb in recentReimbursements" :key="rmb.id">
            <td class="font-medium text-primary">{{ rmb.id }}</td>
            <td>
              <div class="name-cell">
                <div class="avatar-sm">{{ rmb.name?.[0] }}</div>
                {{ rmb.name }}
              </div>
            </td>
            <td>{{ rmb.title }}</td>
            <td class="font-medium">{{ rmb.amount }}</td>
            <td>
              <span class="badge" :class="getStatusBadgeClass(rmb.status)">
                {{ rmb.status.charAt(0).toUpperCase() + rmb.status.slice(1) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-text">Belum ada data pengajuan terbaru.</p>
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

.empty-text {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.badge {
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.badge-warning { background-color: #fef3c7; color: #d97706; }
.badge-info { background-color: #e0f2fe; color: #0284c7; }
.badge-success { background-color: #dcfce3; color: #166534; }
.badge-danger { background-color: #fee2e2; color: #b91c1c; }

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>
