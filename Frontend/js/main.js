// ===============================
// VARIABLES GLOBALES
// ===============================

// Carrito actual del usuario
const carrito = [];

// Categoría seleccionada por defecto
let categoriaActual = "Todos";

// Lista completa de productos traída desde el backend
let productosGlobal = [];

// Lista de productos filtrados u ordenados
let productosFiltrados = [];


// ===============================
// FUNCIÓN PRINCIPAL - ARRANCA TODO
// ===============================
function init() {
  obtenerProductos();          // Trae productos del backend
  filtrarProductos();          // Habilita buscador
  ordenarPorNombre();          // Habilita botón ordenar por nombre
  ordenarPorPrecio();          // Habilita ordenar por precio
  cargarCarrito();             // Recupera carrito guardado en localStorage
  vaciarCarrito();             // Botón para vaciar carrito
  mostrarCarrito();            // Renderiza carrito en pantalla
  ocultarCarrito();            // Cierra o abre panel del carrito
  actualizarTotal();           // Actualiza el total del carrito
  actualizarContadorCarrito(); // Actualiza contador de productos
  filtrarPorCategoria();       // Habilita filtros de categorías
  chequearLogin();             // Previene acceso sin login
  iniciarModoOscuro();         // Activa o recupera el modo oscuro

  // Botón de finalizar compra
  const btnFinalizar = document.getElementById("finalizar_compra");
  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", finalizarCompra);
  }
}


// ===============================
// LOGIN - SI NO ESTÁ LOGUEADO, LO SACA
// ===============================
function chequearLogin() {
  const usuarioLogeado = localStorage.getItem("userName");

  // Si no hay usuario → limpiar todo y volver a bienvenida
  if (!usuarioLogeado) {
    setTimeout(() => {
      carrito.length = 0;
      localStorage.removeItem("carrito");
      window.location.href = "bienvenida.html";
    }, 800);
  }
}


// ===============================
// PRODUCTOS DESDE EL BACKEND
// ===============================
async function obtenerProductos(filtro = "") {
  const contenedor = document.querySelector(".lista_productos");
  contenedor.innerHTML = "<p>Cargando productos...</p>";

  try {
    const res = await fetch("http://localhost:3000/productos");
    const productos = await res.json();

    // Guardo la lista global de productos
    productosGlobal = productos;

    // Renderizo productos en pantalla
    renderizarProductos(productos, filtro);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    contenedor.innerHTML = "<p>Error al cargar productos 😥</p>";
  }
}


// ===============================
// RENDERIZAR PRODUCTOS EN PANTALLA
// ===============================
function renderizarProductos(lista, filtro = "") {
  const contenedor = document.querySelector(".lista_productos");
  contenedor.innerHTML = "";

  // Aplicar el filtro por nombre
  const filtrados = lista.filter((producto) =>
    producto.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  if (filtrados.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  // Crear tarjeta por cada producto
  filtrados.forEach((producto) => {
    const div = document.createElement("div");
    div.classList.add("card");

    div.innerHTML = `
      <img src="./assets/img/${producto.img}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p>$${producto.precio}</p>
      <button class="add-to-cart" id-prod="${producto.id}">Agregar al carrito</button>
    `;

    contenedor.appendChild(div);
  });

  productosFiltrados = lista;

  // Activo nuevamente los botones "Agregar al carrito"
  addToCart();
}


// ===============================
// BUSCADOR DE PRODUCTOS
// ===============================
function filtrarProductos() {
  const input = document.querySelector('input[type="text"]');

  input.addEventListener("input", () => {
    renderizarProductos(productosGlobal, input.value);
  });
}


// ===============================
// ORDENAR POR NOMBRE
// ===============================
function ordenarPorNombre() {
  const btn = document.getElementById("ordenar-nombre");

  btn.addEventListener("click", () => {
    const lista = [...productosFiltrados].sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
    renderizarProductos(lista);
  });
}


// ===============================
// ORDENAR POR PRECIO
// ===============================
function ordenarPorPrecio() {
  const btn = document.getElementById("ordenar-precio");

  btn.addEventListener("click", () => {
    const lista = [...productosFiltrados].sort((a, b) => a.precio - b.precio);
    renderizarProductos(lista);
  });
}


// ===============================
// FILTRO POR CATEGORÍAS
// ===============================
function filtrarPorCategoria() {
  const enlaces = document.querySelectorAll(".contenido-desplegable a");
  const titulo = document.getElementById("titulo-productos");

  enlaces.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const categoria = e.target.getAttribute("data-categoria");

      // Si elige "Todos", mostrar todos los productos
      const filtrados =
        categoria.toLowerCase() === "todos"
          ? productosGlobal
          : productosGlobal.filter(
              (p) => p.categoria.toLowerCase() === categoria.toLowerCase()
            );

      // Cambiar título según la categoría
      titulo.textContent =
        categoria.toLowerCase() === "todos"
          ? "Nuestros Productos"
          : categoria;

      renderizarProductos(filtrados);
    });
  });
}


