// This component will: ✔ Sign a Legacy transaction
// ✔ Sign an EIP-1559 transaction
// ✔ Recover the signer’s address

import React, { useState } from "react";
import { Transaction } from "ethereumjs-tx";

const SignTransaction = ({ privKey, ethAddress }) => {
  const [signedLegacyTx, setSignedLegacyTx] = useState("");
  const [signedEIP1559Tx, setSignedEIP1559Tx] = useState("");
  const [recoveredLegacyAddress, setRecoveredLegacyAddress] = useState("");
  const [recoveredEIP1559Address, setRecoveredEIP1559Address] = useState("");

  const signLegacyTx = () => {
    const txData = {
      nonce: "0x00",
      gasPrice: "0x09184e72a000",
      gasLimit: "0x2710",
      to: ethAddress,
      value: "0x10",
      data: "0x",
      chainId: 3,
    };

    const tx = new Transaction(txData, { chain: "ropsten" });
    tx.sign(Buffer.from(privKey, "hex"));
    const signedTx = tx.serialize().toString("hex");
    
    setSignedLegacyTx(signedTx);
    setRecoveredLegacyAddress("0x" + tx.getSenderAddress().toString("hex"));
  };

  const signEIP1559Tx = () => {
    const txData = {
      nonce: "0x00",
      type: 2,
      maxPriorityFeePerGas: "0x09184e72a000",
      maxFeePerGas: "0x09184e72a000",
      gasLimit: "0x2710",
      to: ethAddress,
      value: "0x10",
      data: "0x",
      chainId: 3,
    };

    const tx = new Transaction(txData, { chain: "ropsten" });
    tx.sign(Buffer.from(privKey, "hex"));
    const signedTx = tx.serialize().toString("hex");
    
    setSignedEIP1559Tx(signedTx);
    setRecoveredEIP1559Address("0x" + tx.getSenderAddress().toString("hex"));
  };

  return (
    <div>
      <h2>Sign Transactions</h2>
      <button onClick={signLegacyTx}>Sign Legacy Transaction</button>
      <button onClick={signEIP1559Tx}>Sign EIP1559 Transaction</button>
      <p>Signed Legacy Tx: {signedLegacyTx}</p>
      <p>Recovered Legacy Address: {recoveredLegacyAddress}</p>
      <p>Signed EIP1559 Tx: {signedEIP1559Tx}</p>
      <p>Recovered EIP1559 Address: {recoveredEIP1559Address}</p>
    </div>
  );
};

export default SignTransaction;