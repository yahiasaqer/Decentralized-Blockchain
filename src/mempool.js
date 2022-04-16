//The blockchain network's pending transactions, waiting to be mined by miners

class MemPool {
  constructor() {
    this.transactions = [];
  }

  updateOrAddTx(transaction) {
    const transactionHash = this.transactions.find(tx => tx.hash === transaction.hash);

    if (transactionHash) {
      this.transactions[this.transactions.indexOf(transactionHash)] = transaction;
    } else {
      this.transactions.push(transaction);
    }

  }

  minePool(minerAddress, difficulty) {
    const tempPool = this.popTx();

    this.generateReward(minerAddress);

    // each tx in this block shold get the timeStamp of its block
    for (const trans of tempPool) {
      trans.timeStamp = Date.now();
    }

    const block = new Block(Date.now(), tempPool, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    this.chain.push(block);

    this.adjustDifficulty();
  }

  popTx() {
    // As per to Mica requirements - one block can only take up to 4 txs
    // each tx that doesn't make it to the mining process stays in memPool
    const tempPool = this.transactions.slice(0, MAX_NUM_OF_TX_PER_BLOCK - 1);
    this.transactions = this.transactions.slice(MAX_NUM_OF_TX_PER_BLOCK - 1);
    return tempPool;
  }

  generateReward(minerAddress) {
    const reward = new Transaction(null, minerAddress, this.miningReward);
    this.transactions.unshift(reward);
  }
}

module.exports.MemPool = MemPool
