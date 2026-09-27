(function () {
  // Feature modules register here without owning page bootstrapping; this keeps
  // the legacy global handlers and navigation contract intact during migration.
  window.CCTVFeatureModules = window.CCTVFeatureModules || {};
  const appRoot = new URL("../../../", document.currentScript.src);
  const loginPageUrl = new URL("pages/login.html", appRoot).toString();
  const dashboardPageUrl = new URL("pages/dashboard/dashboard.html", appRoot).toString();
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (!manifestLink) {
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = new URL("manifest.json", appRoot).toString();
    document.head.appendChild(link);
  }

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#0f172a";
    document.head.appendChild(meta);
  }

  if ("serviceWorker" in navigator) {
    const swUrl = new URL("sw.js", appRoot).toString();
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(swUrl).catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
    });
  }

  const offlineStatus = document.getElementById("offline-status");
  const updateOfflineStatus = () => {
    const offline = !navigator.onLine;
    const status = offline ? "Offline mode aktif" : "Online";
    const element = offlineStatus || document.createElement("div");
    if (!offlineStatus) {
      element.id = "offline-status";
      element.style.cssText = "position:fixed;right:1rem;bottom:1rem;z-index:9999;padding:.6rem .9rem;border-radius:999px;background:rgba(15,23,42,.9);color:#fff;font-size:.75rem;font-weight:600;box-shadow:0 10px 25px rgba(15,23,42,.25);";
      document.body.appendChild(element);
    }
    element.textContent = status;
    element.style.background = offline ? "rgba(220, 38, 38, 0.92)" : "rgba(37, 99, 235, 0.92)";
  };
  updateOfflineStatus();
  window.addEventListener("online", updateOfflineStatus);
  window.addEventListener("offline", updateOfflineStatus);

  let page = (location.pathname.split(/[\\/]/).pop() || "index.html").replace(".html", "");
  document.documentElement.dataset.app = "cctv";
  document.title = `${page === "dashboard" ? "Dashboard" : page === "pekerjaan" ? "Pencatatan CCTV" : "Monitor CCTV"} - Monitor CCTV`;
  if (page === "index" || page === "login") return;

  let currentUser = JSON.parse(localStorage.getItem("cctv_currentUser") || "null");
  if (!currentUser) {
    location.href = loginPageUrl;
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
    location.href = dashboardPageUrl;
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
    if (!job.createdByName) {
      job.createdByName = job.pic || "";
      dataChanged = true;
    }
    if (!job.createdByNpp) {
      job.createdByNpp = "";
      dataChanged = true;
    }
    if (!job.baTitle) {
      job.baTitle = job.title || "";
      dataChanged = true;
    }
    if (!job.baKnownBy) {
      job.baKnownBy = "JM PAMFIK";
      dataChanged = true;
    }
    if (job.keterangan !== "Selesai" && job.keterangan !== "Dalam Proses") {
      job.keterangan = job.status === "Selesai" ? "Selesai" : "Dalam Proses";
      dataChanged = true;
    }
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
  const pekerjaanModule = window.CCTVFeatureModules.pekerjaan.create({
    jobs,
    bas,
    currentUser,
    esc,
    badge,
    getSelectedId: () => selectedId
  });
  const {
    jobTable,
    jobsPage,
    detailPage
  } = pekerjaanModule;
  const beritaAcaraModule = window.CCTVFeatureModules.beritaAcara.create({
    jobs,
    bas,
    currentUser,
    esc,
    badge,
    getSelectedId: () => selectedId
  });
  const { baTable, baPage, baSequence, baDetailPage } = beritaAcaraModule;
  function loadAsset(type, url) {
    return new Promise(resolve => {
      const assetUrl = new URL(url, appRoot).toString();
      if (document.querySelector(`${type}[src="${assetUrl}"],${type}[href="${assetUrl}"]`)) return resolve();
      const node = document.createElement(type);
      if (type === "script") {
        node.src = assetUrl;
      } else {
        node.rel = "stylesheet";
        node.href = assetUrl;
      }
      node.onload = resolve;
      node.onerror = resolve;
      document.head.appendChild(node);
    });
  }
  const ensureMonitoringAssets = () => window.CCTVFeatureModules.monitoring.ensureAssets(loadAsset);
  function go(target, id) {
    if (target === "monitoring" || page === "monitoring") {
      page = target;
      selectedId = id || selectedId;
      history.pushState({ page, id: selectedId }, "", `${location.pathname}${id ? `?id=${encodeURIComponent(id)}` : ""}`);
      ensureMonitoringAssets().then(render);
      return;
    }
    const pageRoutes = {
      dashboard: "pages/dashboard/dashboard.html",
      pekerjaan: "pages/pekerjaan/pekerjaan.html",
      "pekerjaan-detail": "pages/pekerjaan/pekerjaan-detail.html",
      "pekerjaan-form": "pages/pekerjaan/pekerjaan-form.html",
      "berita-acara": "pages/berita-acara/berita-acara.html",
      "berita-acara-detail": "pages/berita-acara/berita-acara-detail.html",
      approval: "pages/approval/approval.html",
      "approval-detail": "pages/approval/approval-detail.html",
      laporan: "pages/laporan/laporan.html",
      divisi: "pages/master/divisi.html",
      personel: "pages/master/personel.html",
      kendaraan: "pages/master/kendaraan.html",
      tools: "pages/master/tools.html"
    };
    location.href = `${new URL(pageRoutes[target], appRoot).toString()}${id ? `?id=${encodeURIComponent(id)}` : ""}`;
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
    location.href = loginPageUrl;
  }
  function isAllowedOnCurrentPage(role) {
    return !pageRoles[page] || pageRoles[page].includes(role);
  }
  function setPreviewRole(role) {
    const names = { Admin: "Admin CCTV", Staff: "Petugas CCTV", Reviewer: "Koordinator Review", "VP Manager": "Penanggung Jawab" };
    Object.assign(currentUser, { name: names[role], role });
    localStorage.setItem("cctv_currentUser", JSON.stringify(currentUser));
    if (!isAllowedOnCurrentPage(role)) {
      location.href = dashboardPageUrl;
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
  const dashboardModule = window.CCTVFeatureModules.dashboard.create({ jobs, cameras, esc, badge });
  const approvalModule = window.CCTVFeatureModules.approval.create({ bas, jobs, esc, badge, save, render: () => render(), toast });
  const laporanModule = window.CCTVFeatureModules.laporan.create({ jobs, esc, jobTable });
  const masterModule = window.CCTVFeatureModules.master.create({ master, monitoringDevices, cameras, esc, getPage: () => page, save, render: () => render(), toast });
  const { dashboard } = dashboardModule;
  const { approvalPage } = approvalModule;
  const { reportsPage } = laporanModule;
  const { masterPage } = masterModule;
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
    modal.innerHTML = `<section class="modal new-job-modal" role="dialog" aria-modal="true" aria-labelledby="new-job-title"><div class="new-job-header"><h2 id="new-job-title">Tambah Pencatatan CCTV</h2><button class="modal-close" type="button" onclick="rendalCloseNewJob()" aria-label="Tutup"><i data-lucide="x"></i></button></div><form id="new-job-form" class="new-job-form"><label>Tanggal<input name="date" type="date" required value="${new Date().toISOString().slice(0, 10)}"></label><label>Lampiran / Judul BA<input name="baTitle" required placeholder="Contoh: Perbaikan Kamera Gerbang Utama"></label><label>Nama Perangkat<input name="title" required placeholder="Ketik nama perangkat CCTV"></label><label>Kendala<textarea name="temuan" rows="3" required placeholder="Tuliskan kendala atau temuan..."></textarea></label><label>Tindakan<textarea name="tindakan" rows="3" placeholder="Tuliskan tindakan yang dilakukan..."></textarea></label><label>Keterangan<select name="keterangan"><option value="Dalam Proses">Dalam Proses / Sedang Berlangsung</option><option value="Selesai">Selesai</option></select></label><label>Nama Pembuat<input name="createdByName" value="" required placeholder="Nama petugas yang membuat pencatatan"></label><label>NPP Pembuat<input name="createdByNpp" value="" required placeholder="Nomor Pokok Pegawai"></label><label>Mengetahui<select name="baKnownBy"><option>JM PAMFIK</option><option>KORDINATOR RENDALPAM</option></select></label><div class="new-job-actions"><button class="btn" type="button" onclick="rendalCloseNewJob()">Batal</button><button class="btn btn-primary" type="submit">Simpan Pencatatan</button></div></form></section>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", event => { if (event.target === modal) window.rendalCloseNewJob(); });
    modal.querySelector("form").addEventListener("submit", event => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const dateInput = String(formData.get("date") || "").trim();
      const title = String(formData.get("title") || "").trim();
      const temuan = String(formData.get("temuan") || "").trim();
      const tindakan = String(formData.get("tindakan") || "").trim();
      const baTitle = String(formData.get("baTitle") || "").trim();
      const createdByName = String(formData.get("createdByName") || "").trim();
      const createdByNpp = String(formData.get("createdByNpp") || "").trim();
      const baKnownBy = String(formData.get("baKnownBy") || "JM PAMFIK").trim();
      const keterangan = String(formData.get("keterangan") || "Dalam Proses").trim();
      const division = title.includes(" - ") ? title.split(" - ").slice(1).join(" - ") : title;
      if (!title || !temuan || !baTitle || !createdByNpp) return;
      jobs.unshift({ ...seedJobs[1], id: `CCTV-LOG-${String(Date.now()).slice(-4)}`, title, baTitle, divisi: division, pic: createdByName, createdByName, createdByNpp, baKnownBy, personnel: [], temuan, tindakan: tindakan || "Belum ada tindakan", keterangan, desc: "-", status: keterangan, progress: keterangan === "Selesai" ? 100 : 0, date: dateInput ? new Date(`${dateInput}T00:00:00`).toLocaleDateString("id-ID") : new Date().toLocaleDateString("id-ID") });
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
      existing.title = job.baTitle || `Berita Acara ${job.title}`;
      existing.divisi = job.divisi;
      existing.date = submittedDate;
      existing.author = job.createdByName || currentUser.name;
      existing.knownBy = job.baKnownBy;
      existing.status = "Menunggu Review";
      existing.revision = "";
    } else {
      bas.unshift({
        id: `BA-2026-${String(Date.now()).slice(-6)}`,
        sequence: bas.reduce((highest, item) => Math.max(highest, baSequence(item)), 0) + 1,
        jobId: id,
        title: job.baTitle || `Berita Acara ${job.title}`,
        divisi: job.divisi,
        date: submittedDate,
        author: job.createdByName || currentUser.name,
        knownBy: job.baKnownBy,
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
    detailModal("Edit Pencatatan CCTV", `<label>Lampiran / Judul BA<input name="baTitle" value="${esc(job.baTitle || job.title)}" required></label><label>Nama Perangkat<input name="title" value="${esc(job.title)}" required></label><label>Kendala<textarea name="temuan" rows="3">${esc(job.temuan)}</textarea></label><label>Tindakan<textarea name="tindakan" rows="3">${esc(job.tindakan)}</textarea></label><label>Keterangan<select name="keterangan"><option value="Dalam Proses" ${job.keterangan !== "Selesai" ? "selected" : ""}>Dalam Proses / Sedang Berlangsung</option><option value="Selesai" ${job.keterangan === "Selesai" ? "selected" : ""}>Selesai</option></select></label><label>Nama Admin<input name="createdByName" value="${esc(job.createdByName || job.pic || currentUser.name)}" required></label><label>NPP Admin<input name="createdByNpp" value="${esc(job.createdByNpp || "")}" required></label><label>Mengetahui<select name="baKnownBy"><option ${job.baKnownBy === "JM PAMFIK" ? "selected" : ""}>JM PAMFIK</option><option ${job.baKnownBy === "KORDINATOR RENDALPAM" ? "selected" : ""}>KORDINATOR RENDALPAM</option></select></label>`, "Simpan Perubahan", form => { job.baTitle = String(form.get("baTitle") || "").trim() || job.baTitle || job.title; job.title = String(form.get("title") || "").trim() || job.title; job.temuan = String(form.get("temuan") || "").trim(); job.tindakan = String(form.get("tindakan") || "").trim(); job.keterangan = String(form.get("keterangan") || "Dalam Proses"); job.createdByName = String(form.get("createdByName") || "").trim() || job.createdByName || currentUser.name; job.createdByNpp = String(form.get("createdByNpp") || "").trim() || job.createdByNpp || ""; job.pic = job.createdByName; job.status = job.status === "Menunggu Review" || job.status === "Menunggu Approval" ? job.status : job.keterangan; job.progress = job.keterangan === "Selesai" ? 100 : 0; job.baKnownBy = String(form.get("baKnownBy") || job.baKnownBy); const ba = bas.find(item => item.jobId === job.id); if (ba) { ba.title = job.baTitle; ba.knownBy = job.baKnownBy; ba.author = job.createdByName; } save(); window.rendalCloseDetailModal(); render(); toast("Pencatatan CCTV diperbarui."); }, true);
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
  window.rendalForward = approvalModule.forward;
  window.rendalApprove = approvalModule.approve;
  window.rendalRevision = approvalModule.revision;
  window.rendalAddMaster = masterModule.add;
  window.rendalEditCamera = masterModule.editCamera;
  window.rendalDeleteMaster = masterModule.remove;
  const lucideScript = document.createElement("script");
  lucideScript.src = "https://unpkg.com/lucide@latest";
  lucideScript.onload = () => { if (window.lucide) window.lucide.createIcons(); };
  document.head.appendChild(lucideScript);
  if (page === "monitoring") ensureMonitoringAssets().then(render);
  else render();
})();
