(function (global) {
  global.CCTVFeatureModules = global.CCTVFeatureModules || {};
  global.CCTVFeatureModules.dashboard = {
    create: function createDashboard(api) {
      const { jobs, esc, badge } = api;
        function dashboard() {
          const divisions = ["Gerbang Utama", "Area Parkir", "Gudang A", "Gedung Produksi"]
            .map(name => [name, jobs.filter(job => job.divisi === name).length]);
          const chartMax = Math.max(1, ...divisions.map(([, count]) => count));
          const attention = jobs
            .filter(job => job.status !== "Selesai")
            .slice(0, 3)
            .map(job => ({ job, id: job.id, title: job.title, divisi: job.divisi, status: job.status }));
          return `<div class="page-heading"><div><h1>Dashboard CCTV</h1><p class="muted">Ringkasan kondisi perangkat dan pencatatan pemeliharaan CCTV.</p></div></div>
            <div class="grid grid-4 dashboard-stats">
              <div class="card dashboard-stat"><div class="stat-label">Total Pencatatan</div><div class="stat-value">${jobs.length}</div></div>
              <div class="card dashboard-stat"><div class="stat-label">Dilaporkan</div><div class="stat-value">${jobs.filter(j => j.status === "Dilaporkan").length}</div></div>
              <div class="card dashboard-stat"><div class="stat-label">Dalam Pemeriksaan</div><div class="stat-value">${jobs.filter(j => j.status === "Dalam Pemeriksaan").length}</div></div>
              <div class="card dashboard-stat"><div class="stat-label">Dalam Pengerjaan</div><div class="stat-value">${jobs.filter(j => j.status === "Dalam Pengerjaan").length}</div></div>
              <div class="card dashboard-stat"><div class="stat-label">Selesai</div><div class="stat-value">${jobs.filter(j => j.status === "Selesai").length}</div></div>
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
