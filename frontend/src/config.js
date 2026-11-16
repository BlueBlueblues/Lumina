const devPorts = new Set(["5173", "5500", "8080"]);
const localHosts = new Set(["localhost", "127.0.0.1"]);
const isLocalDevServer =
  localHosts.has(location.hostname) && devPorts.has(location.port);
const isFile = location.protocol === "file:";

export const API_BASE =
  window.LUMINA_API_BASE ??
  (isLocalDevServer || isFile ? "http://127.0.0.1:3000" : "");
