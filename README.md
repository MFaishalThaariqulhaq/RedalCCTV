# Monitor CCTV

Prototype frontend sistem internal untuk pencatatan dan pemeliharaan perangkat CCTV PT Pindad.

## Status

Fitur yang tersedia: login simulasi dengan role Admin dan Staff, dashboard operasional, halaman Monitoring CCTV dengan 11 layout dan marker CCTV 35–57, pencatatan kendala dan tindakan, berita acara Draft/Selesai, laporan, dan penyimpanan localStorage. Admin dapat menambah, memindahkan, menghapus, dan mengubah status marker melalui Monitoring; Staff dapat melihat detail CCTV dan mencatat pekerjaan tanpa kontrol pengubahan marker. Perubahan posisi, status/kendala, marker tambahan, dan marker yang dihapus disimpan terpisah pada `cctv_camera_positions`, `cctv_camera_overrides`, `cctv_custom_cameras`, dan `cctv_deleted_cameras`. Data default dan layout tidak diubah.

## Menjalankan

Buka `index.html` langsung di browser. Entry point akan mengarahkan ke `pages/login.html`.

## Struktur Fitur

- `pages/`: halaman dikelompokkan di folder `dashboard`, `pekerjaan`, `berita-acara`, `laporan`, dan `master`.
- `assets/js/core/`: bootstrap aplikasi, shell global, navigasi, dan autentikasi.
- `assets/js/core/storage.js`: akses persistence localStorage untuk kamera, pekerjaan, dan data runtime bersama.
- `assets/js/modules/`: JavaScript per fitur; halaman Monitoring CCTV ditampilkan di dalam shell global.
- `assets/css/modules/`: stylesheet khusus fitur.
- `data/`: data prototype.
- `data/cameras.js`: data default/reference kamera; perubahan runtime disimpan di localStorage tanpa mengubah data layout atau koordinat default.

Dashboard menghitung ringkasan status dari state kamera yang sama dengan Monitoring dan menghitung riwayat, jenis kendala, pekerjaan terbaru, serta tren harian 30 hari dari `cctv_logs`. Catatan yang dibuat dari detail marker menyimpan `cameraId` agar pekerjaan tetap terhubung ke CCTV yang tepat. Dashboard merender ulang saat state lokal berubah dan saat menerima pembaruan localStorage dari tab lain; `window.refreshDashboard()` juga tersedia untuk pemanggilan manual.

## Akun Demo

Semua akun menggunakan password `123456`: `admin` dan `staff`.

Data pencatatan dan perubahan status kamera disimpan di localStorage browser. Data pekerjaan dan Berita Acara tidak lagi di-seed dengan contoh; keduanya mulai kosong dan terisi melalui aplikasi.
