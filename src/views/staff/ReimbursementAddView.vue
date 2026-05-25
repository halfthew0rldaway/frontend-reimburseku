<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, UploadCloud } from 'lucide-vue-next'
import apiClient from '@/api/apiClient' // Sesuaikan dengan path Axios client Anda
import { useAuthStore } from '@/stores/auth'
import apiService from '@/api/ApiService'

const router = useRouter()
const authStore = useAuthStore()

const listKategori = ref([])
const fileInput = ref(null)
const selectedFile = ref(null)
const isLoading = ref(false)

const data = ref({
  rekening: 'BCA 31234123 (Silviana Rodrigo)',
  nama: 'Silviana Rodrigo',
  posisi: 'Software Engineer',
  kategori: '',
  tanggal: '',
  total: '',
  catatan: ''
})

onMounted(async () => {
  try {
    const res = await apiService.getCategories()
    listKategori.value = res.data.data || res.data
  } catch (error) {
    console.error('Gagal mengambil kategori:', error)
  }
})

const triggerUpload = () => {
  fileInput.value.click()
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validasi ukuran file (contoh: maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB')
      return
    }
    selectedFile.value = file
  }
}

// Fungsi Submit ke API Laravel
const submit = async () => {
  // Validasi sederhana
  if (!data.value.kategori || !data.value.tanggal || !data.value.total || !selectedFile.value) {
    alert('Harap lengkapi Kategori, Tanggal, Total, dan Bukti Struk!')
    return
  }

  isLoading.value = true

  // Wajib menggunakan FormData untuk mengirim File + Teks
  const formData = new FormData()
  formData.append('category_id', data.value.kategori)
  formData.append('expense_date', data.value.tanggal)

  // Membersihkan format "Rp." jika ada, hanya menyisakan angka
  const cleanTotal = data.value.total.replace(/[^0-9]/g, '')
  formData.append('amount', cleanTotal)

  formData.append('description', data.value.catatan)
  formData.append('attachment', selectedFile.value)

  try {
    await apiClient.post('/reimbursements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    alert('Reimbursement berhasil diajukan!')
    router.push('/staf/dasbor')
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal mengirim pengajuan')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const displayTotal = computed({
  get: () => {
    // Jika data total kosong, tampilkan string kosong
    if (!data.value.total) return '';

    // Ubah integer menjadi string dengan pemisah ribuan (titik)
    const rupiah = data.value.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${rupiah}`;
  },
  set: (newValue) => {
    // Saat user mengetik, hapus semua karakter SELAIN angka (termasuk Rp, titik, dan spasi)
    const rawNumber = newValue.replace(/[^0-9]/g, '');

    // Simpan kembali sebagai integer ke dalam data.total
    data.value.total = rawNumber ? parseInt(rawNumber, 10) : '';
  }
})
const preventLetters = (event) => {
  // Dapatkan kode tombol yang ditekan
  const charCode = event.which ? event.which : event.keyCode;

  // Jika tombol yang ditekan BUKAN angka (kode ASCII 48-57 adalah 0-9)
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault(); // Batalkan inputan tersebut
  }
}
</script>

<template>
  <div class="add-page">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/staf/dasbor')">
        <ArrowLeft :size="20" />
      </button>
      <div>
        <h1 class="page-title">Tambah Reimbursement</h1>
        <p class="text-muted">Buat pengajuan reimburse baru anda</p>
      </div>
    </div>

    <div class="card detail-card">
      <div class="form-section">
        <div class="section-title-wrap">
          <div class="section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h3 class="section-title">Informasi Karyawan</h3>
        </div>

        <div class="grid-3-cols">
          <div class="form-group">
            <label class="form-label">Nomor Rekening</label>
            <input type="text" class="form-control" disabled :value="data.rekening" />
          </div>
          <div class="form-group">
            <label class="form-label">Nama</label>
            <input type="text" class="form-control" disabled :value="authStore.user?.name || 'User'" />
          </div>
          <div class="form-group">
            <label class="form-label">Posisi</label>
            <input type="text" class="form-control" disabled :value="authStore.user?.position || 'N/A'" />
          </div>
        </div>
      </div>

      <div class="form-section mt-6">
        <div class="section-title-wrap">
          <div class="section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3 class="section-title">Informasi Pengajuan</h3>
        </div>

        <div class="grid-2-cols-uneven">
          <!-- Left fields -->
          <div class="left-fields">
            <div class="form-group">
              <label class="form-label">Kategori *</label>
              <select class="form-control" v-model="data.kategori">
                <option value="" disabled>Pilih Kategori</option>
                <option v-for="kat in listKategori" :key="kat.id_category" :value="kat.id_category">
                  {{ kat.name || kat.category_name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tanggal Tagihan *</label>
              <input type="date" class="form-control" v-model="data.tanggal" />
            </div>
            <div class="form-group">
              <label class="form-label">Total Tagihan *</label>
              <input type="text" class="form-control" placeholder="Rp 0" v-model="displayTotal"
                @keypress="preventLetters" />
            </div>
          </div>

          <!-- Right fields -->
          <div class="right-fields">
            <div class="form-group">
              <label class="form-label">Upload Bukti / Struk *</label>

              <input type="file" ref="fileInput" @change="handleFileUpload" accept=".pdf,.jpg,.jpeg,.png"
                style="display: none;" />

              <div class="upload-box" @click="triggerUpload">
                <UploadCloud :size="32" class="text-primary mb-2" />

                <p class="font-medium text-primary" v-if="selectedFile">
                  {{ selectedFile.name }}
                </p>
                <p class="font-medium" v-else>Pilih file untuk di upload</p>

                <p class="text-xs text-muted mt-1">PDF, JPG, PNG (Maks. 5MB)</p>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Keterangan / Catatan</label>
              <textarea class="form-control" rows="4" placeholder="Tuliskan keterangan..."
                v-model="data.catatan"></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions mt-6" style="display: flex; justify-content: flex-end;">
        <button class="btn btn-primary" @click="submit" :disabled="isLoading">
          {{ isLoading ? 'Mengirim...' : 'Buat Pengajuan' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.back-btn:hover {
  background: #f1f5f9;
  color: var(--color-primary);
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.detail-card {
  padding: 2rem;
  max-width: 1000px;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  color: var(--color-primary);
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.grid-3-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.grid-2-cols-uneven {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.left-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.right-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-control:disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
}

.upload-box {
  padding: 2rem 1rem;
  background-color: #f8fafc;
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-box:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.mt-6 {
  margin-top: 2rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.text-xs {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .grid-3-cols {
    grid-template-columns: 1fr;
  }

  .grid-2-cols-uneven {
    grid-template-columns: 1fr;
  }
}
</style>
