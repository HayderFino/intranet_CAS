const app = require("./src/app");
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Servidor CAS corriendo en http://localhost:${PORT}`);
    console.log(
      `⚙️ Panel de administración en http://localhost:${PORT}/administracion`
    );
  });
}

module.exports = app;
