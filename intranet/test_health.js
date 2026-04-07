const http = require("http");

const PORT = 3000;
const options = {
  hostname: "localhost",
  port: PORT,
  path: "/api/test-server",
  method: "GET",
};

console.log("🧪 Iniciando prueba de salud del servidor...");

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    if (res.statusCode === 200) {
      try {
        const json = JSON.parse(data);
        if (json.status === "ok") {
          console.log(
            "✅ Prueba superada: Servidor respondiendo correctamente.",
          );
          process.exit(0);
        } else {
          console.error(
            "❌ Prueba fallida: Respuesta inesperada del servidor.",
          );
          process.exit(1);
        }
      } catch (e) {
        console.error(
          "❌ Prueba fallida: No se pudo parsear la respuesta JSON.",
        );
        process.exit(1);
      }
    } else {
      console.error(`❌ Prueba fallida: Código de estado ${res.statusCode}`);
      process.exit(1);
    }
  });
});

req.on("error", (e) => {
  console.error(`❌ Prueba fallida: Error de conexión (${e.message})`);
  console.log(
    "TIP: Asegúrate de que el servidor esté corriendo antes de ejecutar el test.",
  );
  process.exit(1);
});

req.end();
