const Web3 = require('web3')
const Tx = require('ethereumjs-tx')

const contractInfo = require('./build/contracts/RegistryLookup.json')
const contractAddress = contractInfo.networks["5777"].address

const web3 = new Web3('HTTP://127.0.0.1:8545')

let contractInstance = new web3.eth.Contract(contractInfo.abi, contractAddress)

const pvtKey = Buffer.from('4909ceca58bff841f06a31671b84610faafe3ab5d674cc4c4715f81fea38a47b', 'hex')
const account = web3.eth.accounts.privateKeyToAccount('0x' + pvtKey.toString('hex'));

const TOKENS_TO_ADD = [
  '0x73030C881460FE7cb4945ac7CC6C64888AF09916',
  '0x1817c374e07E7138320562201297CaC29e43762d',
  '0xE7981784B9376ADe80CF42A892BD23149Df5d78B',
  '0xCe561c1521DE5483176cbFa23547D861379DC659',
  '0xBDDbB4B82d7CAAa7F99e6d4D178cc554DFa9F8FA',
  '0xdF6231b016870E4B6FFb9e1c2ddbF9B4b1ca2F3d',
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

async function addPairs(tokenIndex, pairsIndexes) {
  try {
    const functionAbi = await contractInstance.methods.addPairs(tokenIndex, pairsIndexes).encodeABI()
    await sendSignedTx(functionAbi)
  } catch (e) {
    console.error(e)
  }
}

async function removeTokens(tokens) {
  try {
    const functionAbi = await contractInstance.methods.removeTokens(tokens).encodeABI()
    await sendSignedTx(functionAbi)
  } catch (e) {
    console.error(e)
  }
}

async function seed() {
  await addTokens(TOKENS_TO_ADD)
  await addPairs(0, [1,2,3,4])
  await addPairs(4, [1,2])
}

seed()