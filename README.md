# ReimburseKu - Frontend

Sistem Manajemen Reimbursement berbasis web yang dikembangkan menggunakan Vue 3 dan Vite. Proyek ini merupakan bagian dari aplikasi manajemen klaim biaya karyawan yang dirancang untuk memfasilitasi proses pengajuan hingga pembayaran secara efisien dan terorganisir.

## Deskripsi Proyek
ReimburseKu menyediakan antarmuka pengguna untuk dua level akses utama yaitu Admin dan Finance. Fokus utama pengembangan pada repositori ini adalah implementasi antarmuka yang padat (compact layout), responsif, dan fungsional sesuai dengan standar aplikasi administrasi profesional.

## Fitur Utama

### Modul Admin
*   Dasbor Statistik: Visualisasi total karyawan, klaim menunggu, dan distribusi kategori reimbursement.
*   Manajemen Karyawan: Fitur tambah, edit, dan hapus data karyawan beserta informasi rekening bank.
*   Manajemen Kategori: Pengelolaan kategori biaya reimbursement.
*   Metode Pembayaran: Pengaturan bank atau e-wallet yang didukung sistem.
*   Log Aktivitas: Pemantauan aktivitas sistem secara real-time.

### Modul Finance
*   Dasbor Keuangan: Ringkasan budget bulanan dan pengeluaran harian.
*   Pemrosesan Reimbursement: Alur kerja dua tahap (Proses dan Bayar) dengan validasi wajib unggah bukti transfer.
*   Manajemen Deposit: Pengelolaan alokasi dana petty cash dan dana operasional.
*   Arsip Data: Penyimpanan data reimbursement yang telah selesai atau dibatalkan.
*   Data Karyawan: Pandangan ringkas performa pengajuan klaim per karyawan.

## Persyaratan Sistem
Sebelum memulai proses instalasi, pastikan sistem telah memenuhi persyaratan berikut:
*   Node.js (Versi ^20.19.0 atau >=22.12.0)
*   NPM (Node Package Manager)

## Instalasi

1.  Lakukan kloning repositori:
    ```sh
    git clone https://github.com/username/frontend-reimburseku.git
    ```

2.  Masuk ke direktori proyek:
    ```sh
    cd frontend-reimburseku
    ```

3.  Instal seluruh dependensi:
    ```sh
    npm install
    ```

## Jalankan Aplikasi

### Mode Pengembangan
Jalankan aplikasi dalam mode pengembangan dengan fitur Hot-Reload:
```sh
npm run dev
```
Aplikasi akan berjalan pada alamat default `http://localhost:5173`.

### Build Produksi
Lakukan kompilasi dan optimasi file untuk kebutuhan deployment produksi:
```sh
npm run build
```
Hasil build akan tersedia di dalam direktori `dist`.

### Linting dan Format Kode
Gunakan perintah berikut untuk memeriksa dan memperbaiki kualitas kode:
```sh
# Linting dengan ESLint dan Oxlint
npm run lint

# Format kode dengan Prettier
npm run format
```

## Teknologi yang Digunakan
*   Framework Utama: Vue 3 (Composition API)
*   Build Tool: Vite
*   State Management: Pinia
*   Routing: Vue Router
*   HTTP Client: Axios
*   Ikon: Lucide Vue Next
*   Styling: Vanilla CSS (Modern Design System)

Proyek ini dikembangkan dengan pendekatan User Interface (UI) yang bersih, profesional, dan dioptimalkan untuk penggunaan administratif intensif.
