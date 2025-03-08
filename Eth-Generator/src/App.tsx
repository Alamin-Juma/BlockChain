import React, { useState } from "react";
import GenerateAccount from "./components/GenerateAccount";
import SignTransaction from "./components/SignTransaction";
import { Container } from "react-bootstrap";

const App: React.FC = () => {
  const [privKey, setPrivKey] = useState("");
  const [ethAddress, setEthAddress] = useState("");

  return (
    <Container className="mt-4">
      <h1 className="text-center">Ethereum Account Generator & Signer</h1>
      <GenerateAccount setPrivKey={setPrivKey} setEthAddress={setEthAddress} />
      {privKey && ethAddress && <SignTransaction privKey={privKey} ethAddress={ethAddress} />}
    </Container>
  );
};

export default App;
