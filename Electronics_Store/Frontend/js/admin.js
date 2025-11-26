// Espero a que toda la página cargue para empezar a trabajar
document.addEventListener("DOMContentLoaded", () => {

  // Traigo todos los elementos que voy a usar del HTML
  const lista = document.getElementById("lista-productos");
  const form = document.getElementById("form-agregar");
  const nombre = document.getElementById("nombre");
  const precio = document.getElementById("precio");
  const imagen = document.getElementById("imagen");
  const btnCerrarSesion = document.getElementById("cerrar-sesion");

  // Acá voy a guardar los productos que vengan del backend
  let productos = [];

  // ===============================
  // Cargar productos desde el backend
  // ===============================
  async function cargarProductos() {
    try {
      // Pido al backend todos los productos
      const res = await fetch("http://localhost:3000/productos");

      // Guardo la lista que vino
      productos = await res.json();

      // Los muestro en pantalla
      renderProductos();
    } catch (error) {
      console.error("Error al cargar productos:", error);
      lista.innerHTML = "<p>Error al cargar productos.</p>";
    }
  }

  // ===============================
  // Renderizar los productos en pantalla
  // ===============================
  function renderProductos() {

    // Limpio la lista antes de volver a agregar
    lista.innerHTML = "";

    // Recorro cada producto que tengo en el array
    productos.forEach((p) => {

      // Creo un div contenedor por producto
      const div = document.createElement("div");
      div.classList.add("producto");

      // Armo el HTML interno del producto
      div.innerHTML = `
        <div class="info">
          <img src="${p.imagen || ""}" />
          <span><strong>${p.nombre}</strong> - $${p.precio}</span>
        </div>
        <div class="botones">
          <button class="editar">Editar</button>
          <button class="eliminar">Eliminar</button>
        </div>
      `;

      // ---------------------------
      // ACCIÓN: Eliminar producto
      // ---------------------------
      div.querySelector(".eliminar").addEventListener("click", async () => {

        // Confirmo si realmente quiere borrar
        if (!confirm(`¿Eliminar ${p.nombre}?`)) return;

        try {
          // Llamo al backend para borrar
          await fetch(`http://localhost:3000/productos/${p.id}`, {
            method: "DELETE",
          });

          // Recargo la lista
          await cargarProductos();

        } catch (err) {
          alert("Error al eliminar producto");
          console.error(err);
        }
      });

      // ---------------------------
      // ACCIÓN: Editar producto
      // ---------------------------
      div.querySelector(".editar").addEventListener("click", async () => {

        // Pido los nuevos datos por prompt
        const nuevoNombre = prompt("Nuevo nombre:", p.nombre);
        const nuevoPrecio = prompt("Nuevo precio:", p.precio);

        // Si puso datos válidos, procedo
        if (nuevoNombre && nuevoPrecio) {
          try {
            // Envío al backend los datos actualizados
            await fetch(`http://localhost:3000/productos/${p.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nombre: nuevoNombre.trim(),
                precio: parseFloat(nuevoPrecio),
              }),
            });

            // Recargo la lista
            await cargarProductos();

          } catch (err) {
            alert("Error al actualizar producto");
            console.error(err);
          }
        }
      });

      // Agrego el producto a la lista visual
      lista.appendChild(div);
    });
  }

  // ===============================
  // AGREGAR PRODUCTO NUEVO
  // ===============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita que recargue la página

    // Armo el objeto producto a enviar
    const nuevo = {
      nombre: nombre.value.trim(),
      precio: parseFloat(precio.value),
      imagen: imagen.value.trim() || "",
    };

    // Si tiene datos válidos...
    if (nuevo.nombre && nuevo.precio) {
      try {
        // Envío el producto nuevo al backend
        await fetch("http://localhost:3000/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevo),
        });

        // Limpio el formulario
        form.reset();

        // Recargo la lista
        await cargarProductos();

      } catch (err) {
        alert("Error al agregar producto");
        console.error(err);
      }
    } else {
      alert("Completa nombre y precio correctamente.");
    }
  });

  // ===============================
  // CERRAR SESIÓN
  // ===============================
  btnCerrarSesion.addEventListener("click", () => {
    // Borrado del usuario guardado en LocalStorage
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");

    // Llevo a la página de bienvenida
    window.location.href = "bienvenida.html";
  });

  // ===============================
  // Cargo los productos al iniciar
  // ===============================
  cargarProductos();
});
