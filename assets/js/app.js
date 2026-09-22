(function () {
  let page = (location.pathname.split(/[\\/]/).pop() || "index.html").replace(".html", "");
  document.documentElement.dataset.app = "cctv";
  document.title = `${page === "dashboard" ? "Dashboard" : page === "pekerjaan" ? "Pencatatan CCTV" : "Monitor CCTV"} - Monitor CCTV`;
  if (page === "index" || page === "login") return;

  let currentUser = JSON.parse(localStorage.getItem("cctv_currentUser") || "null");
  if (!currentUser) {
    location.href = "login.html";
    return;
  }
  const pageRoles = {
    monitoring: ["Admin", "Staff", "Reviewer", "VP Manager"],
    pekerjaan: ["Admin", "Staff", "Reviewer"],
    "pekerjaan-detail": ["Admin", "Staff", "Reviewer"],
    "pekerjaan-form": ["Admin", "Staff"],
    approval: ["Reviewer", "VP Manager"],
    "approval-detail": ["Reviewer", "VP Manager"],
    laporan: ["Admin", "Reviewer", "VP Manager"],
    divisi: ["Admin"],
    personel: ["Admin"],
    kendaraan: ["Admin"],
    tools: ["Admin"]
  };
  if (pageRoles[page] && !pageRoles[page].includes(currentUser.role)) {
    location.href = "dashboard.html";
    return;
  }
  const seedJobs = [
    { id: "CCTV-LOG-0042", title: "CCTV-001 - Gerbang Utama", divisi: "Gerbang Utama", jenis: "Pemeriksaan", pic: "Andi Pratama", date: "13 Sep 2026", progress: 100, status: "Selesai", location: "Gerbang Utama", desc: "Pemeriksaan kondisi perangkat CCTV.", keterangan: "Perangkat kembali normal.", temuan: "Gambar kamera sempat tidak tampil.", tindakan: "Pemeriksaan kabel dan adaptor; perangkat kembali normal.", tools: ["Toolkit", "Multimeter"], personnel: [{ name: "Andi Pratama", role: "Petugas CCTV" }], photos: [], timeline: ["Pencatatan dibuat", "Pemeriksaan", "Tindakan", "Selesai"] },
    { id: "CCTV-LOG-0041", title: "CCTV-003 - Gudang A", divisi: "Gudang A", jenis: "Pemeliharaan", pic: "Budi Santoso", date: "12 Sep 2026", progress: 60, status: "Dalam Proses", location: "Gudang A", desc: "Pemeriksaan berkala perangkat CCTV.", keterangan: "Perlu pemantauan lanjutan.", temuan: "Gambar kamera buram.", tindakan: "Pembersihan lensa dan penjadwalan pemeriksaan lanjutan.", tools: ["Toolkit"], personnel: [], photos: [], timeline: ["Pencatatan dibuat", "Pemeriksaan"] },
    { id: "CCTV-LOG-0040", title: "CCTV-002 - Area Parkir", divisi: "Area Parkir", jenis: "Pemeriksaan", pic: "Rizal Maulana", date: "11 Sep 2026", progress: 80, status: "Menunggu Review", location: "Area Parkir", desc: "Pemeriksaan rutin kamera area parkir.", keterangan: "Menunggu review hasil pemeriksaan.", temuan: "Sudut pandang kamera bergeser.", tindakan: "Penyesuaian posisi kamera dan pengujian rekaman.", tools: ["Toolkit"], personnel: [{ name: "Rizal Maulana", role: "Petugas CCTV" }], photos: [], timeline: ["Pencatatan dibuat", "Pemeriksaan", "Tindakan"] },
    { id: "CCTV-LOG-0039", title: "CCTV-004 - Gedung Produksi", divisi: "Gedung Produksi", jenis: "Perbaikan", pic: "Siti Rahma", date: "10 Sep 2026", progress: 0, status: "Perlu Tindak Lanjut", location: "Gedung Produksi", desc: "Laporan gangguan perangkat CCTV.", keterangan: "Menunggu pemeriksaan teknisi jaringan.", temuan: "Tidak ada tampilan pada monitor.", tindakan: "Menunggu pemeriksaan teknisi jaringan.", tools: [], personnel: [{ name: "Siti Rahma", role: "Petugas CCTV" }], photos: [], timeline: ["Pencatatan dibuat"] }
  ];
  const seedBas = [
    { id: "BA-CCTV-0042", jobId: "CCTV-LOG-0042", title: "BA Pemeriksaan CCTV Gerbang Utama", divisi: "Gerbang Utama", date: "13 Sep 2026", author: "Andi Pratama", status: "Menunggu Approval", revision: "" },
    { id: "BA-CCTV-0040", jobId: "CCTV-LOG-0040", title: "BA Pemeriksaan CCTV Area Parkir", divisi: "Area Parkir", date: "11 Sep 2026", author: "Rizal Maulana", status: "Menunggu Review", revision: "" }
  ];
  const master = JSON.parse(localStorage.getItem("cctv_master") || "null") || {
    divisi: ["Divisi Munisi", "Divisi Senjata", "Divisi Kendaraan Khusus", "Divisi Rantaipasok", "Biro Umum", "HCM", "Divisi Mesin"],
    personel: ["Andi Pratama", "Budi Santoso", "Rizal Maulana", "Siti Rahma"],
    kendaraan: ["Isuzu", "Toyota Hilux", "Kendaraan Operasional 02"],
    tools: ["Toolkit", "Jack", "Torque wrench", "Multimeter", "Safety kit"],
    perangkat: (window.CCTVCameraCatalog || []).map(camera => `RIG-${String(camera.rig).padStart(3, "0")} - ${camera.lokasi}`)
  };
  const savedCameras = JSON.parse(localStorage.getItem("cctv_cameras") || "null");
  const cameras = savedCameras && savedCameras.length ? savedCameras : (window.CCTVCameraCatalog || []);
  const monitoringDevices = [
    { id: "CAM-001", name: "Gerbang Utama (Main Gate)", location: "Pos Utama Selatan", status: "online", ip: "192.0.2.101" },
    { id: "CAM-002", name: "Pos Pengamanan Selatan", location: "Gerbang Selatan", status: "online", ip: "192.0.2.102" },
    { id: "CAM-003", name: "Area Parkir Karyawan", location: "Zona Parkir Barat", status: "offline", ip: "192.0.2.103" },
    { id: "CAM-004", name: "Gudang Material A", location: "Kompleks Gudang", status: "maintenance", ip: "192.0.2.104" },
    { id: "CAM-005", name: "Gedung Direksi & Admin", location: "Ring 1 Administrasi", status: "online", ip: "192.0.2.105" },
    { id: "CAM-006", name: "Area Produksi Utama", location: "Pabrik Divisi Muatan", status: "online", ip: "192.0.2.106" },
    { id: "CAM-007", name: "Area Loading Dock", location: "Zona Logistik Keluar", status: "online", ip: "192.0.2.107" },
    { id: "CAM-008", name: "Pos Pengamanan Utara", location: "Akses Perimeter Utara", status: "online", ip: "192.0.2.108" },
    { id: "CAM-009", name: "Workshop & Divisi Tempa", location: "Gedung Bengkel Heavy", status: "offline", ip: "192.0.2.109" },
    { id: "CAM-010", name: "Jalan Akses Utama", location: "Koridor Jalur Truk", status: "online", ip: "192.0.2.110" },
    { id: "CAM-011", name: "Area Perimeter Timur", location: "Batas Area Timur", status: "online", ip: "192.0.2.111" },
    { id: "CAM-012", name: "Lapangan Tengah", location: "Area Terbuka Central", status: "online", ip: "192.0.2.112" },
    { id: "CAM-013", name: "Gedung Utilitas", location: "Zona Utilitas Utara", status: "online", ip: "192.0.2.113" },
    { id: "CAM-014", name: "Check Point Kendaraan", location: "Akses Kendaraan Barat", status: "online", ip: "192.0.2.114" }
  ];
  if (cameras.length && master.perangkat.length !== cameras.length) {
    master.perangkat = cameras.map(camera => `RIG-${String(camera.rig).padStart(3, "0")} - ${camera.lokasi}`);
  }
  let jobs = JSON.parse(localStorage.getItem("cctv_logs") || "null") || seedJobs;
  let bas = JSON.parse(localStorage.getItem("cctv_bas") || "null") || seedBas;
  const removedTemplateName = "Dewi Lestari";
  let dataChanged = false;
  jobs.forEach(job => {
    if (job.pic === removedTemplateName) {
      job.pic = "Budi Santoso";
      dataChanged = true;
    }
    if (Array.isArray(job.personnel)) {
      const personnel = job.personnel.filter(person => person.name !== removedTemplateName && person.name !== "Budi Santoso");
      if (personnel.length !== job.personnel.length) {
        job.personnel = personnel;
        dataChanged = true;
      }
    }
  });
  bas.forEach(ba => {
    if (ba.author === removedTemplateName) {
      ba.author = "Budi Santoso";
      dataChanged = true;
    }
  });
  if (master.personel.includes(removedTemplateName)) {
    master.personel = master.personel.filter(name => name !== removedTemplateName);
    dataChanged = true;
  }
  if (dataChanged) {
    localStorage.setItem("cctv_logs", JSON.stringify(jobs));
    localStorage.setItem("cctv_bas", JSON.stringify(bas));
    localStorage.setItem("cctv_master", JSON.stringify(master));
  }
  let selectedId = new URLSearchParams(location.search).get("id") || jobs[0].id;

  function save() {
    localStorage.setItem("cctv_logs", JSON.stringify(jobs));
    localStorage.setItem("cctv_bas", JSON.stringify(bas));
    localStorage.setItem("cctv_master", JSON.stringify(master));
    localStorage.setItem("cctv_cameras", JSON.stringify(cameras));
  }
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function statusClass(status) {
    const s = status.toLowerCase();
    if (s.includes("selesai") || s.includes("approved")) return "badge-green";
    if (s.includes("proses")) return "badge-blue";
    if (s.includes("review") || s.includes("approval")) return "badge-amber";
    if (s.includes("revisi")) return "badge-red";
    return "";
  }
  function badge(status) { return `<span class="badge ${statusClass(status)}">${esc(status)}</span>`; }
  function loadAsset(type, url) {
    return new Promise(resolve => {
      if (document.querySelector(`${type}[src="${url}"],${type}[href="${url}"]`)) return resolve();
      const node = document.createElement(type);
      if (type === "script") {
        node.src = url;
      } else {
        node.rel = "stylesheet";
        node.href = url;
      }
      node.onload = resolve;
      node.onerror = resolve;
      document.head.appendChild(node);
    });
  }
  function ensureMonitoringAssets() {
    return Promise.all([
      loadAsset("link", "../assets/css/monitoring.css"),
      loadAsset("link", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"),
      loadAsset("link", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"),
      loadAsset("script", "https://cdn.tailwindcss.com"),
      loadAsset("script", "../assets/js/monitoring-template.js"),
      loadAsset("script", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js")
    ]);
  }
  function go(target, id) {
    if (target === "monitoring" || page === "monitoring") {
      page = target;
      selectedId = id || selectedId;
      history.pushState({ page, id: selectedId }, "", `${location.pathname}${id ? `?id=${encodeURIComponent(id)}` : ""}`);
      ensureMonitoringAssets().then(render);
      return;
    }
    location.href = `../pages/${target}.html${id ? `?id=${encodeURIComponent(id)}` : ""}`;
  }
  function toast(message, type = "success") {
    const node = document.createElement("div");
    node.className = `toast toast-${type}`;
    node.innerHTML = `<i data-lucide="${type === "success" ? "check-circle-2" : "info"}"></i><span>${esc(message)}</span>`;
    document.body.appendChild(node);
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => node.remove(), 2600);
  }
  function logout() {
    localStorage.removeItem("cctv_currentUser");
    location.href = "login.html";
  }
  function isAllowedOnCurrentPage(role) {
    return !pageRoles[page] || pageRoles[page].includes(role);
  }
  function setPreviewRole(role) {
    const names = { Admin: "Admin CCTV", Staff: "Petugas CCTV", Reviewer: "Koordinator Review", "VP Manager": "Penanggung Jawab" };
    currentUser = { ...currentUser, name: names[role], role };
    localStorage.setItem("cctv_currentUser", JSON.stringify(currentUser));
    if (!isAllowedOnCurrentPage(role)) {
      location.href = "dashboard.html";
      return;
    }
    render();
  }
  function shell(content, active) {
    const nav = [
      ["dashboard", "Dashboard", "layout-dashboard", "Semua role"],
      ["monitoring", "Monitoring CCTV", "map", "Semua role"],
      ["pekerjaan", "Pencatatan CCTV", "clipboard-list", "Admin,Staff,Reviewer"],
      ["berita-acara", "Berita Acara", "file-text", "Admin,Staff,Reviewer,VP Manager"],
      ["approval", "Approval BA", "file-check", "Reviewer,VP Manager"],
      ["laporan", "Laporan", "bar-chart-3", "Admin,Reviewer,VP Manager"]
    ];
    const allowed = role => role === "Semua role" || role.split(",").includes(currentUser.role);
    const navHtml = nav.filter(item => allowed(item[3])).map(item => `<button class="nav-link ${active === item[0] ? "active" : ""}" onclick="rendalGo('${item[0]}')"><i data-lucide="${item[2]}" class="nav-icon"></i><span>${item[1]}</span></button>`).join("");
    const masterHtml = currentUser.role === "Admin" ? `<div class="nav-section">Pengaturan</div><button class="nav-link ${active === "master" ? "active" : ""}" onclick="rendalGo('tools')"><i data-lucide="camera" class="nav-icon"></i><span>Data Perangkat</span></button>` : "";
    return `<div class="app-shell"><aside class="sidebar" id="rendal-sidebar"><div class="brand"><span class="brand-mark">C</span><span class="brand-title">MONITOR CCTV</span><button class="mobile-menu" onclick="rendalToggleSidebar()" aria-label="Tutup menu"><i data-lucide="x"></i></button></div><nav class="nav">${navHtml}${masterHtml}</nav><div class="sidebar-footer"><strong>PT Pindad</strong><br><span>Pencatatan CCTV v1.0.0</span></div></aside><section class="main-area"><header class="topbar"><button class="mobile-menu" onclick="rendalToggleSidebar()" aria-label="Buka menu"><i data-lucide="menu"></i></button><div class="topbar-search"><i data-lucide="search"></i><input type="search" placeholder="Cari perangkat, kendala, atau petugas..." oninput="rendalGlobalSearch(this.value)"></div><span class="topbar-title">Monitor CCTV / ${esc(active.replace("-", " "))}</span><div class="topbar-actions"><button class="notification" type="button" aria-label="Notifikasi" onclick="rendalNotify()"><i data-lucide="bell"></i><span class="notification-count">3</span></button><span class="topbar-divider"></span><div class="profile-menu"><button class="user-chip" onclick="rendalToggleProfile(event)"><span class="avatar">${esc(currentUser.name.charAt(0))}</span><span>${esc(currentUser.name)}</span><i data-lucide="chevron-down" class="profile-chevron"></i></button><div class="profile-dropdown hidden" id="profile-dropdown"><p>Role Preview / Demo Mode</p><button onclick="rendalSetRole('Admin')">Admin CCTV</button><button onclick="rendalSetRole('Staff')">Petugas CCTV</button><button onclick="rendalSetRole('Reviewer')">Koordinator Review</button><button onclick="rendalSetRole('VP Manager')">Penanggung Jawab</button><button onclick="rendalLogout()">Keluar</button></div></div></div></header><main class="content">${content}</main></section></div>`;
  }
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
  function jobTable(rows) {
    const page = Number(window.jobPage || 1);
    const pageSize = 4;
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    window.jobPage = currentPage;
    const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const pagination = rows.length ? `<div class="jobs-pagination"><span>Menampilkan ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, rows.length)} dari ${rows.length} pekerjaan</span><div class="pagination-actions"><button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""} onclick="rendalSetJobPage(${currentPage - 1})" aria-label="Halaman sebelumnya"><i data-lucide="chevron-left"></i></button>${Array.from({ length: pageCount }, (_, i) => `<button class="pagination-btn ${i + 1 === currentPage ? "active" : ""}" onclick="rendalSetJobPage(${i + 1})">${i + 1}</button>`).join("")}<button class="pagination-btn" ${currentPage === pageCount ? "disabled" : ""} onclick="rendalSetJobPage(${currentPage + 1})" aria-label="Halaman berikutnya"><i data-lucide="chevron-right"></i></button></div></div>` : "";
    return `<div class="table-wrap jobs-table-wrap"><table class="jobs-table"><thead><tr><th>No</th><th>Tanggal</th><th>Perangkat</th><th>Kendala (Ringkas)</th><th>Petugas</th><th>Status</th></tr></thead><tbody>${pageRows.map((j, index) => { const device = String(j.title || "").split(" - "); const rig = device.shift() || "-"; const area = device.join(" - ") || "-"; return `<tr class="job-row" onclick="rendalGo('pekerjaan-detail','${j.id}')"><td data-label="No">${index + 1}</td><td data-label="Tanggal">${esc(j.date)}</td><td data-label="Perangkat"><button class="job-id-link" onclick="event.stopPropagation();rendalGo('pekerjaan-detail','${j.id}')"><strong>${esc(rig)}</strong><small>${esc(area)}</small></button></td><td data-label="Kendala (Ringkas)"><span class="job-issue">${esc(j.temuan || "-")}</span></td><td data-label="Petugas">${esc(j.pic)}</td><td data-label="Status">${badge(j.status)}</td></tr>`; }).join("") || "<tr><td colspan='6' class='jobs-empty'>Tidak ada data.</td></tr>"}</tbody></table></div>${pagination}`;
  }
  function jobsPage() {
    return `<div class="page-heading jobs-heading"><div><h1>Pencatatan CCTV</h1><p class="muted">Catat tanggal, perangkat, kendala, tindakan, petugas, dan keterangan.</p></div><button class="btn btn-primary jobs-new-btn" onclick="rendalNewJob()"><i data-lucide="plus"></i> Tambah Pencatatan</button></div><section class="card jobs-card"><div class="jobs-toolbar"><label class="jobs-search"><i data-lucide="search"></i><input id="job-search" placeholder="Cari perangkat, kendala, petugas..." oninput="rendalFilterJobs()"></label><button class="btn jobs-filter-btn" type="button" onclick="rendalToggleJobFilters()"><i data-lucide="filter"></i> Filter</button></div><div class="jobs-filters hidden" id="job-filters"><select class="field" id="job-status" onchange="rendalFilterJobs()"><option value="">Semua status</option><option>Dalam Proses</option><option>Menunggu Review</option><option>Menunggu Approval</option><option>Selesai</option><option>Perlu Tindak Lanjut</option></select><select class="field" id="job-period" onchange="rendalFilterJobs()"><option value="">Semua periode</option><option value="month">Bulan ini</option><option value="week">7 hari terakhir</option></select></div><div id="job-table">${jobTable(jobs)}</div></section>`;
  }
  function detailPhotoMarkup(job, photo, index) {
    const image = job.photoImages?.find(item => item.caption === photo);
    return `<div><div class="photo detail-photo">${image?.src ? `<img src="${esc(image.src)}" alt="${esc(image.caption || photo)}">` : `<i data-lucide="camera"></i><span>Foto Dummy</span>`}<button class="photo-delete-btn" onclick="event.stopPropagation();rendalDeletePhoto('${job.id}','${encodeURIComponent(photo)}')" aria-label="Hapus foto ${esc(photo)}"><i data-lucide="trash-2"></i></button></div><small>${esc(image?.caption || photo)}</small></div>`;
  }
  function detailPage() {
    const job = jobs.find(j => j.id === selectedId) || jobs[0];
    const ba = bas.find(item => item.jobId === job.id);
    return `<div class="detail-header"><div><button class="back-link" onclick="rendalGo('pekerjaan')"><i data-lucide="arrow-left"></i></button><h1>${esc(job.title)}</h1><div class="detail-meta"><span><i data-lucide="file-text"></i>${esc(job.id)}</span><span><i data-lucide="map-pin"></i>${esc(job.divisi)}</span><span><i data-lucide="calendar-days"></i>${esc(job.date)}</span>${badge(job.status)}</div></div><div class="detail-actions"><button class="btn detail-edit" onclick="rendalEditJob('${job.id}')">Edit Data</button>${ba ? `<button class="btn btn-primary" onclick="rendalGo('berita-acara-detail','${ba.id}')">Lihat BA</button>` : ""}${currentUser.role === "Staff" || currentUser.role === "Admin" ? `<button class="btn btn-primary" onclick="rendalCreateBA('${job.id}')">Buat / Ajukan BA</button>` : ""}</div></div><div class="detail-layout"><div class="detail-content-grid"><section class="card detail-info-card"><h2>Detail Pencatatan</h2><div class="detail-info-grid"><div><h4>Kendala</h4><p class="detail-callout warning">${esc(job.temuan || "-")}</p></div><div><h4>Tindakan</h4><p class="detail-callout success">${esc(job.tindakan || "-")}</p></div><div class="detail-info-wide"><h4>Keterangan</h4><p>${esc(job.keterangan || job.desc || "-")}</p></div></div></section><div class="detail-small-cards"><section class="card detail-list-card"><div class="detail-card-heading"><h2>Peralatan</h2><button onclick="rendalAddTool('${job.id}')" aria-label="Tambah peralatan"><i data-lucide="plus"></i></button></div>${job.tools.map(tool => `<div class="detail-list-item"><i data-lucide="wrench"></i>${esc(tool)}</div>`).join("")}</section><section class="card detail-list-card"><div class="detail-card-heading"><h2>Personel</h2><button onclick="rendalAddPerson('${job.id}')" aria-label="Tambah personel"><i data-lucide="plus"></i></button></div>${job.personnel.map(person => `<div class="person-item"><span class="person-avatar"><i data-lucide="user-round"></i></span><span>${esc(person.name)}<small>${esc(person.role)}</small></span></div>`).join("")}</section></div><section class="card detail-doc-card"><div class="detail-card-heading"><h2>Dokumentasi</h2><button onclick="rendalAddPhoto('${job.id}')"><i data-lucide="camera"></i> Tambah Foto</button></div><div class="detail-gallery">${job.photos.map((photo, index) => detailPhotoMarkup(job, photo, index)).join("")}</div></section></div></div>`;
  }
  function baTable(rows) {
    return `<div class="table-wrap jobs-table-wrap"><table class="jobs-table ba-table"><thead><tr><th>Nomor BA</th><th>Kegiatan &amp; Divisi</th><th>Tanggal</th><th>Dibuat oleh</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${rows.map(b => `<tr class="job-row" onclick="rendalGo('berita-acara-detail','${b.id}')"><td><button class="job-id-link" onclick="event.stopPropagation();rendalGo('berita-acara-detail','${b.id}')">${esc(b.id)}</button></td><td><div class="job-title">${esc(b.title)}</div><div class="job-division">${esc(b.divisi)}</div></td><td>${esc(b.date)}</td><td>${esc(b.author)}</td><td>${badge(b.status)}</td><td><button class="job-action" aria-label="Lihat ${esc(b.id)}" onclick="event.stopPropagation();rendalGo('berita-acara-detail','${b.id}')"><i data-lucide="chevron-right"></i></button></td></tr>`).join("") || "<tr><td colspan='6' class='jobs-empty'>Tidak ada data.</td></tr>"}</tbody></table></div>`;
  }
  function baPage() {
    return `<div class="page-heading jobs-heading"><div><h1>Daftar Berita Acara</h1><p class="muted">Kelola dan pantau seluruh berita acara pekerjaan.</p></div></div><section class="card jobs-card"><div class="jobs-toolbar"><label class="jobs-search"><i data-lucide="search"></i><input id="ba-search" placeholder="Cari nomor BA, kegiatan, atau divisi..." oninput="rendalFilterBA(this.value)"></label></div><div id="ba-table">${baTable(bas)}</div></section>`;
  }
  function baDocumentNumber(ba) {
    if (ba.documentNumber) return ba.documentNumber;
    const match = String(ba.id || "").match(/(\d+)$/);
    const sequence = String(Number(match ? match[1] : 1)).padStart(3, "0");
    const year = new Date().getFullYear();
    const month = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][new Date().getMonth()];
    return `BA/${sequence}/PA/FIK-SUS/${month}/${year}`;
  }
  function baDateParts(value) {
    const raw = String(value || "").trim();
    const slashDate = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const date = slashDate
      ? new Date(Number(slashDate[3]), Number(slashDate[2]) - 1, Number(slashDate[1]))
      : new Date(value);
    if (Number.isNaN(date.getTime())) return { full: value, day: "-", month: "-", year: "-" };
    return {
      full: date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      day: date.toLocaleDateString("id-ID", { day: "numeric" }),
      month: date.toLocaleDateString("id-ID", { month: "long" }),
      year: date.toLocaleDateString("id-ID", { year: "numeric" })
    };
  }
  function baLogoMarkup() {
    return `<img class="ba-header-image" src="../assets/images/ba-header.png?v=20260921" alt="Kop surat PT Pindad dan Danantara">`;
  }
  function baFooterMarkup() {
    return `<footer class="ba-document-footer"><img src="../assets/images/ba-footer.png" alt="Alamat dan sertifikasi PT Pindad"></footer>`;
  }
  function baPhotosMarkup(job) {
    const images = job.photoImages || [];
    const photos = job.photos.map(caption => images.find(image => image.caption === caption) || { caption });
    return photos.map(photo => `<figure class="ba-photo">${photo.src ? `<img src="${esc(photo.src)}" alt="${esc(photo.caption)}">` : `<div class="ba-photo-placeholder"><i data-lucide="camera"></i><span>Foto dokumentasi</span></div>`}<figcaption>${esc(photo.caption)}</figcaption></figure>`).join("");
  }
  function baDetailPage() {
    const ba = bas.find(b => b.id === selectedId) || bas[0];
    const job = jobs.find(j => j.id === ba.jobId) || jobs[0];
    const date = baDateParts(ba.date);
    const activity = job.title || "Pekerjaan";
    const personnel = job.personnel || [];
    const coordinator = personnel.find(person => /koordinator/i.test(person.role)) || { name: currentUser.name, role: "Petugas CCTV" };
    const jm = personnel.find(person => /jm|pamik|rescue/i.test(person.role)) || { name: "................................", role: "JM PAMFIK & RESCUE" };
    const actionButtons = `<div class="ba-screen-actions"><button class="btn" onclick="window.print()">Print / PDF</button>${currentUser.role === "Reviewer" && ba.status === "Menunggu Review" ? `<button class="btn btn-primary" onclick="rendalForward('${ba.id}')">Teruskan ke VP Manager</button><button class="btn btn-danger" onclick="rendalRevision('${ba.id}')">Kembalikan Revisi</button>` : ""}${currentUser.role === "VP Manager" && ba.status === "Menunggu Approval" ? `<button class="btn btn-success" onclick="rendalApprove('${ba.id}')">Approve</button><button class="btn btn-danger" onclick="rendalRevision('${ba.id}')">Minta Revisi</button>` : ""}</div>`;
    return `<div class="ba-detail-toolbar"><button class="btn" onclick="rendalGo('berita-acara')">Kembali</button>${badge(ba.status)}${actionButtons}</div><div class="ba-document">
      <section class="ba-paper ba-paper-main"><header class="ba-document-header">${baLogoMarkup()}</header><div class="ba-document-title"><h1>BERITA ACARA ${esc(activity).toUpperCase()}</h1><p>Nomor : <u>${esc(baDocumentNumber(ba))}</u></p></div>
      <div class="ba-body"><p>1. Berdasarkan tugas dan tanggung jawab perihal pengecekan petugas CCTV.</p><p>2. Pada hari ini, <strong>${esc(date.full)}</strong> telah selesai menyelesaikan pencatatan perangkat <strong>${esc(activity)}</strong>, dengan uraian sebagai berikut :</p>
      <table class="ba-form-table ba-process-table"><thead><tr><th>No</th><th>Tanggal</th><th>Nama Perangkat</th><th>Kendala</th><th>Tindakan</th></tr></thead><tbody><tr><td>1</td><td>${esc(date.full)}</td><td>${esc(activity)}</td><td>${esc(job.temuan || "-")}</td><td>${esc(job.tindakan || "-")}</td></tr></tbody></table>
      <h3 class="ba-section-title">Daftar Personel</h3><table class="ba-form-table ba-personnel-table"><thead><tr><th>No</th><th>Nama</th><th>NPP</th><th>Peran / Tugas</th></tr></thead><tbody>${personnel.map((person, index) => `<tr><td>${index + 1}</td><td>${esc(person.name || "-")}</td><td>${esc(person.npp || "-")}</td><td>${esc(person.role || "-")}</td></tr>`).join("") || "<tr><td colspan='4'>Belum ada personel.</td></tr>"}</tbody></table>
      <p class="ba-closing">Demikian berita acara pencatatan CCTV ini dibuat dengan sebenar-benarnya, atas perhatiannya saya ucapkan terima kasih.</p><div class="ba-signatures"><div><strong>Mengetahui</strong><strong>${esc(jm.role)}</strong><div class="ba-signature-space"></div><u>${esc(jm.name)}</u></div><div><p>Bandung, ${esc(date.full)}</p><strong>${esc(coordinator.role)}</strong><div class="ba-signature-space"></div><u>${esc(coordinator.name)}</u></div></div></div>${baFooterMarkup()}</section>
      <section class="ba-paper ba-paper-attachment"><header class="ba-document-header">${baLogoMarkup()}</header><div class="ba-attachment-meta"><div><strong>Lampiran</strong> : ${esc(activity)}<br><strong>Nomor</strong> : ${esc(baDocumentNumber(ba))}<br><strong>Tanggal</strong> : ${esc(date.full)}</div></div><h2>DOKUMENTASI ${esc(activity).toUpperCase()}</h2><div class="ba-photo-grid">${baPhotosMarkup(job) || "<p class='muted'>Belum ada dokumentasi foto.</p>"}</div><div class="ba-attachment-signatures"><div><strong>Mengetahui</strong><br><strong>${esc(jm.role)}</strong><div class="ba-signature-space"></div><u>${esc(jm.name)}</u></div><div><p>Bandung, ${esc(date.full)}</p><strong>Petugas CCTV</strong><div class="ba-signature-space"></div><u>${esc(coordinator.name)}</u></div></div>${baFooterMarkup()}</section></div>`;
  }
  function approvalPage() {
    const pending = bas.filter(b => b.status === "Menunggu Review" || b.status === "Menunggu Approval");
    return `<div class="page-heading"><div><h1>Approval BA</h1><p class="muted">Dokumen yang memerlukan tindakan sesuai role Anda.</p></div></div><div class="grid grid-2">${pending.map(b => `<section class="card"><h3>${esc(b.id)}</h3><p>${esc(b.title)}</p><p class="muted">${esc(b.divisi)} · Diajukan ${esc(b.date)}</p><p>${badge(b.status)}</p><button class="btn btn-primary" onclick="rendalGo('berita-acara-detail','${b.id}')">Lihat BA</button></section>`).join("") || `<section class="card"><p>Tidak ada dokumen yang menunggu tindakan.</p></section>`}</div>`;
  }
  function reportsPage() {
    return `<div class="page-heading"><div><h1>Laporan</h1><p class="muted">Ringkasan pekerjaan berdasarkan data prototype.</p></div><button class="btn" onclick="window.print()">Export PDF / Print</button></div><div class="grid grid-4"><div class="card"><div class="stat-label">Total pekerjaan</div><div class="stat-value">${jobs.length}</div></div><div class="card"><div class="stat-label">Selesai</div><div class="stat-value">${jobs.filter(j => j.status === "Selesai").length}</div></div><div class="card"><div class="stat-label">Belum selesai</div><div class="stat-value">${jobs.filter(j => j.status !== "Selesai").length}</div></div><div class="card"><div class="stat-label">Divisi aktif</div><div class="stat-value">${new Set(jobs.map(j => j.divisi)).size}</div></div></div><section class="card" style="margin-top:1rem"><h3>Rekap pekerjaan</h3>${jobTable(jobs)}</section>`;
  }
  function masterPage() {
    const key = page === "personel" ? "personel" : page === "kendaraan" ? "kendaraan" : page === "tools" ? "perangkat" : "divisi";
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    if (key === "perangkat") {
      const query = String(window.masterDeviceSearch || "").toLowerCase();
      const statusFilter = window.masterDeviceStatus || "";
      const statusLabel = { online: "Online", offline: "Offline", maintenance: "Maintenance" };
      const filtered = monitoringDevices.filter(camera => {
        const haystack = `${camera.id} ${camera.name} ${camera.location} ${camera.ip}`.toLowerCase();
        return (!query || haystack.includes(query)) && (!statusFilter || camera.status === statusFilter);
      });
      const cameraRows = filtered.map((camera, index) => {
        const statusClass = camera.status === "online" ? "badge-green" : camera.status === "offline" ? "badge-red" : "badge-amber";
        return `<tr><td>${String(index + 1).padStart(2, "0")}</td><td><strong>${camera.id}</strong></td><td>${esc(camera.name)}</td><td>${esc(camera.location)}</td><td><span class="badge ${statusClass}">${statusLabel[camera.status]}</span></td><td class="device-ip">${camera.ip}</td><td><button class="btn btn-secondary" onclick="rendalGo('monitoring','${camera.id}')"><i data-lucide="eye"></i> Detail / Live</button></td></tr>`;
      }).join("") || "<tr><td colspan='7' class='jobs-empty'>Tidak ada perangkat yang sesuai.</td></tr>";
      return `<div class="page-heading"><div><h1>Daftar Perangkat &amp; Unit CCTV</h1><p class="muted">Daftar lengkap titik pemantauan CCTV internal area simulasi.</p></div></div><section class="card device-inventory-card"><div class="device-inventory-heading"><div><h2>Inventaris &amp; Status Perangkat CCTV</h2><p class="muted">Kelola dan pantau status perangkat CCTV pada area simulasi.</p></div><div class="device-inventory-filters"><input id="device-search" type="search" value="${esc(window.masterDeviceSearch || "")}" placeholder="Cari perangkat..." oninput="rendalFilterDevices(this.value)"><select id="device-status" onchange="rendalFilterDeviceStatus(this.value)" aria-label="Filter status"><option value="">Semua status</option><option value="online" ${statusFilter === "online" ? "selected" : ""}>Online</option><option value="offline" ${statusFilter === "offline" ? "selected" : ""}>Offline</option><option value="maintenance" ${statusFilter === "maintenance" ? "selected" : ""}>Maintenance</option></select></div></div><div class="table-wrap device-inventory-table"><table><thead><tr><th>No</th><th>Kode CAM</th><th>Nama Perangkat</th><th>Lokasi Area</th><th>Status</th><th>IP Address (Dummy)</th><th>Aksi</th></tr></thead><tbody>${cameraRows}</tbody></table></div></section>`;
    }
    const cameraRows = master[key].map((item, i) => `<tr><td>${i + 1}</td><td>${esc(item)}</td><td><button class="btn btn-danger" onclick="rendalDeleteMaster('${key}',${i})">Hapus</button></td></tr>`).join("");
    return `<div class="page-heading"><div><h1>Data ${label}</h1><p class="muted">Kelola data master ${label.toLowerCase()}.</p></div></div><section class="card"><div class="table-wrap"><table><thead><tr><th>#</th><th>Nama</th><th>Aksi</th></tr></thead><tbody>${cameraRows}</tbody></table></div></section>`;
  }
  function render() {
    let content; let active = page;
    if (page === "dashboard") content = dashboard();
    else if (page === "monitoring") content = window.monitoringTemplate || `<div class="page-placeholder">Template monitoring sedang dimuat...</div>`;
    else if (page === "pekerjaan") content = jobsPage();
    else if (page === "pekerjaan-detail") { content = detailPage(); active = "pekerjaan"; }
    else if (page === "pekerjaan-form") { content = jobsPage(); active = "pekerjaan"; }
    else if (page === "berita-acara") content = baPage();
    else if (page === "berita-acara-detail" || page === "approval-detail") { content = baDetailPage(); active = page === "approval-detail" ? "approval" : "berita-acara"; }
    else if (page === "approval") content = approvalPage();
    else if (page === "laporan") content = reportsPage();
    else content = masterPage();
    document.body.innerHTML = shell(content, active);
    if (window.lucide) window.lucide.createIcons();
    if (page === "monitoring" && window.initMonitoringView) {
      window.initMonitoringView();
      if (selectedId && window.openCctvModal) window.openCctvModal(selectedId);
    }
  }
  window.rendalGo = (target, id) => go(target, id);
  window.rendalLogout = logout;
  window.rendalToggleSidebar = () => document.getElementById("rendal-sidebar")?.classList.toggle("is-open");
  window.rendalToggleProfile = event => {
    event.stopPropagation();
    document.getElementById("profile-dropdown")?.classList.toggle("hidden");
  };
  window.rendalSetRole = role => setPreviewRole(role);
  window.rendalNotify = () => toast("Tidak ada notifikasi baru.");
  window.addEventListener("popstate", () => {
    page = history.state?.page || "dashboard";
    selectedId = history.state?.id || selectedId;
    if (page === "monitoring") ensureMonitoringAssets().then(render);
    else render();
  });
  document.addEventListener("click", event => {
    if (!event.target.closest(".profile-menu")) document.getElementById("profile-dropdown")?.classList.add("hidden");
  });
  window.rendalGlobalSearch = value => {
    if (page === "pekerjaan") {
      const input = document.getElementById("job-search");
      if (input) { input.value = value; window.rendalFilterJobs(); }
    } else if (page === "berita-acara") {
      const input = document.getElementById("ba-search");
      if (input) { input.value = value; window.rendalFilterBA(value); }
    } else if (page === "tools") {
      const input = document.getElementById("device-search");
      if (input) { input.value = value; window.rendalFilterDevices(value); }
    }
  };
  window.rendalFilterDevices = value => {
    window.masterDeviceSearch = String(value || "");
    render();
  };
  window.rendalFilterDeviceStatus = value => {
    window.masterDeviceStatus = String(value || "");
    render();
  };
  window.rendalFilterJobs = () => {
    const search = (document.getElementById("job-search")?.value || "").toLowerCase();
    const status = document.getElementById("job-status")?.value || "";
    const period = document.getElementById("job-period")?.value || "";
    const now = new Date();
    const rows = jobs.filter(j => {
      const date = new Date(j.date);
      const days = (now - date) / 86400000;
      return (!search || `${j.id} ${j.title} ${j.pic} ${j.temuan} ${j.tindakan} ${j.keterangan}`.toLowerCase().includes(search))
        && (!status || j.status === status)
        && (!period || (period === "week" ? days >= 0 && days <= 7 : date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()));
    });
    if (!window.keepJobPage) window.jobPage = 1;
    window.keepJobPage = false;
    document.getElementById("job-table").innerHTML = jobTable(rows);
    if (window.lucide) window.lucide.createIcons();
  };
  window.rendalSetJobPage = pageNumber => {
    window.jobPage = pageNumber;
    window.keepJobPage = true;
    window.rendalFilterJobs();
  };
  window.rendalToggleJobFilters = () => document.getElementById("job-filters")?.classList.toggle("hidden");
  window.rendalFilterBA = value => {
    const search = String(value || "").toLowerCase();
    const rows = bas.filter(b => `${b.id} ${b.title} ${b.divisi} ${b.author}`.toLowerCase().includes(search));
    const table = document.getElementById("ba-table");
    if (table) table.innerHTML = baTable(rows);
  };
  window.rendalNewJob = () => {
    document.getElementById("new-job-modal")?.remove();
    const modal = document.createElement("div");
    modal.id = "new-job-modal";
    modal.className = "modal-backdrop new-job-backdrop";
    modal.innerHTML = `<section class="modal new-job-modal" role="dialog" aria-modal="true" aria-labelledby="new-job-title"><div class="new-job-header"><h2 id="new-job-title">Tambah Pencatatan CCTV</h2><button class="modal-close" type="button" onclick="rendalCloseNewJob()" aria-label="Tutup"><i data-lucide="x"></i></button></div><form id="new-job-form" class="new-job-form"><label>Tanggal<input name="date" type="date" required value="${new Date().toISOString().slice(0, 10)}"></label><label>Nama Perangkat<input name="title" required placeholder="Ketik nama perangkat CCTV"></label><label>Kendala<textarea name="temuan" rows="3" required placeholder="Tuliskan kendala atau temuan..."></textarea></label><label>Tindakan<textarea name="tindakan" rows="3" placeholder="Tuliskan tindakan yang dilakukan..."></textarea></label><label>Petugas<input name="pic" required placeholder="Nama petugas"></label><div class="new-job-actions"><button class="btn" type="button" onclick="rendalCloseNewJob()">Batal</button><button class="btn btn-primary" type="submit">Simpan Pencatatan</button></div></form></section>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", event => { if (event.target === modal) window.rendalCloseNewJob(); });
    modal.querySelector("form").addEventListener("submit", event => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const dateInput = String(formData.get("date") || "").trim();
      const title = String(formData.get("title") || "").trim();
      const temuan = String(formData.get("temuan") || "").trim();
      const tindakan = String(formData.get("tindakan") || "").trim();
      const pic = String(formData.get("pic") || "").trim();
      const division = title.includes(" - ") ? title.split(" - ").slice(1).join(" - ") : title;
      if (!title || !temuan || !pic) return;
      jobs.unshift({ ...seedJobs[1], id: `CCTV-LOG-${String(Date.now()).slice(-4)}`, title, divisi: division, pic, personnel: [], temuan, tindakan: tindakan || "Belum ada tindakan", keterangan: "-", desc: "-", status: "Dalam Proses", progress: 0, date: dateInput ? new Date(`${dateInput}T00:00:00`).toLocaleDateString("id-ID") : new Date().toLocaleDateString("id-ID") });
      save();
      window.rendalCloseNewJob();
      render();
      toast("Pencatatan CCTV berhasil ditambahkan.");
    });
    if (window.lucide) window.lucide.createIcons();
    modal.querySelector('input[name="title"]').focus();
  };
  window.rendalCloseNewJob = () => document.getElementById("new-job-modal")?.remove();
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") window.rendalCloseNewJob?.();
    if (event.key === "Escape") window.rendalCloseDetailModal?.();
  });
  window.rendalCreateBA = id => {
    const job = jobs.find(j => j.id === id);
    if (!job) {
      toast("Data pekerjaan tidak ditemukan.", "info");
      return;
    }
    const submittedDate = new Date().toLocaleDateString("id-ID");
    const existing = bas.find(b => b.jobId === id);
    if (existing) {
      existing.title = `Berita Acara ${job.title}`;
      existing.divisi = job.divisi;
      existing.date = submittedDate;
      existing.author = currentUser.name;
      existing.status = "Menunggu Review";
      existing.revision = "";
    } else {
      bas.unshift({
        id: `BA-2026-${String(Date.now()).slice(-6)}`,
        jobId: id,
        title: `Berita Acara ${job.title}`,
        divisi: job.divisi,
        date: submittedDate,
        author: currentUser.name,
        status: "Menunggu Review",
        revision: ""
      });
    }
    job.status = "Menunggu Review";
    job.progress = Math.max(job.progress, 90);
    save();
    toast("BA dibuat dan diajukan untuk review.");
    go("berita-acara");
  };
  function detailModal(title, body, submitLabel, onSubmit, wide) {
    document.getElementById("detail-action-modal")?.remove();
    const modal = document.createElement("div");
    modal.id = "detail-action-modal";
    modal.className = "modal-backdrop";
    modal.innerHTML = `<section class="modal detail-action-modal ${wide ? "detail-action-modal-wide" : ""}" role="dialog" aria-modal="true"><div class="new-job-header"><h2>${title}</h2><button class="modal-close" type="button" onclick="rendalCloseDetailModal()" aria-label="Tutup"><i data-lucide="x"></i></button></div><form class="new-job-form">${body}<div class="new-job-actions"><button class="btn" type="button" onclick="rendalCloseDetailModal()">Batal</button><button class="btn btn-primary" type="submit">${submitLabel}</button></div></form></section>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", event => { if (event.target === modal) window.rendalCloseDetailModal(); });
    modal.querySelector("form").addEventListener("submit", event => { event.preventDefault(); onSubmit(new FormData(event.currentTarget)); });
    if (window.lucide) window.lucide.createIcons();
    modal.querySelector("input, textarea")?.focus();
    return modal;
  }
  window.rendalCloseDetailModal = () => document.getElementById("detail-action-modal")?.remove();
  window.rendalEditJob = id => {
    const job = jobs.find(item => item.id === id);
    if (!job) return;
    detailModal("Edit Pencatatan CCTV", `<label>Nama Perangkat<input name="title" value="${esc(job.title)}" required></label><label>Kendala<textarea name="temuan" rows="3">${esc(job.temuan)}</textarea></label><label>Tindakan<textarea name="tindakan" rows="3">${esc(job.tindakan)}</textarea></label>`, "Simpan Perubahan", form => { job.title = String(form.get("title") || "").trim() || job.title; job.temuan = String(form.get("temuan") || "").trim(); job.tindakan = String(form.get("tindakan") || "").trim(); save(); window.rendalCloseDetailModal(); render(); toast("Pencatatan CCTV diperbarui."); }, true);
  };
  window.rendalAddTool = id => detailModal("Tambah Peralatan", `<label>Nama Peralatan<input name="tool" required placeholder="Contoh: Mesin Las 900W"></label>`, "Tambah", form => { const job = jobs.find(item => item.id === id); const tool = String(form.get("tool") || "").trim(); if (!job || !tool) return; job.tools.push(tool); save(); window.rendalCloseDetailModal(); render(); toast("Peralatan ditambahkan."); });
  window.rendalAddPerson = id => detailModal("Tambah Personel", `<label>Nama<input name="name" required placeholder="Nama lengkap"></label><label>NPP<input name="npp" required placeholder="Nomor Pokok Pegawai"></label><label>Peran / Tugas<input name="role" required placeholder="Contoh: Petugas CCTV"></label>`, "Tambah", form => { const job = jobs.find(item => item.id === id); const name = String(form.get("name") || "").trim(); const npp = String(form.get("npp") || "").trim(); const role = String(form.get("role") || "").trim(); if (!job || !name || !npp || !role) return; job.personnel.push({ name, npp, role }); save(); window.rendalCloseDetailModal(); render(); toast("Personel ditambahkan."); });
  window.rendalDeletePhoto = (id, encodedCaption) => {
    const job = jobs.find(item => item.id === id);
    const caption = decodeURIComponent(encodedCaption);
    if (!job || !job.photos.includes(caption)) return;
    if (!confirm("Hapus foto ini?")) return;
    job.photoImages = (job.photoImages || []).filter(item => item.caption !== caption);
    job.photos = job.photos.filter(item => item !== caption);
    save();
    render();
    toast("Foto berhasil dihapus.");
  };
  window.rendalAddPhoto = id => {
    let imageData = "";
    let originalImage = null;
    const modal = detailModal("Tambah Dokumentasi Foto", `<label class="photo-upload-box" for="photo-file"><i data-lucide="cloud-upload"></i><span>Klik untuk upload foto</span><input id="photo-file" name="photo" type="file" accept="image/*" required></label><div class="photo-crop-editor hidden" id="photo-crop-editor"><div class="crop-stage"><img id="crop-preview" alt="Preview foto"><div class="crop-selection"><span class="crop-handle crop-handle-nw"></span><span class="crop-handle crop-handle-ne"></span><span class="crop-handle crop-handle-sw"></span><span class="crop-handle crop-handle-se"></span></div></div><small>Geser kotak untuk memilih area foto, atau tarik sudutnya untuk mengubah ukuran.</small><button type="button" class="btn crop-apply-btn" id="apply-crop">Terapkan Crop</button></div><label>Keterangan Foto<input name="caption" required placeholder="Contoh: Retak pada pondasi tiang"></label>`, "Simpan Foto", form => { const job = jobs.find(item => item.id === id); const caption = String(form.get("caption") || "").trim(); if (!job || !caption || !imageData) { toast("Pilih gambar dan isi keterangannya.", "info"); return; } job.photoImages = job.photoImages || []; job.photoImages.push({ src: imageData, caption }); job.photos.push(caption); save(); window.rendalCloseDetailModal(); render(); toast("Dokumentasi foto berhasil disimpan."); });
    modal.querySelector("#photo-file").addEventListener("change", event => {
      const file = event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) { toast("File harus berupa gambar.", "info"); event.target.value = ""; return; }
      const reader = new FileReader();
      reader.onload = () => {
        originalImage = new Image();
        originalImage.onload = () => {
          imageData = String(reader.result);
          modal.querySelector(".photo-upload-box span").textContent = file.name;
          const preview = modal.querySelector("#crop-preview");
          preview.src = imageData;
          preview.onload = () => {
            modal.querySelector("#photo-crop-editor").classList.remove("hidden");
            const selection = modal.querySelector(".crop-selection");
            selection.style.left = "10%";
            selection.style.top = "10%";
            selection.style.width = "80%";
            selection.style.height = "80%";
          };
        };
        originalImage.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
    modal.querySelector("#apply-crop").addEventListener("click", () => {
      if (!originalImage) return;
      const preview = modal.querySelector("#crop-preview");
      const selection = modal.querySelector(".crop-selection");
      const imageRect = preview.getBoundingClientRect();
      const selectionRect = selection.getBoundingClientRect();
      const x = Math.max(0, selectionRect.left - imageRect.left);
      const y = Math.max(0, selectionRect.top - imageRect.top);
      const width = Math.min(imageRect.width - x, selectionRect.width);
      const height = Math.min(imageRect.height - y, selectionRect.height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(originalImage.naturalWidth * width / imageRect.width);
      canvas.height = Math.round(originalImage.naturalHeight * height / imageRect.height);
      canvas.getContext("2d").drawImage(originalImage, originalImage.naturalWidth * x / imageRect.width, originalImage.naturalHeight * y / imageRect.height, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      imageData = canvas.toDataURL("image/jpeg", .9);
      preview.src = imageData;
      modal.querySelector(".photo-upload-box span").textContent = "Crop diterapkan";
      toast("Crop gambar diterapkan.");
    });
    const selection = modal.querySelector(".crop-selection");
    let pointerState = null;
    modal.querySelectorAll(".crop-handle").forEach(handle => handle.addEventListener("pointerdown", event => {
      event.preventDefault();
      pointerState = { mode: handle.className.split(" ").find(name => name.startsWith("crop-handle-")).replace("crop-handle-", ""), startX: event.clientX, startY: event.clientY, rect: selection.getBoundingClientRect(), stage: modal.querySelector(".crop-stage").getBoundingClientRect() };
      handle.setPointerCapture(event.pointerId);
    }));
    selection.addEventListener("pointerdown", event => {
      if (event.target !== selection) return;
      pointerState = { mode: "move", startX: event.clientX, startY: event.clientY, rect: selection.getBoundingClientRect(), stage: modal.querySelector(".crop-stage").getBoundingClientRect() };
      selection.setPointerCapture(event.pointerId);
    });
    selection.addEventListener("pointermove", event => {
      if (!pointerState) return;
      const dx = event.clientX - pointerState.startX;
      const dy = event.clientY - pointerState.startY;
      let left = pointerState.rect.left - pointerState.stage.left;
      let top = pointerState.rect.top - pointerState.stage.top;
      let width = pointerState.rect.width;
      let height = pointerState.rect.height;
      if (pointerState.mode === "move") { left += dx; top += dy; }
      if (pointerState.mode.includes("e")) width += dx;
      if (pointerState.mode.includes("s")) height += dy;
      if (pointerState.mode.includes("w")) { left += dx; width -= dx; }
      if (pointerState.mode.includes("n")) { top += dy; height -= dy; }
      const stage = pointerState.stage;
      width = Math.max(40, Math.min(width, stage.width - left));
      height = Math.max(40, Math.min(height, stage.height - top));
      left = Math.max(0, Math.min(left, stage.width - width));
      top = Math.max(0, Math.min(top, stage.height - height));
      selection.style.left = `${left / stage.width * 100}%`;
      selection.style.top = `${top / stage.height * 100}%`;
      selection.style.width = `${width / stage.width * 100}%`;
      selection.style.height = `${height / stage.height * 100}%`;
    });
    selection.addEventListener("pointerup", () => { pointerState = null; });
  };
  window.rendalForward = id => { const b = bas.find(x => x.id === id); if (b) b.status = "Menunggu Approval"; save(); render(); toast("BA diteruskan ke VP Manager."); };
  window.rendalApprove = id => { if (!confirm("Apakah Anda yakin ingin menyetujui Berita Acara ini?")) return; const b = bas.find(x => x.id === id); const j = jobs.find(x => x.id === b.jobId); if (b) b.status = "Approved"; if (j) { j.status = "Selesai"; j.progress = 100; } save(); render(); toast("BA disetujui. Pekerjaan selesai."); };
  window.rendalRevision = id => { const reason = prompt("Alasan revisi:"); if (!reason) return; const b = bas.find(x => x.id === id); const j = jobs.find(x => x.id === b.jobId); if (b) { b.status = "Revisi"; b.revision = reason; } if (j) j.status = "Revisi"; save(); render(); toast("BA dikembalikan untuk revisi."); };
  window.rendalAddMaster = key => { const value = prompt(`Nama ${key}:`); if (!value) return; master[key].push(value); save(); render(); };
  window.rendalEditCamera = rig => {
    const camera = cameras.find(item => item.rig === rig);
    if (!camera) return;
    const lokasi = prompt("Lokasi / area kamera:", camera.lokasi);
    if (lokasi === null) return;
    const server = prompt("Server:", camera.server || "");
    if (server === null) return;
    const kondisi = prompt("Kondisi (Baik/Aktif atau Tidak Aktif):", camera.kondisi);
    if (kondisi === null) return;
    const keterangan = prompt("Keterangan:", camera.keterangan || "");
    if (keterangan === null) return;
    camera.lokasi = lokasi.trim() || camera.lokasi;
    camera.server = server.trim();
    camera.kondisi = kondisi.trim() || camera.kondisi;
    camera.keterangan = keterangan.trim();
    master.perangkat = cameras.map(item => `RIG-${String(item.rig).padStart(3, "0")} - ${item.lokasi}`);
    save();
    render();
    toast(`Data RIG-${String(rig).padStart(3, "0")} berhasil diperbarui.`);
  };
  window.rendalDeleteMaster = (key, index) => { if (!confirm("Hapus data ini?")) return; master[key].splice(index, 1); save(); render(); };
  const lucideScript = document.createElement("script");
  lucideScript.src = "https://unpkg.com/lucide@latest";
  lucideScript.onload = () => { if (window.lucide) window.lucide.createIcons(); };
  document.head.appendChild(lucideScript);
  if (page === "monitoring") ensureMonitoringAssets().then(render);
  else render();
})();
