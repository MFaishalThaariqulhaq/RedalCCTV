(function (global) {
  // ============================================================
  // # KONFIGURASI: KUNCI DAN STATUS CCTV
  // ============================================================
  const cameraOverridesKey = "cctv_camera_overrides";
  const cameraPositionsKey = "cctv_camera_positions";
  const customCamerasKey = "cctv_custom_cameras";
  const deletedCamerasKey = "cctv_deleted_cameras";
  const legacyCamerasKey = "cctv_cameras";
  const jobsKey = "cctv_logs";
  const validCameraStatuses = new Set(["normal", "dalam_pemeriksaan", "dalam_pengerjaan", "bermasalah"]);

  function normalizeCameraStatus(status) {
    const normalized = String(status || "").trim().toLowerCase().replace(/\s+/g, "_");
    const aliases = {
      pemeriksaan: "dalam_pemeriksaan",
      "dalam pemeriksaan": "dalam_pemeriksaan",
      pengerjaan: "dalam_pengerjaan",
      "dalam pengerjaan": "dalam_pengerjaan",
      bermasalah: "bermasalah",
      normal: "normal"
    };
    return aliases[normalized] || aliases[String(status || "").trim().toLowerCase()] || normalized;
  }

  // ============================================================
  // # STORAGE: BACA DAN TULIS LOCALSTORAGE
  // ============================================================
  function read(key, fallback) {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error(`Data localStorage "${key}" tidak dapat dibaca:`, error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Data localStorage "${key}" tidak dapat disimpan:`, error);
      throw error;
    }
  }

  // ============================================================
  // # STORAGE: DATA CCTV DAN POSISI MARKER
  // ============================================================
  function cameraOverrides() {
    const current = read(cameraOverridesKey, null);
    if (current && typeof current === "object" && !Array.isArray(current)) return current;

    const legacy = read(legacyCamerasKey, []);
    if (!Array.isArray(legacy)) return {};
    return legacy.reduce((overrides, camera) => {
      if (camera && typeof camera.id === "string") {
        const normalizedStatus = normalizeCameraStatus(camera.status);
        const status = validCameraStatuses.has(normalizedStatus) ? normalizedStatus : null;
        const kendala = typeof camera.kendala === "string" ? camera.kendala : null;
        if (status || kendala !== null) {
          overrides[camera.id] = {
            ...(status ? { status } : {}),
            ...(kendala !== null ? { kendala } : {})
          };
        }
      }
      return overrides;
    }, {});
  }

  function cameraPositions() {
    const stored = read(cameraPositionsKey, null);
    if (stored && typeof stored === "object" && !Array.isArray(stored)) return stored;
    return {};
  }

  function cameraPositionById() {
    const positions = cameraPositions();
    return Object.entries(positions).reduce((byId, [key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(position => {
          if (position && typeof position.id === "string") byId[position.id] = position;
        });
      } else if (value && typeof value === "object" && Number.isFinite(Number(value.x)) && Number.isFinite(Number(value.y))) {
        byId[key] = value;
      }
      return byId;
    }, {});
  }

  function customCameras() {
    const stored = read(customCamerasKey, []);
    return Array.isArray(stored) ? stored : [];
  }

  function deletedCameras() {
    const stored = read(deletedCamerasKey, []);
    return Array.isArray(stored) ? stored : [];
  }

  function getCameras(defaults) {
    const overrides = cameraOverrides();
    const positions = cameraPositionById();
    const custom = customCameras();
    const deleted = new Set(deletedCameras());
    const allDefaults = defaults.filter(camera => !deleted.has(camera.id));

    custom.forEach(camera => {
      if (!camera || typeof camera.id !== "string") return;
      if (!allDefaults.some(item => item.id === camera.id)) {
        allDefaults.push(camera);
      }
    });

    return allDefaults.map(camera => {
      const override = overrides[camera.id];
      const position = positions[camera.id];
      const base = { ...camera };
      if (override && typeof override === "object") {
        Object.assign(base, {
          ...(validCameraStatuses.has(normalizeCameraStatus(override.status)) ? { status: normalizeCameraStatus(override.status) } : {}),
          ...(typeof override.kendala === "string" ? { kendala: override.kendala } : {})
        });
      }
      if (position && typeof position === "object") {
        const x = Number(position.x);
        const y = Number(position.y);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          base.x = Math.min(100, Math.max(0, x));
          base.y = Math.min(100, Math.max(0, y));
        }
      }
      return base;
    });
  }

  function saveCameras(cameras, defaults) {
    const overrides = {};
    const positions = {};
    const defaultsById = new Map(defaults.map(camera => [camera.id, camera]));
    const deleted = new Set(deletedCameras());
    const custom = [];

    defaults.forEach(camera => {
      if (cameras.some(item => item && item.id === camera.id)) deleted.delete(camera.id);
      else deleted.add(camera.id);
    });
    cameras.forEach(camera => {
      if (!camera || typeof camera.id !== "string") return;
      const x = Number(camera.x);
      const y = Number(camera.y);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        const layout = String(camera.layout || "");
        if (!positions[layout]) positions[layout] = [];
        positions[layout].push({
          id: camera.id,
          number: String(camera.number || ""),
          x: Math.min(100, Math.max(0, x)),
          y: Math.min(100, Math.max(0, y))
        });
      }

      const fallback = defaultsById.get(camera.id);
      if (!fallback) {
        custom.push({ ...camera });
        return;
      }

      const status = normalizeCameraStatus(camera.status);
      const changedStatus = validCameraStatuses.has(status) && status !== fallback.status;
      const kendala = typeof camera.kendala === "string" ? camera.kendala : "";
      const changedKendala = kendala !== (fallback.kendala || "");
      if (changedStatus || changedKendala) overrides[camera.id] = {
        ...(changedStatus ? { status } : {}),
        ...(changedKendala ? { kendala } : {})
      };
    });

    write(cameraOverridesKey, overrides);
    write(cameraPositionsKey, positions);
    write(customCamerasKey, custom);
    write(deletedCamerasKey, Array.from(deleted));
  }

  function deleteCamera(cameraId, layoutId, defaults) {
    const defaultCamera = defaults.find(camera => camera.id === cameraId && camera.layout === layoutId);
    const custom = customCameras();
    const customCamera = custom.find(camera => camera.id === cameraId && camera.layout === layoutId);
    if (!defaultCamera && !customCamera) return false;

    if (defaultCamera) {
      const deleted = new Set(deletedCameras());
      deleted.add(cameraId);
      write(deletedCamerasKey, Array.from(deleted));
    }
    if (customCamera) {
      write(customCamerasKey, custom.filter(camera => camera.id !== cameraId || camera.layout !== layoutId));
    }

    return true;
  }

  // ============================================================
  // # STORAGE: PEKERJAAN, MASTER, DAN RESET DATA
  // ============================================================
  function getJobs(defaults) {
    const stored = read(jobsKey, null);
    return Array.isArray(stored) ? stored : defaults;
  }

  function saveJobs(jobs) {
    write(jobsKey, jobs);
  }

  function getValue(key, fallback) {
    return read(key, fallback);
  }

  function saveValue(key, value) {
    write(key, value);
  }

  function resetPrototypeData() {
    [cameraOverridesKey, cameraPositionsKey, customCamerasKey, deletedCamerasKey, jobsKey, "cctv_bas", "cctv_master"].forEach(key => localStorage.removeItem(key));
  }

  global.CCTVStorage = { getCameras, saveCameras, deleteCamera, getJobs, saveJobs, getValue, saveValue, resetPrototypeData };
})(window);
