const loginForm = document.getElementById("login-form");
const nameInput = document.getElementById("nombre");
const loginContainer = document.getElementById("login-container");
const siteContent = document.getElementById("site-content");
const welcomeMessage = document.getElementById("welcome-message");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const userName = nameInput.value.trim();

  // Modo usuario normal
  if (userName) {
    if (userName === "nahuel_admin") {
      localStorage.setItem("isAdmin", true);
      alert("Acceso concedido como administrador.");
      window.location.href = "admin.html";
      return;
    } else {
      localStorage.setItem("userName", userName);
      welcomeMessage.textContent = `¡Hola, ${userName}!`;
      loginContainer.classList.add("hidden");
      siteContent.classList.remove("hidden");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    }
  } else {
    alert("Por favor, ingresa tu nombre.");
  }
});

const storedName = localStorage.getItem("userName");
if (storedName) {
  welcomeMessage.textContent = `¡Hola de nuevo, ${storedName}!`;
  loginContainer.classList.add("hidden");
  siteContent.classList.remove("hidden");
}
