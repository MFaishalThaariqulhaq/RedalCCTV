(function (global) {
  const moduleRoot = new URL("../../../../", document.currentScript.src);
  global.CCTVFeatureModules = global.CCTVFeatureModules || {};
  global.CCTVFeatureModules.beritaAcara = global.CCTVFeatureModules.beritaAcara || {};
  // ============================================================
  // # FITUR: BERITA ACARA
  // ============================================================
  global.CCTVFeatureModules.beritaAcara.create = function createBeritaAcaraModule(api) {
    const { jobs, bas, esc, badge, getSelectedId } = api;
      // ============================================================
      // # RENDER: DAFTAR BERITA ACARA
      // ============================================================
      function baTable(rows) {
        return `<div class="table-wrap jobs-table-wrap"><table class="jobs-table ba-table"><thead><tr><th>Nomor BA</th><th>Kegiatan &amp; Divisi</th><th>Tanggal</th><th>Dibuat oleh</th><th>Status</th></tr></thead><tbody>${rows.map(b => `<tr class="job-row" onclick="rendalGo('berita-acara-detail','${b.id}')"><td><button class="job-id-link" onclick="event.stopPropagation();rendalGo('berita-acara-detail','${b.id}')">${esc(baDocumentNumber(b))}</button></td><td><div class="job-title">${esc(b.title)}</div><div class="job-division">${esc(b.divisi)}</div></td><td>${esc(b.date)}</td><td>${esc(b.author)}</td><td>${badge(b.status)}</td></tr>`).join("") || "<tr class='jobs-empty-row'><td colspan='5' class='jobs-empty'>Tidak ada data.</td></tr>"}</tbody></table></div>`;
      }
      function baPage() {
        return `<div class="page-heading jobs-heading"><div><h1>Daftar Berita Acara</h1><p class="muted">Kelola dan pantau seluruh berita acara pekerjaan.</p></div></div><section class="card jobs-card"><div class="jobs-toolbar"><label class="jobs-search"><i data-lucide="search"></i><input id="ba-search" placeholder="Cari nomor BA, kegiatan, atau divisi..." oninput="rendalFilterBA(this.value)"></label></div><div id="ba-table">${baTable(bas)}</div></section>`;
      }
      // ============================================================
      // # KONFIGURASI: NOMOR DAN TANGGAL BERITA ACARA
      // ============================================================
      function baDocumentNumber(ba) {
        if (ba.documentNumber) return ba.documentNumber;
        const date = baDateParts(ba.date);
        const month = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][date.monthNumber - 1] || "I";
        const sequence = baSequence(ba);
        return `BA/${sequence}/PA/FIK-SUS/${month}/${date.year}`;
      }
      function baSequence(ba) {
        const index = Math.max(0, bas.indexOf(ba));
        return Number(ba.sequence) || bas.length - index;
      }
      function baDateParts(value) {
        const raw = String(value || "").trim();
        const slashDate = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        const date = slashDate
          ? new Date(Number(slashDate[3]), Number(slashDate[2]) - 1, Number(slashDate[1]))
          : new Date(value);
        if (Number.isNaN(date.getTime())) return { full: value, day: "-", weekday: "-", month: "-", monthNumber: 1, year: "-" };
        return {
          full: date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          day: date.toLocaleDateString("id-ID", { day: "numeric" }),
          weekday: date.toLocaleDateString("id-ID", { weekday: "long" }),
          month: date.toLocaleDateString("id-ID", { month: "long" }),
          monthNumber: date.getMonth() + 1,
          year: date.toLocaleDateString("id-ID", { year: "numeric" })
        };
      }
      // ============================================================
      // # RENDER: DOKUMEN BERITA ACARA
      // ============================================================
      function baLogoMarkup() {
        return `<img class="ba-header-image" src="${new URL("assets/images/ba-header.png", moduleRoot)}" crossorigin="anonymous" alt="Kop surat PT Pindad dan Danantara">`;
      }
      function baFooterMarkup() {
        return `<footer class="ba-document-footer"><img src="${new URL("assets/images/ba-footer.png", moduleRoot)}" crossorigin="anonymous" alt="Alamat dan sertifikasi PT Pindad"></footer>`;
      }
      function baPhotosMarkup(job) {
        const images = job.photoImages || [];
        const photos = job.photos.map(caption => images.find(image => image.caption === caption) || { caption });
        return photos.map(photo => `<figure class="ba-photo">${photo.src ? `<img src="${esc(photo.src)}" alt="${esc(photo.caption)}">` : `<div class="ba-photo-placeholder"><i data-lucide="camera"></i><span>Foto dokumentasi</span></div>`}<figcaption>${esc(photo.caption)}</figcaption></figure>`).join("");
      }
      // ============================================================
      // # HUBUNGAN: PEKERJAAN → BERITA ACARA
      // # Isi dokumen BA diambil dari pekerjaan yang terkait.
      // ============================================================
      function baDetailPage(baOverride) {
        const ba = baOverride || bas.find(b => b.id === getSelectedId()) || bas[0];
        if (!ba) return `<section class="card"><p class="jobs-empty">Belum ada data Berita Acara.</p><button class="btn" onclick="rendalGo('berita-acara')">Kembali ke Berita Acara</button></section>`;
        const job = jobs.find(j => j.id === ba.jobId) || jobs[0];
        if (!job) return `<section class="card"><p class="jobs-empty">Data pekerjaan untuk Berita Acara ini tidak ditemukan.</p><button class="btn" onclick="rendalGo('berita-acara')">Kembali ke Berita Acara</button></section>`;
        const date = baDateParts(ba.date);
        const activity = ba.title || job.baTitle || job.title || "Pekerjaan";
        const personnel = job.personnel || [];
        const tools = job.tools || [];
        const coordinator = { name: job.createdByName || currentUser.name, npp: job.createdByNpp || "", role: "Petugas CCTV" };
        const knownByParty = ba.knownBy || job.baKnownBy || "JM PAMFIK";
        const knownByPerson = knownByParty === "KORDINATOR RENDALPAM"
          ? personnel.find(person => /koordinator/i.test(person.role))
          : personnel.find(person => /jm|pamik|rescue/i.test(person.role));
        const jm = knownByPerson
          ? { ...knownByPerson, position: knownByParty }
          : { name: "................................", npp: "", position: knownByParty };
        const actionButtons = `<div class="ba-screen-actions"><button class="btn" type="button" onclick="rendalExportSingleBA('${esc(ba.id)}')">Download PDF</button></div>`;
        return `<div class="ba-detail-toolbar"><button class="btn" onclick="rendalGo('berita-acara')">Kembali</button>${badge(ba.status)}${actionButtons}</div><div class="ba-document">
          <section class="ba-paper ba-paper-main"><header class="ba-document-header">${baLogoMarkup()}</header><div class="ba-document-title"><h1>BERITA ACARA ${esc(activity).toUpperCase()}</h1><p>Nomor : <u>${esc(baDocumentNumber(ba))}</u></p></div>
          <div class="ba-body"><p>1. Berdasarkan tugas dan tanggung jawab perihal pengecekan petugas CCTV.</p><p>2. Pada hari ${esc(date.weekday)}, tanggal ${esc(date.full)}, telah selesai dilaksanakan ${esc(activity)}, dengan uraian sebagai berikut:</p>
          <div class="ba-point-three"><p>3. Uraian hasil pencatatan:</p><table class="ba-form-table ba-process-table"><thead><tr><th>No</th><th>Tanggal</th><th>Nama Perangkat</th><th>Kendala</th><th>Tindakan</th><th>Keterangan</th></tr></thead><tbody><tr><td>1</td><td>${esc(date.full)}</td><td>${esc(job.title)}</td><td>${esc(job.temuan || "-")}</td><td>${esc(job.tindakan || "-")}</td><td>${esc(job.keterangan || "Sedang berlangsung")}</td></tr></tbody></table></div>
          <h3 class="ba-section-title">4. Perkakas yang Digunakan</h3><ol class="ba-tools-list">${tools.map(tool => `<li>${esc(tool)}</li>`).join("") || "<li>Belum ada perkakas yang digunakan.</li>"}</ol>
          <h3 class="ba-section-title">5. Daftar Personel</h3><table class="ba-form-table ba-personnel-table"><thead><tr><th>No</th><th>Nama</th><th>NPP</th><th>Peran / Tugas</th></tr></thead><tbody>${personnel.map((person, index) => `<tr><td>${index + 1}</td><td>${esc(person.name || "-")}</td><td>${esc(person.npp || "-")}</td><td>${esc(person.role || "-")}</td></tr>`).join("") || "<tr><td colspan='4'>Belum ada personel.</td></tr>"}</tbody></table>
          <p class="ba-closing">Demikian berita acara pencatatan CCTV ini dibuat dengan sebenar-benarnya, atas perhatiannya saya ucapkan terima kasih.</p><div class="ba-signatures"><div>Mengetahui<br>${esc(jm.position)}<div class="ba-signature-space"></div><u>${esc(jm.name)}</u>${jm.npp ? `<small>NPP: ${esc(jm.npp)}</small>` : ""}</div><div><p>Bandung, ${esc(date.full)}</p>${esc(coordinator.role)}<div class="ba-signature-space"></div><u>${esc(coordinator.name)}</u><small>NPP: ${esc(coordinator.npp || "-")}</small></div></div></div>${baFooterMarkup()}</section>
          <section class="ba-paper ba-paper-attachment"><header class="ba-document-header">${baLogoMarkup()}</header><div class="ba-attachment-meta"><div>Lampiran : ${esc(activity)}<br>Nomor : ${esc(baDocumentNumber(ba))}<br>Tanggal : ${esc(date.full)}</div></div><h2>DOKUMENTASI ${esc(activity).toUpperCase()}</h2><div class="ba-photo-grid">${baPhotosMarkup(job) || "<p class='muted'>Belum ada dokumentasi foto.</p>"}</div><div class="ba-attachment-signatures"><div>Mengetahui<br>${esc(jm.position)}<div class="ba-signature-space"></div><u>${esc(jm.name)}</u></div><div><p>Bandung, ${esc(date.full)}</p>Petugas CCTV<div class="ba-signature-space"></div><u>${esc(coordinator.name)}</u></div></div>${baFooterMarkup()}</section></div>`;
      }
    return { baTable, baPage, baSequence, baDocumentNumber, baDetailPage };
  };
})(window);
