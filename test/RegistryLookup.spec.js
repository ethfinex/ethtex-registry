const RegistryLookup = artifacts.require("RegistryLookup");
const ERCTest1 = artifacts.require("ERCTest1");
const ERCTest2 = artifacts.require("ERCTest2");

const Web3 = require('web3')
const Tx = require('ethereumjs-tx')

const web3 = new Web3('HTTP://127.0.0.1:7545')

let contractInstance = null
const pvtKey = Buffer.from('6faf0316868c76ddf97dc02f762dbd54c45f6e43ab61f1ac4475a3abe87e5a7c', 'hex')
const account = web3.eth.accounts.privateKeyToAccount('0x' + pvtKey.toString('hex'));


const TOKENS_TO_ADD = [
  '0x6c4A662d93F46A2Cdf864bdcF9D9a0cA154eD12e',
  '0x50be63E4f7c704fE50128de6CE3fBCdc2Cf4C327',
  '0x9A4531473f3B6A8fBa2A56162Df1931ae7c36633',
  '0xDAC4AE188AcE3C8985765eDc6C9B4739D4845DdC',
  '0x5581959Aa90eD7f8111C68F1Fa49F3dB4a98a532',
]

let DUMMY_ERC_ADDRESS_1, DUMMY_ERC_ADDRESS_2

contract("RegistryLookup", accounts => {
  before(async () => {
    let deployedInstance = await RegistryLookup.deployed();
    contractInstance = new web3.eth.Contract(deployedInstance.abi, deployedInstance.address)
    const dummyErcInstance1 = await ERCTest1.deployed()
    DUMMY_ERC_ADDRESS_1 = dummyErcInstance1.address
    const dummyErcInstance2 = await ERCTest2.deployed()
    DUMMY_ERC_ADDRESS_2 = dummyErcInstance2.address
  })

  it('adds new Tokens', async () => {
    await addTokens(TOKENS_TO_ADD)

    const availableTokens = await contractInstance.methods.getAvailableTokens().call()
    expect(availableTokens).to.eql(TOKENS_TO_ADD)
  })

  it('adds new pairs', async () => {
    const pairsForToken0 = [1, 2, 3, 4]
    await addPairs(0, pairsForToken0)
    const tokenIndexesWithPairs = await contractInstance.methods.getTokenIndexesWithPairs().call()
    expect(tokenIndexesWithPairs.map(i => i.toNumber())).to.eql([0])

    const pairsForToken4 = [1, 2]
    await addPairs(4, pairsForToken4)
    const tokenIndexesWithPairs2 = await contractInstance.methods.getTokenIndexesWithPairs().call()
    expect(tokenIndexesWithPairs2.map(i => i.toNumber())).to.eql([0, 4])

    const pairsForIndex0 = await contractInstance.methods.getPairsForTokenByIndex(0).call()
    expect(pairsForIndex0.map(i => i.toNumber())).to.eql(pairsForToken0)
    const pairsForIndex4 = await contractInstance.methods.getPairsForTokenByIndex(4).call()
    expect(pairsForIndex4.map(i => i.toNumber())).to.eql(pairsForToken4)
  })

  it('removes tokens correctly', async () => {
    //removes tokens from index 2 and 3
    await removeTokens([TOKENS_TO_ADD[2], TOKENS_TO_ADD[3]])

    const availableTokens = await contractInstance.methods.getAvailableTokens().call()
    const expectedTokens = [...TOKENS_TO_ADD]
    expectedTokens[2] = "0x0000000000000000000000000000000000000000"
    expectedTokens[3] = "0x0000000000000000000000000000000000000000"
    expect(availableTokens).to.eql(expectedTokens)

    const pairsForIndex0 = await contractInstance.methods.getPairsForTokenByIndex(0).call()
    expect(pairsForIndex0.map(i => i.toNumber())).to.eql([1, 0, 0, 4])
    const pairsForIndex4 = await contractInstance.methods.getPairsForTokenByIndex(4).call()
    expect(pairsForIndex4.map(i => i.toNumber())).to.eql([1, 4])
  })

  it('gets ERC20 data correctly', async () => {
    const data = await contractInstance.methods.getTokenData([DUMMY_ERC_ADDRESS_1, DUMMY_ERC_ADDRESS_2]).call()
    const expectedErc1 = {
      symbol: "ERC1",
      decimals: 10,
      name: "The First ERC20 Test Token"
    }
    const expectedErc2 = {
      symbol: "ERC2",
      decimals: 20,
      name: "The Second ERC20 Test Token"
    }
    const erc1 = {
      name: data.names[0],
      symbol: data.symbols[0],
      decimals: data.decimals[0].toNumber()
    }
    const erc2 = {
      name: data.names[1],
      symbol: data.symbols[1],
      decimals: data.decimals[1].toNumber()
    }
    expect(erc1).to.eql(expectedErc1)
    expect(erc2).to.eql(expectedErc2)
  })

})

// -----------------------------------


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