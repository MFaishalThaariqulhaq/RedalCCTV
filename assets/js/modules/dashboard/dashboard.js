(function (global) {
  global.CCTVFeatureModules = global.CCTVFeatureModules || {};
  global.CCTVFeatureModules.dashboard = {
    create: function createDashboard(api) {
      const { jobs, cameras, esc, badge } = api;
        function dashboard() {
          const divisions = ["Gerbang Utama", "Area Parkir", "Gudang A", "Gedung Produksi"]
            .map(name => [name, jobs.filter(job => job.divisi === name).length]);
          const chartMax = Math.max(1, ...divisions.map(([, count]) => count));
          const attention = [
            {
              job: jobs.find(j => j.id === "CCTV-LOG-0040"),
              id: "CCTV-LOG-0040",
              title: "CCTV-002 - Area Parkir",
              divisi: "Area Parkir",
              status: "Menunggu Review"
            },
            {
              job: jobs.find(j => j.status === "Perlu Tindak Lanjut"),
              id: "CCTV-LOG-0039",
              title: "CCTV-004 - Gedung Produksi",
              divisi: "Gedung Produksi",
              status: "Perlu Tindak Lanjut"
            }
          ];
          const activeCameras = cameras.filter(camera => /aktif/i.test(camera.kondisi) && !/mati|tidak aktif/i.test(camera.keterangan || "")).length;
          const inactiveCameras = cameras.length - activeCameras;
          return `<div class="page-heading"><div><h1>Dashboard CCTV</h1><p class="muted">Ringkasan kondisi perangkat dan pencatatan pemeliharaan CCTV.</p></div></div>
            <div class="grid grid-4 dashboard-stats">
              <div class="card dashboard-stat"><div class="stat-label">Total Pencatatan</div><div class="stat-value">${jobs.length}</div></div>
              <div class="card dashboard-stat"><div class="stat-label">Dalam Penanganan</div><div class="stat-value">${jobs.filter(j => j.status === "Dalam Proses").length}</div></div>
              <div class="card dashboard-stat"><div class="stat-label">Perlu Tindak Lanjut</div><div class="stat-value">${jobs.filter(j => j.status === "Perlu Tindak Lanjut").length}</div></div>
              <div class="card dashboard-stat"><div class="stat-label">Selesai</div><div class="stat-value">${jobs.filter(j => j.status === "Selesai").length}</div></div>
              <div class="card dashboard-stat"><div class="stat-label">Kamera Aktif</div><div class="stat-value">${activeCameras}</div></div>
              <div class="card dashboard-stat"><div class="stat-label">Kamera Tidak Aktif</div><div class="stat-value">${inactiveCameras}</div></div>
            </div>
            <div class="grid dashboard-panels">
              <section class="card dashboard-panel">
                <div class="dashboard-panel-heading"><h2>Grafik Pencatatan Berdasarkan Area</h2><select class="dashboard-period" aria-label="Periode"><option>Bulan Ini</option></select></div>
                <div class="dashboard-chart" role="img" aria-label="Grafik pencatatan berdasarkan area">${divisions.map(([name, count]) => `<div class="dashboard-chart-column"><span class="dashboard-chart-value">${count}</span><div class="dashboard-chart-bar" style="height:${Math.max(8, (count / chartMax) * 100)}%"></div><span class="dashboard-chart-label">${name}</span></div>`).join("")}</div>
              </section>
              <section class="card dashboard-panel">
                <div class="dashboard-panel-heading"><h2>Perlu Perhatian</h2></div>
                <div class="attention-list">${attention.map(item => `<article class="attention-item" ${item.job ? `onclick="rendalGo('pekerjaan-detail','${item.job.id}')"` : ""}><div class="attention-top"><span class="attention-id">${esc(item.id)}</span>${badge(item.status)}</div><p class="attention-title">${esc(item.title)}</p><p class="attention-division">${esc(item.divisi)}</p></article>`).join("")}</div>
              </section>
            </div>`;
        }
      return { dashboard };
    }
  };
})(window);
