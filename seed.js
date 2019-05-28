const Web3 = require('web3')
const Tx = require('ethereumjs-tx')

const contractInfo = require('./build/contracts/RegistryLookup.json')
const contractAddress = '0x24909BaeA3d4445bB75bB9136D3747771c6445b2'

const web3 = new Web3('HTTP://127.0.0.1:7545')

let contractInstance = new web3.eth.Contract(contractInfo.abi, contractAddress)

const pvtKey = Buffer.from('6faf0316868c76ddf97dc02f762dbd54c45f6e43ab61f1ac4475a3abe87e5a7c', 'hex')
const account = web3.eth.accounts.privateKeyToAccount('0x' + pvtKey.toString('hex'));

const TOKENS_TO_ADD = [
  '0x35700ddDa14B352B6fc86dc6306f5cAC9Bb22dFa',
  '0xBa5b461659b949FFA00663ad93c69cF632cCE5dC',
  '0xf4833Ccdd2F2A5ce2F7a6a45815d2AC7eC843430',
  '0xa0275807cD71f80359511F9351F8ef7ed2D9f42f',
  '0xF372a91432a947031c79EBf0CB46b9e46ed5Ca5c',
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