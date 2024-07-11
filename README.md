# Fix truffle-plugin-verify for viaIR compiler settings
**Postinstall fix for `truffle-plugin-verify@v0.6.7`.**

*The problem and solution are described here:
[github.com/rkalis/truffle-plugin-verify/issues/181](https://github.com/rkalis/truffle-plugin-verify/issues/181)*


## Problem
When using the --via-ir (viaIR: true) compiler option,
the plugin cannot verify the smart contract and produces this error:
```text
Fail - Unable to verify. Compiled contract deployment bytecode does NOT match the transaction deployment bytecode.
```


## Solution
Automatic file replacement called by `postinstall` script.

Copy the files `/scripts/fix-truffle-plugin-verify-for-via-ir.js`
and `/scripts/data/util.js` into your project
and upgrade the `package.json`.
```json
  ...
  "scripts": {
    "postinstall": "node ./scripts/fix-truffle-plugin-verify-for-via-ir.js",
    ...
  },
  ...
```



## Proof
[Verified smart contract](https://sepolia.etherscan.io/address/0x3CbAD0Df62A36EEaE26e70B37cAf62560f787D0F#code#L8).



## Install dependencies
```bash
yarn install
```


## Compile, test, deploy and verify Smart Contracts
> Compiler options are defined in the file [/truffle-config.js](/truffle-config.js).


### Compile Smart Contracts
> After successful compilation, smart contract appear in [/flatten](/flatten) folder,
which already include all dependencies in one file.
```bash
yarn compile
```


### Test Smart Contracts
In a different terminal:
```bash
yarn ganache
```

```bash
yarn test
yarn deploy development
```


### Deploy Smart Contracts
Make `/.env` file from `/.env.example`.
Fill in the environment variable data:
  - MNEMONIC - Seed phrase (24 words) for the deployer wallet.
  - ENDPOINT_SEPOLIA - See [infura.io/](https://infura.io/) or [alchemy.com](https://alchemy.com/) or any public endpoin.
  - ENDPOINT_ETHEREUM - See [infura.io/](https://infura.io/) or [alchemy.com](https://alchemy.com/) or any public endpoin.
  - API_ETHERSCAN - [etherscan.io/myapikey](https://etherscan.io/myapikey).
  - API_BSCSCAN - [bscscan.com/myapikey](https://bscscan.com/myapikey).

```bash
yarn deploy sepolia
```


### Verify Smart Contracts
```bash
yarn verify sepolia Migrations
```
