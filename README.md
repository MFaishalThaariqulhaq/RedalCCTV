# Monitor CCTV

Prototype frontend sistem internal untuk pencatatan dan pemeliharaan perangkat CCTV PT Pindad.

## Status

Fitur yang tersedia: login simulasi, role Admin dan Staff, dashboard operasional dengan ringkasan status kamera dan pencatatan, halaman Monitoring CCTV dengan 11 layout PNG dan marker kamera CCTV 35–57 sebagai data default, pencatatan kendala dan tindakan dengan status operasional, berita acara Draft/Selesai, laporan, dan penyimpanan localStorage. Override status/kendala kamera disimpan pada `cctv_camera_overrides`; pekerjaan, berita acara, dan master tetap memakai key localStorage prototype yang sudah ada.

## Menjalankan

Buka `index.html` langsung di browser. Entry point akan mengarahkan ke `pages/login.html`.

## Struktur Fitur

- `pages/`: halaman dikelompokkan di folder `dashboard`, `pekerjaan`, `berita-acara`, `laporan`, dan `master`.
- `assets/js/core/`: bootstrap aplikasi, shell global, navigasi, dan autentikasi.
- `assets/js/core/storage.js`: akses persistence localStorage untuk kamera, pekerjaan, dan data runtime bersama.
- `assets/js/modules/`: JavaScript per fitur; halaman Monitoring CCTV ditampilkan di dalam shell global.
- `assets/css/modules/`: stylesheet khusus fitur.
- `data/`: data prototype.
- `data/cameras.js`: data default/reference kamera; perubahan runtime disimpan sebagai override, tanpa menyimpan ulang posisi denah.

Dashboard menghitung ringkasan status dari state kamera yang sama dengan Monitoring dan menghitung riwayat, jenis kendala, pekerjaan terbaru, serta tren harian 30 hari dari `cctv_logs`. Catatan yang dibuat dari detail marker menyimpan `cameraId` agar pekerjaan tetap terhubung ke CCTV yang tepat. Dashboard merender ulang saat state lokal berubah dan saat menerima pembaruan localStorage dari tab lain; `window.refreshDashboard()` juga tersedia untuk pemanggilan manual.

## Akun Demo

Semua akun menggunakan password `123456`: `admin` dan `staff`.

Data pencatatan dan perubahan status kamera disimpan di localStorage browser. Data pekerjaan dan Berita Acara tidak lagi di-seed dengan contoh; keduanya mulai kosong dan terisi melalui aplikasi.
