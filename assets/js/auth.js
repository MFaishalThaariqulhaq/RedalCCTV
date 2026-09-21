(function () {
  const users = {
    admin: { name: "Admin CCTV", role: "Admin" },
    staff: { name: "Petugas CCTV", role: "Staff" },
    reviewer: { name: "Koordinator Review", role: "Reviewer" },
    vpmanager: { name: "VP Manager", role: "VP Manager" }
  };
  const form = document.getElementById("login-form");
  if (!form) return;
  if (localStorage.getItem("cctv_currentUser")) {
    window.location.href = "dashboard.html";
    return;
  }
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const error = document.getElementById("login-error");
    if (!users[username] || password !== "123456") {
      error.textContent = "Username atau password tidak sesuai. Gunakan password demo 123456.";
      return;
    }
    localStorage.setItem("cctv_currentUser", JSON.stringify({ username, ...users[username] }));
    window.location.href = "dashboard.html";
  });
})();
