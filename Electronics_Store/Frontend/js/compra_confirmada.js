// ==========================
// OBTENER ID DE VENTA REAL
// ==========================
const params = new URLSearchParams(window.location.search);
const idVenta = params.get("idVenta");

// Mostramos el id real
document.getElementById("nro-orden").innerText = "#" + idVenta;


// ==========================
// OBTENER DATOS NECESARIOS
// ==========================
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

  // Mostrar total final
  document.getElementById("total-final").textContent =
    "$" + total.toLocaleString();

  // Mostrar fecha actual
  const fecha = new Date();
  const fechaFormateada = fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  document.getElementById("fecha-hoy").textContent = fechaFormateada;

  // Eliminar carrito después de usarlo
  setTimeout(() => localStorage.removeItem("carrito"), 500);


  // ==========================
  // BOTÓN VOLVER
  // ==========================
  document.getElementById("volver").addEventListener("click", () => {
    window.location.href = "index.html";
  });
});


// ==========================
// GENERAR TICKET PDF
// ==========================
document.getElementById("descargar-pdf").addEventListener("click", () => {
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  script.onload = generarTicketPDF;
  document.body.appendChild(script);
});

function generarTicketPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  let y = 20;

  // Título
  pdf.setFontSize(22);
  pdf.text("Electronics Store", 20, y);
  y += 10;

  pdf.setLineWidth(0.5);
  pdf.line(20, y, 190, y);
  y += 10;

  // Datos de la compra
  const numeroOrden = document.getElementById("nro-orden").innerText;
  const fechaHoy = document.getElementById("fecha-hoy").innerText;
  const usuario = document.getElementById("nombre-usuario").innerText;

  pdf.setFontSize(12);
  pdf.text(`Ticket de Compra`, 20, y);
  y += 7;
  pdf.text(`N° de Orden: ${numeroOrden}`, 20, y);
  y += 7;
  pdf.text(`Cliente: ${usuario}`, 20, y);
  y += 7;
  pdf.text(`Fecha: ${fechaHoy}`, 20, y);
  y += 15;

  pdf.setFontSize(14);
  pdf.text("Detalle del pedido:", 20, y);
  y += 10;

  // Tabla manual
  const filas = document.querySelectorAll("#lista-productos tr");

  filas.forEach((fila) => {
    const tds = fila.querySelectorAll("td");
    if (tds.length === 4) {
      pdf.setFontSize(12);
      pdf.text(`Producto: ${tds[0].innerText}`, 20, y); y += 6;
      pdf.text(`Cantidad: ${tds[1].innerText}`, 20, y); y += 6;
      pdf.text(`Precio Unit.: ${tds[2].innerText}`, 20, y); y += 6;
      pdf.text(`Subtotal: ${tds[3].innerText}`, 20, y); y += 10;
    }
  });

  // Total
  const totalFinal = document.getElementById("total-final").innerText;
  pdf.setFontSize(14);
  pdf.text(`TOTAL: ${totalFinal}`, 20, y);

  y += 20;

  pdf.save("ticket_compra.pdf");
}
