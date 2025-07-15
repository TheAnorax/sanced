// utils/fetch.js
const fetch = (...args) =>
  import("node-fetch").then((mod) => mod.default(...args));
module.exports = fetch;
