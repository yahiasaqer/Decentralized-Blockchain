const Websocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const MESSAGE_TYPES = {
  chain: 'CHAIN',
  transaction: 'TRANSACTION'
}


class P2PServer {
  constructor(blockchain, memPool) {
    this.blockchain = blockchain;
    this.memPool = memPool;
    this.sockets = [];
  }

  listen() {
    const server = new Websocket.Server({ port: P2P_PORT });
    server.on('connection', socket => this.connectSocket(socket));

    this.connectToPeers();

    console.log(`Listening on PORT ${P2P_PORT}`);
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    console.log(` connected`);

    this.messageHandler(socket);

    this.sendChain(socket);
  }

  connectToPeers() {
    peers.forEach(peer => {
      // ws://localhost:5001,ws://localhost:5002 ...
      const socket = new Websocket(peer);
      socket.on('open', () => this.connectSocket(socket));
    })
  }

  messageHandler(socket) {
    socket.on('message', message => {
      const data = JSON.parse(message);
      switch(data.type) {
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPES.transaction:
          this.memPool.transactions.push(data.transaction);
          break;
      }

      this.blockchain.replaceChain(data);
    });
  }

  sendChain(socket) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.chain,
      chain: this.blockchain.chain
    }));
  }

  sendTransaction(socket, transaction) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.transaction,
      transaction
    }));
  }

  syncChains() {
    this.sockets.forEach(socket => this.sendChain(socket));
  }

  broadcastTransaction(transaction) {
    this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
  }
}

module.exports.P2PServer = P2PServer;
