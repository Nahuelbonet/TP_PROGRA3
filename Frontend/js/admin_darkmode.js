// MODO OSCURO GLOBAL PARA TODO EL ADMIN

// Espero a que cargue todo el HTML antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {

  // Busco el botón del modo oscuro
  const toggle = document.getElementById("dark-toggle");

  // Si la página no tiene el botón, no hago nada
  if (!toggle) return;

  // Si ya tenía guardado en localStorage que el admin estaba en modo oscuro,
  // aplico la clase apenas carga la página
  if (localStorage.getItem("adminDarkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  // Evento cuando toco el botón de modo oscuro
  toggle.addEventListener("click", () => {

    // Activo o desactivo la clase que cambia todos los colores
    document.body.classList.toggle("dark-mode");

    // Guardo en localStorage cómo quedó el estado (true o false)
    localStorage.setItem(
      "adminDarkMode",
      document.body.classList.contains("dark-mode")
    );

    // Cambio el icono del botón según el modo actual
    toggle.textContent = document.body.classList.contains("dark-mode")
      ? "☀️"   // si está oscuro, muestro sol
      : "🌙";  // si está claro, muestro luna
  });

  // Al cargar la página, acomodo el icono según el modo que esté activo
  toggle.textContent = document.body.classList.contains("dark-mode")
    ? "☀️"
    : "🌙";
});
