(function (global) {
  global.CCTVFeatureModules = global.CCTVFeatureModules || {};
  // ============================================================
  // # FITUR: DASHBOARD CCTV
  // ============================================================
  global.CCTVFeatureModules.dashboard = {
    create: function createDashboard(api) {
      const { jobs, cameras, layouts, esc, badge } = api;
      // ============================================================
      // # KONFIGURASI: LABEL STATUS DAN BULAN
      // ============================================================
      const statuses = {
        normal: { label: "Normal", className: "green" },
        dalam_pemeriksaan: { label: "Dalam Pemeriksaan", className: "amber" },
        dalam_pengerjaan: { label: "Dalam Pengerjaan", className: "orange" },
        bermasalah: { label: "Bermasalah", className: "red" }
      };
      const monthNumbers = {
        jan: 0, januari: 0, feb: 1, februari: 1, mar: 2, maret: 2,
        apr: 3, april: 3, mei: 4, may: 4,         jun: 5, juni: 5,
        jul: 6, juli: 6, aug: 7, agu: 7, agustus: 7, sep: 8, september: 8,
        oct: 9, okt: 9, oktober: 9, nov: 10, november: 10, dec: 11, des: 11, desember: 11
      };

      // ============================================================
      // # DATA: REKAP STATUS, RIWAYAT, DAN TREN PEKERJAAN
      // ============================================================
      function parseDate(value) {
        if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
        const text = String(value || "").trim();
        let match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(text);
        if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
        if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
        match = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(text);
        if (match) {
          const month = monthNumbers[match[2].toLowerCase()];
          return month === undefined ? null : new Date(Number(match[3]), month, Number(match[1]));
        }
        const parsed = new Date(text);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      }

      function formatDate(value, parsed) {
        if (!parsed) return esc(value || "Tanggal tidak tersedia");
        return esc(parsed.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
      }

      function cameraNumberFromJob(job) {
        const match = /CAM-PARKIR-(\d{1,3})|CCTV[\s-]*(\d{1,3})/i.exec(String(job.title || ""));
        return match ? String(Number(match[1] || match[2])) : "";
      }

      function collectDashboardData() {
        const statusCounts = { normal: 0, dalam_pemeriksaan: 0, dalam_pengerjaan: 0, bermasalah: 0 };
        const camerasById = new Map(cameras.map(camera => [camera.id, camera]));
        const camerasByName = new Map(cameras.map(camera => [camera.name.toLowerCase(), camera]));
        const camerasByNumber = new Map();
        const layoutsById = new Map(layouts.map(layout => [layout.id, layout]));
        const historyByCamera = new Map();
        const issues = new Map();
        const areaCounts = new Map();
        cameras.forEach(camera => {
          const number = String(Number(camera.number));
          const numberedCameras = camerasByNumber.get(number) || [];
          numberedCameras.push(camera);
          camerasByNumber.set(number, numberedCameras);
          if (Object.prototype.hasOwnProperty.call(statusCounts, camera.status)) statusCounts[camera.status] += 1;
          const layout = layoutsById.get(camera.layout);
          const areaName = layout?.shortName || layout?.name || "Area tidak diketahui";
          if (!areaCounts.has(areaName)) areaCounts.set(areaName, { name: areaName, count: 0, firstCamera: camera });
          if (camera.status === "bermasalah") areaCounts.get(areaName).count += 1;
        });

        const cameraForJob = job => {
          if (typeof job.cameraId === "string" && camerasById.has(job.cameraId)) return camerasById.get(job.cameraId);
          const title = String(job.title || "");
          const explicitId = title.match(/CAM-[A-Z0-9-]+/i)?.[0];
          if (explicitId && camerasById.has(explicitId.toUpperCase())) return camerasById.get(explicitId.toUpperCase());
          const exactName = camerasByName.get(title.trim().toLowerCase());
          if (exactName) return exactName;
          const numbered = camerasByNumber.get(cameraNumberFromJob(job));
          return numbered?.length === 1 ? numbered[0] : null;
        };
        const orderedJobs = jobs.map((job, index) => ({
          job,
          index,
          date: parseDate(job.date),
          timestamp: parseDate(job.timestamp || job.createdAt || job.updatedAt)
        }))
          .sort((left, right) => {
            if (!left.date && !right.date) return left.index - right.index;
            if (!left.date) return 1;
            if (!right.date) return -1;
            return right.date - left.date
              || (right.timestamp || 0) - (left.timestamp || 0)
              || left.index - right.index;
          });
        orderedJobs.forEach(({ job, date }) => {
          const camera = cameraForJob(job);
          if (camera) {
            const history = historyByCamera.get(camera.id) || { camera, count: 0, latestIssue: "", latestDate: null };
            history.count += 1;
            if (!history.latestIssue && job.temuan) history.latestIssue = job.temuan;
            if (!history.latestDate && date) history.latestDate = date;
            historyByCamera.set(camera.id, history);
          }
          const issue = String(job.temuan || "").trim();
          if (issue) issues.set(issue, (issues.get(issue) || 0) + 1);
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const trendStart = new Date(today);
        trendStart.setDate(trendStart.getDate() - 29);
        const dailyCounts = new Map();
        orderedJobs.forEach(({ date }) => {
          if (!date) return;
          const jobDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          if (jobDate < trendStart || jobDate > today) return;
          const key = `${jobDate.getFullYear()}-${String(jobDate.getMonth() + 1).padStart(2, "0")}-${String(jobDate.getDate()).padStart(2, "0")}`;
          dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
        });
        const trend = Array.from({ length: 30 }, (_, index) => {
          const date = new Date(trendStart);
          date.setDate(trendStart.getDate() + index);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          return {
            key,
            date,
            count: dailyCounts.get(key) || 0,
            label: date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
            fullLabel: date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
          };
        });

        return {
          statusCounts,
          areas: [...areaCounts.values()],
          history: [...historyByCamera.values()].sort((left, right) => right.count - left.count || (right.latestDate || 0) - (left.latestDate || 0)),
          issues: [...issues.entries()].map(([name, count]) => ({ name, count })).sort((left, right) => right.count - left.count),
          trend,
          recentJobs: orderedJobs.slice(0, 5)
        };
      }

      // ============================================================
      // # RENDER: KOMPONEN RINGKASAN DASHBOARD
      // ============================================================
      function statusBadge(status) {
        const item = statuses[status] || { label: "Status tidak tersedia", className: "neutral" };
        return `<span class="dashboard-status-badge is-${item.className}">${esc(item.label)}</span>`;
      }

      function summaryCards(statusCounts) {
        const cards = [
          { label: "Total CCTV", value: cameras.length, key: "total", icon: "video", tone: "blue" },
          { label: "Normal", value: statusCounts.normal, key: "normal", icon: "circle-check", tone: "green" },
          { label: "Dalam Pemeriksaan", value: statusCounts.dalam_pemeriksaan, key: "dalam_pemeriksaan", icon: "search-check", tone: "amber" },
          { label: "Dalam Pengerjaan", value: statusCounts.dalam_pengerjaan, key: "dalam_pengerjaan", icon: "wrench", tone: "orange" },
          { label: "Bermasalah", value: statusCounts.bermasalah, key: "bermasalah", icon: "triangle-alert", tone: "red" }
        ];
        return `<section class="dashboard-summary-grid" aria-label="Ringkasan kondisi CCTV">${cards.map(card => `<article class="card dashboard-summary-card is-${card.tone}"><div class="dashboard-summary-icon"><i data-lucide="${card.icon}"></i></div><div><p>${card.label}</p><strong>${card.value.toLocaleString("id-ID")}</strong></div></article>`).join("")}</section>`;
      }

      function areaIssues(areas) {
        const max = Math.max(1, ...areas.map(area => area.count));
        return `<section class="card dashboard-panel"><div class="dashboard-section-heading"><div><h2>CCTV Bermasalah per Area</h2><p>Jumlah kamera dengan status bermasalah saat ini.</p></div></div>${areas.length ? `<div class="dashboard-area-list">${areas.map(area => `<button type="button" class="dashboard-area-row" onclick="rendalOpenMonitoringCamera('${esc(area.firstCamera.id)}')"><span class="dashboard-area-name">${esc(area.name)}</span><span class="dashboard-area-track"><span style="width:${area.count ? Math.max(5, area.count / max * 100) : 0}%"></span></span><strong>${area.count}</strong></button>`).join("")}</div>` : `<p class="dashboard-empty">Data area CCTV belum tersedia.</p>`}</section>`;
      }

      function topHistory(history) {
        const rows = history.filter(item => item.count > 0).slice(0, 5);
        return `<section class="card dashboard-panel"><div class="dashboard-section-heading"><div><h2>CCTV dengan Riwayat Gangguan Terbanyak</h2><p>Urutan berdasarkan jumlah pekerjaan yang tercatat, bukan penilaian kualitas.</p></div></div>${rows.length ? `<div class="dashboard-history-list">${rows.map(item => {
          const layout = layouts.find(entry => entry.id === item.camera.layout);
          return `<button type="button" class="dashboard-history-row" onclick="rendalOpenMonitoringCamera('${esc(item.camera.id)}')"><span class="dashboard-history-main"><strong>${esc(item.camera.name)}</strong><small>${esc(layout?.shortName || layout?.name || "Area tidak diketahui")}</small></span><span class="dashboard-history-issue">${esc(item.latestIssue || "Kendala tidak dicatat")}</span><span class="dashboard-history-count">${item.count} gangguan</span>${statusBadge(item.camera.status)}</button>`;
        }).join("")}</div>` : `<p class="dashboard-empty">Belum ada riwayat pekerjaan yang terhubung ke CCTV 35–57.</p>`}</section>`;
      }

      function issueTypes(issues) {
        const max = Math.max(1, ...issues.map(issue => issue.count));
        return `<section class="card dashboard-panel"><div class="dashboard-section-heading"><div><h2>Jenis Kendala CCTV</h2><p>Dikelompokkan berdasarkan teks kendala pada pencatatan.</p></div></div>${issues.length ? `<div class="dashboard-issue-list">${issues.slice(0, 5).map(issue => `<div class="dashboard-issue-row"><span>${esc(issue.name)}</span><div class="dashboard-area-track"><span style="width:${issue.count / max * 100}%"></span></div><strong>${issue.count}</strong></div>`).join("")}</div>` : `<p class="dashboard-empty">Belum ada kendala yang tercatat.</p>`}</section>`;
      }

      function incidentTrend(trend) {
        const totalIncidents = trend.reduce((total, day) => total + day.count, 0);
        const heading = `<div class="dashboard-section-heading"><div><h2>Tren Gangguan CCTV</h2><p>Jumlah gangguan berdasarkan pencatatan pekerjaan dalam 30 hari terakhir.</p></div></div>`;
        if (!totalIncidents) {
          return `<section class="card dashboard-panel">${heading}<div class="dashboard-trend-empty"><strong>Belum ada data gangguan</strong><span>Data tren akan muncul setelah pencatatan pekerjaan CCTV dilakukan.</span></div></section>`;
        }
        const max = Math.max(1, ...trend.map(day => day.count));
        return `<section class="card dashboard-panel">${heading}<div class="dashboard-trend-plot"><span class="dashboard-trend-y-label">Jumlah Gangguan</span><div class="dashboard-trend-scroll" role="region" aria-label="Grafik gangguan harian 30 hari terakhir"><div class="dashboard-trend-chart" role="img" aria-label="Jumlah gangguan per tanggal selama 30 hari terakhir">${trend.map(day => `<div class="dashboard-trend-column ${day.count ? "has-incidents" : "is-zero"}" title="${esc(`${day.fullLabel}: ${day.count} gangguan`)}"><strong>${day.count}</strong><span class="dashboard-trend-bar" style="height:${day.count ? Math.max(6, day.count / max * 100) : 0}%"></span><small>${esc(day.label)}</small></div>`).join("")}</div></div></div><div class="dashboard-trend-axis-label">Tanggal</div></section>`;
      }

      function latestJobs(items) {
        return `<section class="card dashboard-panel dashboard-latest-panel"><div class="dashboard-section-heading"><div><h2>Pekerjaan Terbaru</h2><p>Diurutkan berdasarkan tanggal pencatatan yang tersedia.</p></div><button type="button" class="dashboard-link" onclick="rendalGo('pekerjaan')">Lihat semua</button></div>${items.length ? `<div class="dashboard-latest-list">${items.map(({ job, date }) => `<button type="button" class="dashboard-latest-row" onclick="rendalGo('pekerjaan-detail','${esc(job.id)}')"><span class="dashboard-latest-icon"><i data-lucide="clipboard-list"></i></span><span class="dashboard-latest-main"><strong>${esc(job.title || "CCTV tidak disebutkan")}</strong><small>${esc(job.divisi || job.location || "Area tidak tersedia")} · ${esc(job.temuan || "Kendala tidak dicatat")}</small></span><span class="dashboard-latest-meta"><small>${formatDate(job.date, date)}</small>${badge(job.status || "Status tidak tersedia")}</span></button>`).join("")}</div>` : `<p class="dashboard-empty">Belum ada pekerjaan yang tercatat.</p>`}</section>`;
      }

      function dashboard() {
        const data = collectDashboardData();
        const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        return `<div class="page-heading dashboard-heading"><div><h1>Dashboard CCTV</h1><p class="muted">Ringkasan kondisi dan pekerjaan CCTV</p></div><span class="dashboard-today"><i data-lucide="calendar-days"></i>${esc(today)}</span></div>
          ${summaryCards(data.statusCounts)}
          <div class="dashboard-content-grid">${areaIssues(data.areas)}${topHistory(data.history)}${issueTypes(data.issues)}${incidentTrend(data.trend)}${latestJobs(data.recentJobs)}</div>`;
      }

      return { dashboard };
    }
  };
})(window);
