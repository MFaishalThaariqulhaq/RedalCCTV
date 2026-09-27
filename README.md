# Monitor CCTV

Prototype frontend sistem internal untuk pencatatan dan pemeliharaan perangkat CCTV PT Pindad.

## Status

Fitur yang tersedia: login simulasi, role, dashboard kondisi CCTV, pencatatan kendala dan tindakan, detail pencatatan, berita acara, approval/revisi, laporan, master perangkat, dan penyimpanan localStorage.

## Menjalankan

Buka `index.html` langsung di browser. Entry point akan mengarahkan ke `pages/login.html`.

## Struktur Fitur

- `pages/`: halaman dikelompokkan di folder `dashboard`, `pekerjaan`, `berita-acara`, `approval`, `laporan`, dan `master`.
- `assets/js/core/`: bootstrap aplikasi, shell global, navigasi, dan autentikasi.
- `assets/js/modules/`: JavaScript per fitur; Monitoring ditampilkan di dalam shell global.
- `assets/css/modules/`: stylesheet khusus fitur.
- `data/`: data prototype.

## Akun Demo

Semua akun menggunakan password `123456`: `admin`, `staff`, `reviewer`, dan `vpmanager`.

Data demo dan perubahan workflow disimpan di localStorage browser agar tetap tersedia selama demonstrasi.
