import bcrypt from "bcryptjs";

const password = "Admin123"; // Modifico la clave que yo desee y ejecuto: node hashGenerator.js en consola

const hash = bcrypt.hashSync(password, 10);

console.log("Tu hash bcrypt es:");
console.log(hash);
