// MODO OSCURO GLOBAL PARA TODO EL ADMIN
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("dark-toggle");
  if (!toggle) return;

  // Cargar estado guardado
  if (localStorage.getItem("adminDarkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    localStorage.setItem(
      "adminDarkMode",
      document.body.classList.contains("dark-mode")
    );

    // Cambiar ícono
    toggle.textContent = document.body.classList.contains("dark-mode")
      ? "☀️"
      : "🌙";
  });

  // Ajustar ícono al cargar
  toggle.textContent = document.body.classList.contains("dark-mode")
    ? "☀️"
    : "🌙";
});
