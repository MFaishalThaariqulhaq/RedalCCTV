window.monitoringTemplate = `<div id="monitoring-runtime" class="monitoring-runtime">
                <div id="view-monitoring" class="view-content space-y-4 h-full flex flex-col">
                    
                    <!-- STATS BAR -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div onclick="filterCameraStatus('all')" class="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:border-sky-500/50 transition">
                            <div>
                                <p class="text-xs font-medium text-slate-400">Total Kamera</p>
                                <p id="stat-total" class="text-xl md:text-2xl font-bold text-white font-mono-code mt-0.5">14</p>
                            </div>
                            <div class="w-10 h-10 rounded-lg bg-blue-950/70 text-blue-400 border border-blue-800/40 flex items-center justify-center text-lg">
                                <i class="fa-solid fa-video"></i>
                            </div>
                        </div>

                        <div onclick="filterCameraStatus('online')" class="bg-slate-900 border border-emerald-900/40 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition">
                            <div>
                                <p class="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Online
                                </p>
                                <p id="stat-online" class="text-xl md:text-2xl font-bold text-emerald-400 font-mono-code mt-0.5">11</p>
                            </div>
                            <div class="w-10 h-10 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 flex items-center justify-center text-lg">
                                <i class="fa-solid fa-circle-check"></i>
                            </div>
                        </div>

                        <div onclick="filterCameraStatus('offline')" class="bg-slate-900 border border-rose-900/40 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:border-rose-500/50 transition">
                            <div>
                                <p class="text-xs font-medium text-rose-400 flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full bg-rose-500"></span> Offline
                                </p>
                                <p id="stat-offline" class="text-xl md:text-2xl font-bold text-rose-400 font-mono-code mt-0.5">2</p>
                            </div>
                            <div class="w-10 h-10 rounded-lg bg-rose-950/70 text-rose-400 border border-rose-800/40 flex items-center justify-center text-lg">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                            </div>
                        </div>

                        <div onclick="filterCameraStatus('maintenance')" class="bg-slate-900 border border-amber-900/40 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition">
                            <div>
                                <p class="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full bg-amber-500"></span> Maintenance
                                </p>
                                <p id="stat-maintenance" class="text-xl md:text-2xl font-bold text-amber-400 font-mono-code mt-0.5">1</p>
                            </div>
                            <div class="w-10 h-10 rounded-lg bg-amber-950/70 text-amber-400 border border-amber-800/40 flex items-center justify-center text-lg">
                                <i class="fa-solid fa-screwdriver-wrench"></i>
                            </div>
                        </div>
                    </div>

                    <!-- MAP AND SIDE PANELS CONTAINER -->
                    <div class="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[480px]">
                        
                        <!-- MAP AREA (Main Visual Element) -->
                        <div class="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-2 relative flex flex-col min-h-[420px]">
                            
                            <!-- MAP CONTROLS OVERLAY -->
                            <div class="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                                <div class="bg-slate-950/90 backdrop-blur border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-medium pointer-events-auto shadow-xl flex items-center gap-2">
                                    <i class="fa-solid fa-layer-group text-sky-400"></i>
                                    <span>Peta Pindad Area (Simulasi ATCS)</span>
                                </div>

                                <div class="flex items-center gap-2 pointer-events-auto">
                                    <button onclick="resetMapView()" class="bg-slate-950/90 hover:bg-slate-800 backdrop-blur border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-medium transition shadow-xl flex items-center gap-1.5">
                                        <i class="fa-solid fa-compress"></i> Reset Fit View
                                    </button>
                                </div>
                            </div>

                            <!-- LEAFLET MAP ELEMENT -->
                            <div id="map" class="w-full flex-1 rounded-lg"></div>
                        </div>

                        <!-- CAMERA QUICK SELECTOR PANEL -->
                        <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col h-full max-h-[550px] lg:max-h-none">
                            <div class="pb-2 border-b border-slate-800 flex items-center justify-between">
                                <h3 class="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                    <i class="fa-solid fa-list-check text-sky-400"></i>
                                    <span>Daftar Titik CCTV</span>
                                </h3>
                                <span id="camera-filter-tag" class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono-code">Semua</span>
                            </div>

                            <!-- Search Input -->
                            <div class="my-2 relative">
                                <input type="text" id="map-search-input" onkeyup="searchMapCamera()" placeholder="Cari kode / lokasi..." class="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500">
                                <i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-slate-500 text-xs"></i>
                            </div>

                            <!-- Camera List Scrollable -->
                            <div id="camera-side-list" class="flex-1 overflow-y-auto space-y-2 pr-1 my-1">
                                <!-- Dynamic rendering via JS -->
                            </div>
                        </div>

                    </div>
                </div>

            <div id="cctv-modal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 hidden flex items-center justify-center p-3 md:p-5">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
                    <div class="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/60 flex items-center justify-center text-sm font-bold">
                                <i class="fa-solid fa-video"></i>
                            </div>
                            <div>
                                <h3 id="modal-cam-id" class="font-bold text-slate-100 text-sm md:text-base font-mono-code flex items-center gap-2">
                                    <span>CAM-001</span>
                                    <span id="modal-cam-status-badge" class="px-2 py-0.5 rounded text-[10px] font-semibold"></span>
                                </h3>
                                <p id="modal-cam-location" class="text-xs text-slate-400"></p>
                            </div>
                        </div>
                        <button onclick="closeCctvModal()" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition" aria-label="Tutup detail kamera">
                            <i class="fa-solid fa-xmark text-base"></i>
                        </button>
                    </div>
                    <div class="p-4 md:p-5 overflow-y-auto space-y-4 flex-1">
                        <div class="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative group">
                            <div class="absolute top-3 left-3 right-3 z-30 flex items-center justify-between text-[11px] font-mono-code text-white bg-slate-950/60 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800/80 pointer-events-none">
                                <span class="font-bold tracking-wide"><span class="w-2 h-2 rounded-full bg-rose-500 inline-block mr-1"></span>REC LIVE</span>
                                <span id="modal-hud-timestamp"></span>
                            </div>
                            <div class="w-full h-[260px] sm:h-[360px] relative scanlines flex items-center justify-center bg-black">
                                <canvas id="cctv-canvas" class="w-full h-full object-cover"></canvas>
                            </div>
                            <div class="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                <button id="btn-toggle-feed" onclick="toggleFeedPlay()" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 text-[11px]">
                                    <i class="fa-solid fa-pause"></i> Pause Stream
                                </button>
                                <button onclick="triggerFullscreenCanvas()" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1">
                                    <i class="fa-solid fa-expand"></i> Fullscreen
                                </button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                                <h4 class="font-semibold text-slate-200 border-b border-slate-800 pb-1.5">Informasi Perangkat</h4>
                                <div class="grid grid-cols-2 gap-2 text-slate-400">
                                    <div>Kode Kamera: <span id="info-code" class="text-slate-200 font-mono-code font-semibold">CAM-001</span></div>
                                    <div>Zona/Area: <span id="info-zone" class="text-slate-200"></span></div>
                                    <div>Terakhir Update: <span id="info-last-check" class="text-slate-200 font-mono-code"></span></div>
                                    <div>IP Simulasi: <span id="info-ip" class="text-slate-200 font-mono-code"></span></div>
                                </div>
                            </div>
                            <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                                <h4 class="font-semibold text-slate-200 border-b border-slate-800 pb-1.5">Uji Status Kamera</h4>
                                <div class="grid grid-cols-3 gap-2 pt-1">
                                    <button onclick="changeCurrentCamStatus('online')" class="py-1.5 px-2 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-semibold text-[11px]">Online</button>
                                    <button onclick="changeCurrentCamStatus('offline')" class="py-1.5 px-2 rounded bg-rose-950/80 border border-rose-700/60 text-rose-300 font-semibold text-[11px]">Offline</button>
                                    <button onclick="changeCurrentCamStatus('maintenance')" class="py-1.5 px-2 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300 font-semibold text-[11px]">Maintenance</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
                        <button onclick="closeCctvModal()" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition">Tutup</button>
                    </div>
                </div>
            </div>

    <!-- TOAST NOTIFICATION CONTAINER -->
    <div id="toast-container" class="fixed bottom-5 right-5 z-50 space-y-2 pointer-events-none"></div></div>`;

