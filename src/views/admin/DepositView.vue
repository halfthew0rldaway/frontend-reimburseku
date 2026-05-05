<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Trash2, X, Archive } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const deposits = ref([])
const loading = ref(true)
const showModal = ref(false)
const isSaving = ref(false)
const deleteConfirmId = ref(null)

const form = ref({
  amount: '',
  source: '',
  description: '',
  date: '',
})

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

async function loadDeposits() {
  loading.value = true
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/deposit', { headers: getHeaders() })
    deposits.value = res.data.data?.data ?? res.data.data ?? []
  } catch { deposits.value = [] }
  finally { loading.value = false }
}

async function save() {
  isSaving.value = true
  try {
    const fd = new FormData()
    Object.entries(form.value).forEach(([k, v]) => { if (v) fd.append(k, v) })
    await axios.post('http://127.0.0.1:8000/api/deposit/save', fd, { headers: getHeaders() })
    showModal.value = false
    form.value = { amount: '', source: '', description: '', date: '' }
    loadDeposits()
  } catch (err) {
    alert(err.response?.data?.message ?? 'Gagal menyimpan.')
  } finally { isSaving.value = false }
}

async function deleteDeposit() {
  try {
    await axios.delete(`http://127.0.0.1:8000/api/deposit/delete/${deleteConfirmId.value}`, { headers: getHeaders() })
    deleteConfirmId.value = null
    loadDeposits()
  } catch (err) {
    alert(err.response?.data?.message ?? 'Gagal menghapus.')
  }
}

onMounted(loadDeposits)
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Deposit Perusahaan</h1>
        <p class="page-sub">Kelola saldo kas dan riwayat deposit perusahaan</p>
      </div>
      <div class="head-actions">
        <button class="btn btn-outline" @click="router.push('/admin/arsip-deposit')">
          <Archive :size="15" /> Arsip Deposit
        </button>
        <button class="btn btn-primary" @click="showModal = true">
          <Plus :size="16" /> Tambah Deposit
        </button>
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
          <tr v-if="deposits.length === 0">
            <td colspan="6" class="empty-cell">Belum ada deposit.</td>
          </tr>
          <tr v-for="(d, i) in deposits" :key="d.id">
            <td class="text-muted">{{ i + 1 }}</td>
            <td class="font-semibold amount-cell">{{ formatRupiah(d.amount) }}</td>
            <td>{{ d.source ?? '—' }}</td>
            <td class="text-muted">{{ d.description ?? '—' }}</td>
            <td class="text-muted">{{ formatDate(d.date ?? d.created_at) }}</td>
            <td>
              <button class="icon-btn delete-btn" @click="deleteConfirmId = d.id" title="Hapus">
                <Trash2 :size="14" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Tambah Deposit -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-head">
          <h3>Tambah Deposit</h3>
          <button class="close-btn" @click="showModal = false"><X :size="18" /></button>
        </div>
        <form @submit.prevent="save" style="padding: 1.5rem;">
          <div class="form-group">
            <label class="form-label">Jumlah (Rp) <span class="req">*</span></label>
            <input v-model="form.amount" type="number" class="form-control" required min="1" />
          </div>
          <div class="form-group">
            <label class="form-label">Sumber Dana</label>
            <input v-model="form.source" type="text" class="form-control" placeholder="contoh: Bank BCA" />
          </div>
          <div class="form-group">
            <label class="form-label">Tanggal</label>
            <input v-model="form.date" type="date" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">Deskripsi</label>
            <textarea v-model="form.description" class="form-control" rows="2"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showModal = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="deleteConfirmId" class="modal-overlay" @click.self="deleteConfirmId = null">
      <div class="modal modal-sm">
        <div class="modal-head">
          <h3>Hapus Deposit?</h3>
          <button class="close-btn" @click="deleteConfirmId = null"><X :size="18" /></button>
        </div>
        <p class="confirm-text">Data deposit akan dihapus secara permanen.</p>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="deleteConfirmId = null">Batal</button>
          <button class="btn btn-danger" @click="deleteDeposit">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.5rem; }
.page-head { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 1.375rem; font-weight: 700; color: var(--color-text-main); }
.page-sub { font-size: 0.8125rem; color: var(--color-text-muted); margin-top: 0.25rem; }
.head-actions { display: flex; gap: 0.75rem; }

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

.icon-btn {
  width: 30px; height: 30px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--color-border); background: white;
  cursor: pointer; transition: all 0.15s;
}
.delete-btn:hover { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

.loading-text, .empty-cell {
  padding: 2.5rem; text-align: center;
  color: var(--color-text-muted); font-size: 0.875rem;
}

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: white; border-radius: 14px; width: 100%; max-width: 480px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
.modal-sm { max-width: 360px; }
.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-border);
}
.modal-head h3 { font-size: 1rem; font-weight: 600; }
.close-btn { color: var(--color-text-muted); padding: 0.25rem; border-radius: 4px; }
.close-btn:hover { background: #f1f5f9; }
.confirm-text { padding: 1rem 1.5rem; color: var(--color-text-muted); font-size: 0.875rem; }
.req { color: var(--color-danger); }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}
.btn-danger {
  background-color: var(--color-danger); color: white;
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1.25rem; border-radius: var(--radius-md);
  font-size: 0.875rem; font-weight: 500;
}
.btn-danger:hover { background-color: #dc2626; }
</style>
