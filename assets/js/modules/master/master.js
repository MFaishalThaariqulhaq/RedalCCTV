(function (global) {
  global.CCTVFeatureModules = global.CCTVFeatureModules || {};
  global.CCTVFeatureModules.master = {
    create: function createMaster(api) {
      const { master, monitoringDevices, cameras, esc, getPage, save, render, toast } = api;
      function masterPage() {
        const page = getPage();
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
      function add(key) {
        const value = prompt(`Nama ${key}:`);
        if (!value) return;
        master[key].push(value); save(); render();
      }
      function editCamera(rig) {
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
        save(); render(); toast(`Data RIG-${String(rig).padStart(3, "0")} berhasil diperbarui.`);
      }
      function remove(key, index) {
        if (!confirm("Hapus data ini?")) return;
        master[key].splice(index, 1); save(); render();
      }
      return { masterPage, add, editCamera, remove };
    }
  };
})(window);