const BASE_LAT = -6.9312;
const BASE_LNG = 107.6582;

let cameras = [
    { id: "CAM-001", name: "Gerbang Utama (Main Gate)", location: "Pos Utama Selatan", lat: BASE_LAT + 0.0002, lng: BASE_LNG - 0.0012, status: "online", ip: "192.0.2.101" },
    { id: "CAM-002", name: "Pos Pengamanan Selatan", location: "Gerbang Selatan", lat: BASE_LAT - 0.0010, lng: BASE_LNG - 0.0008, status: "online", ip: "192.0.2.102" },
    { id: "CAM-003", name: "Area Parkir Karyawan", location: "Zona Parkir Barat", lat: BASE_LAT + 0.0012, lng: BASE_LNG - 0.0005, status: "offline", ip: "192.0.2.103" },
    { id: "CAM-004", name: "Gudang Material A", location: "Kompleks Gudang", lat: BASE_LAT - 0.0015, lng: BASE_LNG + 0.0010, status: "maintenance", ip: "192.0.2.104" },
    { id: "CAM-005", name: "Gedung Direksi & Admin", location: "Ring 1 Administrasi", lat: BASE_LAT + 0.0005, lng: BASE_LNG + 0.0002, status: "online", ip: "192.0.2.105" },
    { id: "CAM-006", name: "Area Produksi Utama", location: "Pabrik Divisi Muatan", lat: BASE_LAT - 0.0008, lng: BASE_LNG + 0.0018, status: "online", ip: "192.0.2.106" },
    { id: "CAM-007", name: "Area Loading Dock", location: "Zona Logistik Keluar", lat: BASE_LAT - 0.0020, lng: BASE_LNG + 0.0005, status: "online", ip: "192.0.2.107" },
    { id: "CAM-008", name: "Pos Pengamanan Utara", location: "Akses Perimeter Utara", lat: BASE_LAT + 0.0020, lng: BASE_LNG - 0.0002, status: "online", ip: "192.0.2.108" },
    { id: "CAM-009", name: "Workshop & Divisi Tempa", location: "Gedung Bengkel Heavy", lat: BASE_LAT - 0.0022, lng: BASE_LNG + 0.0022, status: "offline", ip: "192.0.2.109" },
    { id: "CAM-010", name: "Jalan Akses Utama", location: "Koridor Jalur Truk", lat: BASE_LAT + 0.0001, lng: BASE_LNG - 0.0020, status: "online", ip: "192.0.2.110" },
    { id: "CAM-011", name: "Gudang Logistik Senjata", location: "Sektor Khusus B", lat: BASE_LAT - 0.0028, lng: BASE_LNG + 0.0012, status: "online", ip: "192.0.2.111" },
    { id: "CAM-012", name: "Area Perimeter Timur", location: "Pagar Batas Luar", lat: BASE_LAT - 0.0005, lng: BASE_LNG + 0.0030, status: "online", ip: "192.0.2.112" },
    { id: "CAM-013", name: "Fasilitas Kantin Karyawan", location: "Area Publik Center", lat: BASE_LAT + 0.0018, lng: BASE_LNG + 0.0012, status: "online", ip: "192.0.2.113" },
    { id: "CAM-014", name: "Pos Pemeriksaan Kendaraan", location: "Inbound Heavy Check", lat: BASE_LAT - 0.0018, lng: BASE_LNG - 0.0018, status: "online", ip: "192.0.2.114" }
];

