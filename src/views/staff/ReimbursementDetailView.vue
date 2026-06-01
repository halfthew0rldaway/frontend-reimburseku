<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Image as ImageIcon, X, ZoomIn, ZoomOut } from 'lucide-vue-next' // Tambahkan ikon baru
import ApiService from '@/api/ApiService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// State Modal Preview Gambar
const isModalOpen = ref(false)
const zoomLevel = ref(1)

const data = ref({
  rekening: '-',
  nama: '-',
  posisi: '-',
  kategori: '-',
  tanggal: '-',
  total: '-',
  catatan: '-',
  bukti: '-',
  buktiUrl: ''
})

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
}

onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      const res = await ApiService.getReimbursementDetail(id)
      const detail = res.data?.data || res.data
      
      const user = authStore.user || {}
      const accountPayout = authStore.accountPayout || {}
      data.value = {
        rekening: accountPayout?.account_holder_name ? `${accountPayout?.account_number} - ${accountPayout?.account_holder_name || ''}` : '-',
        nama: user.name || '-',
        posisi: user.position || '-',
        kategori:  detail.category_name || 'Kategori',
        tanggal: new Date(detail.expense_date).toLocaleDateString('id-ID'),
        total: formatRupiah(detail.amount),
        catatan: detail.description || '-',
        bukti: detail.attachment_url ? 'Lihat Bukti' : 'Tidak ada lampiran',
        buktiUrl: detail.attachment_url || ''
      }
    } catch (err) {
      console.error(err)
    }
  }
})

// --- FUNGSI MODAL & ZOOM ---
const openModal = () => {
  if (!data.value.buktiUrl) return
  
  // Opsional: Jika PDF, buka di tab baru karena IMG tag tidak mendukung render PDF
  if (data.value.buktiUrl.toLowerCase().endsWith('.pdf')) {
    window.open(data.value.buktiUrl, '_blank')
    return
  }
  
  zoomLevel.value = 1 // Reset zoom setiap kali dibuka
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const zoomIn = () => {
  if (zoomLevel.value < 3) zoomLevel.value += 0.25 // Maksimal zoom 3x
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) zoomLevel.value -= 0.25 // Minimal zoom 0.5x
}
</script>
<template>
  <div class="detail-page">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/staf/dasbor')">
        <ArrowLeft :size="20" />
      </button>
      <div>
        <h1 class="page-title">Detail Reimbursement</h1>
        <p class="text-muted">Informasi lengkap reimburse anda</p>
      </div>
    </div>

    <div class="card detail-card">
      <div class="form-section">
        <div class="section-title-wrap">
          <div class="section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h3 class="section-title">Informasi Karyawan</h3>
        </div>
        
        <div class="grid-3-cols">
          <div class="form-group">
            <label class="form-label">Nomor Rekening</label>
            <div class="readonly-field">{{ data.rekening }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Nama</label>
            <div class="readonly-field">{{ data.nama }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Posisi</label>
            <div class="readonly-field">{{ data.posisi }}</div>
          </div>
        </div>
      </div>

      <div class="form-section mt-6">
        <div class="section-title-wrap">
          <div class="section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h3 class="section-title">Informasi Pengajuan</h3>
        </div>

        <div class="grid-2-cols-uneven">
          <div class="left-fields">
            <div class="form-group">
              <label class="form-label">Kategori</label>
              <select class="form-control" disabled>
                <option>{{ data.kategori }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tanggal di Kirim</label>
              <input type="text" class="form-control" :value="data.tanggal" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">Total Tagihan</label>
              <input type="text" class="form-control font-bold" :value="data.total" disabled />
            </div>
          </div>

          <div class="right-fields">
            <div class="form-group">
              <label class="form-label">Upload Bukti / Struk</label>
              <div 
                class="file-preview-box" 
                :class="{ 'is-clickable': data.buktiUrl }"
                @click="openModal"
              >
                <ImageIcon :size="20" :class="data.buktiUrl ? 'text-primary' : 'text-muted'" />
                <span :class="{ 'text-primary font-medium': data.buktiUrl }">{{ data.bukti }}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Keterangan / Catatan</label>
              <textarea class="form-control" rows="4" disabled :value="data.catatan"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="image-modal-backdrop" @click.self="closeModal">
      <div class="image-modal-content">
        <div class="modal-top-bar">
          <button class="close-modal-btn" @click="closeModal" title="Tutup">
            <X :size="24" />
          </button>
        </div>

        <div class="image-scroll-container">
          <img 
            :src="data.buktiUrl" 
            alt="Bukti Reimbursement" 
            class="zoomable-image"
            :style="{ transform: `scale(${zoomLevel})` }" 
          />
        </div>

        <div class="zoom-controls">
          <button class="zoom-btn" @click="zoomOut" :disabled="zoomLevel <= 0.5" title="Zoom Out">
            <ZoomOut :size="20" />
          </button>
          <span class="zoom-indicator">{{ Math.round(zoomLevel * 100) }}%</span>
          <button class="zoom-btn" @click="zoomIn" :disabled="zoomLevel >= 3" title="Zoom In">
            <ZoomIn :size="20" />
          </button>
        </div>
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

.readonly-field {
  padding: 0.75rem 1rem;
  background-color: #f8fafc;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--color-text-main);
  min-height: 42px;
}

.form-control:disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
}

.file-preview-box {
  padding: 0.75rem 1rem;
  background-color: #f8fafc;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-main);
}

.mt-6 {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .grid-3-cols {
    grid-template-columns: 1fr;
  }
  .grid-2-cols-uneven {
    grid-template-columns: 1fr;
  }
}
.file-preview-box.is-clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  border-color: #93c5fd; /* Biru muda */
  background-color: #eff6ff;
}
.file-preview-box.is-clickable:hover {
  border-color: var(--color-primary);
  background-color: #dbeafe;
}
.text-primary { color: var(--color-primary, #3b82f6); }
.font-medium { font-weight: 500; }


/* --- CSS UNTUK IMAGE MODAL --- */
.image-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85); /* Latar belakang hitam transparan */
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Pastikan di atas segalanya */
}

.image-modal-content {
  position: relative;
  width: 90vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.modal-top-bar {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}

.close-modal-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-modal-btn:hover {
  background: #ef4444; /* Merah saat dihover */
  transform: scale(1.05);
}

.image-scroll-container {
  width: 100%;
  height: 100%;
  overflow: auto; /* Mengizinkan scroll jika gambar di-zoom lebih besar dari layar */
  display: flex;
  justify-content: center;
  align-items: center;
}

.zoomable-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1); /* Efek zoom mulus */
  transform-origin: center center;
}

.zoom-controls {
  position: absolute;
  bottom: 2rem;
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(8px);
  padding: 0.5rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.zoom-btn {
  background: transparent;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.zoom-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.zoom-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.zoom-indicator {
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 45px;
  text-align: center;
}
</style>
