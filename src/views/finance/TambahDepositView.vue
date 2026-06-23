<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Wallet, Calendar, Plus, Upload } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'

const router = useRouter()

const form = ref({
  source: 'Bank BCA - 1231423',
  target: 'Reimbursement',
  date: '',
  ref_bank: '',
  amount: '',
  note: '',
  proof: null
})

const isSaving = ref(false)

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.value.proof = file
  }
}

async function submit() {
  if (!form.value.amount || !form.value.date || !form.value.ref_bank) {
    Swal.fire({
      icon: 'warning',
      title: 'Perhatian',
      text: 'Harap isi field yang wajib'
    })
    return
  }
  
  isSaving.value = true
  try {
    const formData = new FormData()
    formData.append('bank_ref_number', form.value.ref_bank)
    const cleanTotal = form.value.amount.replace(/[^0-9]/g, '')
    formData.append('amount', cleanTotal)
    formData.append('transaction_date', form.value.date)
    formData.append('source_fund_id', 1) // nilai default sementara, bisa dibuat dinamis
    formData.append('notes', form.value.note)
    if (form.value.proof) {
      formData.append('transfer_receipt', form.value.proof)
    }

    await ApiService.saveDeposit(formData)
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Deposit berhasil ditambahkan!',
      showConfirmButton: false,
      timer: 1500
    })
    router.push('/finance/deposit')
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: err.response?.data?.message || 'Gagal menyimpan deposit'
    })
    console.error(err)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="tambah-deposit-page">
    

    <div class="form-container">
      <div class="form-card">
        <form @submit.prevent="submit" class="form-content">
          <!-- Section 1 -->
          <div class="form-section">
            <div class="section-title-wrap" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
              <button type="button" class="back-btn-inline" @click="router.back()" title="Kembali">
                <ChevronLeft :size="18" />
              </button>
              <div class="section-icon" style="width: 32px; height: 32px; border-radius: 8px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center;">
                <Wallet :size="16" />
              </div>
              <h3 class="section-title" style="margin: 0; font-size: 1rem; text-transform: capitalize; letter-spacing: normal;">Informasi Transaksi</h3>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Sumber Dana</label>
                <input v-model="form.source" type="text" placeholder="Masukkan sumber dana" required />
              </div>
              <div class="form-group">
                <label>Tujuan Alokasi</label>
                <input v-model="form.target" type="text" placeholder="Reimbursement" required />
              </div>
              <div class="form-group">
                <label>Tanggal</label>
                <div class="input-with-icon">
                  <input v-model="form.date" type="date" placeholder="Pilih Tanggal" required />
                  <Calendar :size="16" class="inner-icon" />
                </div>
              </div>
              <div class="form-group">
                <label>No. Referensi Bank</label>
                <input v-model="form.ref_bank" type="text" placeholder="Masukkan No. Ref Bank" />
              </div>
            </div>
          </div>

          <!-- Section 2 -->
          <div class="form-section mt-6">
            <div class="section-title-wrap" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
              <div class="section-icon" style="width: 32px; height: 32px; border-radius: 8px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center;">
                <Plus :size="16" />
              </div>
              <h3 class="section-title" style="margin: 0; font-size: 1rem; text-transform: capitalize; letter-spacing: normal;">Detail Nominal & Bukti</h3>
            </div>
            <div class="form-grid dual">
              <div class="form-group">
                <label>Total Nominal <span class="req">*</span></label>
                <div class="input-with-prefix">
                  <span class="prefix">Rp</span>
                  <input v-model="form.amount" type="text" placeholder="0" required />
                </div>
              </div>
              <div class="form-group">
                <label>Upload Bukti Transfer <span class="req">*</span></label>
                <div class="upload-area">
                  <Upload :size="24" class="upload-icon" />
                  <p class="upload-hint">{{ form.proof ? form.proof.name : 'Pilih file (JPG/PDF)' }}</p>
                  <input type="file" class="file-input" @change="handleFileUpload" />
                </div>
              </div>
              <div class="form-group" style="grid-column: span 2;">
                <label>Catatan Tambahan</label>
                <textarea v-model="form.note" placeholder="Keterangan..." rows="3"></textarea>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-submit" :disabled="isSaving">
              <Plus :size="16" /> {{ isSaving ? 'Memproses...' : 'Submit Deposit' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tambah-deposit-page { display: flex; flex-direction: column; gap: 1.25rem; height: calc(100vh - 64px - 3rem); overflow: hidden; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }

.form-container { display: flex; justify-content: center; height: 100%; overflow: hidden; padding-bottom: 1.5rem; }
.form-card { background: white; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.03); width: 100%; display: flex; flex-direction: column; overflow: hidden; }
.form-content { padding: 1rem 1.5rem; overflow-y: auto; flex: 1; }

.back-btn-inline {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.back-btn-inline:hover {
  background: #f8fafc;
  color: #3b82f6;
  border-color: #cbd5e1;
}

.section-title { font-size: 1rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-grid.dual { grid-template-columns: 1fr 1fr; }

.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.8125rem; font-weight: 600; color: #475569; }
.req { color: #ef4444; }

input, textarea { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.875rem; color: #1e293b; transition: all 0.2s; background: #fcfdfe; }
input:focus, textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); background: white; }

.input-with-icon { position: relative; }
.input-with-icon input { width: 100%; padding-right: 2.5rem; }
.inner-icon { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }

.input-with-prefix { position: relative; display: flex; align-items: center; }
.prefix { position: absolute; left: 1rem; font-weight: 700; color: #1e293b; font-size: 0.875rem; }
.input-with-prefix input { padding-left: 2.75rem; width: 100%; font-weight: 700; }

.upload-area { border: 2px dashed #e2e8f0; border-radius: 12px; padding: 1rem; text-align: center; background: #fcfdfe; position: relative; cursor: pointer; transition: all 0.2s; }
.upload-area:hover { border-color: #3b82f6; background: #eff6ff; }
.upload-icon { color: #94a3b8; margin-bottom: 0.5rem; }
.upload-hint { font-size: 0.75rem; color: #3b82f6; font-weight: 600; }
.file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

.mt-6 { margin-top: 0.75rem; }
.mt-4 { margin-top: 0.5rem; }

.form-actions { display: flex; justify-content: flex-end; margin-top: 2.5rem; }
.btn-submit { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.75rem; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25); }
@media (max-width: 768px) {
  .form-grid, .form-grid.dual {
    grid-template-columns: 1fr;
  }
}
</style>
