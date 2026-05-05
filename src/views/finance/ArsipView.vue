<script setup>
import { ref } from 'vue'
import { Filter, Search, RotateCcw, FileText } from 'lucide-vue-next'

const archives = ref([
  { id: 'RMB-010', name: 'Budi Santoso', date: '10 Apr 2026', category: 'Makan', title: 'Makan siang tim', amount: 'Rp 150.000', status: 'dibayar' },
  { id: 'RMB-011', name: 'Andi Wijaya', date: '08 Apr 2026', category: 'Transportasi', title: 'Bensin dinas luar', amount: 'Rp 200.000', status: 'ditolak' },
  { id: 'RMB-012', name: 'Silviana Rodrigo', date: '05 Apr 2026', category: 'Penginapan', title: 'Hotel visit cabang', amount: 'Rp 800.000', status: 'dibayar' },
])

const getStatusBadgeClass = (status) => {
  switch(status) {
    case 'dibayar': return 'badge-success'
    case 'ditolak': return 'badge-danger'
    default: return ''
  }
}
</script>

<template>
  <div class="archive-list">
    <div class="page-header">
      <div>
        <h1 class="page-title">Arsip Reimbursement</h1>
        <p class="text-muted mt-1">Riwayat reimbursement yang telah selesai (dibayar/ditolak)</p>
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
              <th>Status Akhir</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="archives.length === 0">
              <td colspan="7" class="empty-cell">Tidak ada arsip reimbursement.</td>
            </tr>
            <tr v-for="item in archives" :key="item.id">
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
                  <button class="btn btn-icon btn-outline" title="Detail">
                    <FileText :size="16" />
                  </button>
                  <button class="btn btn-icon btn-outline recover-btn" title="Pulihkan">
                    <RotateCcw :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <span class="text-sm text-muted">Menampilkan 1-3 dari 3 data</span>
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
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
}

.btn-icon:hover {
  background: #f1f5f9;
  color: var(--color-text-main);
}

.recover-btn:hover {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.badge {
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}
.badge-success { background-color: #dcfce3; color: #166534; }
.badge-danger { background-color: #fee2e2; color: #b91c1c; }

.empty-cell {
  padding: 2.5rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

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
