(function (global) {
  global.CCTVFeatureModules = global.CCTVFeatureModules || {};
  global.CCTVFeatureModules.monitoring = global.CCTVFeatureModules.monitoring || {};
  global.CCTVFeatureModules.monitoring.ensureAssets = function (loadAsset) {
    return Promise.all([
      loadAsset("link", "assets/css/modules/monitoring.css"),
      loadAsset("link", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"),
      loadAsset("link", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"),
      loadAsset("script", "https://cdn.tailwindcss.com"),
      loadAsset("script", "assets/js/modules/monitoring/monitoring-template.js"),
      loadAsset("script", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js")
    ]);
  };
})(window);
