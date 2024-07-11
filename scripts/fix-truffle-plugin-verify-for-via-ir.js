#!/usr/bin/env node

const fs = require("node:fs");



if (fs.existsSync("./node_modules/truffle-plugin-verify/dist/util.js")) {
  const data = fs.readFileSync("./scripts/data/util.js", { encoding: "utf8", });
  fs.writeFileSync("./node_modules/truffle-plugin-verify/dist/util.js", data);

  console.log("truffle-plugin-verify fixed!");
}
