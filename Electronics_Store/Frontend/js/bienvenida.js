// Traigo todos los elementos del login y del contenido del sitio
const loginForm = document.getElementById("login-form");
const nameInput = document.getElementById("nombre");
const loginContainer = document.getElementById("login-container");
const siteContent = document.getElementById("site-content");
const welcomeMessage = document.getElementById("welcome-message");

// Lista de usuarios que pueden entrar al panel admin
// (los comparo siempre en minúscula)
const ADMIN_USERS = ["admin", "nahuel_admin", "root"];

// Cuando se envía el formulario de login...
loginForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Evito el refresh automático

  // Tomo el nombre ingresado
  const userName = nameInput.value.trim().toLowerCase();

  // Si el usuario no escribió nada → aviso
  if (!userName) {
    alert("Por favor, ingresa tu nombre.");
    return;
  }

  // ============================================
  // SI EL USUARIO ES ADMIN
  // ============================================
  if (ADMIN_USERS.includes(userName)) {
    // Guardo en localStorage que es admin
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("userName", userName);

    alert("Acceso administrador concedido.");

    // Lo mando directo al login del backend
    window.location.href = "http://localhost:3000/admin/login";
    return;
  }

  // ============================================
  // SI ES UN USUARIO NORMAL
  // ============================================
  localStorage.setItem("userName", userName);
  localStorage.removeItem("isAdmin"); // Me aseguro de limpiar admin

  // Actualizo el mensaje de bienvenida
  welcomeMessage.textContent = `¡Hola, ${userName}!`;

  // Oculto el login y muestro el contenido del sitio
  loginContainer.classList.add("hidden");
  siteContent.classList.remove("hidden");

  // Redirección después de 1.5 segundos
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
});

// ============================================
// AUTOLOGIN: si ya hay un usuario guardado
// ============================================
const storedName = localStorage.getItem("userName");

// Si hay un usuario guardado → muestro directamente el contenido
if (storedName) {
  welcomeMessage.textContent = `¡Hola de nuevo, ${storedName}!`;
  loginContainer.classList.add("hidden");
  siteContent.classList.remove("hidden");
}
