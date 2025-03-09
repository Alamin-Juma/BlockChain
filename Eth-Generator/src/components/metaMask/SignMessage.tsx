//🔹 Enables the user to sign messages.

import React, { useState } from "react";
import Web3 from "web3";
import { Card, Button, Form, Alert } from "react-bootstrap";

interface SignMessageProps {
  web3: Web3 | null;
  ethAddress: string;
}

const SignMessage: React.FC<SignMessageProps> = ({ web3, ethAddress }) => {
  const [message, setMessage] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [error, setError] = useState("");

  const signMessage = async () => {
    if (!web3 || !ethAddress || !message) {
      setError("Ensure wallet is connected and message is entered.");
      return;
    }

    try {
      const signature = await web3.eth.personal.sign(message, ethAddress, "");
      setSignedMessage(signature);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <Card className="shadow mt-4">
      <Card.Body>
        <Card.Title>Sign Message</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group>
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Enter message to sign..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Form.Group>
          <Button className="mt-3" variant="primary" onClick={signMessage}>
            Sign Message
          </Button>
        </Form>
        {signedMessage && <Alert variant="success" className="mt-3">Signed Message: {signedMessage}</Alert>}
      </Card.Body>
    </Card>
  );
};

export default SignMessage;
