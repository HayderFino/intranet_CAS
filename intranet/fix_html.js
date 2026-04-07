const fs = require("fs");
const path = require("path");
const HTML_PATH =
  "c:/Users/HAYDER/Videos/intranet/intranet/header_menu/sgi/politicas.html";

if (fs.existsSync(HTML_PATH)) {
  let content = fs.readFileSync(HTML_PATH, "utf8");

  // 1. Quitar marcadores antiguos y el div pdf-grid
  // Buscamos el bloque completo
  const blockRegex =
    /<!-- Documentos descargables[^>]*>[\s\S]*?<div class="pdf-grid" id="politicas-docs-grid"[\s\S]*?<!-- BEGIN_POLITICAS_DOCS -->[\s\S]*?<!-- END_POLITICAS_DOCS -->[\s\S]*?<\/div>/;
  content = content.replace(blockRegex, "");

  // 2. Insertar nuevos marcadores al final de policy-container
  // Buscamos el cierre de policy-container (el primer </div> después del artículo static-vial)
  const containerRegex =
    /(article[^>]*data-id="static-vial"[\s\S]*?<\/article>\s*)(<\/div>)/;
  if (containerRegex.test(content)) {
    content = content.replace(
      containerRegex,
      "$1\n                <!-- BEGIN_POLITICAS_DOCS -->\n                \n                <!-- END_POLITICAS_DOCS -->\n            $2",
    );
    console.log("✅ Marcadores movidos con éxito.");
  } else {
    console.log("❌ No se encontró el cierre del contenedor de políticas.");
  }

  fs.writeFileSync(HTML_PATH, content, "utf8");
} else {
  console.log("❌ No existe el archivo HTML.");
}
