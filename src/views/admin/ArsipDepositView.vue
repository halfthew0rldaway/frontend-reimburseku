<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft, RotateCcw } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const archives = ref([])
const loading = ref(true)
const recoverConfirmId = ref(null)
const isRecovering = ref(false)

function getHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

function formatRupiah(val) {
  if (!val && val !== 0) return '—'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function loadArchives() {
  loading.value = true
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/deposit/draft/get', { headers: getHeaders() })
    archives.value = res.data.data?.data ?? res.data.data ?? []
  } catch { archives.value = [] }
  finally { loading.value = false }
}

async function recoverDeposit() {
  isRecovering.value = true
  try {
    await axios.post(`http://127.0.0.1:8000/api/deposit/recovery/${recoverConfirmId.value}`, {}, { headers: getHeaders() })
    recoverConfirmId.value = null
    loadArchives()
  } catch (err) {
    alert(err.response?.data?.message ?? 'Gagal memulihkan.')
  } finally { isRecovering.value = false }
}

onMounted(loadArchives)
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div class="head-left">
        <button class="back-btn" @click="router.push('/admin/deposit')">
          <ArrowLeft :size="18" />
        </button>
        <div>
          <h1 class="page-title">Arsip Deposit</h1>
          <p class="page-sub">Deposit yang telah diarsipkan (lebih dari 30 hari)</p>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div v-if="loading" class="loading-text">Memuat data...</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Jumlah</th>
            <th>Sumber</th>
            <th>Deskripsi</th>
            <th>Tanggal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="archives.length === 0">
            <td colspan="6" class="empty-cell">Tidak ada arsip deposit.</td>
          </tr>
          <tr v-for="(d, i) in archives" :key="d.id">
            <td class="text-muted">{{ i + 1 }}</td>
            <td class="font-semibold amount-cell">{{ formatRupiah(d.amount) }}</td>
            <td>{{ d.source ?? '—' }}</td>
            <td class="text-muted">{{ d.description ?? '—' }}</td>
            <td class="text-muted">{{ formatDate(d.date ?? d.created_at) }}</td>
            <td>
              <button class="recover-btn" @click="recoverConfirmId = d.id" title="Pulihkan">
                <RotateCcw :size="13" /> Pulihkan
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Recover Confirm -->
    <div v-if="recoverConfirmId" class="modal-overlay" @click.self="recoverConfirmId = null">
      <div class="modal">
        <div class="modal-head">
          <h3>Pulihkan Deposit?</h3>
        </div>
        <p class="confirm-text">Data deposit akan dipindahkan kembali ke daftar deposit aktif.</p>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="recoverConfirmId = null">Batal</button>
          <button class="btn btn-primary" @click="recoverDeposit" :disabled="isRecovering">
            {{ isRecovering ? 'Memulihkan...' : 'Pulihkan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.5rem; }
.page-head { display: flex; justify-content: space-between; align-items: flex-start; }
.head-left { display: flex; align-items: center; gap: 0.875rem; }

.back-btn {
  width: 36px; height: 36px; border-radius: 8px;
  border: 1px solid var(--color-border); background: white;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-muted); cursor: pointer; transition: all 0.15s;
}
.back-btn:hover { background: #f1f5f9; color: var(--color-text-main); }

.page-title { font-size: 1.375rem; font-weight: 700; color: var(--color-text-main); }
.page-sub { font-size: 0.8125rem; color: var(--color-text-muted); margin-top: 0.25rem; }

.amount-cell { color: #16a34a; }

.table-card {
  background: white; border: 1px solid var(--color-border);
  border-radius: 12px; box-shadow: var(--shadow-sm); overflow: hidden;
}
.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.data-table th {
  text-align: left; padding: 0.75rem 1rem;
  font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.05em;
  background: #f9fafb; border-bottom: 1px solid var(--color-border);
}
.data-table td {
  padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9;
  color: var(--color-text-main); vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #fafafa; }

.recover-btn {
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.375rem 0.75rem; border-radius: 6px;
  background: #eff6ff; color: #2563eb; font-size: 0.8125rem; font-weight: 500;
  border: 1px solid #bfdbfe; cursor: pointer; transition: all 0.15s;
}
.recover-btn:hover { background: #dbeafe; }

.loading-text, .empty-cell {
  padding: 2.5rem; text-align: center;
  color: var(--color-text-muted); font-size: 0.875rem;
}

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: white; border-radius: 14px; width: 100%; max-width: 400px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
.modal-head {
  padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-border);
}
.modal-head h3 { font-size: 1rem; font-weight: 600; }
.confirm-text { padding: 1rem 1.5rem; color: var(--color-text-muted); font-size: 0.875rem; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}
</style>
