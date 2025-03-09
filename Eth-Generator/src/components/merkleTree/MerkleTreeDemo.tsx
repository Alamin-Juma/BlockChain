import React, { useState, useEffect } from "react";
import * as d3 from "d3";

// Type definitions
interface Transaction {
  id: number;
  from: string;
  to: string;
  amount: number;
}

interface TreeNode {
  hash: string;
  level: number;
  parent: TreeNode | null;
  position?: 'left' | 'right' | null;
  isLeaf: boolean;
  id?: number;
  data?: Transaction;
  leftChild?: TreeNode;
  rightChild?: TreeNode;
}

interface MerkleTree {
  treeNodes: TreeNode[];
  root: TreeNode | null;
}

interface VerificationPathNode {
  hash: string;
  position: 'left' | 'right' | null;
  isTarget: boolean;
}

// D3 specific types
interface D3Link {
  source: d3.HierarchyPointNode<TreeNode>;
  target: d3.HierarchyPointNode<TreeNode>;
}

// Simplified crypto implementation for browser
const sha256 = (message: string): string => {
  // This is a simplified version for demonstration purposes
  // In a real application, use a proper crypto library or the Web Crypto API
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Convert to hex string and ensure it's 64 chars long (like SHA-256)
  const hexHash = Math.abs(hash).toString(16).padStart(64, '0');
  return hexHash;
};

