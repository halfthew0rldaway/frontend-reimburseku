<script setup>
import { ref } from 'vue'
import { Plus, Ticket, Car, FileText, CheckCircle2, Clock, XCircle, Wallet } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const reimbursements = ref([
  { id: 1, title: 'Uang Makan', status: 'Disetujui', amount: 'Rp.500.000', date: '12/10/2023', icon: FileText, color: 'text-green-500', badgeClass: 'badge-success' },
  { id: 2, title: 'Servis Motor Kendaraan', status: 'Ditolak', amount: 'Rp.22.000', date: '21/10/2023', icon: Car, color: 'text-red-500', badgeClass: 'badge-danger' },
  { id: 3, title: 'Tiket Bus', status: 'Menunggu', amount: 'Rp.200.000', date: '24/10/2023', icon: Ticket, color: 'text-yellow-500', badgeClass: 'badge-warning' },
  { id: 4, title: 'Perbaikan Laptop', status: 'Dibayar', amount: 'Rp.500.000', date: '02/11/2023', icon: FileText, color: 'text-blue-500', badgeClass: 'badge-info' },
  { id: 5, title: 'Beli ATK', status: 'Disetujui', amount: 'Rp.1.000.000', date: '06/11/2023', icon: FileText, color: 'text-green-500', badgeClass: 'badge-success' },
])

const filterMonth = ref('Oktober')
</script>

<template>
  <div class="dashboard-page">
    <div class="page-top-actions">
      <button class="btn btn-primary shadow-sm" @click="router.push('/staff/reimbursement/add')">
        <Plus :size="16" /> Tambah Reimbursement
      </button>
    </div>

    <div class="dashboard-grid">
      <!-- Left Column -->
      <div class="main-column">
        <div class="section-header">
          <h2 class="section-title">Riwayat Reimbursement</h2>
          <div class="filter-wrap">
            <select v-model="filterMonth" class="form-control select-sm">
              <option value="Semua">Semua</option>
              <option value="Oktober">Oktober</option>
              <option value="November">November</option>
            </select>
          </div>
        </div>

        <div class="list-container card">
          <div v-for="item in reimbursements" :key="item.id" class="list-item" @click="router.push('/staff/reimbursement/' + item.id)">
            <div class="item-left">
              <div class="item-icon" :class="item.color">
                <component :is="item.icon" :size="20" />
              </div>
              <div class="item-info">
                <h4 class="item-title">{{ item.title }}</h4>
                <span class="badge" :class="item.badgeClass">{{ item.status }}</span>
              </div>
            </div>
            <div class="item-right">
              <div class="item-amount font-bold">{{ item.amount }}</div>
              <div class="item-date text-muted text-sm">{{ item.date }}</div>
            </div>
          </div>
          
          <div class="pagination">
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <span class="page-dots">...</span>
            <button class="page-btn">10</button>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="side-column">
        <div class="section-header">
          <h2 class="section-title">Statistik dan Laporan</h2>
        </div>

        <div class="stats-grid">
          <div class="stat-box bg-green">
            <div class="stat-icon"><CheckCircle2 :size="24" /></div>
            <div class="stat-data">
              <div class="stat-label">Disetujui</div>
              <div class="stat-val">Rp 1.500.000</div>
            </div>
          </div>
          
          <div class="stat-box bg-pink">
            <div class="stat-icon"><XCircle :size="24" /></div>
            <div class="stat-data">
              <div class="stat-label">Ditolak</div>
              <div class="stat-val">Rp 22.000</div>
            </div>
          </div>

          <div class="stat-box bg-purple">
            <div class="stat-icon"><Clock :size="24" /></div>
            <div class="stat-data">
              <div class="stat-label">Menunggu</div>
              <div class="stat-val">Rp 200.000</div>
            </div>
          </div>

          <div class="stat-box bg-blue">
            <div class="stat-icon"><Wallet :size="24" /></div>
            <div class="stat-data">
              <div class="stat-label">Total Cair</div>
              <div class="stat-val">Rp 2.000.000</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-top-actions {
  display: flex;
  justify-content: flex-end;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.select-sm {
  padding: 0.375rem 2rem 0.375rem 0.75rem;
  border-radius: 20px;
  background-color: white;
  font-size: 0.875rem;
}

/* List Container */
.list-container {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 8px;
}

.list-item:hover {
  background-color: #f8fafc;
}

.list-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.item-right {
  text-align: right;
}

.item-amount {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 0 0.5rem;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.page-btn.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.page-btn:hover:not(.active) {
  background-color: #f1f5f9;
}

.page-dots {
  color: var(--color-text-muted);
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-box {
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.stat-val {
  font-size: 1.25rem;
  font-weight: 700;
}

.bg-green { background-color: #22c55e; }
.bg-pink { background-color: #ec4899; }
.bg-purple { background-color: #a855f7; }
.bg-blue { background-color: #3b82f6; }

/* Text colors */
.text-green-500 { color: #22c55e; }
.text-red-500 { color: #ef4444; }
.text-yellow-500 { color: #eab308; }
.text-blue-500 { color: #3b82f6; }

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
