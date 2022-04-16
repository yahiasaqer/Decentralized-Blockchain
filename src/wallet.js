//Creates new wallet, adds new transactions by wallet owner and signs them


const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const {Transaction} = require('../src/transaction');

class Wallet {
  constructor() {
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic('hex');
  }

  createTransaction(from, to, amount) {
    const transAction = new Transaction(from, to, amount);
    transAction.sign(this);

    return transAction;
  }

  toString() {
    return `Address of the wallet: ${this.publicKey}`;
  }
}

module.exports.Wallet = Wallet