// ===============================
// CARRITO: AGREGAR PRODUCTO
// ===============================
function addToCart() {
  const botones = document.querySelectorAll(".add-to-cart");

  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("id-prod"));
      const producto = productosGlobal.find((p) => p.id === id);

      // Si ya existe en carrito → aumentar cantidad
      const existe = carrito.find((p) => p.id === id);

      if (existe) {
        existe.cantidad++;
      } else {
        carrito.push({ ...producto, cantidad: 1 });
      }

      guardarCarrito();
      mostrarCarrito();
    });
  });
}


// ===============================
// MOSTRAR CARRITO
// ===============================
function mostrarCarrito() {
  const contenedor = document.querySelector(".carrito-items");
  contenedor.innerHTML = "";

  carrito.forEach((producto, index) => {
    const div = document.createElement("div");
    div.classList.add("cart-product");

    div.innerHTML = `
      <img src="./assets/img/${producto.img}">
      <div class="cart-info">
        <h3>${producto.nombre}</h3>
        <p>$${producto.precio * producto.cantidad}</p>
      </div>
      <div class="controles-cantidad">
        <button class="decrease" data-index="${index}">-</button>
        <span class="cantidad">${producto.cantidad}</span>
        <button class="increase" data-index="${index}">+</button>
      </div>
    `;

    contenedor.appendChild(div);
  });

  configurarBotonesCantidad();
  actualizarTotal();
  actualizarContadorCarrito();
}


// ===============================
// BOTONES + Y - DEL CARRITO
// ===============================
function configurarBotonesCantidad() {
  // Botón "+"
  document.querySelectorAll(".increase").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      carrito[index].cantidad++;
      guardarCarrito();
      mostrarCarrito();
    })
  );

  // Botón "-"
  document.querySelectorAll(".decrease").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);

      // Si queda en 0 → eliminar producto
      if (carrito[index].cantidad > 1) carrito[index].cantidad--;
      else carrito.splice(index, 1);

      guardarCarrito();
      mostrarCarrito();
    })
  );
}


// ===============================
// LOCALSTORAGE: GUARDAR Y RECUPERAR CARRITO
// ===============================
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cargarCarrito() {
  const guardado = localStorage.getItem("carrito");
  if (guardado) {
    carrito.length = 0;
    JSON.parse(guardado).forEach((item) => carrito.push(item));
  }
}


// ===============================
// VACIAR CARRITO
// ===============================
function vaciarCarrito() {
  const btn = document.querySelector(".vaciar");
  if (!btn) return;

  btn.addEventListener("click", () => {
    carrito.length = 0;
    guardarCarrito();
    mostrarCarrito();
  });
}


// ===============================
// TOTAL DEL CARRITO
// ===============================
function actualizarTotal() {
  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  document.querySelector(".carrito-total").innerText = `Total: $${total}`;
}


// ===============================
// CONTADOR DE ÍTEMS DEL CARRITO
// ===============================
function actualizarContadorCarrito() {
  const contador = document.getElementById("contador_carrito");
  const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  contador.innerText = `Carrito-Productos: ${total}`;
}


// ===============================
// PANEL DEL CARRITO (ABRIR/CERRAR)
// ===============================
function ocultarCarrito() {
  const boton = document.querySelector(".boton_carrito");
  const menu = document.getElementById("panel-carrito");
  const cerrar = document.getElementById("cerrar-carrito");

  boton.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.add("visible");
  });

  cerrar.addEventListener("click", () => menu.classList.remove("visible"));

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !boton.contains(e.target)) {
      menu.classList.remove("visible");
    }
  });
}


// ===============================
// NAVBAR + DROPDOWN
// ===============================
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => nav.classList.toggle("open"));

  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
      nav.classList.remove("open");
    }
  });
}

// Dropdown dentro del navbar
const dropdownButtons = document.querySelectorAll(".boton-dropdown");

dropdownButtons.forEach((btn) =>
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const wrapper = btn.closest(".dropdown");

    document
      .querySelectorAll(".nav .dropdown.open")
      .forEach((d) => d !== wrapper && d.classList.remove("open"));

    wrapper.classList.toggle("open");
  })
);


// ===============================
// LOGOUT
// ===============================
const logoutButton = document.querySelector("#logout-button");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("carrito");
    window.location.href = "bienvenida.html";
  });
}


// ===============================
// FINALIZAR COMPRA (ENVÍA A BACKEND)
// ===============================
async function finalizarCompra() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  try {
    // Enviar carrito al backend
    const resp = await fetch("http://localhost:3000/comprar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productos: carrito })
    });

    const data = await resp.json();

    // Si está OK, redirige al ticket
    if (resp.ok) {
      window.location.href =
        "/Electronics_Store/Frontend/compra_confirmada.html?idVenta=" +
        data.idVenta;
    } else {
      alert("Error al procesar la compra");
    }
  } catch (err) {
    console.error("Error al registrar la venta:", err);
  }
}


// ===============================
// MODO OSCURO
// ===============================
function iniciarModoOscuro() {
  const toggle = document.getElementById("dark-toggle");
  if (!toggle) return;

  // Recupero estado guardado
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  // Cambiar de tema
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    localStorage.setItem(
      "darkMode",
      document.body.classList.contains("dark-mode")
    );
  });
}


// ===============================
// INICIALIZAR TODO
// ===============================
document.addEventListener("DOMContentLoaded", init);
