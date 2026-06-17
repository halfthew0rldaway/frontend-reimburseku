<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'

const router = useRouter()
const karyawan = ref([])
const isLoading = ref(true)

// State Pagination
const currentPage = ref(1)
const lastPage = ref(1)
const totalItems = ref(0)
const fromItem = ref(0)

const fetchKaryawan = async (page = 1) => {
  isLoading.value = true
  try {
    const res = await ApiService.getEmployees(page)

    // Pastikan path ke meta sesuai dengan response axios Anda. 
    // Jika axios, biasanya res.data.meta. Jika sudah di-intercept, mungkin res.meta
    const metaData = res.data?.meta || {}
    currentPage.value = metaData.current_page || 1
    lastPage.value = metaData.last_page || 1
    totalItems.value = metaData.total || 0
    fromItem.value = metaData.from || 0

    const listData = res.data?.data || []

    karyawan.value = listData
      // Mengubah cara filter agar mengecek id_role di dalam object role
      .filter(emp => emp.role?.id_role === 1) 
      .map(emp => {
        const payout = emp.account_payout || {}
        const providerData = payout.provider || {}
        const roleData = emp.role || {}
        
        return {
          id: emp.id, // Disesuaikan dengan "id" di JSON
          nama: emp.name || '-',
          email: emp.email || '-',
          jabatan: roleData.role_name || '-', // Mengambil role_name dari object role
          totalPengajuan: emp.total_pengajuan || 0,
          totalAmount: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(emp.total_nominal || 0),
          atasNama: payout.account_holder_name || 'Belum diatur',
          nomorRekening: payout.account_number || '-',
          provider: providerData.provider_name || '-'
        }
      })
  } catch (error) {
    console.error('Failed to load employees', error)
  } finally {
    isLoading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= lastPage.value && page !== currentPage.value) {
    fetchKaryawan(page)
  }
}

onMounted(() => {
  fetchKaryawan(1)
})

const searchQuery = ref('')
const filtered = computed(() => {
  return karyawan.value.filter(k =>
    k.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    k.atasNama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    k.nomorRekening.includes(searchQuery.value)
  )
})

// Pindah ke halaman detail dengan membawa ID
const goToDetail = (id) => {
  // Guard untuk mencegah navigasi jika id null
  if (id) {
    router.push(`/karyawan/${id}`)
  } else {
    console.warn('ID Karyawan tidak ditemukan')
  }
}
</script>

<template>
  <div class="finance-karyawan">
    <div class="page-header">
      <h1 class="page-title">Karyawan</h1>
    </div>

    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Data Karyawan</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari Nama / Rekening..." class="search-input" />
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>NAMA KARYAWAN</th>
              <th>JABATAN</th>
              <th>INFO PEMBAYARAN</th>
              <th class="text-center">TOTAL PENGAJUAN</th>
              <th>TOTAL NILAI</th>
              <th width="100" class="text-center">AKSI</th>
            </tr>
          </thead>

     <tbody v-if="isLoading">
            <tr>
              <td colspan="6" class="text-center loading-state">
                <div class="loader-spinner"></div>
                <p class="loading-text">Memuat data karyawan...</p>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="filtered.length === 0">
            <tr>
              <td colspan="6" class="text-center py-8">
                <p class="text-muted">Tidak ada data karyawan yang ditemukan.</p>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="k in filtered" :key="k.id">
              <td>
                <div class="user-info">
                  <div class="avatar-sm">{{ k.nama[0] }}</div>
                  <div class="user-meta">
                    <p class="user-name">{{ k.nama }}</p>
                    <p class="user-email">{{ k.email }}</p>
                  </div>
                </div>
              </td>
              <td class="text-muted">{{ k.jabatan }}</td>
              <td>
                <div class="payout-info">
                  <p class="payout-name">{{ k.atasNama }}</p>
                  <p class="payout-detail">{{ k.provider }} &bull; {{ k.nomorRekening }}</p>
                </div>
              </td>
              <td class="text-center font-semibold">{{ k.totalPengajuan }}</td>
              <td class="font-bold text-success">{{ k.totalAmount }}</td>
              <td class="text-center">
                <button class="btn-icon detail" title="Lihat Detail" @click="goToDetail(k.id)">
                  <Eye :size="12" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">
          menampilkan {{ fromItem }} dari {{ totalItems }} data
        </p>
        <div class="pagination" v-if="lastPage > 1">
          <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            <ChevronLeft :size="12" />
          </button>
          <button v-for="page in lastPage" :key="page" class="page-btn" :class="{ active: currentPage === page }" @click="changePage(page)">
            {{ page }}
          </button>
          <button class="page-btn" :disabled="currentPage === lastPage" @click="changePage(currentPage + 1)">
            <ChevronRight :size="12" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-karyawan { display: flex; flex-direction: column; gap: 1rem; background: #f8fafc; height: 100%; overflow: hidden; }
.page-header { margin-bottom: 0.25rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
.card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); overflow: hidden; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }
.header-actions { display: flex; gap: 0.625rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 220px; }
.table-responsive { overflow-x: auto; max-height: calc(100vh - 220px); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.user-info { display: flex; align-items: center; gap: 0.625rem; }
.avatar-sm { width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; border: 1px solid #e2e8f0; }
.user-meta { display: flex; flex-direction: column; }
.user-name { font-weight: 700; color: #1e293b; font-size: 0.75rem; }
.user-email { font-size: 0.65rem; color: #94a3b8; }
.payout-info { display: flex; flex-direction: column; gap: 0.125rem; }
.payout-name { font-weight: 600; color: #1e293b; font-size: 0.7rem; }
.payout-detail { font-size: 0.65rem; color: #64748b; }
.text-center { text-align: center; }
.text-success { color: #16a34a !important; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.text-muted { color: #94a3b8; margin: 0; }
.py-8 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
.btn-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
.btn-icon.detail { background: #f1f5f9; color: #64748b; }
.btn-icon.detail:hover { background: #e2e8f0; color: #1e293b; }
.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.text-xs { font-size: 0.65rem; }
.loading-state, .empty-state {
  padding: 3rem 1rem !important;
}
.loader-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f5f9;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
.loading-text {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>