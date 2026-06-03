<script setup>
import { ref, onMounted } from 'vue'
import { formatRupiah, mapStatusToFrontend } from '@/utils/format'
import { Filter, Search, Plus, FileText } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'

const reimbursements = ref([])

onMounted(async () => {
  try {
    const res = await ApiService.getMyReimbursements()
    const responseData = res.data?.data?.data || res.data?.data || []
    reimbursements.value = responseData.map(item => ({
      id: `RMB-${item.id_request}`,
      rawId: item.id_request,
      date: new Date(item.expense_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      category: item.category_name,
      title: item.description || 'Pengajuan Reimbursement',
      amount: formatRupiah(item.amount),
      status: mapStatusToFrontend(item.last_status)
    }))
  } catch (error) {
    console.error('Failed to load reimbursements', error)
  }
})

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
        <h1 class="page-title">Daftar Reimbursement</h1>
        <p class="text-muted mt-1">Kelola semua pengajuan reimbursement Anda</p>
      </div>
      <router-link to="/staf/reimbursement/tambah" class="btn btn-primary">
        <Plus :size="18" />
        Pengajuan Baru
      </router-link>
    </div>

    <div class="card">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input type="text" class="form-control" placeholder="Cari ID atau judul..." />
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
              <th>Judul Pengajuan</th>
              <th>Kategori</th>
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
                <div class="item-title">{{ item.title }}</div>
              </td>
              <td>{{ item.category }}</td>
              <td class="font-medium">{{ item.amount }}</td>
              <td>
                <span class="badge" :class="getStatusBadgeClass(item.status)">
                  {{ item.status.charAt(0).toUpperCase() + item.status.slice(1) }}
                </span>
              </td>
              <td>
                <router-link :to="'/staf/reimbursement/' + item.rawId" class="btn btn-sm btn-outline">
                  <FileText :size="14" />
                  Detail
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <span class="text-sm text-muted">Menampilkan 1-5 dari 5 data</span>
        <div class="page-controls">
          <button class="btn btn-outline btn-sm" disabled>Sebelummya</button>
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

.item-title {
  font-weight: 500;
  color: var(--color-text-main);
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
