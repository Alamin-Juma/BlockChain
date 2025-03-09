import React, { useState } from "react";
import Web3 from "web3";
import { Card, Button, Form, Alert } from "react-bootstrap";

interface SendTransactionProps {
  web3: Web3 | null;
  ethAddress: string;
}

const SendTransaction: React.FC<SendTransactionProps> = ({ web3, ethAddress }) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [error, setError] = useState("");

  const sendTransaction = async () => {
    if (!web3 || !ethAddress || !recipientAddress || !amount) {
      setError("Ensure wallet is connected and fields are filled.");
      return;
    }

    try {
      const amountInWei = web3.utils.toWei(amount, "ether");
      const tx = { from: ethAddress, to: recipientAddress, value: amountInWei, gas: 21000 };
      const txHash = await web3.eth.sendTransaction(tx);
      // Convert the transactionHash to string to fix the type error
      setTransactionHash(txHash.transactionHash.toString());
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <Card className="shadow mt-4">
      <Card.Body>
        <Card.Title>Send ETH</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group>
            <Form.Label>Recipient Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Label>Amount (ETH)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Form.Group>
          <Button className="mt-3" variant="success" onClick={sendTransaction}>
            Send Transaction
          </Button>
        </Form>
        {transactionHash && <Alert variant="success" className="mt-3">Transaction Hash: {transactionHash}</Alert>}
      </Card.Body>
    </Card>
  );
};

export default SendTransaction;