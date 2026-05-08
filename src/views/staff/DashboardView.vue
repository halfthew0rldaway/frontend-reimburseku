<script setup>
import { ref, computed } from 'vue'
import { Plus, Car, UtensilsCrossed, ParkingMeter, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

// Filter status aktif
const filterAktif = ref('semua')
const filterBulan = ref('2025-09')

const filterList = [
  { key: 'semua',    label: 'Semua',   warna: '' },
  { key: 'menunggu', label: 'Menunggu', warna: '#f59e0b' },
  { key: 'diterima', label: 'Diterima', warna: '#3b82f6' },
  { key: 'ditolak',  label: 'Tolak',   warna: '#ef4444' },
  { key: 'dibayar',  label: 'Dibayar', warna: '#22c55e' },
]

const semuaData = ref([
  { id: 1, judul: 'Grab Food bulan ini',      status: 'dibayar',  catatan: '',                         jumlah: 'Rp.300.000',   tanggal: '26/10/2025' },
  { id: 2, judul: 'Parkir Motor Kendaraan',   status: 'ditolak',  catatan: 'Nota Terlampir tidak valid', jumlah: 'Rp.25.000',   tanggal: '25/10/2025' },
  { id: 3, judul: 'Tiket Bus',                status: 'menunggu', catatan: '',                         jumlah: 'Rp.300.000',   tanggal: '24/10/2025' },
  { id: 4, judul: 'Perbaikan Laptop',         status: 'diterima', catatan: '',                         jumlah: 'Rp.500.000',   tanggal: '23/10/2025' },
  { id: 5, judul: 'Perbaiki AC',              status: 'dibayar',  catatan: '',                         jumlah: 'Rp.1.000.000', tanggal: '20/10/2025' },
])

// Pagination
const halamanAktif = ref(1)
const itemPerHalaman = 5
const totalHalaman = 5 // dummy 5 halaman

const dataFiltered = computed(() => {
  if (filterAktif.value === 'semua') return semuaData.value
  return semuaData.value.filter(d => d.status === filterAktif.value)
})

// Stat kategori (kanan)
const kategoriStats = [
  { label: 'Transportasi', jumlah: 'Rp.100.000', ikon: Car,             bg: '#22c55e' },
  { label: 'Makanan',      jumlah: 'Rp.200.000', ikon: UtensilsCrossed, bg: '#ec4899' },
  { label: 'Parkir',       jumlah: 'Rp.500.000', ikon: ParkingMeter,    bg: '#a855f7' },
  { label: 'Dan lain-lain',jumlah: 'Rp.2.000.000',ikon: MoreHorizontal, bg: '#3b82f6' },
]

// Badge info per status
function getBadgeClass(status) {
  switch (status) {
    case 'dibayar':  return 'chip chip-bayar'
    case 'ditolak':  return 'chip chip-tolak'
    case 'menunggu': return 'chip chip-menunggu'
    case 'diterima': return 'chip chip-diterima'
    default: return 'chip'
  }
}

function getLabelStatus(status) {
  const map = { dibayar: 'Dibayar', ditolak: 'Ditolak', menunggu: 'Menunggu', diterima: 'Diterima' }
  return map[status] || status
}

function gantiHalaman(h) {
  if (h >= 1 && h <= totalHalaman) halamanAktif.value = h
}
</script>

<template>
  <div class="dasbor-staf">
    <!-- Header & Tombol Tambah -->
    <div class="header-utama">
      <h2 class="judul-halaman">Dashboard Staff</h2>
      <button class="btn btn-primary tombol-tambah" @click="router.push('/staf/reimbursement/tambah')">
        <Plus :size="16" /> Tambah Reimbursement
      </button>
    </div>

    <div class="grid-dasbor">
      <!-- Kolom kiri: Riwayat -->
      <div class="kolom-kiri">
        <div class="section-title-row">
          <h3 class="judul-seksi">Riwayat Reimbursement</h3>
        </div>

        <div class="filter-bulan-wrap">
          <div class="filter-chip-row">
            <button
              v-for="f in filterList"
              :key="f.key"
              class="filter-chip"
              :class="{ 'filter-chip-aktif': filterAktif === f.key }"
              @click="filterAktif = f.key"
            >
              <span v-if="f.warna" class="titik-warna" :style="{ background: f.warna }"></span>
              {{ f.label }}
            </button>
          </div>

          <div class="pilih-bulan">
            <input type="month" v-model="filterBulan" class="input-bulan" />
          </div>
        </div>

        <!-- Daftar item -->
        <div class="daftar-container">
          <div v-if="dataFiltered.length === 0" class="kosong-teks">
            Tidak ada data untuk filter ini.
          </div>

          <div
            v-for="item in dataFiltered"
            :key="item.id"
            class="item-riwayat"
            @click="router.push('/staf/reimbursement/' + item.id)"
          >
            <div class="item-kiri">
              <p class="item-judul">{{ item.judul }}</p>
              <div class="item-bawah">
                <span :class="getBadgeClass(item.status)">{{ getLabelStatus(item.status) }}</span>
                <span v-if="item.catatan" class="item-catatan">{{ item.catatan }}</span>
              </div>
              <p class="item-jumlah">{{ item.jumlah }}</p>
            </div>
            <div class="item-kanan">
              <span class="item-tanggal">{{ item.tanggal }}</span>
            </div>
          </div>

          <!-- Pagination -->
          <div class="paginasi">
            <button class="btn-paging" @click="gantiHalaman(halamanAktif - 1)" :disabled="halamanAktif === 1">
              <ChevronLeft :size="16" />
            </button>
            <button
              v-for="h in totalHalaman"
              :key="h"
              class="btn-paging"
              :class="{ 'paging-aktif': halamanAktif === h }"
              @click="gantiHalaman(h)"
            >{{ h }}</button>
            <button class="btn-paging" @click="gantiHalaman(halamanAktif + 1)" :disabled="halamanAktif === totalHalaman">
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Kolom kanan: Statistik -->
      <div class="kolom-kanan">
        <h2 class="judul-seksi">Statistik dan Laporan</h2>

        <div class="grid-statistik">
          <div
            v-for="s in kategoriStats"
            :key="s.label"
            class="kartu-stat"
            :style="{ backgroundColor: s.bg }"
          >
            <div class="stat-ikon">
              <component :is="s.ikon" :size="28" />
            </div>
            <div class="stat-info">
              <p class="stat-label">{{ s.label }}</p>
              <p class="stat-jumlah">{{ s.jumlah }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dasbor-staf {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Baris atas */


.tombol-tambah {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

/* Grid utama */
.grid-dasbor {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.header-utama {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.judul-halaman {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.judul-seksi {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 1rem;
}

/* ─── Kolom kiri ─── */
.kolom-kiri {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Filter chip */
.filter-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.875rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.875rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: white;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.filter-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-chip-aktif {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.titik-warna {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

/* Input bulan */
.pilih-bulan {
  margin-bottom: 0;
}

.filter-bulan-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-bulan {
  padding: 0.5rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--color-text-main);
  background: white;
  outline: none;
  width: 100%;
  max-width: 220px;
  cursor: pointer;
}

.input-bulan:focus {
  border-color: var(--color-primary);
}

/* Daftar */
.daftar-container {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.item-riwayat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.item-riwayat:last-of-type {
  border-bottom: none;
}

.item-riwayat:hover {
  background-color: #f8fafc;
}

.item-kiri {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-judul {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.item-bawah {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.item-catatan {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.item-jumlah {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 0.25rem;
}

.item-kanan {
  text-align: right;
  flex-shrink: 0;
  padding-left: 1rem;
}

.item-tanggal {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

/* Chip status */
.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.175rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.chip-bayar   { background: #dcfce7; color: #166534; }
.chip-tolak   { background: #fee2e2; color: #b91c1c; }
.chip-menunggu{ background: #fef3c7; color: #d97706; }
.chip-diterima{ background: #dbeafe; color: #1d4ed8; }

/* Paginasi */
.paginasi {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
  padding: 1rem;
  border-top: 1px solid #f1f5f9;
}

.btn-paging {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 500;
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-paging:hover:not(:disabled):not(.paging-aktif) {
  background: #f1f5f9;
}

.btn-paging:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.paging-aktif {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.kosong-teks {
  padding: 2.5rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

/* ─── Kolom kanan: Statistik ─── */
.kolom-kanan {
  display: flex;
  flex-direction: column;
}

.grid-statistik {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.kartu-stat {
  border-radius: 14px;
  padding: 1rem;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.04);
  transition: all 0.25s ease;
  position: relative;
}

.kartu-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.stat-ikon {
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.22);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 0.2rem;
}

.stat-jumlah {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* Responsive */
@media (max-width: 1100px) {
  .grid-dasbor {
    grid-template-columns: 1fr;
  }
  .grid-statistik {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-statistik {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