let map = null;
let mapMarkers = {};
let activeFilter = 'all';
let currentModalCamera = null;
let canvasAnimFrame = null;
let isFeedPlaying = true;

window.initMonitoringView = function () {
    if (map) {
        map.remove();
        map = null;
    }
    initClock();
    initMap();
    updateStats();
    renderCameraSideList();
    renderDeviceTable();
};

// Live Clock Updates
function initClock() {
    function update() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB';
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const dateStr = now.toLocaleDateString('id-ID', options);

        const timeEl = document.getElementById('live-time');
        const dateEl = document.getElementById('live-date');
        if (timeEl) timeEl.textContent = timeStr;
        if (dateEl) dateEl.textContent = dateStr;
    }
    update();
    setInterval(update, 1000);
}

function initMap() {
    // Center map around simulated coordinates
    map = L.map('map', {
        zoomControl: true,
        attributionControl: false
    }).setView([BASE_LAT, BASE_LNG], 16);

    const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);
    let fallbackShown = false;
    baseLayer.on('tileerror', () => {
        if (fallbackShown) return;
        fallbackShown = true;
        map.removeLayer(baseLayer);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
        }).addTo(map);
    });

    renderMapMarkers();
    setTimeout(() => {
        map.invalidateSize();
        resetMapView();
    }, 100);
}

