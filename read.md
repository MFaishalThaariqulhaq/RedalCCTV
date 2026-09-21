# DESIGN REFERENCE RULE

Saya sudah memiliki prototype Rendal PAM sebelumnya bernama:

`rev2.html`

File tersebut adalah **referensi utama desain UI/UX** untuk proyek ini.

## ATURAN PALING PENTING

JANGAN mendesain ulang aplikasi dari nol.

Gunakan `rev2.html` sebagai **design source of truth**.

Sebelum membuat file baru:

1. Baca dan analisis `rev2.html`.
2. Identifikasi struktur layout.
3. Identifikasi sidebar.
4. Identifikasi topbar/header.
5. Identifikasi typography.
6. Identifikasi warna.
7. Identifikasi spacing.
8. Identifikasi border radius.
9. Identifikasi shadow.
10. Identifikasi card.
11. Identifikasi table.
12. Identifikasi button.
13. Identifikasi badge/status.
14. Identifikasi modal.
15. Identifikasi icon.
16. Identifikasi chart.
17. Identifikasi responsive behavior.

Semua elemen tersebut harus dipertahankan secara visual ketika membuat halaman baru.

---

# VISUAL CONSISTENCY

Halaman baru harus terlihat seperti bagian dari aplikasi yang sama.

Contohnya:

Dashboard
→ Pekerjaan
→ Detail Pekerjaan
→ Berita Acara
→ Approval
→ Laporan

harus memiliki:

* Sidebar yang sama
* Topbar yang sama
* Typography yang sama
* Warna yang sama
* Button style yang sama
* Card style yang sama
* Table style yang sama
* Badge style yang sama
* Spacing yang sama
* Border radius yang sama
* Icon style yang sama

Jangan membuat halaman baru menggunakan style yang berbeda hanya karena halaman tersebut memiliki fungsi berbeda.

---

# REUSE, DON'T REDESIGN

Jika `rev2.html` sudah memiliki komponen:

* Sidebar
* Header
* Card
* Button
* Table
* Badge
* Modal
* Dropdown
* Tabs
* Timeline

gunakan kembali pola desain tersebut.

Jika memungkinkan, ekstrak style yang sudah ada ke:

`assets/css/app.css`

Jangan membuat versi baru dari komponen yang sebenarnya sudah tersedia.

---

# PRESERVE EXISTING DESIGN

Jika terdapat konflik antara desain baru dengan `rev2.html`, prioritaskan desain `rev2.html`.

Jangan mengubah:

* Primary color
* Font
* Ukuran font utama
* Layout sidebar
* Lebar sidebar
* Header height
* Card appearance
* Button appearance
* Border radius
* Shadow
* Table appearance

kecuali saya secara eksplisit meminta perubahan.

---

# IMPROVEMENT RULE

Anda boleh memperbaiki:

* struktur HTML
* accessibility
* responsive behavior
* JavaScript
* code organization
* reusable components
* bug

Tetapi jangan mengubah visual secara signifikan.

Tujuannya adalah:

**same design + better structure + better functionality**

bukan:

**new design**

---

# NEW PAGE RULE

Jika halaman baru belum memiliki referensi visual di `rev2.html`, jangan membuat design system baru.

Ambil:

1. layout dari `rev2.html`
2. typography dari `rev2.html`
3. color system dari `rev2.html`
4. component style dari `rev2.html`

kemudian gunakan kombinasi tersebut untuk membuat halaman baru.

---

# BEFORE CODING

Sebelum membuat halaman baru, jelaskan secara singkat:

* komponen apa dari `rev2.html` yang akan digunakan kembali
* bagian mana yang baru
* bagaimana memastikan visual tetap konsisten

Setelah itu baru implementasikan.

---

# IMPORTANT

`rev2.html` adalah referensi visual utama.

Jangan mengganti desain hanya karena Anda memiliki preferensi desain lain.

Jangan menggunakan template dashboard dari internet.

Jangan menggunakan Bootstrap/AdminLTE/Tailwind UI template kecuali saya meminta.

Jangan membuat tampilan generik.

Targetnya adalah ketika pengguna membuka:

`dashboard.html`

dan kemudian:

`pekerjaan.html`

mereka harus merasa bahwa kedua halaman tersebut adalah **satu aplikasi Rendal PAM yang sama**.
