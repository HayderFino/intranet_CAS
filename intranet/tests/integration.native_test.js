const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const mongoose = require("mongoose");
const app = require("../server.js");

// Variable para el servidor en ejecución temporal
let server;
let baseUrl;

// Preconfiguraciones antes de correr la suite
test.before(async () => {
  // Crear un servidor local real con un puerto aleatorio (0)
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Tests] Servidor efímero lanzado en ${baseUrl}`);

  // Esperar a que Mongoose se conecte si aún no lo ha hecho por server.js
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once("open", resolve));
  }
});

// Desconexión tras finalizar
test.after(async () => {
  console.log("[Tests] Cerrando servidor efímero...");
  server.close();
  await mongoose.disconnect();
  console.log("[Tests] Recursos liberados.");
});

// SUITE: Rutas Estáticas y de Salud
test("Suite: Infraestructura y Salud", async (t) => {
  await t.test("Debería retornar status 200 en endpoint de comprobación API", async () => {
    const res = await fetch(`${baseUrl}/api/test-server`);
    assert.strictEqual(res.status, 200, "El servidor debe estar activo");
    const json = await res.json();
    assert.strictEqual(json.status, "ok", "El status devuelto debe ser ok");
  });

  await t.test("Debería servir el HTML de Administración", async () => {
    const res = await fetch(`${baseUrl}/administracion/index.html`);
    assert.strictEqual(res.status, 200, "El panel admin debe existir");
    const text = await res.text();
    assert.ok(text.includes("<html"), "Debe devolver código HTML válido");
  });
});

// SUITE: Búsqueda y Lectura (GET)
test("Suite: Consultas Integrales e índices DB HTML", async (t) => {
  await t.test("Buscador general (GET /api/search) debe retornar Array de Resultados", async () => {
    const res = await fetch(`${baseUrl}/api/search?q=resolucion`);
    assert.strictEqual(res.status, 200, "Buscador debe responder a GET request");
    const data = await res.json();
    assert.ok(Array.isArray(data), "Buscador debe estructurar un Array JSON");
  });

  await t.test("Módulos SGI (GET /api/sgi/planeacion) deben compilar FS RAM", async () => {
    const res = await fetch(`${baseUrl}/api/sgi/planeacion`);
    assert.strictEqual(res.status, 200, "SGI Module failed");
    const data = await res.json();
    assert.ok(Array.isArray(data), "SGI debe retornar formato Array");
  });
});

// SUITE: Seguridad y Bloqueos de Escritura
test("Suite: Middleware de Seguridad en Rutas Mutables", async (t) => {
  await t.test("Petición POST (Sin Auth) a Noticias debe arrojar 401 Unauthorized", async () => {
    const res = await fetch(`${baseUrl}/api/news`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Inyección SQL Maliciosa" }),
    });

    assert.strictEqual(res.status, 401, "El escudo global debe repeler escritura anónima");
    const data = await res.json();
    assert.strictEqual(data.success, false, "El payload debe reportar fracaso");
    assert.ok(data.message.includes("Acceso denegado"), "Respuesta debe declarar acceso denegado");
  });
});
