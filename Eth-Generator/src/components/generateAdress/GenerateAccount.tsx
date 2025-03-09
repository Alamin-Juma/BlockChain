import React, { useState } from "react";
import { ethers } from "ethers";
import { Container, Card, Button, Form } from "react-bootstrap";

const GenerateAccount: React.FC<{
  setPrivKey: (key: string) => void;
  setEthAddress: (address: string) => void;
}> = ({ setPrivKey, setEthAddress }) => {
  const [mnemonic, setMnemonic] = useState("");
  const [privKey, setPrivKeyLocal] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [ethAddress, setEthAddressLocal] = useState("");

  const generateNewMnemonic = () => {
    const wallet = ethers.Wallet.createRandom();
    setMnemonic(wallet.mnemonic!.phrase);
    setPrivKeyLocal(wallet.privateKey);
    setPubKey(wallet.publicKey);
    setEthAddressLocal(wallet.address);
    setPrivKey(wallet.privateKey);
    setEthAddress(wallet.address);
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-lg">
        <Card.Body>
          <Card.Title className="text-center">Ethereum Account Generator</Card.Title>
          <Card.Subtitle className="text-center mb-4">Generate New Credentials</Card.Subtitle>

          <div className="text-center mb-4">
            <Button variant="primary" onClick={generateNewMnemonic}>
              Generate New Credentials
            </Button>
          </div>

          {mnemonic && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Mnemonic Phrase</Card.Title>
                <Form.Control as="textarea" rows={3} value={mnemonic} readOnly />
                <Form.Text className="text-muted">
                  Store this phrase securely. It can be used to recover your account.
                </Form.Text>
              </Card.Body>
            </Card>
          )}

          {privKey && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Private Key</Card.Title>
                <Form.Control as="textarea" rows={2} value={privKey} readOnly />
                <Form.Text className="text-muted">
                  Never share your private key with anyone!
                </Form.Text>
              </Card.Body>
            </Card>
          )}

          {pubKey && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Public Key</Card.Title>
                <Form.Control as="textarea" rows={2} value={pubKey} readOnly />
              </Card.Body>
            </Card>
          )}

          {ethAddress && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Ethereum Address</Card.Title>
                <Form.Control as="textarea" rows={2} value={ethAddress} readOnly />
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GenerateAccount;