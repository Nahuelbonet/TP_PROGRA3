// ==========================
// OBTENER ID DE VENTA REAL
// ==========================

// Leo los parámetros que vienen en la URL (por ejemplo ?idVenta=12)
const params = new URLSearchParams(window.location.search);

// Saco el idVenta de la query string
const idVenta = params.get("idVenta");

// Si existe idVenta, muestro #<número>. Si no, muestro un guion
document.getElementById("nro-orden").innerText = idVenta ? `#${idVenta}` : "—";


// ==========================
// OBTENER DATOS NECESARIOS
// ==========================

document.addEventListener("DOMContentLoaded", () => {
  // Tomo el nombre del usuario guardado, o uso "Cliente" por defecto
  const usuario = localStorage.getItem("userName") || "Cliente";

  // Traigo el carrito desde localStorage, o un array vacío si no hay nada
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Pinto el nombre del usuario en la pantalla
  document.getElementById("nombre-usuario").textContent = usuario;

  // Cuerpo de la tabla donde voy a ir metiendo los productos
  const tbody = document.getElementById("lista-productos");
  let total = 0;

  // Recorro cada ítem del carrito
  carrito.forEach((item) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal; // Voy sumando el total

    // Creo una fila para la tabla
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>$${item.precio.toLocaleString()}</td>
      <td>$${subtotal.toLocaleString()}</td>
    `;

    // Agrego la fila al cuerpo de la tabla
    tbody.appendChild(fila);
  });

  // Muestro el total final formateado
  document.getElementById("total-final").textContent =
    "$" + total.toLocaleString();

  // Armo la fecha de hoy en formato dd/mm/aaaa para Argentina
  const fecha = new Date();
  const fechaFormateada = fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  document.getElementById("fecha-hoy").textContent = fechaFormateada;

  // 🔥 Cuando el usuario se va de la página, limpio el carrito del localStorage
  window.addEventListener("beforeunload", () => {
    localStorage.removeItem("carrito");
  });

  // Botón para volver a la tienda (index)
  document.getElementById("volver").addEventListener("click", () => {
    window.location.href = "index.html";
  });
});


// ==========================
// GENERAR TICKET PDF
// ==========================

// Cuando tocan el botón de "Descargar PDF"
document.getElementById("descargar-pdf").addEventListener("click", () => {
  // Cargo dinámicamente la librería jsPDF desde CDN
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  script.onload = generarTicketPDF; // Cuando termina de cargar, llamo a la función
  document.body.appendChild(script);
});

// Función que arma y genera el PDF del ticket
function generarTicketPDF() {
  // Saco jsPDF del objeto global que expone la librería
  const { jsPDF } = window.jspdf;

  // Creo un nuevo PDF tamaño A4 en milímetros
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  let y = 20; // Variable para ir manejando la altura donde escribo

  // ==========================
  // Encabezado / título
  // ==========================
  pdf.setFontSize(22);
  pdf.text("Electronics Store", 20, y);
  y += 10;

  // Línea separadora
  pdf.setLineWidth(0.5);
  pdf.line(20, y, 190, y);
  y += 10;

  // ==========================
  // Datos generales del ticket
  // ==========================
  const numeroOrden = document.getElementById("nro-orden").innerText;
  const fechaHoy = document.getElementById("fecha-hoy").innerText;
  const usuario = document.getElementById("nombre-usuario").innerText;

  pdf.setFontSize(12);
  pdf.text(`Ticket de Compra`, 20, y); y += 7;
  pdf.text(`N° de Orden: ${numeroOrden}`, 20, y); y += 7;
  pdf.text(`Cliente: ${usuario}`, 20, y); y += 7;
  pdf.text(`Fecha: ${fechaHoy}`, 20, y); y += 15;

  // Título del detalle
  pdf.setFontSize(14);
  pdf.text("Detalle del pedido:", 20, y);
  y += 10;

  // ==========================
  // Recorro las filas de la tabla HTML
  // ==========================
  const filas = document.querySelectorAll("#lista-productos tr");

  filas.forEach((fila) => {
    const tds = fila.querySelectorAll("td");
    // Me aseguro que tenga las 4 columnas esperadas
    if (tds.length === 4) {
      pdf.setFontSize(12);
      pdf.text(`Producto: ${tds[0].innerText}`, 20, y); y += 6;
      pdf.text(`Cantidad: ${tds[1].innerText}`, 20, y); y += 6;
      pdf.text(`Precio Unit.: ${tds[2].innerText}`, 20, y); y += 6;
      pdf.text(`Subtotal: ${tds[3].innerText}`, 20, y); y += 10;
    }
  });

  // ==========================
  // Total final
  // ==========================
  const totalFinal = document.getElementById("total-final").innerText;
  pdf.setFontSize(14);
  pdf.text(`TOTAL: ${totalFinal}`, 20, y);
  y += 20;

  // Descargo el archivo con este nombre
  pdf.save("ticket_compra.pdf");
}
