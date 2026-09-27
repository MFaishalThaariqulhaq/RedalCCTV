(function (global) {
  global.CCTVFeatureModules = global.CCTVFeatureModules || {};
  global.CCTVFeatureModules.approval = {
    create: function createApproval(api) {
      const { bas, jobs, esc, badge, save, render, toast } = api;
      function approvalPage() {
        const pending = bas.filter(b => b.status === "Menunggu Review" || b.status === "Menunggu Approval");
        return `<div class="page-heading"><div><h1>Approval BA</h1><p class="muted">Dokumen yang memerlukan tindakan sesuai role Anda.</p></div></div><div class="grid grid-2">${pending.map(b => `<section class="card"><h3>${esc(b.id)}</h3><p>${esc(b.title)}</p><p class="muted">${esc(b.divisi)} ? Diajukan ${esc(b.date)}</p><p>${badge(b.status)}</p><button class="btn btn-primary" onclick="rendalGo('berita-acara-detail','${b.id}')">Lihat BA</button></section>`).join("") || `<section class="card"><p>Tidak ada dokumen yang menunggu tindakan.</p></section>`}</div>`;
      }
      function forward(id) {
        const ba = bas.find(item => item.id === id);
        if (ba) ba.status = "Menunggu Approval";
        save(); render(); toast("BA diteruskan ke VP Manager.");
      }
      function approve(id) {
        if (!confirm("Apakah Anda yakin ingin menyetujui Berita Acara ini?")) return;
        const ba = bas.find(item => item.id === id);
        const job = ba && jobs.find(item => item.id === ba.jobId);
        if (ba) ba.status = "Approved";
        if (job) { job.status = "Selesai"; job.progress = 100; }
        save(); render(); toast("BA disetujui. Pekerjaan selesai.");
      }
      function revision(id) {
        const reason = prompt("Alasan revisi:");
        if (!reason) return;
        const ba = bas.find(item => item.id === id);
        const job = ba && jobs.find(item => item.id === ba.jobId);
        if (ba) { ba.status = "Revisi"; ba.revision = reason; }
        if (job) job.status = "Revisi";
        save(); render(); toast("BA dikembalikan untuk revisi.");
      }
      return { approvalPage, forward, approve, revision };
    }
  };
})(window);