const MerkleTreeDemo: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, from: "Alice", to: "Bob", amount: 5 },
    { id: 2, from: "Bob", to: "Charlie", amount: 3 },
    { id: 3, from: "Charlie", to: "Dave", amount: 8 },
    { id: 4, from: "Dave", to: "Alice", amount: 2 }
  ]);
  
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modifiedTx, setModifiedTx] = useState<Transaction | null>(null);
  const [verificationPath, setVerificationPath] = useState<VerificationPathNode[]>([]);
  const [rootHash, setRootHash] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  
  // Build the complete Merkle tree
  const buildMerkleTree = (txs: Transaction[]): MerkleTree => {
    if (!txs || txs.length === 0) return { treeNodes: [], root: null };
    
    // Create leaf nodes from transactions
    const leaves: TreeNode[] = txs.map(tx => {
      const txString = JSON.stringify(tx);
      return {
        id: tx.id,
        hash: sha256(txString),
        data: tx,
        level: 0,
        parent: null,
        position: null,
        isLeaf: true
      };
    });
    
    // Build the tree
    let treeNodes: TreeNode[] = [...leaves];
    let currentLevel = 0;
    let currentLevelNodes: TreeNode[] = [...leaves];
    
    while (currentLevelNodes.length > 1) {
      currentLevel++;
      const nextLevelNodes: TreeNode[] = [];
      
      for (let i = 0; i < currentLevelNodes.length; i += 2) {
        const leftNode = currentLevelNodes[i];
        const rightNode = i + 1 < currentLevelNodes.length 
          ? currentLevelNodes[i + 1] 
          : { ...currentLevelNodes[i], position: 'right' }; // Duplicate the last node if odd
        
        leftNode.position = 'left';
        rightNode.position = 'right';
        
        const parentHash = sha256(leftNode.hash + rightNode.hash);
        const parentNode: TreeNode = {
          hash: parentHash,
          level: currentLevel,
          leftChild: leftNode,
          rightChild: rightNode,
          parent: null,
          isLeaf: false
        };
        
        leftNode.parent = parentNode;
        rightNode.parent = parentNode;
        
        nextLevelNodes.push(parentNode);
        treeNodes.push(parentNode);
      }
      
      currentLevelNodes = nextLevelNodes;
    }
    
    const root = currentLevelNodes[0];
    setRootHash(root.hash);
    
    return { treeNodes, root };
  };
  
  // Generate a verification path for a specific transaction
  const generateVerificationPath = (tree: MerkleTree, txId: number): VerificationPathNode[] => {
    if (!tree.root) return [];
    
    // Find the leaf node for this transaction
    const leafNode = tree.treeNodes.find(node => node.isLeaf && node.id === txId);
    if (!leafNode) return [];
    
    // Build the path
    const path: VerificationPathNode[] = [];
    let currentNode: TreeNode = leafNode;
    
    while (currentNode.parent) {
      const isLeft = currentNode.position === 'left';
      const siblingNode = isLeft 
        ? currentNode.parent.rightChild 
        : currentNode.parent.leftChild;
      
      if (siblingNode) {
        path.push({
          hash: siblingNode.hash,
          position: siblingNode.position || null,
          isTarget: false
        });
      }
      
      currentNode = currentNode.parent;
    }
    
    return path;
  };
  
  // Verify a transaction using the Merkle path
  const verifyTransaction = (tx: Transaction, path: VerificationPathNode[]): boolean => {
    // Hash the transaction
    const txHash = sha256(JSON.stringify(tx));
    
    // Apply hashes along the path to compute the root
    let computedHash = txHash;
    
    for (const node of path) {
      if (node.position === 'left') {
        computedHash = sha256(node.hash + computedHash);
      } else {
        computedHash = sha256(computedHash + node.hash);
      }
    }
    
    // Compare with the stored root hash
    return computedHash === rootHash;
  };
  
  // Select a transaction to verify
  const handleSelectTransaction = (tx: Transaction): void => {
    setSelectedTx(tx);
    setModifiedTx(null);
    setIsValid(null);
    
    const tree = buildMerkleTree(transactions);
    const path = generateVerificationPath(tree, tx.id);
    setVerificationPath(path);
  };
  
  // Modify a transaction (to demonstrate tampering)
  const handleModifyTransaction = (): void => {
    if (!selectedTx) return;
    
    // Create a modified copy with a different amount
    const modified = {
      ...selectedTx,
      amount: selectedTx.amount + 10
    };
    
    setModifiedTx(modified);
    setIsValid(null);
  };
  
  // Verify the selected transaction
  const handleVerify = (): void => {
    if (!selectedTx || !verificationPath.length) return;
    
    const txToVerify = modifiedTx || selectedTx;
    const isValid = verifyTransaction(txToVerify, verificationPath);
    setIsValid(isValid);
  };
  
  // Add a new transaction
  const handleAddTransaction = (): void => {
    const newId = transactions.length + 1;
    const newTx: Transaction = {
      id: newId,
      from: `User${newId}`,
      to: `User${newId + 1}`,
      amount: Math.floor(Math.random() * 10) + 1
    };
    
    setTransactions([...transactions, newTx]);
    setSelectedTx(null);
    setModifiedTx(null);
    setIsValid(null);
    setVerificationPath([]);
  };
  
  // Recompute the tree when transactions change
  useEffect(() => {
    buildMerkleTree(transactions);
  }, [transactions]);
  
  // Render the tree visualization using D3
  useEffect(() => {
    if (transactions.length === 0) return;
    
    const { treeNodes, root } = buildMerkleTree(transactions);
    if (!root) return;
    
    // Clear previous SVG
    d3.select("#merkleTreeViz").selectAll("*").remove();
    
    // SVG dimensions
    const width = 800;
    const height = 400;
    const nodeRadius = 25;
    
    // Create SVG
    const svg = d3.select("#merkleTreeViz")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, 40)`);
    
    // Create hierarchical layout
    const hierarchyData = d3.hierarchy(root, (d) => {
      if (!d.leftChild && !d.rightChild) return null;
      return [d.leftChild, d.rightChild].filter(Boolean) as TreeNode[];
    });
    
    // Tree layout
    const treeLayout = d3.tree<TreeNode>()
      .size([width - 100, height - 100])
      .nodeSize([70, 100]);
    
    const rootWithPositions = treeLayout(hierarchyData);
    
    // Draw links
    svg.selectAll(".link")
      .data(rootWithPositions.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d: D3Link) => {
        // Ensure we have values for all coordinates
        const sourceX = d.source.x || 0;
        const sourceY = d.source.y || 0;
        const targetX = d.target.x || 0;
        const targetY = d.target.y || 0;
        
        return `M${sourceX},${sourceY}
                C${sourceX},${(sourceY + targetY) / 2}
                 ${targetX},${(sourceY + targetY) / 2}
                 ${targetX},${targetY}`;
      })
      .attr("fill", "none")
      .attr("stroke", (d: D3Link) => {
        if (!selectedTx) return "#aaa";
        
        // Highlight verification path
        const isInPath = verificationPath.some(node => 
          node.hash === d.target.data.hash || node.hash === d.source.data.hash
        );
        
        return isInPath ? "#ff9800" : "#aaa";
      })
      .attr("stroke-width", (d: D3Link) => {
        if (!selectedTx) return 2;
        
        // Highlight verification path
        const isInPath = verificationPath.some(node => 
          node.hash === d.target.data.hash || node.hash === d.source.data.hash
        );
        
        return isInPath ? 4 : 2;
      });
    
    // Draw nodes
    const treeNodeElements = svg.selectAll(".node")
      .data(rootWithPositions.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
    
    treeNodeElements.append("circle")
      .attr("r", nodeRadius)
      .attr("fill", d => {
        if (d.data.isLeaf) {
          if (selectedTx && d.data.id === selectedTx.id) {
            return "#4caf50"; // Selected transaction
          }
          return "#64b5f6"; // Leaf node
        }
        
        if (d.data === root) return "#f44336"; // Root
        
        // Check if in verification path
        const isInPath = verificationPath.some(node => node.hash === d.data.hash);
        return isInPath ? "#ff9800" : "#9c27b0"; // Internal node
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    // Add hash text
    treeNodeElements.append("text")
      .attr("dy", nodeRadius + 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text(d => d.data.hash.substring(0, 6) + "...");
    
    // Add level labels
    treeNodeElements.append("text")
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(d => {
        if (d.data.isLeaf) {
          if (d.data.data) {
            return `TX ${d.data.data.id}`;
          }
          return "TX";
        }
        return d.data === root ? "ROOT" : "H";
      });
    
  }, [transactions, selectedTx, verificationPath]);
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Merkle Tree Demonstration</h2>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">Visualization</h3>
          <div id="merkleTreeViz" className="w-full h-96 overflow-auto flex justify-center" />
          
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: "#f44336"}}></div>
              <span>Root Node</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: "#9c27b0"}}></div>
              <span>Internal Node</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: "#64b5f6"}}></div>
              <span>Transaction (Leaf)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: "#4caf50"}}></div>
              <span>Selected Transaction</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: "#ff9800"}}></div>
              <span>Verification Path</span>
            </div>
          </div>
          
          <div className="mt-4">
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-black px-4 py-2 rounded mr-2"
              onClick={handleAddTransaction}
            >
              Add Transaction
            </button>
            <button 
              className="bg-gray-500 hover:bg-gray-600 text-red px-4 py-2 rounded"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
          </div>
          
          {showDetails && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h4 className="font-bold">Root Hash:</h4>
              <p className="font-mono text-sm break-all">{rootHash}</p>
            </div>
          )}
        </div>
        
        <div className="w-full lg:w-1/3 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">Transactions</h3>
          <div className="space-y-2 mb-4">
            {transactions.map(tx => (
              <div 
                key={tx.id}
                className={`p-3 rounded cursor-pointer ${
                  selectedTx && selectedTx.id === tx.id 
                    ? 'bg-green-100 border border-green-500' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => handleSelectTransaction(tx)}
              >
                <div className="font-bold">Transaction {tx.id}</div>
                <div>From: {tx.from}</div>
                <div>To: {tx.to}</div>
                <div>Amount: {tx.amount} ETH</div>
              </div>
            ))}
          </div>
          
          {selectedTx && (
            <div className="bg-gray-100 p-3 rounded mb-4">
              <h4 className="font-bold">Verification</h4>
              <p>Selected: Transaction {selectedTx.id}</p>
              
              <div className="my-2">
                <button 
                  onClick={handleModifyTransaction}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded mr-2"
                >
                  Tamper
                </button>
                <button 
                  onClick={handleVerify}
                  className="bg-green-500 hover:bg-green-600 text-black px-3 py-1 rounded"
                >
                  Verify
                </button>
              </div>
              
              {modifiedTx && (
                <div className="mt-2 p-2 bg-yellow-100 rounded">
                  <p className="text-yellow-800">Modified! Amount changed to: {modifiedTx.amount} ETH</p>
                </div>
              )}
              
              {isValid !== null && (
                <div className={`mt-2 p-2 rounded ${isValid ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className={isValid ? 'text-green-800' : 'text-red-800'}>
                    {isValid 
                      ? 'Verification Successful! The transaction is valid.' 
                      : 'Verification Failed! The transaction has been tampered with.'}
                  </p>
                </div>
              )}
              
              {showDetails && verificationPath.length > 0 && (
                <div className="mt-2">
                  <h5 className="font-bold">Verification Path:</h5>
                  <div className="text-xs font-mono">
                    {verificationPath.map((node, i) => (
                      <div key={i} className="mb-1">
                        {node.position === 'left' ? '← ' : '→ '}
                        {node.hash.substring(0, 10)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-2">How Merkle Trees Work</h3>
        <p className="mb-2">
          A Merkle tree is a binary tree of hashes, where:
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-2">
          <li>Leaf nodes are the hashes of individual data blocks (transactions)</li>
          <li>Non-leaf nodes are the hashes of their two child hashes combined</li>
          <li>The root hash represents a fingerprint of the entire data set</li>
        </ol>
        
        <h4 className="font-bold">Key Benefits:</h4>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Efficiently verify that a transaction is included in a block (O(log n) complexity)</li>
          <li>Only need the verification path, not the entire transaction set</li>
          <li>Detect tampering of any transaction in the set</li>
          <li>Critical for lightweight clients in blockchain (SPV nodes)</li>
        </ul>
        
        <h4 className="font-bold">Try it yourself:</h4>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Select a transaction from the list</li>
          <li>Use the "Verify" button to check its authenticity</li>
          <li>Try the "Tamper" button to modify it and see verification fail</li>
          <li>Add more transactions to see how the tree grows</li>
        </ol>
      </div>
    </div>
  );
};

export default MerkleTreeDemo;