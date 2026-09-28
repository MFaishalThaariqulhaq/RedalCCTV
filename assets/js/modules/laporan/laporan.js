(function (global) {
  global.CCTVFeatureModules = global.CCTVFeatureModules || {};
  global.CCTVFeatureModules.laporan = {
    create: function createLaporan(api) {
      const { jobs, cameras, layouts, esc, badge } = api;
      const statuses = ["Selesai", "Dalam Pengerjaan", "Dalam Pemeriksaan", "Dilaporkan"];
      const layoutNames = new Map(layouts.map(layout => [layout.id, layout.name]));
      let startDate = "";
      let endDate = "";
      let selectedJobId = "";

      function parseJobDate(value) {
        const text = String(value || "").trim();
        let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
        if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
        const parsed = new Date(text);
        return Number.isNaN(parsed.getTime())
          ? null
          : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      }

      function dateKey(date) {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }

      function formatDate(value) {
        const date = parseJobDate(value);
        return date ? date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : String(value || "-");
      }

      function areaFor(job) {
        const camera = cameras.find(item => item.id === job.cameraId);
        return (camera && layoutNames.get(camera.layout)) || job.location || job.divisi || "-";
      }

      function filteredJobs() {
        return jobs
          .map((job, index) => ({ job, index, date: parseJobDate(job.date) }))
          .filter(({ date }) => {
            if (!startDate && !endDate) return true;
            if (!date) return false;
            const key = dateKey(date);
            return (!startDate || key >= startDate) && (!endDate || key <= endDate);
          })
          .sort((a, b) => {
            if (!a.date && !b.date) return a.index - b.index;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date - a.date || a.index - b.index;
          })
          .map(item => item.job);
      }

      function countBy(rows, getLabel) {
        const counts = new Map();
        rows.forEach(job => {
          const label = String(getLabel(job) || "").trim() || "Tidak dicantumkan";
          counts.set(label, (counts.get(label) || 0) + 1);
        });
        return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "id"));
      }

      function summaryMarkup(rows) {
        const counts = Object.fromEntries(statuses.map(status => [status, rows.filter(job => job.status === status).length]));
        const summaries = [
          ["Total Pekerjaan", rows.length],
          ["Selesai", counts["Selesai"]],
          ["Dalam Pengerjaan", counts["Dalam Pengerjaan"]],
          ["Dalam Pemeriksaan", counts["Dalam Pemeriksaan"]],
          ["Dilaporkan", counts["Dilaporkan"]]
        ];
        return `<section class="reports-summary-grid" aria-label="Ringkasan pekerjaan">${summaries.map(([label, value]) => `<article class="card reports-summary-card"><span>${label}</span><strong>${value}</strong></article>`).join("")}</section>`;
      }

      function breakdownMarkup(title, entries, emptyText) {
        return `<section class="card reports-breakdown"><h2>${title}</h2>${entries.length ? `<div class="reports-breakdown-list">${entries.map(([label, count]) => `<div class="reports-breakdown-row"><span>${esc(label)}</span><strong>${count}</strong></div>`).join("")}</div>` : `<p class="reports-muted">${emptyText}</p>`}</section>`;
      }

      function jobDetailMarkup(job) {
        if (!job) return "";
        return `<section class="card reports-detail" aria-live="polite"><div class="reports-detail-heading"><div><span class="reports-muted">Detail pekerjaan</span><h2>${esc(job.title || "-")}</h2></div><button class="btn" type="button" onclick="rendalToggleReportDetail('')">Tutup</button></div><dl class="reports-detail-grid"><div><dt>Tanggal</dt><dd>${esc(formatDate(job.date))}</dd></div><div><dt>CCTV / Nama Perangkat</dt><dd>${esc(job.title || "-")}</dd></div><div><dt>Area / Layout</dt><dd>${esc(areaFor(job))}</dd></div><div><dt>Kendala</dt><dd>${esc(job.temuan || "-")}</dd></div><div><dt>Tindakan</dt><dd>${esc(job.tindakan || "-")}</dd></div><div><dt>Petugas</dt><dd>${esc(job.createdByName || job.pic || "-")}</dd></div><div><dt>Status</dt><dd>${badge(job.status || "-")}</dd></div><div><dt>ID Pekerjaan</dt><dd>${esc(job.id || "-")}</dd></div></dl></section>`;
      }

      function tableMarkup(rows) {
        const selectedJob = rows.find(job => job.id === selectedJobId);
        if (selectedJobId && !selectedJob) selectedJobId = "";
        return `<section class="card reports-table-card"><div class="reports-section-heading"><div><h2>Riwayat Pekerjaan</h2><p class="reports-muted">${rows.length} pekerjaan pada periode yang dipilih</p></div></div><div class="table-wrap reports-table-wrap"><table class="reports-table"><thead><tr><th>No</th><th>Tanggal</th><th>CCTV / Nama Perangkat</th><th>Area / Layout</th><th>Kendala</th><th>Tindakan</th><th>Petugas</th><th>Status</th></tr></thead><tbody>${rows.map((job, index) => `<tr class="reports-job-row ${job.id === selectedJobId ? "is-selected" : ""}" tabindex="0" onclick="rendalToggleReportDetail('${esc(job.id)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();rendalToggleReportDetail('${esc(job.id)}')}"><td data-label="No">${index + 1}</td><td data-label="Tanggal">${esc(formatDate(job.date))}</td><td data-label="CCTV / Nama Perangkat">${esc(job.title || "-")}</td><td data-label="Area / Layout">${esc(areaFor(job))}</td><td data-label="Kendala">${esc(job.temuan || "-")}</td><td data-label="Tindakan">${esc(job.tindakan || "-")}</td><td data-label="Petugas">${esc(job.createdByName || job.pic || "-")}</td><td data-label="Status">${badge(job.status || "-")}</td></tr>`).join("") || `<tr><td colspan="8" class="reports-empty">Belum ada data pekerjaan pada periode yang dipilih.</td></tr>`}</tbody></table></div></section>${jobDetailMarkup(selectedJob)}`;
      }

      function reportsPage() {
        const rows = filteredJobs();
        const issues = countBy(rows, job => job.temuan);
        const areas = countBy(rows, areaFor);
        return `<div id="reports-root"><div class="page-heading reports-heading"><div><h1>Laporan</h1><p class="muted">Rekap dan riwayat pekerjaan CCTV berdasarkan data pencatatan.</p></div><button class="btn" type="button" onclick="window.print()">Cetak / Export PDF</button></div><form class="card reports-filter" onsubmit="event.preventDefault();rendalApplyReportFilter(this)"><label>Tanggal mulai<input class="field" type="date" name="startDate" value="${esc(startDate)}"></label><label>Tanggal akhir<input class="field" type="date" name="endDate" value="${esc(endDate)}"></label><div class="reports-filter-actions"><button class="btn btn-primary" type="submit">Terapkan Filter</button><button class="btn" type="button" onclick="rendalResetReportFilter()">Reset</button></div></form>${rows.length ? "" : `<p class="reports-empty-notice" role="status">Belum ada data pekerjaan pada periode yang dipilih.</p>`}${summaryMarkup(rows)}<div class="reports-breakdown-grid">${breakdownMarkup("Rekap Kendala", issues, "Tidak ada rekap kendala pada periode ini.")}${breakdownMarkup("Rekap Area / Layout", areas, "Tidak ada rekap area pada periode ini.")}</div>${tableMarkup(rows)}</div>`;
      }

      function refreshReportView() {
        const root = document.getElementById("reports-root");
        if (root) {
          root.outerHTML = reportsPage();
          if (global.lucide) global.lucide.createIcons();
        }
      }

      global.rendalApplyReportFilter = form => {
        startDate = String(new FormData(form).get("startDate") || "");
        endDate = String(new FormData(form).get("endDate") || "");
        refreshReportView();
      };
      global.rendalResetReportFilter = () => {
        startDate = "";
        endDate = "";
        selectedJobId = "";
        refreshReportView();
      };
      global.rendalToggleReportDetail = jobId => {
        selectedJobId = selectedJobId === String(jobId || "") ? "" : String(jobId || "");
        refreshReportView();
      };

      return { reportsPage, refreshReportView };
    }
  };
})(window);
