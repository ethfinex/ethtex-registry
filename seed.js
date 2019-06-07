const Web3 = require('web3')
const Tx = require('ethereumjs-tx')

const registryContractInfo = require('./build/contracts/RegistryLookup.json')

const batContractInfo = require('./build/contracts/BAT.json')
const daiContractInfo = require('./build/contracts/Dai.json')
const golemContractInfo = require('./build/contracts/Golem.json')
const leoContractInfo = require('./build/contracts/Leo.json')
const omiseGoContractInfo = require('./build/contracts/OmiseGo.json')
const tetherContractInfo = require('./build/contracts/Tether.json')
const wEthContractInfo = require('./build/contracts/WEth.json')
const zeroXContractInfo = require('./build/contracts/ZeroX.json')

const NETWORK_ID = "5777"

const contractAddress = registryContractInfo.networks[NETWORK_ID].address

const web3 = new Web3('HTTP://127.0.0.1:8545')

let contractInstance = new web3.eth.Contract(contractInfo.abi, contractAddress)

const pvtKey = Buffer.from('4909ceca58bff841f06a31671b84610faafe3ab5d674cc4c4715f81fea38a47b', 'hex')
const account = web3.eth.accounts.privateKeyToAccount('0x' + pvtKey.toString('hex'));

const TOKENS_TO_ADD = [
  batContractInfo.networks[NETWORK_ID].address,
  daiContractInfo.networks[NETWORK_ID].address,
  golemContractInfo.networks[NETWORK_ID].address,
  leoContractInfo.networks[NETWORK_ID].address,
  omiseGoContractInfo.networks[NETWORK_ID].address,
  tetherContractInfo.networks[NETWORK_ID].address,
  wEthContractInfo.networks[NETWORK_ID].address,
  zeroXContractInfo.networks[NETWORK_ID].address,
]

function sendSignedTx(functionAbi) {
  return new Promise(async (resolve, reject) => {
    const nonce = await web3.eth.getTransactionCount(account.address)

    const txParams = {
      gasPrice: 100000,
      gasLimit: 3000000,
      to: contractInstance.address,
      data: functionAbi,
      from: account.address,
      nonce: '0x' + nonce.toString(16)
    };


    const tx = new Tx(txParams);
    tx.sign(pvtKey); // Transaction Signing here

    const serializedTx = tx.serialize();

    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .once('transactionHash', hash => console.log(`Hash: ${hash}`))
      .once('receipt', receipt => console.log(`Receipt: ${receipt}`))
      .on('error', error => {
        console.error("Error: ", error)
        reject()
      })
      .on('confirmation', (confNumber, receipt) => {
        console.log('Confirmation: ', confNumber, receipt)
        resolve();
      })
  })
}

async function addTokens(tokens) {
  try {
    const functionAbi = await contractInstance.methods.addNewTokens(tokens).encodeABI()
    await sendSignedTx(functionAbi)
  } catch (e) {
    console.error(e)
  }
}

async function seed() {
  await addTokens(TOKENS_TO_ADD)
}

seed()