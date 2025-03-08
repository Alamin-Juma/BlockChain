import React, { useState } from "react";
import { Transaction } from "ethereumjs-tx";
import { Container, Card, Button, Form } from "react-bootstrap";
import { ethers } from "ethers";

const SignTransaction: React.FC<{ privKey: string; ethAddress: string }> = ({ privKey, ethAddress }) => {
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
    const privateKeyUint8Array = ethers.utils.arrayify(privKey);
    tx.sign(privateKeyUint8Array);
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
    const privateKeyUint8Array = ethers.utils.arrayify(privKey);
    tx.sign(privateKeyUint8Array);
    const signedTx = tx.serialize().toString("hex");

    setSignedEIP1559Tx(signedTx);
    setRecoveredEIP1559Address("0x" + tx.getSenderAddress().toString("hex"));
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-lg">
        <Card.Body>
          <Card.Title className="text-center">Sign Transactions</Card.Title>

          <div className="text-center mb-4">
            <Button variant="primary" onClick={signLegacyTx}>
              Sign Legacy Transaction
            </Button>
            <Button variant="primary" onClick={signEIP1559Tx} className="ml-2">
              Sign EIP1559 Transaction
            </Button>
          </div>

          {signedLegacyTx && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Signed Legacy Transaction</Card.Title>
                <Form.Control as="textarea" rows={3} value={signedLegacyTx} readOnly />
              </Card.Body>
            </Card>
          )}

          {recoveredLegacyAddress && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Recovered Legacy Address</Card.Title>
                <Form.Control as="textarea" rows={2} value={recoveredLegacyAddress} readOnly />
              </Card.Body>
            </Card>
          )}

          {signedEIP1559Tx && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Signed EIP1559 Transaction</Card.Title>
                <Form.Control as="textarea" rows={3} value={signedEIP1559Tx} readOnly />
              </Card.Body>
            </Card>
          )}

          {recoveredEIP1559Address && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Recovered EIP1559 Address</Card.Title>
                <Form.Control as="textarea" rows={2} value={recoveredEIP1559Address} readOnly />
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SignTransaction;