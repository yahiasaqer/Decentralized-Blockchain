//here you can create new transactions

const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timeStamp = Date.now();
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(this.fromAddress +
      this.toAddress +
      this.amount +
      this.timeStamp
    ).toString();
  }

  sign(senderWallet) {
    const signingKey = senderWallet.keyPair;
    if (signingKey.getPublic('hex') !== this.fromAddress) { 
      throw new Error(`Can't make a transaction using other wallets.`);
    }

    const hashTx = this.hash;
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  isTransactionValid() {
    if (this.fromAddress === null) { 
      return true;
    }
    if (!this.signature || this.signature.length === 0) { 
      throw new Error(`Transaction must be signed first.`);
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex'); 
    return publicKey.verify(this.calculateHash(), this.signature); 
  }

  toString() {
    return `
        *Transaction*:
          TimeStamp: ${this.timeStamp}
          From:      ${this.fromAddress}
          Amount:    ${this.amount}
          To:        ${this.toAddress}
          Hash:      ${this.hash}`;
  }
}

module.exports.Transaction = Transaction;
