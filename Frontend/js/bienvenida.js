const loginForm = document.getElementById("login-form");
const nameInput = document.getElementById("nombre");
const loginContainer = document.getElementById("login-container");
const siteContent = document.getElementById("site-content");
const welcomeMessage = document.getElementById("welcome-message");

// Lista de usuarios administradores válidos
const ADMIN_USERS = ["admin", "nahuel_admin", "root"];

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const userName = nameInput.value.trim().toLowerCase();

  if (!userName) {
    alert("Por favor, ingresa tu nombre.");
    return;
  }

  // Si es admin → ir al panel de admin
  if (ADMIN_USERS.includes(userName)) {
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("userName", userName);

    alert("Acceso administrador concedido.");
    window.location.href = "http://localhost:3000/admin/login";
    return;
  }

  // Usuario normal
  localStorage.setItem("userName", userName);
  localStorage.removeItem("isAdmin");

  welcomeMessage.textContent = `¡Hola, ${userName}!`;
  loginContainer.classList.add("hidden");
  siteContent.classList.remove("hidden");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
});

// Autologin si ya hay usuario guardado
const storedName = localStorage.getItem("userName");

if (storedName) {
  welcomeMessage.textContent = `¡Hola de nuevo, ${storedName}!`;
  loginContainer.classList.add("hidden");
  siteContent.classList.remove("hidden");
}
