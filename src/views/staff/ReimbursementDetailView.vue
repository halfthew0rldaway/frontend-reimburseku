<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Image as ImageIcon } from 'lucide-vue-next'

const router = useRouter()

const data = ref({
  rekening: 'BCA 31234123 Atas nama Silviana',
  nama: 'Silviana Rodrigo',
  posisi: 'STAFF Software Engineer',
  kategori: 'Makan/Minum',
  tanggal: '23/10/2023',
  total: 'Rp.300.000',
  catatan: 'Grab Food selama cuti\nMakan siang lembur divisi',
  bukti: 'IMG_20231023_093123.jpg'
})
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
      <!-- Section 1 -->
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

      <!-- Section 2 -->
      <div class="form-section mt-6">
        <div class="section-title-wrap">
          <div class="section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h3 class="section-title">Informasi Pengajuan</h3>
        </div>

        <div class="grid-2-cols-uneven">
          <!-- Left fields -->
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

          <!-- Right fields -->
          <div class="right-fields">
            <div class="form-group">
              <label class="form-label">Upload Bukti / Struk</label>
              <div class="file-preview-box">
                <ImageIcon :size="20" class="text-muted" />
                <span>{{ data.bukti }}</span>
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
</style>
