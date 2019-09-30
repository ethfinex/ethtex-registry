const commandLineArgs = require('command-line-args')
const Web3 = require('web3')
const _get = require('lodash/get')

const Utils = require('./utils')

const registryContractInfo = require('./build/contracts/RegistryLookup.json')
const batContractInfo = require('./build/contracts/BAT.json')
const daiContractInfo = require('./build/contracts/Dai.json')
const golemContractInfo = require('./build/contracts/Golem.json')
const leoContractInfo = require('./build/contracts/Leo.json')
const omiseGoContractInfo = require('./build/contracts/OmiseGo.json')
const tetherContractInfo = require('./build/contracts/Tether.json')
const zeroXContractInfo = require('./build/contracts/ZeroX.json')
const wethContractInfo = require('./build/contracts/Weth.json')

const NETWORK_ID = "5777"
const defaultProvider = 'HTTP://127.0.0.1:8545'
const pvtKeyDefault = '4909ceca58bff841f06a31671b84610faafe3ab5d674cc4c4715f81fea38a47b'
const contractAddressDefault = _get(registryContractInfo.networks[NETWORK_ID], 'address', '')
const tokensDefault = [
  _get(batContractInfo.networks[NETWORK_ID], 'address', ''),
  _get(daiContractInfo.networks[NETWORK_ID], 'address', ''),
  _get(golemContractInfo.networks[NETWORK_ID], 'address', ''),
  _get(leoContractInfo.networks[NETWORK_ID], 'address', ''),
  _get(omiseGoContractInfo.networks[NETWORK_ID], 'address', ''),
  _get(tetherContractInfo.networks[NETWORK_ID], 'address', ''),
  _get(zeroXContractInfo.networks[NETWORK_ID], 'address', ''),
  _get(wethContractInfo.networks[NETWORK_ID], 'address', ''),
]

const options = commandLineArgs([
  { name: 'provider', alias: 'p', type: String, defaultValue: defaultProvider },
  { name: 'privatekey', alias: 'k', type: String, defaultValue: pvtKeyDefault },
  { name: 'contract', alias: 'c', type: String, defaultValue: contractAddressDefault },
  { name: 'token', alias: 't', type: String, multiple: true, defaultValue: tokensDefault },
])

const { provider, privatekey, contract, token } = options
const web3 = new Web3(provider)

let contractInstance = new web3.eth.Contract(registryContractInfo.abi, contract)

const pvtKey = Buffer.from(privatekey, 'hex')
const utils = new Utils(contractInstance, web3, pvtKey)

async function seed() {
  try {
    await utils.addTokens(token)
    console.log('\nSeed successful!');
  } catch (e) {
    console.error(e)
  }
}

seed()