function createMarkerIcon(status, code) {
    let colorClass = 'bg-emerald-500 marker-pulse-online';
    if (status === 'offline') colorClass = 'bg-rose-500 marker-pulse-offline';
    if (status === 'maintenance') colorClass = 'bg-amber-500 marker-pulse-maintenance';

    const html = `
                <div class="relative group cursor-pointer">
                    <div class="w-7 h-7 rounded-full ${colorClass} border-2 border-slate-950 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                        <i class="fa-solid fa-video text-[10px]"></i>
                    </div>
                    <div class="absolute left-1/2 -translate-x-1/2 top-8 bg-slate-950/90 text-slate-200 border border-slate-800 text-[10px] font-mono-code font-semibold px-2 py-0.5 rounded shadow-xl whitespace-nowrap opacity-90 group-hover:opacity-100 transition">
                        ${code}
                    </div>
                </div>
            `;

    return L.divIcon({
        html: html,
        className: 'custom-cctv-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
}

function renderMapMarkers() {
    // Clear existing markers
    Object.values(mapMarkers).forEach(m => map.removeLayer(m));
    mapMarkers = {};

    cameras.forEach(cam => {
        if (activeFilter !== 'all' && cam.status !== activeFilter) return;

        const icon = createMarkerIcon(cam.status, cam.id);
        const marker = L.marker([cam.lat, cam.lng], {
            icon: icon,
            title: `${cam.id} - ${cam.name}`,
            keyboard: true
        }).addTo(map);

        marker.on('click', () => {
            openCctvModal(cam.id);
        });

        mapMarkers[cam.id] = marker;
    });
}

function resetMapView() {
    if (!map) return;
    const group = L.featureGroup(Object.values(mapMarkers));
    if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds().pad(0.15));
    } else {
        map.setView([BASE_LAT, BASE_LNG], 16);
    }
}

