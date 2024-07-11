#!/usr/bin/env node

const ganache = require("ganache");


const mnemonic = "";

const options = {
  //mnemonic,
};
const server = ganache.server(options);


const PORT = 9545; // 0 means any available port
server.listen(PORT, async err => {
  if (err) throw err;

  console.log(`ganache listening on port ${server.address().port}...`);
  const provider = server.provider;
  const accounts = await provider.request({
    method: "eth_accounts",
    params: [],
  });
  console.log(`ganache laccounts \n${JSON.stringify(accounts, null, 2)}`);
});
