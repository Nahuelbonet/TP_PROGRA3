import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  server: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};


const db = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("Conectado a SQL Server con SQL Auth ✅");
    return pool;
  })
  .catch(err => {
    console.error("Error al conectar con SQL Server:", err);
  });

export default db;
