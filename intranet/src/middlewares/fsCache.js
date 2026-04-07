const fs = require("fs");

const setupFsCache = () => {
  // --- Parche Global de Caché FS para DB en HTML ---
  const originalReadFileSync = fs.readFileSync;
  const originalWriteFileSync = fs.writeFileSync;
  const htmlCache = new Map();

  fs.readFileSync = (pathStr, options) => {
    if (
      typeof pathStr === "string" &&
      pathStr.endsWith(".html") &&
      (options === "utf8" || (options && options.encoding === "utf8"))
    ) {
      if (htmlCache.has(pathStr)) return htmlCache.get(pathStr);
      const content = originalReadFileSync(pathStr, options);
      htmlCache.set(pathStr, content);
      return content;
    }
    return originalReadFileSync(pathStr, options);
  };

  fs.writeFileSync = (pathStr, data, options) => {
    if (typeof pathStr === "string" && pathStr.endsWith(".html")) {
      htmlCache.delete(pathStr); // Invalidamos al escribir
    }
    return originalWriteFileSync(pathStr, data, options);
  };
};

module.exports = setupFsCache;
