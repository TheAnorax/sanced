const selfsigned = require("selfsigned");
const fs = require("fs");
const path = require("path");

const attrs = [{ name: "commonName", value: "66.232.105.87" }];
const pems = selfsigned.generate(attrs, { days: 365 });

const sslDir = path.join(__dirname, "ssl");
if (!fs.existsSync(sslDir)) fs.mkdirSync(sslDir);

fs.writeFileSync(path.join(sslDir, "key.pem"), pems.private);
fs.writeFileSync(path.join(sslDir, "cert.pem"), pems.cert);

console.log("✅ Certificado autofirmado generado en ./ssl/");
