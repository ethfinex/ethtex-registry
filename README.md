# ethtex-registry

Token registry smart contract for D-Arch platform.

Main contract can be found on `contracts/RegistryLookup.sol`

## Setup

Standard truffle project, so truffle should be installed globally, and regular cli commands can be used (`truffle compile`, `truffle migrate`, `truffle test`, etc)

## Seed

Example usage of the seed script:

```bash
node seed --provider "http://locahost:4321" --privatekey "potatos" --contract "0x123..." --token "0x111..." --token "0x222..." --token "0x333..."
```
or use shorthand alias:

```bash
node seed -p "http://locahost:4321" -k "potatos" -c "0x123..." -t "0x111..." -t "0x222..." -t "0x333..."
```
