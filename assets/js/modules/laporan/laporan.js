(function (global) {
  global.CCTVFeatureModules = global.CCTVFeatureModules || {};
  global.CCTVFeatureModules.laporan = {
    create: function createLaporan(api) {
      const { jobs, esc, jobTable } = api;
      function reportsPage() {
        return `<div class="page-heading"><div><h1>Laporan</h1><p class="muted">Ringkasan pekerjaan berdasarkan data prototype.</p></div><button class="btn" onclick="window.print()">Export PDF / Print</button></div><div class="grid grid-4"><div class="card"><div class="stat-label">Total pekerjaan</div><div class="stat-value">${jobs.length}</div></div><div class="card"><div class="stat-label">Selesai</div><div class="stat-value">${jobs.filter(j => j.status === "Selesai").length}</div></div><div class="card"><div class="stat-label">Belum selesai</div><div class="stat-value">${jobs.filter(j => j.status !== "Selesai").length}</div></div><div class="card"><div class="stat-label">Divisi aktif</div><div class="stat-value">${new Set(jobs.map(j => j.divisi)).size}</div></div></div><section class="card" style="margin-top:1rem"><h3>Rekap pekerjaan</h3>${jobTable(jobs)}</section>`;
      }
      return { reportsPage };
    }
  };
})(window);
