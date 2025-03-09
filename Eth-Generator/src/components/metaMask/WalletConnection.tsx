import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { Card, Button, Form, Alert } from "react-bootstrap";

const WalletConnection: React.FC<{ setWeb3: (web3: Web3 | null) => void; setEthAddress: (address: string) => void; setEthBalance: (balance: string) => void }> = ({
  setWeb3,
  setEthAddress,
  setEthBalance,
}) => {
  const [ethAddress, setEthAddressLocal] = useState("");
  const [ethBalance, setEthBalanceLocal] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const web3 = new Web3(window.ethereum);
        setWeb3(web3);

        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          updateAccountInfo(web3, accounts[0]);
        }
      } else {
        setError("MetaMask not detected! Please install MetaMask.");
      }
    } catch (error) {
      console.error("Error checking wallet:", error);
    }
  };

  const updateAccountInfo = async (web3: Web3, address: string) => {
    try {
      const balance = await web3.eth.getBalance(address);
      const ethBalanceValue = web3.utils.fromWei(balance, "ether");

      setEthAddress(address);
      setEthBalance(ethBalanceValue);
      setEthAddressLocal(address);
      setEthBalanceLocal(ethBalanceValue);
    } catch (error) {
      console.error("Failed to fetch account info:", error);
    }
  };

  const connectMetaMask = async () => {
    try {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();

        setWeb3(web3);
        updateAccountInfo(web3, accounts[0]);
      } else {
        setError("Please install MetaMask.");
      }
    } catch (error: any) {
      console.error("MetaMask connection failed:", error);
      setError(error.message);
    }
  };

  return (
    <Card className="shadow">
      <Card.Body>
        <Card.Title>Wallet Connection</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {!ethAddress ? (
          <Button variant="primary" onClick={connectMetaMask}>
            Connect MetaMask
          </Button>
        ) : (
          <>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Ethereum Address</Card.Title>
                <Form.Control as="textarea" rows={1} value={ethAddress} readOnly />
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <Card.Title>ETH Balance</Card.Title>
                <Form.Control type="text" value={`${ethBalance} ETH`} readOnly />
              </Card.Body>
            </Card>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default WalletConnection;
