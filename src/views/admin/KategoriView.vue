<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, PencilLine, Trash2, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'

const categories = ref([])

const fetchCategories = async () => {
  try {
    const res = await ApiService.getCategories()
    const listData = res.data?.data?.data || res.data?.data || []
    
    categories.value = listData.map(c => ({
      id: c.id_category,
      name: c.category_name || '-',
      description: c.description || '-'
    }))
  } catch (err) {
    console.error('Failed to load categories', err)
  }
}

onMounted(fetchCategories)

const searchQuery = ref('')


const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formData = ref({ category_name: '', description: '' })

function openAdd() {
  isEdit.value = false
  editId.value = null
  formData.value = { category_name: '', description: '' }
  showModal.value = true
}

function openEdit(cat) {
  isEdit.value = true
  editId.value = cat.id
  formData.value = { category_name: cat.name, description: cat.description }
  showModal.value = true
}

function closeAdd() {
  showModal.value = false
}

async function submitAdd() {
  try {
    if (isEdit.value) {
      await ApiService.updateCategory(editId.value, formData.value)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kategori berhasil diupdate.', showConfirmButton: false, timer: 1500 })
    } else {
      await ApiService.saveCategory(formData.value)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kategori berhasil ditambahkan.', showConfirmButton: false, timer: 1500 })
    }
    fetchCategories()
    closeAdd()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan kategori' })
    console.error(err)
  }
}

const deleteCategory = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus Kategori?',
    text: "Yakin ingin menghapus kategori ini?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })
  
  if (result.isConfirmed) {
    try {
      await ApiService.deleteCategory(id)
      fetchCategories()
      Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'Kategori berhasil dihapus.', showConfirmButton: false, timer: 1500 })
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus kategori' })
      console.error(err)
    }
  }
}

const filteredCategories = computed(() => {
  return categories.value.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})
</script>

<template>
  <div class="kategori-page">
    

    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Kategori</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari kategori..." class="search-input" />
          </div>
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort">
              Urutkan <ChevronDown :size="12" />
            </button>
          </div>
          <button class="btn btn-primary btn-add" @click="openAdd">
            <Plus :size="14" /> Tambah Kategori
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="30%">NAMA</th>
              <th>DESKRIPSI</th>
              <th width="120" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in filteredCategories" :key="cat.id">
              <td class="font-semibold text-primary-dark">{{ cat.name }}</td>
              <td class="text-muted">{{ cat.description }}</td>
              <td class="text-center">
                <div class="action-btns">
                  <button class="btn-icon edit" @click="openEdit(cat)"><PencilLine :size="12" /></button>
                  <button class="btn-icon delete" @click="deleteCategory(cat.id)"><Trash2 :size="12" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">Menampilkan {{ filteredCategories.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filteredCategories.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filteredCategories.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Kategori -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeAdd">
      <div class="modal-panel">
        <div class="modal-panel-header">
          <div class="modal-header-icon">
            <component :is="isEdit ? PencilLine : Plus" :size="18" />
          </div>
          <div>
            <h3>{{ isEdit ? 'Edit Kategori' : 'Tambah Kategori Baru' }}</h3>
            <p class="modal-header-sub">{{ isEdit ? 'Perbarui informasi kategori' : 'Isi informasi kategori yang ingin ditambahkan' }}</p>
          </div>
        </div>
        <div class="modal-panel-body" style="display: grid; gap: 1rem;">
          <div class="form-group">
            <label>Nama Kategori <span class="required">*</span></label>
            <input v-model="formData.category_name" type="text" class="form-control" placeholder="Contoh: Transport, Akomodasi, Makan" />
            <p class="form-hint">Nama singkat yang menggambarkan jenis pengeluaran</p>
          </div>
          <div class="form-group">
            <label>Deskripsi</label>
            <textarea v-model="formData.description" class="form-control" rows="2" placeholder="Jelaskan kategori ini mencakup pengeluaran apa saja..."></textarea>
            <p class="form-hint">Deskripsi opsional untuk membantu pengguna memahami kategori</p>
          </div>
        </div>
        <div class="modal-panel-footer">
          <button class="btn btn-outline" @click="closeAdd">Batal</button>
          <button class="btn btn-primary btn-save" @click="submitAdd" :disabled="!formData.category_name.trim()">
            <component :is="isEdit ? PencilLine : Plus" :size="14" />
            {{ isEdit ? 'Simpan Perubahan' : 'Tambah Kategori' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kategori-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }

.page-header { margin-bottom: 0; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.main-card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; display: flex; flex-direction: column; flex: 1; min-height: 0; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; flex-shrink: 0; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }

.header-actions { display: flex; gap: 0.625rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 200px; }
.btn-sort { display: flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.875rem; font-size: 0.75rem; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }
.btn-add { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; padding: 0.4rem 0.875rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }

.table-responsive { overflow-x: auto; overflow-y: auto; flex: 1; }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }

.text-primary-dark { color: #2563eb; font-weight: 700; }
.text-muted { color: #94a3b8; font-size: 0.7rem; }

.action-btns { display: flex; justify-content: center; gap: 0.375rem; }
.btn-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
.btn-icon.edit { background: #f59e0b; color: white; }
.btn-icon.delete { background: #ef4444; color: white; }

.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: center; background: #f8fafc; border-top: 1px solid #f1f5f9; flex-shrink: 0; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }

/* Modal */
.form-group { text-align: left; }
.form-group label { display: block; margin-bottom: 0.375rem; font-size: 0.8125rem; font-weight: 600; color: #475569; }
.required { color: #ef4444; }
.form-control { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; font-size: 0.8125rem; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
.form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.form-control:disabled { background: #f8fafc; cursor: not-allowed; }
textarea.form-control { resize: vertical; }
.form-hint { margin: 0.375rem 0 0; font-size: 0.6875rem; color: #94a3b8; line-height: 1.4; }
.btn-outline { background: white; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.8125rem; color: #475569; transition: all 0.15s; }
.btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-save { display: inline-flex; align-items: center; gap: 0.375rem; background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.8125rem; transition: all 0.15s; }
.btn-save:hover { background: #2563eb; }
.btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
</style>
