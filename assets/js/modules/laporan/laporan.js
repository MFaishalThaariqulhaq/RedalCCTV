(function (global) {
  global.CCTVFeatureModules = global.CCTVFeatureModules || {};
  global.CCTVFeatureModules.laporan = {
    create: function createLaporan(api) {
      const { jobs, cameras, layouts, renderBADocument, getBADocumentNumber, esc, badge, toast } = api;
      const statuses = ["Selesai", "Dalam Pengerjaan", "Dalam Pemeriksaan", "Dilaporkan"];
      const layoutNames = new Map(layouts.map(layout => [layout.id, layout.name]));
      let startDate = "";
      let endDate = "";
      let selectedJobId = "";
      let archiveStatus = "";
      let archiveInProgress = false;

      function getBAs() {
        const rows = global.CCTVStorage.getValue("cctv_bas", []);
        if (!Array.isArray(rows)) {
          throw new TypeError("Data Berita Acara harus berupa array.");
        }
        return rows;
      }

      function parseJobDate(value) {
        const text = String(value || "").trim();
        let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
        if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
        const parsed = new Date(text);
        return Number.isNaN(parsed.getTime())
          ? null
          : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      }

      function dateKey(date) {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }

      function formatDate(value) {
        const date = parseJobDate(value);
        return date ? date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : String(value || "-");
      }

      function areaFor(job) {
        const camera = cameras.find(item => item.id === job.cameraId);
        return (camera && layoutNames.get(camera.layout)) || job.location || job.divisi || "-";
      }

      function filteredJobs() {
        return jobs
          .map((job, index) => ({ job, index, date: parseJobDate(job.date) }))
          .filter(({ date }) => {
            if (!startDate && !endDate) return true;
            if (!date) return false;
            const key = dateKey(date);
            return (!startDate || key >= startDate) && (!endDate || key <= endDate);
          })
          .sort((a, b) => {
            if (!a.date && !b.date) return a.index - b.index;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date - a.date || a.index - b.index;
          })
          .map(item => item.job);
      }

      function filteredBAs() {
        return getBAs()
          .map((ba, index) => ({ ba, index, date: parseJobDate(ba.date) }))
          .filter(({ date }) => {
            if (!startDate && !endDate) return true;
            if (!date) return false;
            const key = dateKey(date);
            return (!startDate || key >= startDate) && (!endDate || key <= endDate);
          })
          .sort((a, b) => {
            if (!a.date && !b.date) return a.index - b.index;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date - a.date || a.index - b.index;
          })
          .map(item => item.ba);
      }

      function encodeText(value) {
        return new TextEncoder().encode(value);
      }

      function concatenateBytes(chunks) {
        const size = chunks.reduce((total, chunk) => total + chunk.length, 0);
        const result = new Uint8Array(size);
        let offset = 0;
        chunks.forEach(chunk => {
          result.set(chunk, offset);
          offset += chunk.length;
        });
        return result;
      }

      function createPdf(pages) {
        const objects = [];
        const pageReferences = pages.map((page, index) => `${3 + index * 3} 0 R`).join(" ");
        objects[1] = [encodeText("<< /Type /Catalog /Pages 2 0 R >>")];
        objects[2] = [encodeText(`<< /Type /Pages /Kids [${pageReferences}] /Count ${pages.length} >>`)];

        pages.forEach((page, index) => {
          const pageId = 3 + index * 3;
          const contentId = pageId + 1;
          const imageId = pageId + 2;
          const content = encodeText("q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ");
          objects[pageId] = [encodeText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`)];
          objects[contentId] = [
            encodeText(`<< /Length ${content.length} >>\nstream\n`),
            content,
            encodeText("\nendstream")
          ];
          objects[imageId] = [
            encodeText(`<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`),
            page.jpeg,
            encodeText("\nendstream")
          ];
        });

        const chunks = [encodeText("%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n")];
        const offsets = [0];
        let byteOffset = chunks[0].length;
        for (let id = 1; id < objects.length; id += 1) {
          offsets[id] = byteOffset;
          const objectChunks = [encodeText(`${id} 0 obj\n`), ...objects[id], encodeText("\nendobj\n")];
          objectChunks.forEach(chunk => {
            chunks.push(chunk);
            byteOffset += chunk.length;
          });
        }
        const xrefOffset = byteOffset;
        const xref = [`xref\n0 ${objects.length}\n`, "0000000000 65535 f \n"];
        for (let id = 1; id < objects.length; id += 1) {
          xref.push(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
        }
        xref.push(`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
        chunks.push(encodeText(xref.join("")));
        return new Blob([concatenateBytes(chunks)], { type: "application/pdf" });
      }

      function canvasJpeg(canvas) {
        return new Promise((resolve, reject) => {
          canvas.toBlob(blob => {
            if (!blob) {
              reject(new Error("Gambar halaman BA tidak dapat dikonversi."));
              return;
            }
            blob.arrayBuffer().then(buffer => resolve(new Uint8Array(buffer)), reject);
          }, "image/jpeg", 0.94);
        });
      }

      let canvasRendererPromise;

      function loadCanvasRenderer() {
        if (typeof global.html2canvas === "function") return Promise.resolve(global.html2canvas);
        if (canvasRendererPromise) return canvasRendererPromise;
        canvasRendererPromise = new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = new URL("../../assets/js/vendor/html2canvas.min.js", global.location.href).toString();
          script.onload = () => {
            if (typeof global.html2canvas !== "function") {
              reject(new Error("Library renderer PDF BA tidak tersedia."));
              return;
            }
            resolve(global.html2canvas);
          };
          script.onerror = () => reject(new Error("Library renderer PDF BA gagal dimuat."));
          document.head.appendChild(script);
        }).catch(error => {
          canvasRendererPromise = null;
          throw error;
        });
        return canvasRendererPromise;
      }

      async function paperToJpeg(paper) {
        const bounds = paper.getBoundingClientRect();
        const width = Math.ceil(bounds.width);
        const height = Math.ceil(bounds.height);
        if (!width || !height) return Promise.reject(new Error("Ukuran halaman BA tidak valid."));

        const html2canvas = await loadCanvasRenderer();
        const scale = 2;
        const canvas = await html2canvas(paper, {
          allowTaint: false,
          backgroundColor: "#ffffff",
          height,
          logging: false,
          scale,
          useCORS: true,
          width
        });
        return { width: canvas.width, height: canvas.height, jpeg: await canvasJpeg(canvas) };
      }

      function waitForImages(root) {
        return Promise.all(Array.from(root.images).map(image => {
          if (image.complete) {
            return image.naturalWidth
              ? Promise.resolve()
              : Promise.reject(new Error(`Gambar template gagal dimuat: ${image.alt || image.src}`));
          }
          return new Promise((resolve, reject) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", () => reject(new Error(`Gambar template gagal dimuat: ${image.alt || image.src}`)), { once: true });
          });
        }));
      }

      async function prepareCanvasImages(root) {
        await Promise.all(Array.from(root.images).map(async image => {
          const source = image.currentSrc || image.src;
          if (source.startsWith("data:")) return;
          const imageUrl = new URL(source, root.baseURI);
          if (imageUrl.origin === global.location.origin) {
            if (!image.complete || !image.naturalWidth) {
              throw new Error(`Gambar lokal template belum selesai dimuat: ${image.alt || source}`);
            }
            return;
          }
          let response;
          try {
            response = await fetch(imageUrl.href, { mode: "cors", credentials: "omit" });
          } catch (error) {
            throw new Error(`Gambar template tidak dapat dimuat dengan aman untuk PDF: ${image.alt || source}`);
          }
          if (!response.ok) {
            throw new Error(`Gambar template gagal dimuat (${response.status}): ${image.alt || source}`);
          }
          const blob = await response.blob();
          if (!blob.type.startsWith("image/")) {
            throw new Error(`Sumber template bukan gambar: ${image.alt || source}`);
          }
          const imageData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error(`Gambar template gagal diproses: ${image.alt || source}`));
            reader.readAsDataURL(blob);
          });
          image.src = imageData;
          try {
            await image.decode();
          } catch (error) {
            throw new Error(`Gambar template tidak dapat didekode: ${image.alt || source}`);
          }
        }));
      }

      function safeFilePart(value) {
        return String(value || "")
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
          .replace(/\s+/g, "_")
          .replace(/[^A-Za-z0-9_.-]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^[._-]+|[._-]+$/g, "")
          .slice(0, 80) || "Dokumen";
      }

      function baFileName(ba, index, jobsById, usedNames) {
        const job = jobsById.get(ba.jobId);
        const cameraId = String(job.cameraId || "").match(/(\d+)/);
        const cameraName = String(job.title || "").match(/CCTV\s*(?:No\.?\s*)?[-_ ]*(\d+)/i);
        const baCameraName = String(ba.title || "").match(/CCTV\s*(?:No\.?\s*)?[-_ ]*(\d+)/i);
        const officialNumber = (typeof ba.documentNumber === "string" && ba.documentNumber.trim()) ||
          (typeof getBADocumentNumber === "function" ? String(getBADocumentNumber(ba) || "").trim() : "");
        const cctvNumber = (baCameraName && baCameraName[1]) ||
          (cameraName && cameraName[1]) ||
          (cameraId && cameraId[1]);
        const filePart = officialNumber
          ? safeFilePart(officialNumber.replace(/\/FIK-SUS(?=\/|$)/i, "-FIK-SUS"))
          : `BA_CCTV_${safeFilePart(cctvNumber || "Dokumen")}`;
        let fileName = `${filePart}.pdf`;
        if (usedNames.has(fileName.toLowerCase())) {
          const suffix = safeFilePart(ba.sequence || ba.id || String(index + 1));
          fileName = `${filePart}_${suffix}.pdf`;
        }
        usedNames.add(fileName.toLowerCase());
        return fileName;
      }

      async function buildBAFile(ba, stylesheetUrl) {
        const frame = document.createElement("iframe");
        frame.setAttribute("aria-hidden", "true");
        frame.title = "Renderer PDF Berita Acara";
        frame.style.cssText = "position:fixed;width:1000px;height:1300px;left:-1100px;top:0;border:0;opacity:0;pointer-events:none;";
        frame.srcdoc = `<!doctype html><html lang="id"><head><meta charset="utf-8"><base href="${esc(global.location.href)}"><link rel="stylesheet" href="${esc(stylesheetUrl)}"><style>.ba-document{display:block;max-width:none;margin:0}.ba-paper{width:210mm;min-height:297mm;padding:18mm 20mm;border:0;box-shadow:none;box-sizing:border-box}.ba-detail-toolbar{display:none!important}</style></head><body style="margin:0;overflow:visible"></body></html>`;
        document.body.appendChild(frame);
        try {
          await new Promise((resolve, reject) => {
            frame.onload = resolve;
            frame.onerror = () => reject(new Error("Frame renderer BA gagal dimuat."));
          });
          const frameDocument = frame.contentDocument;
          frameDocument.body.innerHTML = renderBADocument(ba);
          await frameDocument.fonts.ready;
          await waitForImages(frameDocument);
          await prepareCanvasImages(frameDocument);
          const papers = Array.from(frameDocument.querySelectorAll(".ba-paper"));
          if (!papers.length) throw new Error("Template BA tidak menghasilkan halaman dokumen.");
          const pages = [];
          for (const paper of papers) pages.push(await paperToJpeg(paper));
          return createPdf(pages);
        } finally {
          frame.remove();
        }
      }

      async function exportSingleBA(baId) {
        const bas = getBAs();
        const ba = bas.find(item => item.id === baId);
        if (!ba) throw new Error("Berita Acara tidak ditemukan.");
        const jobsById = new Map(jobs.map(job => [job.id, job]));
        if (!jobsById.has(ba.jobId)) throw new Error("Data pekerjaan untuk Berita Acara ini tidak ditemukan.");
        const index = Math.max(0, bas.indexOf(ba));
        const pdf = await buildBAFile(ba, new URL("../../assets/css/app.css", global.location.href).toString());
        await downloadBlob(pdf, baFileName(ba, index, jobsById, new Set()));
      }

      async function downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        try {
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = fileName;
          anchor.style.display = "none";
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
        } finally {
          window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
      }

      async function archiveBAs() {
        if (archiveInProgress) return;
        const rows = filteredBAs();
        const status = document.getElementById("reports-archive-status");
        const button = document.getElementById("reports-archive-button");
        if (!rows.length) {
          archiveStatus = "Belum ada Berita Acara yang dapat diexport.";
          if (status) status.textContent = archiveStatus;
          return;
        }
        const jobsById = new Map(jobs.map(job => [job.id, job]));
        const missingJobs = rows.filter(ba => !jobsById.has(ba.jobId));
        if (missingJobs.length) {
          archiveStatus = `${missingJobs.length} Berita Acara tidak dapat diexport karena data pekerjaan terkait tidak ditemukan.`;
          if (status) status.textContent = archiveStatus;
          return;
        }
        if (typeof renderBADocument !== "function") {
          archiveStatus = "Template Berita Acara tidak tersedia untuk export.";
          if (status) status.textContent = archiveStatus;
          return;
        }

        archiveInProgress = true;
        if (button) button.disabled = true;
        const setStatus = message => {
          archiveStatus = message;
          if (status) status.textContent = message;
        };
        try {
          setStatus(`Menyiapkan arsip BA (0/${rows.length})...`);
          const stylesheetUrl = new URL("../../assets/css/app.css", global.location.href).toString();
          const usedNames = new Set();
          const downloads = [];
          for (let index = 0; index < rows.length; index += 1) {
            setStatus(`Menyiapkan arsip BA (${index + 1}/${rows.length})...`);
            const ba = rows[index];
            const pdf = await buildBAFile(ba, stylesheetUrl);
            downloads.push({ pdf, fileName: baFileName(ba, index, jobsById, usedNames) });
          }
          downloads.forEach(({ pdf, fileName }) => {
            void downloadBlob(pdf, fileName);
          });
          setStatus(`${downloads.length} file PDF BA berhasil diunduh.`);
        } catch (error) {
          setStatus(`Export BA gagal: ${error.message}`);
          console.error("Export arsip Berita Acara gagal:", error);
        } finally {
          archiveInProgress = false;
          if (button) button.disabled = false;
        }
      }

      function countBy(rows, getLabel) {
        const counts = new Map();
        rows.forEach(job => {
          const label = String(getLabel(job) || "").trim() || "Tidak dicantumkan";
          counts.set(label, (counts.get(label) || 0) + 1);
        });
        return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "id"));
      }

      function summaryMarkup(rows) {
        const counts = Object.fromEntries(statuses.map(status => [status, rows.filter(job => job.status === status).length]));
        const summaries = [
          ["Total Pekerjaan", rows.length],
          ["Selesai", counts["Selesai"]],
          ["Dalam Pengerjaan", counts["Dalam Pengerjaan"]],
          ["Dalam Pemeriksaan", counts["Dalam Pemeriksaan"]],
          ["Dilaporkan", counts["Dilaporkan"]]
        ];
        return `<section class="reports-summary-grid" aria-label="Ringkasan pekerjaan">${summaries.map(([label, value]) => `<article class="card reports-summary-card"><span>${label}</span><strong>${value}</strong></article>`).join("")}</section>`;
      }

      function breakdownMarkup(title, entries, emptyText) {
        return `<section class="card reports-breakdown"><h2>${title}</h2>${entries.length ? `<div class="reports-breakdown-list">${entries.map(([label, count]) => `<div class="reports-breakdown-row"><span>${esc(label)}</span><strong>${count}</strong></div>`).join("")}</div>` : `<p class="reports-muted">${emptyText}</p>`}</section>`;
      }

      function jobDetailMarkup(job) {
        if (!job) return "";
        return `<section class="card reports-detail" aria-live="polite"><div class="reports-detail-heading"><div><span class="reports-muted">Detail pekerjaan</span><h2>${esc(job.title || "-")}</h2></div><button class="btn" type="button" onclick="rendalToggleReportDetail('')">Tutup</button></div><dl class="reports-detail-grid"><div><dt>Tanggal</dt><dd>${esc(formatDate(job.date))}</dd></div><div><dt>CCTV / Nama Perangkat</dt><dd>${esc(job.title || "-")}</dd></div><div><dt>Area / Layout</dt><dd>${esc(areaFor(job))}</dd></div><div><dt>Kendala</dt><dd>${esc(job.temuan || "-")}</dd></div><div><dt>Tindakan</dt><dd>${esc(job.tindakan || "-")}</dd></div><div><dt>Petugas</dt><dd>${esc(job.createdByName || job.pic || "-")}</dd></div><div><dt>Status</dt><dd>${badge(job.status || "-")}</dd></div><div><dt>ID Pekerjaan</dt><dd>${esc(job.id || "-")}</dd></div></dl></section>`;
      }

      function tableMarkup(rows) {
        const selectedJob = rows.find(job => job.id === selectedJobId);
        if (selectedJobId && !selectedJob) selectedJobId = "";
        return `<section class="card reports-table-card"><div class="reports-section-heading"><div><h2>Riwayat Pekerjaan</h2><p class="reports-muted">${rows.length} pekerjaan pada periode yang dipilih</p></div></div><div class="table-wrap reports-table-wrap"><table class="reports-table"><thead><tr><th>No</th><th>Tanggal</th><th>CCTV / Nama Perangkat</th><th>Area / Layout</th><th>Kendala</th><th>Tindakan</th><th>Petugas</th><th>Status</th></tr></thead><tbody>${rows.map((job, index) => `<tr class="reports-job-row ${job.id === selectedJobId ? "is-selected" : ""}" tabindex="0" onclick="rendalToggleReportDetail('${esc(job.id)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();rendalToggleReportDetail('${esc(job.id)}')}"><td data-label="No">${index + 1}</td><td data-label="Tanggal">${esc(formatDate(job.date))}</td><td data-label="CCTV / Nama Perangkat">${esc(job.title || "-")}</td><td data-label="Area / Layout">${esc(areaFor(job))}</td><td data-label="Kendala">${esc(job.temuan || "-")}</td><td data-label="Tindakan">${esc(job.tindakan || "-")}</td><td data-label="Petugas">${esc(job.createdByName || job.pic || "-")}</td><td data-label="Status">${badge(job.status || "-")}</td></tr>`).join("") || `<tr><td colspan="8" class="reports-empty">Belum ada data pekerjaan pada periode yang dipilih.</td></tr>`}</tbody></table></div></section>${jobDetailMarkup(selectedJob)}`;
      }

      function reportsPage() {
        const rows = filteredJobs();
        const issues = countBy(rows, job => job.temuan);
        const areas = countBy(rows, areaFor);
        return `<div id="reports-root"><div class="page-heading reports-heading"><div><h1>Laporan</h1><p class="muted">Rekap dan riwayat pekerjaan CCTV berdasarkan data pencatatan.</p></div><button class="btn btn-primary" id="reports-archive-button" type="button" onclick="rendalExportBAArchive()" ${archiveInProgress ? "disabled" : ""}>Export BA</button></div><p class="reports-archive-help">Export BA mengikuti filter tanggal dan mengunduh satu file PDF untuk setiap Berita Acara.</p><p class="reports-archive-status" id="reports-archive-status" role="status" aria-live="polite">${esc(archiveStatus)}</p><form class="card reports-filter" onsubmit="event.preventDefault();rendalApplyReportFilter(this)"><label>Tanggal mulai<input class="field" type="date" name="startDate" value="${esc(startDate)}"></label><label>Tanggal akhir<input class="field" type="date" name="endDate" value="${esc(endDate)}"></label><div class="reports-filter-actions"><button class="btn btn-primary" type="submit">Terapkan Filter</button><button class="btn" type="button" onclick="rendalResetReportFilter()">Reset</button></div></form>${rows.length ? "" : `<p class="reports-empty-notice" role="status">Belum ada data pekerjaan pada periode yang dipilih.</p>`}${summaryMarkup(rows)}<div class="reports-breakdown-grid">${breakdownMarkup("Rekap Kendala", issues, "Tidak ada rekap kendala pada periode ini.")}${breakdownMarkup("Rekap Area / Layout", areas, "Tidak ada rekap area pada periode ini.")}</div>${tableMarkup(rows)}</div>`;
      }

      function refreshReportView() {
        const root = document.getElementById("reports-root");
        if (root) {
          root.outerHTML = reportsPage();
          if (global.lucide) global.lucide.createIcons();
        }
      }

      global.rendalApplyReportFilter = form => {
        startDate = String(new FormData(form).get("startDate") || "");
        endDate = String(new FormData(form).get("endDate") || "");
        archiveStatus = "";
        refreshReportView();
      };
      global.rendalResetReportFilter = () => {
        startDate = "";
        endDate = "";
        selectedJobId = "";
        archiveStatus = "";
        refreshReportView();
      };
      global.rendalExportBAArchive = archiveBAs;
      global.rendalExportSingleBA = async baId => {
        try {
          await exportSingleBA(String(baId || ""));
        } catch (error) {
          console.error("Export Berita Acara gagal:", error);
          toast(`Export BA gagal: ${error.message}`, "info");
        }
      };
      global.rendalToggleReportDetail = jobId => {
        selectedJobId = selectedJobId === String(jobId || "") ? "" : String(jobId || "");
        refreshReportView();
      };

      return { reportsPage, refreshReportView };
    }
  };
})(window);
