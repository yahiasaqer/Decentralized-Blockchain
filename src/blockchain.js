const {Transaction} = require('./transaction');
const {Block} = require('./block');
const {MemPool} = require('./mempool');
const {MerkleTree} = require('./merkle');

const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const maxTransactions = 4; //maximum number of transactions per block.
const initialReward = 100;
const difficultyInitial = 2;
const mineRate = 2000; //mining difficulty rate

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficultyInitial;
    this.miningReward = initialReward;
  }

  createGenesisBlock() {
    const block = new Block("Genesis Time", "Genesis Block", "-");
    block.merkleRoot = SHA256(this.transactions).toString();
    block.difficulty = 0;
    return block;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePool(minerAddress, memPool) {
    memPool.transactions.unshift(new Transaction(null, minerAddress, this.miningReward));
    const tempPool    = memPool.transactions.slice(0, maxTransactions);
    memPool.transactions = memPool.transactions.slice(maxTransactions);

    for (const trans of tempPool) {
      trans.timeStamp = Date.now();
    }

    const block = new Block(Date.now(), tempPool, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    this.chain.push(block);

    this.modifyDifficulty();
  }

  getBalance(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {

        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }

      }
    }

    return balance;
  }

  modifyDifficulty() { 
    if (this.getLatestBlock().timeStamp + mineRate > Date.now()) {
      this.difficulty += 1;
    } else if (this.getLatestBlock().timeStamp + mineRate > Date.now() + mineRate) {
      this.difficulty -= 1;
    }
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidTransactions()) {
        throw new Error("Chain have manipulated transactions. Chain not valid!");
      }

      if (currentBlock.hash !== currentBlock.calculateHash() || currentBlock.previousHash !== previousBlock.hash) {
        throw new Error("Chain have manipulated block. Chain not valid!");
      }

    }

    return true;
  }

  replaceChain(newChain) {
    if (!newChain) {
      throw new Error("Empty chain recieved");
      return;
    } else if (newChain.length > this.chain.length) {
      console.log("Chain is replaced.");
      this.chain = newChain;
    }
  }

}

module.exports.Blockchain = Blockchain;
