import React, { useState } from "react";
import { Container, Navbar, Nav } from "react-bootstrap";
import Web3 from "web3";

// MetaMask Components
import WalletConnection from "./components/metaMask/WalletConnection";
import SendTransaction from "./components/metaMask/SendTransaction";
import SignMessage from "./components/metaMask/SignMessage";

// Ethereum Account Generator Components


// Merkle Tree Demonstration
import MerkleTreeDemo from "./components/merkleTree/MerkleTreeDemo";
import GenerateAccount from "./components/generateAdress/GenerateAccount";
import SignTransaction from "./components/generateAdress/SignTransaction";

const App: React.FC = () => {
  // Page Selection State
  const [view, setView] = useState<"generate" | "wallet" | "merkle">("generate");

  // MetaMask Wallet State
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [ethAddress, setEthAddress] = useState("");

  // Ethereum Address Generator State
  const [privKey, setPrivKey] = useState("");
  const [generatedEthAddress, setGeneratedEthAddress] = useState("");

  return (
    <Container fluid className="mt-4">
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">Ethereum DApp</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link onClick={() => setView("generate")}>Register Address</Nav.Link>
              <Nav.Link onClick={() => setView("wallet")}>Connect Wallet</Nav.Link>
              <Nav.Link onClick={() => setView("merkle")}>Demonstrate Merkle</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Page Content */}
      <Container className="mt-4">
        {view === "generate" && (
          <>
            <h3 className="text-center">Ethereum Account Generator</h3>
            <GenerateAccount setPrivKey={setPrivKey} setEthAddress={setGeneratedEthAddress} />
            {privKey && generatedEthAddress && <SignTransaction privKey={privKey} ethAddress={generatedEthAddress} />}
          </>
        )}

        {view === "wallet" && (
          <>
            <h3 className="text-center">MetaMask Wallet</h3>
            <WalletConnection setWeb3={setWeb3} setEthAddress={setEthAddress} setEthBalance={() => {}} />
            {ethAddress && (
              <>
                <SendTransaction web3={web3} ethAddress={ethAddress} />
                <SignMessage web3={web3} ethAddress={ethAddress} />
              </>
            )}
          </>
        )}

        {view === "merkle" && (
          <>
            <h3 className="text-center">Merkle Tree Demonstration</h3>
            <MerkleTreeDemo />
          </>
        )}
      </Container>
    </Container>
  );
};

export default App;
