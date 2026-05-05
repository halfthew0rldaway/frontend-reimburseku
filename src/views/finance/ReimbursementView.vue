<script setup>
import { ref } from 'vue'
import { Filter, Search, FileText, CheckCircle, XCircle, CreditCard } from 'lucide-vue-next'

const reimbursements = ref([
  { id: 'RMB-001', name: 'Silviana Rodrigo', date: '27 Apr 2026', category: 'Transportasi', title: 'Taksi meeting client', amount: 'Rp 150.000', status: 'menunggu' },
  { id: 'RMB-002', name: 'Budi Santoso', date: '25 Apr 2026', category: 'Makan', title: 'Makan siang tim', amount: 'Rp 85.000', status: 'disetujui' },
  { id: 'RMB-003', name: 'Andi Wijaya', date: '22 Apr 2026', category: 'Penginapan', title: 'Hotel dinas luar kota', amount: 'Rp 1.200.000', status: 'dibayar' },
  { id: 'RMB-004', name: 'Rina Melati', date: '20 Apr 2026', category: 'Lain-lain', title: 'Beli ATK dadakan', amount: 'Rp 50.000', status: 'ditolak' },
  { id: 'RMB-005', name: 'Silviana Rodrigo', date: '18 Apr 2026', category: 'Transportasi', title: 'Bensin dinas', amount: 'Rp 200.000', status: 'menunggu' },
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
  <div class="reimbursement-list">
    <div class="page-header">
      <div>
        <h1 class="page-title">Kelola Reimbursement</h1>
        <p class="text-muted mt-1">Verifikasi dan proses pengajuan reimbursement karyawan</p>
      </div>
    </div>

    <div class="card">
      <div class="toolbar">
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input type="text" class="form-control" placeholder="Cari ID, Karyawan, atau Judul..." />
        </div>
        <div class="filter-actions">
          <button class="btn btn-outline">
            <Filter :size="18" />
            Filter
          </button>
          <select class="form-control" style="width: auto;">
            <option>Semua Status</option>
            <option>Menunggu</option>
            <option>Disetujui</option>
            <option>Dibayar</option>
            <option>Ditolak</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tanggal</th>
              <th>Karyawan</th>
              <th>Judul Pengajuan</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reimbursements" :key="item.id">
              <td class="font-medium text-primary">{{ item.id }}</td>
              <td>{{ item.date }}</td>
              <td>
                <div class="name-cell">
                  <div class="avatar-sm">{{ item.name?.[0] }}</div>
                  {{ item.name }}
                </div>
              </td>
              <td>
                <div class="item-title">{{ item.title }}</div>
                <div class="text-muted text-xs">{{ item.category }}</div>
              </td>
              <td class="font-medium">{{ item.amount }}</td>
              <td>
                <span class="badge" :class="getStatusBadgeClass(item.status)">
                  {{ item.status.charAt(0).toUpperCase() + item.status.slice(1) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button v-if="item.status === 'menunggu'" class="btn btn-icon btn-success-light" title="Setujui">
                    <CheckCircle :size="16" />
                  </button>
                  <button v-if="item.status === 'menunggu'" class="btn btn-icon btn-danger-light" title="Tolak">
                    <XCircle :size="16" />
                  </button>
                  <button v-if="item.status === 'disetujui'" class="btn btn-icon btn-primary-light" title="Bayar">
                    <CreditCard :size="16" />
                  </button>
                  <button class="btn btn-icon btn-outline" title="Detail">
                    <FileText :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <span class="text-sm text-muted">Menampilkan 1-5 dari 5 data</span>
        <div class="page-controls">
          <button class="btn btn-outline btn-sm" disabled>Sebelumnya</button>
          <button class="btn btn-primary btn-sm">1</button>
          <button class="btn btn-outline btn-sm" disabled>Selanjutnya</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  width: 300px;
  max-width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.search-box .form-control {
  padding-left: 2.75rem;
}

.filter-actions {
  display: flex;
  gap: 1rem;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-weight: 500;
}

.avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.item-title {
  font-weight: 500;
  color: var(--color-text-main);
  margin-bottom: 0.125rem;
}

.text-xs {
  font-size: 0.75rem;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.table th,
.table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.table th {
  background-color: #F9FAFB;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.table tbody tr {
  transition: background-color 0.15s ease;
}

.table tbody tr:hover {
  background-color: #F9FAFB;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.btn-success-light {
  background-color: #dcfce3;
  color: #166534;
  border: 1px solid transparent;
}
.btn-success-light:hover { background-color: #bbf7d0; }

.btn-danger-light {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid transparent;
}
.btn-danger-light:hover { background-color: #fecaca; }

.btn-primary-light {
  background-color: #e0f2fe;
  color: #0284c7;
  border: 1px solid transparent;
}
.btn-primary-light:hover { background-color: #bae6fd; }

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

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.pagination {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-controls {
  display: flex;
  gap: 0.5rem;
}
</style>
