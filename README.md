# Monitor CCTV

Prototype frontend sistem internal untuk pencatatan dan pemeliharaan perangkat CCTV PT Pindad.

## Status

Fitur yang tersedia: login simulasi, role Admin dan Staff, dashboard pencatatan, halaman Monitoring CCTV yang siap diisi layout Pindad, pencatatan kendala dan tindakan dengan status operasional, berita acara Draft/Selesai, laporan, dan penyimpanan localStorage. Monitoring CCTV belum menggunakan data kamera.

## Menjalankan

Buka `index.html` langsung di browser. Entry point akan mengarahkan ke `pages/login.html`.

## Struktur Fitur

- `pages/`: halaman dikelompokkan di folder `dashboard`, `pekerjaan`, `berita-acara`, `laporan`, dan `master`.
- `assets/js/core/`: bootstrap aplikasi, shell global, navigasi, dan autentikasi.
- `assets/js/modules/`: JavaScript per fitur; halaman Monitoring CCTV ditampilkan di dalam shell global.
- `assets/css/modules/`: stylesheet khusus fitur.
- `data/`: data prototype.

## Akun Demo

Semua akun menggunakan password `123456`: `admin` dan `staff`.

Data demo pencatatan dan perubahan workflow disimpan di localStorage browser agar tetap tersedia selama demonstrasi.
