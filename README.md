# Sistem Monitoring dan Pencatatan CCTV Rendal PAM

## Tujuan

Sistem ini membantu tim Rendal PAM memantau kamera CCTV, mencatat pekerjaan, membuat Berita Acara (BA), dan melihat rekap pekerjaan. Data pekerjaan menjadi dasar BA dan laporan sehingga informasi yang sama tidak perlu dicatat berulang.

## Fungsi utama

- Monitoring status dan posisi kamera pada layout CCTV.
- Pencatatan kendala, tindakan, peralatan, personel, dan dokumentasi pekerjaan.
- Pembuatan serta pengunduhan BA dalam PDF.
- Rekap pekerjaan dan ekspor BA dari halaman Laporan.
- Penyimpanan data pekerjaan dan pengaturan kamera pada penyimpanan browser (`localStorage`).

## Alur data

```text
Monitoring CCTV
      ↓
Pencatatan Pekerjaan
      ↓
Pekerjaan (sumber data bersama)
      ↓
Berita Acara (BA)
      ↓
Laporan dan ekspor BA
```

Pekerjaan yang dicatat melalui Monitoring terhubung dengan kamera yang dipilih. Record pekerjaan disimpan sebagai `cctv_logs`; BA terkait disimpan sebagai `cctv_bas` dan menunjuk ke pekerjaan terkait. Laporan menggunakan data pekerjaan untuk rekap dan data BA untuk ekspor.

## Hak akses

| Fitur | Admin | Staff |
|---|---|---|
| Melihat Dashboard dan Monitoring | Ya | Ya |
| Mengubah marker, posisi, dan status kamera | Ya | Tidak |
| Membuat dan mengelola pencatatan pekerjaan | Ya | Ya |
| Menghapus peralatan/personel pada detail pekerjaan | Ya | Ya |
| Menghapus seluruh pekerjaan | Ya | Tidak |
| Melihat Berita Acara | Ya | Ya |
| Membuka Laporan dan mengekspor BA dari Laporan | Ya | Tidak |

## Struktur folder aktual

```text
cctv/
├── assets/
│   ├── css/
│   │   └── app.css
│   ├── icons/
│   │   └── cctv-icon.svg
│   ├── images/
│   │   ├── layout/                 # Gambar layout/denah untuk Monitoring
│   │   ├── ba-header.png
│   │   └── ba-footer.png
│   └── js/
│       ├── core/
│       │   ├── app.js              # Bootstrap, shell, Monitoring, dan penghubung modul
│       │   ├── auth.js             # Login prototype
│       │   └── storage.js          # Penyimpanan browser
│       ├── modules/
│       │   ├── dashboard/
│       │   ├── pekerjaan/
│       │   ├── berita-acara/
│       │   ├── laporan/
│       │   └── master/
│       └── vendor/                 # Library pihak ketiga yang digunakan aplikasi
├── data/                           # Data referensi prototype
├── documents/
│   └── layout-cctv/                # PDF layout CCTV
├── pages/
│   ├── dashboard/
│   ├── pekerjaan/
│   ├── berita-acara/
│   ├── laporan/
│   ├── master/
│   └── login.html
├── index.html                      # Entry point
├── read.md                         # Catatan referensi desain yang sudah ada
├── manifest.json
├── offline.html
├── README.md
└── sw.js                           # Service Worker
```

Folder `pages/approval/`, `pages/monitoring/`, dan `assets/js/modules/monitoring/` tidak memiliki file dan tidak digunakan, sehingga folder kosong tersebut dihapus. Halaman Monitoring dirender di dalam shell aplikasi, bukan dari entry point HTML terpisah. Definisi layout, rendering marker, interaksi kamera, dan penghubung ke Pencatatan saat ini berada di `assets/js/core/app.js`; data kamera referensi berada di `data/cameras.js`.

## Modul dan file data

- **Dashboard:** `assets/js/modules/dashboard/`
- **Monitoring CCTV:** layout, marker, dan interaksi di `assets/js/core/app.js`; data kamera di `data/cameras.js`; gambar layout di `assets/images/layout/`.
- **Pekerjaan:** `assets/js/modules/pekerjaan/`
- **Berita Acara:** `assets/js/modules/berita-acara/`
- **Laporan:** `assets/js/modules/laporan/`
- **Data prototype:** `data/cameras.js`, `data/pekerjaan.js`, `data/berita-acara.js`, dan `data/users.js`.
- **Penyimpanan inti:** `assets/js/core/storage.js`; data pekerjaan dan konfigurasi kamera runtime disimpan di browser (`localStorage`).
- **Halaman:** `pages/`; halaman Monitoring tidak berdiri sebagai file HTML tersendiri.
- **Dokumen layout resmi:** `documents/layout-cctv/`.

## Menjalankan aplikasi

Jalankan melalui HTTP lokal, misalnya dengan Live Server. Aplikasi menggunakan `localStorage` dan Service Worker; fitur yang memuat asset, termasuk gambar layout, sebaiknya tidak dijalankan dengan membuka file HTML langsung dari disk.

Akun demo yang tersedia menggunakan password `123456`: `admin` dan `staff`. Data pekerjaan dan BA disimpan pada browser yang digunakan.
