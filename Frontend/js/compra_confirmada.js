// =====================================
// OBTENER ID DE VENTA REAL
// =====================================

// Leo los parámetros que vienen en la URL (?idVenta=12)
const params = new URLSearchParams(window.location.search);

// Saco el idVenta
const idVenta = params.get("idVenta");

// Muestro #número o "—" si no vino
document.getElementById("nro-orden").innerText = idVenta ? `#${idVenta}` : "—";


// =====================================
// OBTENER DATOS Y RENDERIZAR LA COMPRA
// =====================================

document.addEventListener("DOMContentLoaded", () => {
  const usuario = localStorage.getItem("userName") || "Cliente";
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  document.getElementById("nombre-usuario").textContent = usuario;

  const tbody = document.getElementById("lista-productos");
  let total = 0;

  carrito.forEach((item) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>$${item.precio.toLocaleString()}</td>
      <td>$${subtotal.toLocaleString()}</td>
    `;

    tbody.appendChild(fila);
  });

  document.getElementById("total-final").textContent =
    "$" + total.toLocaleString();

  const fecha = new Date();
  const fechaFormateada = fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  document.getElementById("fecha-hoy").textContent = fechaFormateada;

  // Limpio carrito al salir de la página
  window.addEventListener("beforeunload", () => {
    localStorage.removeItem("carrito");
  });

  // Botón para volver a la tienda
  document.getElementById("volver").addEventListener("click", () => {
    window.location.href = "index.html";
  });
});


// =====================================
// DESCARGAR TICKET PDF DESDE EL BACKEND
// =====================================

document.getElementById("descargar-pdf").addEventListener("click", () => {
  if (!idVenta) {
    alert("No se encontró la venta. No se puede generar el ticket.");
    return;
  }

  // Llamo al backend para generar y descargar el PDF real
  fetch(`http://localhost:3000/ticket/${idVenta}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Error al generar el ticket");
      }
      return res.blob();
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket_${idVenta}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch((err) => {
      console.error(err);
      alert("Hubo un error al generar el ticket.");
    });
});
