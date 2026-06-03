<script setup>
import { ref, onMounted } from 'vue'
import ApiService from '@/api/ApiService'
import { useAuthStore } from '@/stores/auth'
import { User, CreditCard, Save } from 'lucide-vue-next'

const authStore = useAuthStore()

const user = ref({
  nama: '',
  email: '',
  posisi: '',
  bank: '',
  rekening: ''
})

const isSaving = ref(false)

onMounted(() => {
  const data = authStore.user || {}
  user.value = {
    nama: data.name || '',
    email: data.email || '',
    posisi: data.position || '',
    bank: data.bank || '',
    rekening: data.account_number || ''
  }
})

const saveProfile = async () => {
  isSaving.value = true
  try {
    const payload = {
      name: user.value.nama,
      email: user.value.email,
      position: user.value.posisi,
      bank: user.value.bank,
      account_number: user.value.rekening
    }
    await ApiService.updateProfile(payload)
    
    // Update local auth store
    authStore.setUser({
      ...authStore.user,
      ...payload
    })
    
    alert('Profil berhasil diperbarui')
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal memperbarui profil')
    console.error(error)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="profile-page">
    <div class="page-top">
      <h1 class="page-title">Akun Profil</h1>
      <p class="text-muted">Manage profile accounts</p>
    </div>

    <div class="profile-layout">
      <!-- Left Form -->
      <div class="form-card card">
        <div class="section-title-wrap">
          <div class="section-icon">
            <User :size="16" />
          </div>
          <h3 class="section-title">Informasi Akun</h3>
        </div>

        <div class="form-grid mb-6">
          <div class="form-group">
            <label class="form-label">Nama</label>
            <input v-model="user.nama" type="text" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="user.email" type="email" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">Posisi Jabatan</label>
            <input v-model="user.posisi" type="text" class="form-control" />
          </div>
        </div>

        <div class="section-title-wrap">
          <div class="section-icon">
            <CreditCard :size="16" />
          </div>
          <h3 class="section-title">Informasi Rekening Bank</h3>
        </div>

        <div class="form-grid mb-6">
          <div class="form-group">
            <label class="form-label">Bank</label>
            <select v-model="user.bank" class="form-control">
              <option>BCA</option>
              <option>Mandiri</option>
              <option>BNI</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Nomor Rekening</label>
            <input v-model="user.rekening" type="text" class="form-control" />
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" @click="saveProfile" :disabled="isSaving">
            <Save :size="16" />
            {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>

      <!-- Right Preview -->
      <div class="preview-card card">
        <h3 class="preview-title">Preview Profile</h3>
        <div class="preview-content">
          <div class="preview-avatar">
            <img src="https://i.pravatar.cc/150?img=32" alt="Avatar" />
          </div>
          <h4 class="preview-name">{{ user.nama }}</h4>
          <span class="badge badge-success">Aktif</span>

          <div class="preview-details mt-6">
            <div class="preview-item">
              <span class="preview-label">Email</span>
              <span class="preview-val">{{ user.email }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Posisi</span>
              <span class="preview-val">{{ user.posisi }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Nomor Rekening</span>
              <span class="preview-val">{{ user.bank }} - {{ user.rekening }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-top {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.profile-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.form-card {
  padding: 2rem;
}

.preview-card {
  padding: 2rem;
  height: fit-content;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  color: var(--color-primary);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* Preview Card */
.preview-title {
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
}

.preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
}

.preview-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.preview-details {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.preview-val {
  font-size: 0.875rem;
  font-weight: 500;
}

@media (max-width: 900px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}
</style>
