//Creates a new Merkle tree for a block
const SHA256 = require('crypto-js/sha256');

class MerkleTree {
  constructor(nodesList) {
    this.terminalNodes = nodesList;
    this.layers = [this.terminalNodes]; //this defines number of tree levels.
    this.calculateTree(this.terminalNodes);
  }

  calculateTree(nodes) {
    if (nodes.length === 1) { // if I only have 1 transaction, return it 
      return nodes[0];
    }
    const layerID = this.layers.length;

    this.layers.push([]);

    // take 2 hashes of different transactions and hash them, push to the layers list (loop until no more even no. of leaves)
    for (let i = 0; i < nodes.length - 1; i += 2) {
      this.layers[layerID].push(SHA256(nodes[i] + nodes[i + 1]).toString());
    }

    if (nodes.length % 2 === 1) {
      this.layers[layerID].push(SHA256(nodes[nodes.length - 1], nodes[nodes.length - 1]).toString());
    }

    return this.calculateTree(this.layers[layerID]);
  }

  getTerminalNodes() {
    return this.terminalNodes;
  }

  getLayers() {
    return this.layers;
  }

  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }

  getProof(leaf) {
    let index;
    const prf = []; //proof

    for (let i = 0; i < this.terminalNodes.length; i++) {
      if (leaf === this.terminalNodes[i].toString()) {
        index = i;
        break;
      }
    }

    if (!index) {
      return prf;
    }

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRight = index % 2; //for checking if its the right node.
      const pairID = isRight ? index - 1 : index + 1;

      prf.push({
        position: isRight ? 'left' : 'right',
        data: layer[pairID].toString()
      });

      index = Math.floor(index / 2);
    }

    return prf;
  }

  check(prf, trgtNode, root) {
    let hash = trgtNode

    if (!Array.isArray(prf) || !prf.length || !trgtNode || !root) {
      return false;
    }

    for (let i = 0; i < prf.length; i++) {
      const node = prf[i]
      const isRightNode = (node.position === 'right')
      const buffers = []

      if (isRightNode) {
        hash = SHA256(hash.toString() + node.data.toString()).toString();
      } else {
        hash = SHA256(node.data.toString() + hash.toString()).toString();
      }

    }

    return hash === root.toString();
  }

}

module.exports.MerkleTree = MerkleTree;
