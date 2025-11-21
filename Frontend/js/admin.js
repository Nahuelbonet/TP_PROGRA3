document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("lista-productos");
  const form = document.getElementById("form-agregar");
  const nombre = document.getElementById("nombre");
  const precio = document.getElementById("precio");
  const imagen = document.getElementById("imagen");
  const btnCerrarSesion = document.getElementById("cerrar-sesion");

  let productos = [];

  //Cargar productos desde el backend
  async function cargarProductos() {
    try {
      const res = await fetch("http://localhost:3000/productos");
      productos = await res.json();
      renderProductos();
    } catch (error) {
      console.error("Error al cargar productos:", error);
      lista.innerHTML = "<p>Error al cargar productos.</p>";
    }
  }

  //
  function renderProductos() {
    lista.innerHTML = "";
    productos.forEach((p) => {
      const div = document.createElement("div");
      div.classList.add("producto");
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

      // Eliminar producto
      div.querySelector(".eliminar").addEventListener("click", async () => {
        if (!confirm(`¿Eliminar ${p.nombre}?`)) return;
        try {
          await fetch(`http://localhost:3000/productos/${p.id}`, {
            method: "DELETE",
          });
          await cargarProductos();
        } catch (err) {
          alert("Error al eliminar producto");
          console.error(err);
        }
      });

      //
      div.querySelector(".editar").addEventListener("click", async () => {
        const nuevoNombre = prompt("Nuevo nombre:", p.nombre);
        const nuevoPrecio = prompt("Nuevo precio:", p.precio);
        if (nuevoNombre && nuevoPrecio) {
          try {
            await fetch(`http://localhost:3000/productos/${p.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nombre: nuevoNombre.trim(),
                precio: parseFloat(nuevoPrecio),
              }),
            });
            await cargarProductos();
          } catch (err) {
            alert("Error al actualizar producto");
            console.error(err);
          }
        }
      });

      lista.appendChild(div);
    });
  }

  //
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevo = {
      nombre: nombre.value.trim(),
      precio: parseFloat(precio.value),
      imagen: imagen.value.trim() || "",
    };

    if (nuevo.nombre && nuevo.precio) {
      try {
        await fetch("http://localhost:3000/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevo),
        });
        form.reset();
        await cargarProductos();
      } catch (err) {
        alert("Error al agregar producto");
        console.error(err);
      }
    } else {
      alert("Completa nombre y precio correctamente.");
    }
  });

  //
  btnCerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    window.location.href = "bienvenida.html";
  });

  //
  cargarProductos();
});