function renderCameraSideList(filterText = '') {
    const listContainer = document.getElementById('camera-side-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    const filtered = cameras.filter(c => {
        const matchesFilter = activeFilter === 'all' || c.status === activeFilter;
        const matchesSearch = c.id.toLowerCase().includes(filterText.toLowerCase()) ||
            c.name.toLowerCase().includes(filterText.toLowerCase()) ||
            c.location.toLowerCase().includes(filterText.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = `
                    <div class="text-center py-8 text-slate-500 text-xs">
                        Tidak ada CCTV ditemukan
                    </div>
                `;
        return;
    }

    filtered.forEach(cam => {
        let badgeColor = 'bg-emerald-950 text-emerald-400 border-emerald-800';
        let statusText = 'ONLINE';
        if (cam.status === 'offline') {
            badgeColor = 'bg-rose-950 text-rose-400 border-rose-800';
            statusText = 'OFFLINE';
        } else if (cam.status === 'maintenance') {
            badgeColor = 'bg-amber-950 text-amber-400 border-amber-800';
            statusText = 'MAINTENANCE';
        }

        const item = document.createElement('div');
        item.className = 'bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg p-2.5 cursor-pointer transition flex items-center justify-between group';
        item.onclick = () => {
            map.panTo([cam.lat, cam.lng]);
            openCctvModal(cam.id);
        };

        item.innerHTML = `
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-mono-code font-bold text-xs text-white">${cam.id}</span>
                            <span class="text-[9px] px-1.5 py-0.2 rounded border font-bold ${badgeColor}">${statusText}</span>
                        </div>
                        <p class="text-xs text-slate-300 font-medium mt-0.5">${cam.name}</p>
                        <p class="text-[10px] text-slate-500">${cam.location}</p>
                    </div>
                    <div class="text-slate-500 group-hover:text-sky-400 text-xs">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                `;

        listContainer.appendChild(item);
    });
}

function filterCameraStatus(status) {
    activeFilter = status;
    document.getElementById('camera-filter-tag').textContent = status.toUpperCase();
    renderMapMarkers();
    renderCameraSideList(document.getElementById('map-search-input').value);
    showToast(`Filter CCTV: ${status.toUpperCase()}`);
}

function searchMapCamera() {
    const query = document.getElementById('map-search-input').value;
    renderCameraSideList(query);
}

function updateStats() {
    const total = cameras.length;
    const online = cameras.filter(c => c.status === 'online').length;
    const offline = cameras.filter(c => c.status === 'offline').length;
    const maintenance = cameras.filter(c => c.status === 'maintenance').length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-online').textContent = online;
    document.getElementById('stat-offline').textContent = offline;
    document.getElementById('stat-maintenance').textContent = maintenance;
}

function openCctvModal(camId) {
    const cam = cameras.find(c => c.id === camId);
    if (!cam) return;

    currentModalCamera = cam;

    document.getElementById('modal-cam-id').innerHTML = `
                <span>${cam.id}</span>
                <span id="modal-cam-status-badge" class="px-2 py-0.5 rounded text-[10px] font-semibold"></span>
            `;
    document.getElementById('modal-cam-location').textContent = `${cam.name} - ${cam.location}`;

    // Update info
    document.getElementById('info-code').textContent = cam.id;
    document.getElementById('info-zone').textContent = cam.location;
    document.getElementById('info-ip').textContent = cam.ip;
    document.getElementById('info-last-check').textContent = new Date().toLocaleTimeString('id-ID');

    updateModalStatusBadge(cam.status);

    const modal = document.getElementById('cctv-modal');
    modal.classList.remove('hidden');

    startCanvasFeed();
}

function updateModalStatusBadge(status) {
    const badge = document.getElementById('modal-cam-status-badge');
    if (!badge) return;

    if (status === 'online') {
        badge.className = "px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800";
        badge.innerHTML = "ONLINE";
    } else if (status === 'offline') {
        badge.className = "px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-400 border border-rose-800";
        badge.innerHTML = "OFFLINE";
    } else {
        badge.className = "px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800";
        badge.innerHTML = "MAINTENANCE";
    }
}

function closeCctvModal() {
    document.getElementById('cctv-modal').classList.add('hidden');
    if (canvasAnimFrame) {
        cancelAnimationFrame(canvasAnimFrame);
    }
    currentModalCamera = null;
}

// Animated Canvas Stream Engine
function startCanvasFeed() {
    const canvas = document.getElementById('cctv-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = 640;
    canvas.height = 360;

    let step = 0;

    function render() {
        if (!currentModalCamera) return;

        const width = canvas.width;
        const height = canvas.height;
        step += 0.05;

        // HUD Clock
        const hudTime = document.getElementById('modal-hud-timestamp');
        if (hudTime) {
            const d = new Date();
            hudTime.textContent = d.toISOString().replace('T', ' ').substring(0, 19);
        }

        // Render state-based video canvas simulation
        if (currentModalCamera.status === 'online') {
            // Dark background gradient
            const bgGrad = ctx.createLinearGradient(0, 0, width, height);
            bgGrad.addColorStop(0, '#0f172a');
            bgGrad.addColorStop(1, '#020617');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            // Simulated 3D Perspective Lines
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(width * 0.2, height);
            ctx.lineTo(width * 0.45, height * 0.4);
            ctx.moveTo(width * 0.8, height);
            ctx.lineTo(width * 0.55, height * 0.4);
            ctx.stroke();

            // Building structures
            ctx.fillStyle = '#111827';
            ctx.fillRect(40, 80, 140, 180);
            ctx.fillRect(460, 100, 150, 160);

            // Horizon
            ctx.strokeStyle = '#334155';
            ctx.beginPath();
            ctx.moveTo(0, height * 0.4);
            ctx.lineTo(width, height * 0.4);
            ctx.stroke();

            // Animated object simulation
            const objX = (Math.sin(step * 0.8) * 120) + (width / 2);
            const objY = height * 0.6 + (Math.cos(step * 0.8) * 20);

            // Motion target bounding box
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(objX - 25, objY - 15, 50, 30);

            ctx.fillStyle = '#0284c7';
            ctx.font = '10px JetBrains Mono';
            ctx.fillText('TARGET: VEHICLE DETECTED', objX - 45, objY - 22);

            // Reticle center
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, 40, 0, Math.PI * 2);
            ctx.stroke();

        } else if (currentModalCamera.status === 'offline') {
            // Signal Lost Noise
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, width, height);

            const imgData = ctx.createImageData(width, height);
            const buffer = new Uint32Array(imgData.data.buffer);
            for (let i = 0; i < buffer.length; i++) {
                if (Math.random() < 0.15) {
                    buffer[i] = 0xff888888;
                }
            }
            ctx.putImageData(imgData, 0, 0);

            ctx.fillStyle = 'rgba(225, 29, 72, 0.85)';
            ctx.fillRect(width / 2 - 130, height / 2 - 30, 260, 60);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('SIGNAL LOST / OFFLINE', width / 2, height / 2 + 5);
            ctx.textAlign = 'start';

        } else if (currentModalCamera.status === 'maintenance') {
            // Maintenance Bars
            const barWidth = width / 7;
            const colors = ['#cbd5e1', '#eab308', '#06b6d4', '#22c55e', '#a855f7', '#ef4444', '#1e3a8a'];
            for (let i = 0; i < 7; i++) {
                ctx.fillStyle = colors[i];
                ctx.fillRect(i * barWidth, 0, barWidth, height);
            }

            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(0, height / 2 - 35, width, 70);

            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('CAMERA UNDER MAINTENANCE', width / 2, height / 2 - 5);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px Inter';
            ctx.fillText('Pemeliharaan sedang berlangsung', width / 2, height / 2 + 18);
            ctx.textAlign = 'start';
        }

        if (isFeedPlaying) {
            canvasAnimFrame = requestAnimationFrame(render);
        }
    }

    render();
}

