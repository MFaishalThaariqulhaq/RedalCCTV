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
  if (!["Admin", "Staff"].includes(currentUser.role)) {
    localStorage.removeItem("cctv_currentUser");
    location.href = loginPageUrl;
    return;
  }
  const pageRoles = {
    monitoring: ["Admin", "Staff"],
    pekerjaan: ["Admin", "Staff"],
    "pekerjaan-detail": ["Admin", "Staff"],
    "pekerjaan-form": ["Admin", "Staff"],
    laporan: ["Admin"],
    divisi: ["Admin"],
    personel: ["Admin"],
    kendaraan: ["Admin"]
  };
  if (pageRoles[page] && !pageRoles[page].includes(currentUser.role)) {
    location.href = dashboardPageUrl;
    return;
  }
  const storage = window.CCTVStorage;
  if (!storage || !Array.isArray(window.RendalDefaultCameras) || !Array.isArray(window.RendalCCTVDefaultJobs)) {
    throw new Error("Data default atau utility penyimpanan CCTV belum dimuat.");
  }
  const seedBas = [
    { id: "BA-CCTV-0042", jobId: "CCTV-LOG-0042", title: "BA Pemeriksaan CCTV Gerbang Utama", divisi: "Gerbang Utama", date: "13 Sep 2026", author: "Andi Pratama", status: "Selesai" },
    { id: "BA-CCTV-0040", jobId: "CCTV-LOG-0040", title: "BA Pemeriksaan CCTV Area Parkir", divisi: "Area Parkir", date: "11 Sep 2026", author: "Rizal Maulana", status: "Draft" }
  ];
  const master = storage.getValue("cctv_master", null) || {
    divisi: ["Divisi Munisi", "Divisi Senjata", "Divisi Kendaraan Khusus", "Divisi Rantaipasok", "Biro Umum", "HCM", "Divisi Mesin"],
    personel: ["Andi Pratama", "Budi Santoso", "Rizal Maulana", "Siti Rahma"],
    kendaraan: ["Isuzu", "Toyota Hilux", "Kendaraan Operasional 02"],
    tools: ["Toolkit", "Jack", "Torque wrench", "Multimeter", "Safety kit"]
  };
  if (master.perangkat) {
    delete master.perangkat;
    storage.saveValue("cctv_master", master);
  }
  let jobs = storage.getJobs(window.RendalCCTVDefaultJobs);
  let bas = storage.getValue("cctv_bas", null) || seedBas;
  const removedTemplateName = "Dewi Lestari";
  let dataChanged = false;
  const jobStatuses = ["Dilaporkan", "Dalam Pemeriksaan", "Dalam Pengerjaan", "Selesai"];
  jobs.forEach(job => {
    if (!jobStatuses.includes(job.status)) {
      job.status = job.keterangan === "Selesai" || Number(job.progress) >= 100
        ? "Selesai"
        : Number(job.progress) > 0
          ? "Dalam Pengerjaan"
          : job.tindakan
            ? "Dalam Pemeriksaan"
            : "Dilaporkan";
      dataChanged = true;
    }
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
    const normalizedNote = job.status === "Selesai" ? "Selesai" : "Sedang berlangsung";
    if (job.keterangan !== normalizedNote) {
      job.keterangan = normalizedNote;
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
    const job = jobs.find(item => item.id === ba.jobId);
    const status = job?.status === "Selesai" ? "Selesai" : "Draft";
    if (ba.status !== status) {
      ba.status = status;
      dataChanged = true;
    }
    if (Object.prototype.hasOwnProperty.call(ba, "revision")) {
      delete ba.revision;
      dataChanged = true;
    }
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
    storage.saveJobs(jobs);
    storage.saveValue("cctv_bas", bas);
    storage.saveValue("cctv_master", master);
  }
  let selectedId = new URLSearchParams(location.search).get("id") || jobs[0].id;

  function save() {
    storage.saveJobs(jobs);
    storage.saveValue("cctv_bas", bas);
    storage.saveValue("cctv_master", master);
    window.dispatchEvent(new Event("cctv:current-data-updated"));
  }
  function syncBAStatus(job) {
    const ba = bas.find(item => item.jobId === job.id);
    if (ba) ba.status = job.status === "Selesai" ? "Selesai" : "Draft";
  }
  function statusOptions(selected) {
    return jobStatuses.map(status => `<option value="${status}" ${selected === status ? "selected" : ""}>${status}</option>`).join("");
  }
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function statusClass(status) {
    if (status === "Selesai") return "badge-green";
    if (status === "Dilaporkan") return "badge-amber";
    if (status === "Dalam Pemeriksaan" || status === "Dalam Pengerjaan") return "badge-blue";
    if (status === "Draft") return "badge-amber";
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
  const { baTable, baPage, baSequence, baDocumentNumber, baDetailPage } = beritaAcaraModule;
  function go(target, id) {
    if (target === "monitoring" || page === "monitoring") {
      page = target;
      selectedId = id || selectedId;
      history.pushState({ page, id: selectedId }, "", `${location.pathname}${id ? `?id=${encodeURIComponent(id)}` : ""}`);
      render();
      return;
    }
    const pageRoutes = {
      dashboard: "pages/dashboard/dashboard.html",
      pekerjaan: "pages/pekerjaan/pekerjaan.html",
      "pekerjaan-detail": "pages/pekerjaan/pekerjaan-detail.html",
      "pekerjaan-form": "pages/pekerjaan/pekerjaan-form.html",
      "berita-acara": "pages/berita-acara/berita-acara.html",
      "berita-acara-detail": "pages/berita-acara/berita-acara-detail.html",
      laporan: "pages/laporan/laporan.html",
      divisi: "pages/master/divisi.html",
      personel: "pages/master/personel.html",
      kendaraan: "pages/master/kendaraan.html"
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
    if (role !== "Admin") return;
    Object.assign(currentUser, { name: "Admin CCTV", role: "Admin" });
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
      ["monitoring", "Monitoring CCTV", "video", "Semua role"],
      ["pekerjaan", "Pencatatan CCTV", "clipboard-list", "Admin,Staff"],
      ["berita-acara", "Berita Acara", "file-text", "Semua role"],
      ["laporan", "Laporan", "bar-chart-3", "Admin"]
    ];
    const allowed = role => role === "Semua role" || role.split(",").includes(currentUser.role);
    const navHtml = nav.filter(item => allowed(item[3])).map(item => `<button class="nav-link ${active === item[0] ? "active" : ""}" onclick="rendalGo('${item[0]}')"><i data-lucide="${item[2]}" class="nav-icon"></i><span>${item[1]}</span></button>`).join("");
    return `<div class="app-shell"><aside class="sidebar" id="rendal-sidebar"><div class="brand"><span class="brand-mark">C</span><span class="brand-title">MONITOR CCTV</span><button class="mobile-menu" onclick="rendalToggleSidebar()" aria-label="Tutup menu"><i data-lucide="x"></i></button></div><nav class="nav">${navHtml}</nav><div class="sidebar-footer"><strong>PT Pindad</strong><br><span>Pencatatan CCTV v1.0.0</span></div></aside><section class="main-area"><header class="topbar"><button class="mobile-menu" onclick="rendalToggleSidebar()" aria-label="Buka menu"><i data-lucide="menu"></i></button><div class="topbar-search"><i data-lucide="search"></i><input type="search" placeholder="Cari pencatatan, kendala, atau petugas..." oninput="rendalGlobalSearch(this.value)"></div><span class="topbar-title">Monitor CCTV / ${esc(active.replace("-", " "))}</span><div class="topbar-actions"><button class="notification" type="button" aria-label="Notifikasi" onclick="rendalNotify()"><i data-lucide="bell"></i><span class="notification-count">3</span></button><span class="topbar-divider"></span><div class="profile-menu"><button class="user-chip" onclick="rendalToggleProfile(event)"><span class="avatar">${esc(currentUser.name.charAt(0))}</span><span>${esc(currentUser.name)}</span><i data-lucide="chevron-down" class="profile-chevron"></i></button><div class="profile-dropdown hidden" id="profile-dropdown"><p>Role Preview / Demo Mode</p><button onclick="rendalSetRole('Admin')">Admin CCTV</button><button onclick="rendalLogout()">Keluar</button></div></div></div></header><main class="content">${content}</main></section></div>`;
  }
  const monitoringLayouts = [{
    id: "parkir-1-2",
    name: "Parkir 1 dan Parkir 2",
    shortName: "Parkir 1 & 2",
    image: new URL("assets/images/layout/LAYOUT CCTV & DVR PARKIR 1 DAN PARKIR 2.png", appRoot).toString()
  }];
  const monitoringStatusLabels = {
    normal: "Normal",
    dalam_pemeriksaan: "Dalam Pemeriksaan",
    dalam_pengerjaan: "Dalam Pengerjaan",
    bermasalah: "Bermasalah"
  };
  const monitoringCameras = storage.getCameras(window.RendalDefaultCameras);
  function syncRuntimeData() {
    let changed = false;
    const currentJobs = storage.getJobs(window.RendalCCTVDefaultJobs);
    if (JSON.stringify(currentJobs) !== JSON.stringify(jobs)) {
      jobs.splice(0, jobs.length, ...currentJobs);
      changed = true;
    }
    const currentCameras = storage.getCameras(window.RendalDefaultCameras);
    if (JSON.stringify(currentCameras) !== JSON.stringify(monitoringCameras)) {
      monitoringCameras.splice(0, monitoringCameras.length, ...currentCameras);
      changed = true;
    }
    const currentBas = storage.getValue("cctv_bas", seedBas);
    if (Array.isArray(currentBas) && JSON.stringify(currentBas) !== JSON.stringify(bas)) {
      bas.splice(0, bas.length, ...currentBas);
      changed = true;
    }
    return changed;
  }
  function refreshDashboard() {
    if (page !== "dashboard") return;
    syncRuntimeData();
    render();
  }
  window.refreshDashboard = refreshDashboard;
  window.addEventListener("storage", event => {
    if (event.storageArea && event.storageArea !== localStorage) return;
    if (event.key && !["cctv_logs", "cctv_camera_overrides", "cctv_camera_positions", "cctv_custom_cameras", "cctv_cameras", "cctv_bas"].includes(event.key)) return;
    if (syncRuntimeData()) render();
  });
  window.addEventListener("cctv:current-data-updated", () => {
    if (page === "dashboard") refreshDashboard();
  });
  window.addEventListener("focus", () => {
    if (syncRuntimeData()) render();
  });
  let monitoringEditMode = false;
  let monitoringEditSnapshot = null;

  function monitoringPage() {
    return `<div class="page-heading"><div><h1>Monitoring CCTV</h1><p class="muted">Pilih layout untuk melihat denah dan contoh posisi CCTV.</p></div></div><section class="card monitoring-controls"><label for="monitoring-layout-select">Pilih Layout</label><select id="monitoring-layout-select" class="field" onchange="rendalChangeMonitoringLayout(this.value)"><option value="">Pilih Layout</option>${monitoringLayouts.map(layout => `<option value="${esc(layout.id)}">${esc(layout.name)}</option>`).join("")}</select><div class="monitoring-edit-tools"><button id="monitoring-edit-toggle" class="btn" type="button" onclick="rendalToggleMonitoringEditMode()"><i data-lucide="settings"></i> Edit Marker</button><button id="monitoring-add-marker" class="btn btn-primary hidden" type="button" onclick="rendalAddMonitoringMarker()"><i data-lucide="plus"></i> Tambah Marker</button><button id="monitoring-save-positions" class="btn btn-primary hidden" type="button" onclick="rendalSaveMonitoringPositions()">Simpan Posisi</button><button id="monitoring-cancel-edit" class="btn hidden" type="button" onclick="rendalCancelMonitoringEdit()">Batal</button></div><div id="monitoring-edit-status" class="monitoring-edit-status hidden">Mode Edit Marker Aktif</div></section><section class="card monitoring-map-card"><div id="monitoring-layout-area" class="monitoring-layout-area"><p class="monitoring-empty">Pilih layout di atas untuk menampilkan denah CCTV.</p></div></section><section id="monitoring-camera-detail" class="card monitoring-camera-detail hidden" aria-live="polite"></section>`;
  }
  function monitoringMarkerStatusClass(status) {
    return `is-status-${Object.prototype.hasOwnProperty.call(monitoringStatusLabels, status) ? status : "normal"}`;
  }
  function clampMarkerCoordinate(value, fallback = 50) {
    const numericValue = Number.isFinite(Number(value)) ? Number(value) : fallback;
    return Math.min(100, Math.max(0, numericValue));
  }
  function monitoringMarkerPlacement(layoutId) {
    const candidates = [
      [50, 40], [45, 45], [55, 45], [45, 50], [55, 50],
      [50, 55], [40, 45], [60, 45], [40, 50], [60, 50],
      [50, 35], [45, 40], [55, 40], [40, 40], [60, 40]
    ];
    return candidates.find(([x, y]) => !monitoringCameras.some(camera =>
      camera.layout === layoutId && Math.hypot(camera.x - x, camera.y - y) < 4
    )) || [50, 40];
  }
  function updateMonitoringEditControls() {
    const editToggle = document.getElementById("monitoring-edit-toggle");
    const addButton = document.getElementById("monitoring-add-marker");
    const saveButton = document.getElementById("monitoring-save-positions");
    const cancelButton = document.getElementById("monitoring-cancel-edit");
    const statusText = document.getElementById("monitoring-edit-status");
    if (editToggle) editToggle.classList.toggle("hidden", monitoringEditMode);
    if (addButton) addButton.classList.toggle("hidden", !monitoringEditMode);
    if (saveButton) saveButton.classList.toggle("hidden", !monitoringEditMode);
    if (cancelButton) cancelButton.classList.toggle("hidden", !monitoringEditMode);
    if (statusText) statusText.classList.toggle("hidden", !monitoringEditMode);
    if (window.lucide) window.lucide.createIcons();
  }
  function monitoringLayoutMarkup(layout) {
    const markers = monitoringCameras.filter(camera => camera.layout === layout.id).map(camera => `<button class="monitoring-marker ${monitoringMarkerStatusClass(camera.status)}" type="button" style="left:${clampMarkerCoordinate(camera.x)}%;top:${clampMarkerCoordinate(camera.y)}%" data-camera-id="${esc(camera.id)}" data-label="${esc(camera.name)}" data-status="${esc(camera.status)}" title="${esc(camera.name)}" aria-label="Detail ${esc(camera.name)}" onclick="rendalSelectMonitoringCamera('${esc(camera.id)}')"><span>${esc(camera.number)}</span></button>`).join("");
    return `<div class="monitoring-map-frame"><img class="monitoring-map-image" src="${esc(layout.image)}" alt="Denah CCTV ${esc(layout.name)}"><div class="monitoring-marker-layer">${markers}</div></div><p class="monitoring-map-caption"><i data-lucide="info"></i> ${monitoringCameras.filter(camera => camera.layout === layout.id).length} marker menunjukkan posisi CCTV pada denah.</p>`;
  }
  function monitoringCameraDetail(camera, layout) {
    const statusOptions = Object.entries(monitoringStatusLabels).map(([value, label]) => `<option value="${value}" ${camera.status === value ? "selected" : ""}>${label}</option>`).join("");
    return `<div class="monitoring-detail-content"><div class="monitoring-detail-heading"><span class="monitoring-detail-kicker">Detail perangkat</span><h2>${esc(camera.name)}</h2><p class="monitoring-detail-layout">Layout: ${esc(layout.shortName)}</p></div><form class="monitoring-status-form" onsubmit="event.preventDefault();rendalSaveMonitoringCameraStatus('${esc(camera.id)}')"><label for="monitoring-status">Status</label><select id="monitoring-status" class="field" name="status">${statusOptions}</select><label for="monitoring-issue">Kendala</label><textarea id="monitoring-issue" class="field" name="kendala" rows="2" placeholder="Isi kendala jika ada">${esc(camera.kendala || "")}</textarea><button class="btn btn-primary" type="submit">Simpan Status</button></form><div class="monitoring-detail-actions"><button class="btn monitoring-job-button" type="button" onclick="rendalNewJobFromMonitoring('${esc(camera.id)}')"><i data-lucide="clipboard-plus"></i> Catat Pekerjaan</button>${monitoringEditMode ? `<button class="btn btn-danger" type="button" onclick="rendalDeleteMonitoringCamera('${esc(camera.id)}')"><i data-lucide="trash-2"></i> Hapus Marker</button>` : ""}</div></div>`;
  }
  function bindMonitoringMarkerInteractions() {
    const area = document.getElementById("monitoring-layout-area");
    if (!area) return;
    const markers = area.querySelectorAll(".monitoring-marker");
    markers.forEach(marker => {
      marker.style.cursor = monitoringEditMode ? "grab" : "";
      marker.onpointerdown = event => {
        if (!monitoringEditMode) return;
        const cameraId = marker.dataset.cameraId;
        const camera = monitoringCameras.find(item => item.id === cameraId);
        if (!camera) return;
        const layer = area.querySelector(".monitoring-marker-layer");
        if (!layer) return;
        const rect = layer.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        marker.classList.add("is-dragging");
        const move = moveEvent => {
          const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
          const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
          const safeX = clampMarkerCoordinate(x, 50);
          const safeY = clampMarkerCoordinate(y, 50);
          camera.x = safeX;
          camera.y = safeY;
          marker.style.left = `${safeX}%`;
          marker.style.top = `${safeY}%`;
        };
        const stop = stopEvent => {
          marker.removeEventListener("pointermove", move);
          marker.removeEventListener("pointerup", stop);
          marker.removeEventListener("pointercancel", stop);
          marker.classList.remove("is-dragging");
          if (stopEvent.pointerId !== undefined && marker.hasPointerCapture?.(stopEvent.pointerId)) {
            marker.releasePointerCapture(stopEvent.pointerId);
          }
        };
        marker.addEventListener("pointermove", move);
        marker.addEventListener("pointerup", stop);
        marker.addEventListener("pointercancel", stop);
        marker.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      };
    });
  }
  function openMonitoringCamera(cameraId) {
    const camera = monitoringCameras.find(item => item.id === cameraId);
    if (!camera) {
      toast("Data CCTV tidak ditemukan.", "info");
      return;
    }
    go("monitoring");
    const layoutSelect = document.getElementById("monitoring-layout-select");
    if (!layoutSelect) return;
    layoutSelect.value = camera.layout;
    window.rendalChangeMonitoringLayout(camera.layout);
    window.rendalSelectMonitoringCamera(camera.id);
  }
  window.rendalOpenMonitoringCamera = openMonitoringCamera;
  const dashboardModule = window.CCTVFeatureModules.dashboard.create({
    jobs,
    cameras: monitoringCameras,
    layouts: monitoringLayouts,
    esc,
    badge,
    openMonitoringCamera
  });
  const laporanModule = window.CCTVFeatureModules.laporan.create({ jobs, esc, jobTable });
  const masterModule = window.CCTVFeatureModules.master.create({ master, esc, getPage: () => page, save, render: () => render() });
  const { dashboard } = dashboardModule;
  const { reportsPage } = laporanModule;
  const { masterPage } = masterModule;
  function render() {
    let content; let active = page;
    if (page === "dashboard") content = dashboard();
    else if (page === "monitoring") content = monitoringPage();
    else if (page === "pekerjaan") content = jobsPage();
    else if (page === "pekerjaan-detail") { content = detailPage(); active = "pekerjaan"; }
    else if (page === "pekerjaan-form") { content = jobsPage(); active = "pekerjaan"; }
    else if (page === "berita-acara") content = baPage();
    else if (page === "berita-acara-detail") content = baDetailPage();
    else if (page === "laporan") content = reportsPage();
    else content = masterPage();
    document.body.innerHTML = shell(content, active);
    if (page === "monitoring" && monitoringLayouts.length) {
      const defaultLayout = monitoringLayouts[0];
      const layoutSelect = document.getElementById("monitoring-layout-select");
      if (layoutSelect) {
        layoutSelect.value = defaultLayout.id;
        window.rendalChangeMonitoringLayout(defaultLayout.id);
      }
    }
    if (window.lucide) window.lucide.createIcons();
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
  window.rendalChangeMonitoringLayout = layoutId => {
    const area = document.getElementById("monitoring-layout-area");
    const detail = document.getElementById("monitoring-camera-detail");
    if (!area || !detail) return;
    const layout = monitoringLayouts.find(item => item.id === layoutId);
    detail.classList.add("hidden");
    detail.innerHTML = "";
    if (!layout) {
      area.innerHTML = `<p class="monitoring-empty">Pilih layout di atas untuk menampilkan denah CCTV.</p>`;
      updateMonitoringEditControls();
      return;
    }
    area.innerHTML = monitoringLayoutMarkup(layout);
    bindMonitoringMarkerInteractions();
    const image = area.querySelector(".monitoring-map-image");
    image.addEventListener("error", () => {
      area.innerHTML = `<p class="monitoring-empty monitoring-error">Denah layout tidak dapat dimuat. Periksa file PNG pada folder assets/images/layout.</p>`;
    }, { once: true });
    updateMonitoringEditControls();
    if (window.lucide) window.lucide.createIcons();
  };
  window.rendalSelectMonitoringCamera = cameraId => {
    if (monitoringEditMode) return;
    const camera = monitoringCameras.find(item => item.id === cameraId);
    const layoutId = document.getElementById("monitoring-layout-select")?.value;
    const layout = monitoringLayouts.find(item => item.id === layoutId);
    const detail = document.getElementById("monitoring-camera-detail");
    if (!camera || !layout || !detail) return;
    detail.innerHTML = monitoringCameraDetail(camera, layout);
    detail.classList.remove("hidden");
    document.querySelectorAll(".monitoring-marker").forEach(marker => {
      marker.classList.toggle("is-selected", marker.dataset.cameraId === camera.id);
    });
    if (window.lucide) window.lucide.createIcons();
  };
  window.rendalToggleMonitoringEditMode = () => {
    if (monitoringEditMode) return;
    monitoringEditSnapshot = new Map(monitoringCameras.map(camera => [camera.id, { x: camera.x, y: camera.y }]));
    monitoringEditMode = true;
    updateMonitoringEditControls();
    document.querySelectorAll(".monitoring-marker").forEach(marker => {
      marker.style.cursor = "grab";
    });
    document.getElementById("monitoring-camera-detail")?.classList.add("hidden");
    document.querySelectorAll(".monitoring-marker").forEach(marker => marker.classList.remove("is-selected"));
  };
  function finishMonitoringEdit() {
    monitoringEditMode = false;
    monitoringEditSnapshot = null;
    document.getElementById("monitoring-camera-detail")?.classList.add("hidden");
    document.querySelectorAll(".monitoring-marker").forEach(marker => {
      marker.classList.remove("is-selected", "is-dragging");
      marker.style.cursor = "";
    });
    updateMonitoringEditControls();
  }
  window.rendalSaveMonitoringPositions = () => {
    if (!monitoringEditMode) return;
    storage.saveCameras(monitoringCameras, window.RendalDefaultCameras);
    const layoutId = document.getElementById("monitoring-layout-select")?.value;
    const layout = monitoringLayouts.find(item => item.id === layoutId);
    if (layout) {
      const area = document.getElementById("monitoring-layout-area");
      if (area) {
        area.innerHTML = monitoringLayoutMarkup(layout);
        bindMonitoringMarkerInteractions();
      }
    }
    finishMonitoringEdit();
    window.dispatchEvent(new Event("cctv:current-data-updated"));
    toast("Posisi marker CCTV berhasil disimpan.");
  };
  window.rendalCancelMonitoringEdit = () => {
    if (!monitoringEditMode) return;
    const originalIds = new Set(monitoringEditSnapshot?.keys() || []);
    for (let index = monitoringCameras.length - 1; index >= 0; index -= 1) {
      const camera = monitoringCameras[index];
      const position = monitoringEditSnapshot?.get(camera.id);
      if (!originalIds.has(camera.id)) {
        monitoringCameras.splice(index, 1);
      } else if (position) {
        camera.x = position.x;
        camera.y = position.y;
      }
    }
    const layout = monitoringLayouts.find(item => item.id === document.getElementById("monitoring-layout-select")?.value);
    const area = document.getElementById("monitoring-layout-area");
    if (layout && area) {
      area.innerHTML = monitoringLayoutMarkup(layout);
      bindMonitoringMarkerInteractions();
    }
    finishMonitoringEdit();
    toast("Perubahan posisi marker dibatalkan.", "info");
  };
  window.rendalAddMonitoringMarker = () => {
    if (!monitoringEditMode) return;
    const layoutId = document.getElementById("monitoring-layout-select")?.value;
    if (!layoutId) {
      toast("Pilih layout terlebih dahulu sebelum menambah marker.", "info");
      return;
    }
    const layout = monitoringLayouts.find(item => item.id === layoutId);
    if (!layout) {
      toast("Layout tidak tersedia.", "info");
      return;
    }
    detailModal("Tambah Marker CCTV", `<label>Nomor CCTV<input name="number" required placeholder="Contoh: 99"></label><label>Layout<input name="layout" value="${esc(layout.name)}" readonly></label>`, "Tambah", form => {
      const number = String(form.get("number") || "").trim();
      if (!number) {
        toast("Nomor CCTV wajib diisi.", "info");
        return;
      }
      const invalid = monitoringCameras.some(camera => camera.layout === layoutId && camera.number === number);
      if (invalid) {
        toast("Nomor CCTV sudah ada pada layout ini.", "info");
        return;
      }
      const id = `CAM-${layoutId.toUpperCase()}-${number}`;
      if (monitoringCameras.some(camera => camera.id === id)) {
        toast("ID marker sudah digunakan. Periksa kembali nomor CCTV.", "info");
        return;
      }
      const [x, y] = monitoringMarkerPlacement(layoutId);
      const camera = {
        id,
        name: `CCTV ${number}`,
        number,
        layout: layoutId,
        x,
        y,
        status: "normal",
        kendala: ""
      };
      monitoringCameras.push(camera);
      const area = document.getElementById("monitoring-layout-area");
      if (area) {
        area.innerHTML = monitoringLayoutMarkup(layout);
        bindMonitoringMarkerInteractions();
      }
      updateMonitoringEditControls();
      window.rendalCloseDetailModal();
      toast(`Marker CCTV ${number} ditambahkan. Atur posisinya lalu simpan.`);
    });
  };
  window.rendalDeleteMonitoringCamera = cameraId => {
    const camera = monitoringCameras.find(item => item.id === cameraId);
    if (!camera) return;
    if (!window.confirm(`Hapus marker ${camera.name}?`)) return;
    const index = monitoringCameras.findIndex(item => item.id === cameraId);
    if (index >= 0) {
      monitoringCameras.splice(index, 1);
      storage.saveCameras(monitoringCameras, window.RendalDefaultCameras);
      const layout = monitoringLayouts.find(item => item.id === camera.layout);
      const detail = document.getElementById("monitoring-camera-detail");
      if (detail) {
        detail.classList.add("hidden");
        detail.innerHTML = "";
      }
      if (layout) {
        const area = document.getElementById("monitoring-layout-area");
        if (area) area.innerHTML = monitoringLayoutMarkup(layout);
      }
      updateMonitoringEditControls();
      window.dispatchEvent(new Event("cctv:current-data-updated"));
      toast(`Marker ${camera.name} dihapus.`);
    }
  };
  window.rendalSaveMonitoringCameraStatus = cameraId => {
    const camera = monitoringCameras.find(item => item.id === cameraId);
    const statusInput = document.getElementById("monitoring-status");
    const issueInput = document.getElementById("monitoring-issue");
    const layout = monitoringLayouts.find(item => item.id === camera?.layout);
    const detail = document.getElementById("monitoring-camera-detail");
    if (!camera || !statusInput || !issueInput || !layout || !detail) {
      toast("Detail CCTV tidak tersedia untuk menyimpan status.", "info");
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(monitoringStatusLabels, statusInput.value)) {
      toast("Pilih status CCTV yang valid.", "info");
      return;
    }
    camera.status = statusInput.value;
    camera.kendala = issueInput.value.trim();
    storage.saveCameras(monitoringCameras, window.RendalDefaultCameras);
    const marker = document.querySelector(`.monitoring-marker[data-camera-id="${camera.id}"]`);
    if (marker) {
      Object.keys(monitoringStatusLabels).forEach(status => marker.classList.remove(`is-status-${status}`));
      marker.classList.add(monitoringMarkerStatusClass(camera.status));
      marker.dataset.status = camera.status;
    }
    detail.innerHTML = monitoringCameraDetail(camera, layout);
    if (window.lucide) window.lucide.createIcons();
    window.dispatchEvent(new Event("cctv:current-data-updated"));
    toast(`Status ${camera.name} disimpan.`);
  };
  window.rendalNewJobFromMonitoring = cameraId => {
    const camera = monitoringCameras.find(item => item.id === cameraId);
    const layout = monitoringLayouts.find(item => item.id === document.getElementById("monitoring-layout-select")?.value);
    if (!camera || !layout) {
      toast("Data CCTV atau layout tidak ditemukan.", "info");
      return;
    }
    window.rendalNewJob({
      cameraId: camera.id,
      deviceName: `${camera.name} (${camera.id}) - ${layout.shortName}`,
      layoutName: layout.name
    });
  };
  window.addEventListener("popstate", () => {
    page = history.state?.page || "dashboard";
    selectedId = history.state?.id || selectedId;
    render();
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
    }
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
    const rows = bas.filter(b => `${baDocumentNumber(b)} ${b.id} ${b.title} ${b.divisi} ${b.author}`.toLowerCase().includes(search));
    const table = document.getElementById("ba-table");
    if (table) table.innerHTML = baTable(rows);
  };
  window.rendalNewJob = (context = {}) => {
    document.getElementById("new-job-modal")?.remove();
    const modal = document.createElement("div");
    modal.id = "new-job-modal";
    modal.className = "modal-backdrop new-job-backdrop";
    const deviceName = String(context.deviceName || "");
    const baTitle = context.layoutName && deviceName ? `Pencatatan ${deviceName}` : "";
    modal.innerHTML = `<section class="modal new-job-modal" role="dialog" aria-modal="true" aria-labelledby="new-job-title"><div class="new-job-header"><h2 id="new-job-title">Tambah Pencatatan CCTV</h2><button class="modal-close" type="button" onclick="rendalCloseNewJob()" aria-label="Tutup"><i data-lucide="x"></i></button></div><form id="new-job-form" class="new-job-form"><input type="hidden" name="cameraId" value="${esc(context.cameraId || "")}"><label>Tanggal<input name="date" type="date" required value="${new Date().toISOString().slice(0, 10)}"></label><label>Lampiran / Judul BA<input name="baTitle" required placeholder="Contoh: Perbaikan Kamera Gerbang Utama" value="${esc(baTitle)}"></label><label>Nama Perangkat<input name="title" required placeholder="Ketik nama perangkat CCTV" value="${esc(deviceName)}"></label><label>Kendala<textarea name="temuan" rows="3" required placeholder="Tuliskan kendala atau temuan..."></textarea></label><label>Tindakan<textarea name="tindakan" rows="3" placeholder="Tuliskan tindakan yang dilakukan..."></textarea></label><label>Status Pekerjaan<select name="status">${statusOptions("Dilaporkan")}</select></label><label>Nama Pembuat<input name="createdByName" value="" required placeholder="Nama petugas yang membuat pencatatan"></label><label>NPP Pembuat<input name="createdByNpp" value="" required placeholder="Nomor Pokok Pegawai"></label><label>Mengetahui<select name="baKnownBy"><option>JM PAMFIK</option><option>KORDINATOR RENDALPAM</option></select></label><div class="new-job-actions"><button class="btn" type="button" onclick="rendalCloseNewJob()">Batal</button><button class="btn btn-primary" type="submit">Simpan Pencatatan</button></div></form></section>`;
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
      const requestedCameraId = String(formData.get("cameraId") || "").trim();
      const cameraId = monitoringCameras.some(camera => camera.id === requestedCameraId) ? requestedCameraId : "";
      const status = jobStatuses.includes(String(formData.get("status") || "")) ? String(formData.get("status")) : "Dilaporkan";
      const keterangan = status === "Selesai" ? "Selesai" : "Sedang berlangsung";
      const division = title.includes(" - ") ? title.split(" - ").slice(1).join(" - ") : title;
      if (!title || !temuan || !baTitle || !createdByNpp) return;
      const progressByStatus = { Dilaporkan: 0, "Dalam Pemeriksaan": 25, "Dalam Pengerjaan": 60, Selesai: 100 };
      jobs.unshift({ ...window.RendalCCTVDefaultJobs[1], ...(cameraId ? { cameraId } : {}), id: `CCTV-LOG-${String(Date.now()).slice(-4)}`, title, baTitle, divisi: division, pic: createdByName, createdByName, createdByNpp, baKnownBy, personnel: [], temuan, tindakan: tindakan || "Belum ada tindakan", keterangan, desc: "-", status, progress: progressByStatus[status], date: dateInput ? new Date(`${dateInput}T00:00:00`).toLocaleDateString("id-ID") : new Date().toLocaleDateString("id-ID") });
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
    const existing = bas.find(b => b.jobId === id);
    if (existing) {
      existing.title = job.baTitle || `Berita Acara ${job.title}`;
      existing.divisi = job.divisi;
      existing.date = job.date;
      existing.author = job.createdByName || currentUser.name;
      existing.knownBy = job.baKnownBy;
      existing.status = job.status === "Selesai" ? "Selesai" : "Draft";
    } else {
      bas.unshift({
        id: `BA-2026-${String(Date.now()).slice(-6)}`,
        sequence: bas.reduce((highest, item) => Math.max(highest, baSequence(item)), 0) + 1,
        jobId: id,
        title: job.baTitle || `Berita Acara ${job.title}`,
        divisi: job.divisi,
        date: job.date,
        author: job.createdByName || currentUser.name,
        knownBy: job.baKnownBy,
        status: job.status === "Selesai" ? "Selesai" : "Draft"
      });
    }
    save();
    toast("Berita Acara dibuat.");
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
    detailModal("Edit Pencatatan CCTV", `<label>Lampiran / Judul BA<input name="baTitle" value="${esc(job.baTitle || job.title)}" required></label><label>Nama Perangkat<input name="title" value="${esc(job.title)}" required></label><label>Kendala<textarea name="temuan" rows="3">${esc(job.temuan)}</textarea></label><label>Tindakan<textarea name="tindakan" rows="3">${esc(job.tindakan)}</textarea></label><label>Status Pekerjaan<select name="status">${statusOptions(job.status)}</select></label><label>Nama Admin<input name="createdByName" value="${esc(job.createdByName || job.pic || currentUser.name)}" required></label><label>NPP Admin<input name="createdByNpp" value="${esc(job.createdByNpp || "")}" required></label><label>Mengetahui<select name="baKnownBy"><option ${job.baKnownBy === "JM PAMFIK" ? "selected" : ""}>JM PAMFIK</option><option ${job.baKnownBy === "KORDINATOR RENDALPAM" ? "selected" : ""}>KORDINATOR RENDALPAM</option></select></label>`, "Simpan Perubahan", form => {
      job.baTitle = String(form.get("baTitle") || "").trim() || job.baTitle || job.title;
      job.title = String(form.get("title") || "").trim() || job.title;
      job.temuan = String(form.get("temuan") || "").trim();
      job.tindakan = String(form.get("tindakan") || "").trim();
      job.status = jobStatuses.includes(String(form.get("status") || "")) ? String(form.get("status")) : "Dilaporkan";
      job.keterangan = job.status === "Selesai" ? "Selesai" : "Sedang berlangsung";
      job.progress = { Dilaporkan: 0, "Dalam Pemeriksaan": 25, "Dalam Pengerjaan": 60, Selesai: 100 }[job.status];
      job.createdByName = String(form.get("createdByName") || "").trim() || job.createdByName || currentUser.name;
      job.createdByNpp = String(form.get("createdByNpp") || "").trim() || job.createdByNpp || "";
      job.pic = job.createdByName;
      job.baKnownBy = String(form.get("baKnownBy") || job.baKnownBy);
      const ba = bas.find(item => item.jobId === job.id);
      if (ba) {
        ba.title = job.baTitle;
        ba.knownBy = job.baKnownBy;
        ba.author = job.createdByName;
      }
      syncBAStatus(job);
      save();
      window.rendalCloseDetailModal();
      render();
      toast("Pencatatan CCTV diperbarui.");
    }, true);
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
  window.rendalAddMaster = masterModule.add;
  window.rendalDeleteMaster = masterModule.remove;
  const lucideScript = document.createElement("script");
  lucideScript.src = "https://unpkg.com/lucide@latest";
  lucideScript.onload = () => { if (window.lucide) window.lucide.createIcons(); };
  document.head.appendChild(lucideScript);
  render();
})();
