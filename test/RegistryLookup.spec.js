const RegistryLookup = artifacts.require("RegistryLookup");
const LeoToken = artifacts.require("Leo");
const BatToken = artifacts.require("BAT");
const DaiToken = artifacts.require("Dai"); // has name represented as bytes32

const Utils = require('../utils')

const Web3 = require('web3')

const web3 = new Web3('HTTP://127.0.0.1:8545')

const pvtKey = Buffer.from('6faf0316868c76ddf97dc02f762dbd54c45f6e43ab61f1ac4475a3abe87e5a7c', 'hex')


const TOKENS_TO_ADD = [
  '0x6c4A662d93F46A2Cdf864bdcF9D9a0cA154eD12e',
  '0x50be63E4f7c704fE50128de6CE3fBCdc2Cf4C327',
  '0x9A4531473f3B6A8fBa2A56162Df1931ae7c36633',
  '0xDAC4AE188AcE3C8985765eDc6C9B4739D4845DdC',
  '0x5581959Aa90eD7f8111C68F1Fa49F3dB4a98a532',
]

contract("RegistryLookup", accounts => {
  let contractInstance, utils

  before(async () => {
    let deployedInstance = await RegistryLookup.deployed();
    contractInstance = new web3.eth.Contract(deployedInstance.abi, deployedInstance.address)
    utils = new Utils(contractInstance, web3, pvtKey)
  })

  it('adds new Tokens', async () => {
    await utils.addTokens(TOKENS_TO_ADD)
    const availableTokens = await contractInstance.methods.getAvailableTokens().call()
    expect(availableTokens).to.eql(TOKENS_TO_ADD)
  })

  it('removes tokens correctly', async () => {
    //removes tokens from index 2 and 3
    await utils.removeTokens([TOKENS_TO_ADD[2], TOKENS_TO_ADD[3]])

    const availableTokens = await contractInstance.methods.getAvailableTokens().call()
    const expectedTokens = [...TOKENS_TO_ADD]
    expectedTokens[2] = "0x0000000000000000000000000000000000000000"
    expectedTokens[3] = "0x0000000000000000000000000000000000000000"
    expect(availableTokens).to.eql(expectedTokens)
  })

  it('gets ERC20 data correctly', async () => {
    const leoTokenInstance = await LeoToken.deployed()
    const batTokenInstance = await BatToken.deployed()
    const data = await contractInstance.methods.getTokenData([leoTokenInstance.address, batTokenInstance.address]).call()
    const expectedLeoToken = {
      symbol: "LEO",
      decimals: 20,
      name: "Bitfinex LEO Token"
    }
    const expectedBatToken = {
      symbol: "BAT",
      decimals: 3,
      name: "Basic Attention Token"
    }
    const leoToken = {
      name: data.names[0],
      symbol: data.symbols[0],
      decimals: data.decimals[0].toNumber()
    }
    const batToken = {
      name: data.names[1],
      symbol: data.symbols[1],
      decimals: data.decimals[1].toNumber()
    }
    expect(leoToken).to.eql(expectedLeoToken)
    expect(batToken).to.eql(expectedBatToken)
  })

  it('gets ERC20 data correctly when the token returns 32bytes var', async () => {
    const daiTokenInstance = await DaiToken.deployed()
    const data = await contractInstance.methods.getTokenData([daiTokenInstance.address]).call()
    const expectedErc = {
      symbol: "DAI",
      decimals: 1,
      name: "Dai Stablecoin"
    }

    const erc = {
      name: data.names[0],
      symbol: data.symbols[0],
      decimals: data.decimals[0].toNumber()
    }
    expect(erc).to.eql(expectedErc)
  })

})