function toggleFeedPlay() {
    isFeedPlaying = !isFeedPlaying;
    const btn = document.getElementById('btn-toggle-feed');
    if (isFeedPlaying) {
        btn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause Stream`;
        startCanvasFeed();
    } else {
        btn.innerHTML = `<i class="fa-solid fa-play"></i> Resume Stream`;
    }
}

function triggerFullscreenCanvas() {
    const canvas = document.getElementById('cctv-canvas');
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
    }
}

function changeCurrentCamStatus(newStatus) {
    if (!currentModalCamera) return;

    currentModalCamera.status = newStatus;
    updateModalStatusBadge(newStatus);
    updateStats();
    renderMapMarkers();
    renderCameraSideList();
    renderDeviceTable();
    showToast(`Status ${currentModalCamera.id} diubah ke ${newStatus.toUpperCase()}`);
}

function renderDeviceTable() {
    const tbody = document.getElementById('device-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    cameras.forEach((cam, index) => {
        let badge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">ðŸŸ¢ Online</span>`;
        if (cam.status === 'offline') {
            badge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">ðŸ”´ Offline</span>`;
        } else if (cam.status === 'maintenance') {
            badge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">Maintenance</span>`;
        }

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-900/80 transition';
        tr.innerHTML = `
                    <td class="py-3 px-4 text-slate-500 font-mono-code">${String(index + 1).padStart(2, '0')}</td>
                    <td class="py-3 px-4 font-bold font-mono-code text-white">${cam.id}</td>
                    <td class="py-3 px-4 text-slate-200">${cam.name}</td>
                    <td class="py-3 px-4 text-slate-400">${cam.location}</td>
                    <td class="py-3 px-4">${badge}</td>
                    <td class="py-3 px-4 font-mono-code text-slate-400">${cam.ip}</td>
                    <td class="py-3 px-4 text-center">
                        <button onclick="openCctvModal('${cam.id}')" class="px-2.5 py-1 rounded bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-400 text-xs font-semibold transition">
                            <i class="fa-solid fa-eye"></i> Detail / Live
                        </button>
                    </td>
                `;
        tbody.appendChild(tr);
    });
}

function filterDeviceTable() {
    const q = document.getElementById('device-table-search').value.toLowerCase();
    const rows = document.querySelectorAll('#device-table-body tr');
    rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
    });
}

function switchTab(tabId) {
    // Hide all views
    document.querySelectorAll('.view-content').forEach(el => el.classList.add('hidden'));

    // Deactivate nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.className = "nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800/60 hover:text-slate-200";
    });

    // Show selected view
    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) targetView.classList.remove('hidden');

    // Highlight nav button
    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) {
        activeNav.className = "nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors bg-sky-600/20 text-sky-400 border border-sky-500/30";
    }

    // Update page title
    const titleMap = {
        'monitoring': 'Monitoring CCTV Area Utama',
        'devices': 'Daftar Perangkat & Unit CCTV'
    };
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.querySelector('span').textContent = titleMap[tabId] || 'CCTV Monitoring';

    // Resize map if switching to monitoring
    if (tabId === 'monitoring' && map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('-translate-x-full');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('-translate-x-full');
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'bg-slate-900 border border-sky-500/50 text-slate-100 text-xs px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200';
    toast.innerHTML = `
                <i class="fa-solid fa-circle-info text-sky-400"></i>
                <span>${message}</span>
            `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

