const Tx = require('ethereumjs-tx').Transaction

class Utils {
  constructor(contractInstance, web3, pvtKey) {
    this.contractInstance = contractInstance
    this.web3 = web3
    this.pvtKey = pvtKey
    this.account = web3.eth.accounts.privateKeyToAccount('0x' + pvtKey.toString('hex'));
  }

  async addTokens(tokens) {
    const functionAbi = await this.contractInstance.methods.addNewTokens(tokens).encodeABI()
    await this.sendSignedTx(functionAbi)
  }

  async removeTokens(tokens) {
    const functionAbi = await this.contractInstance.methods.removeTokens(tokens).encodeABI()
    await this.sendSignedTx(functionAbi)
  }

  sendSignedTx(functionAbi) {
    return new Promise(async (resolve, reject) => {
      const nonce = await this.web3.eth.getTransactionCount(this.account.address)

      const txParams = {
        gasPrice: 100000,
        gasLimit: 3000000,
        to: this.contractInstance.address,
        data: functionAbi,
        from: this.account.address,
        nonce: '0x' + nonce.toString(16)
      };


      const tx = new Tx(txParams);
      tx.sign(this.pvtKey); // Transaction Signing here

      const serializedTx = tx.serialize();

      this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .once('transactionHash', hash => console.log(`Hash: ${hash}`))
        .once('receipt', receipt => console.log(`Receipt: ${receipt}`))
        .on('error', error => {
          console.error("Error: ", error)
          reject(error)
        })
        .on('confirmation', (confNumber, receipt) => {
          console.log('Confirmation: ', confNumber, receipt)
          resolve(receipt);
        })
    })
  }
}

module.exports = Utils