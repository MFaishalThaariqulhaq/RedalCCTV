(function (global) {
  global.CCTVFeatureModules = global.CCTVFeatureModules || {};
  global.CCTVFeatureModules.master = {
    create: function createMaster(api) {
      const { master, esc, getPage, save, render } = api;
      function masterPage() {
        const page = getPage();
        const key = page === "personel" ? "personel" : page === "kendaraan" ? "kendaraan" : "divisi";
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        const cameraRows = master[key].map((item, i) => `<tr><td>${i + 1}</td><td>${esc(item)}</td><td><button class="btn btn-danger" onclick="rendalDeleteMaster('${key}',${i})">Hapus</button></td></tr>`).join("");
        return `<div class="page-heading"><div><h1>Data ${label}</h1><p class="muted">Kelola data master ${label.toLowerCase()}.</p></div></div><section class="card"><div class="table-wrap"><table><thead><tr><th>#</th><th>Nama</th><th>Aksi</th></tr></thead><tbody>${cameraRows}</tbody></table></div></section>`;
      }
      function add(key) {
        const value = prompt(`Nama ${key}:`);
        if (!value) return;
        master[key].push(value); save(); render();
      }
      function remove(key, index) {
        if (!confirm("Hapus data ini?")) return;
        master[key].splice(index, 1); save(); render();
      }
      return { masterPage, add, remove };
    }
  };
})(window);
