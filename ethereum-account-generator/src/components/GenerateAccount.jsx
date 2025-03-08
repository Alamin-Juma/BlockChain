import React, { useState } from "react";
import BIP39 from "bip39";
import { hdkey } from "ethereumjs-wallet";
import * as Wallet from "ethereumjs-wallet"; // Fix import issue
import { keccak256 } from "js-sha3";

const GenerateAccount = () => {
  const [mnemonic, setMnemonic] = useState("");
  const [privKey, setPrivKey] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [ethAddress, setEthAddress] = useState("");

  const generateNewMnemonic = () => {
    const newMnemonic = BIP39.generateMnemonic();
    setMnemonic(newMnemonic);
    generateKeys(newMnemonic);
  };

  const generateKeys = (mnemonic) => {
    const seed = BIP39.mnemonicToSeedSync(mnemonic);
    const derivedNode = hdkey.fromMasterSeed(seed).derivePath("m/44'/60'/0'/0/0");
    const wallet = derivedNode.getWallet();
    const privateKey = wallet.getPrivateKey().toString("hex");

    // FIX: Use Wallet.default if "fromPrivateKey" is undefined
    const publicKey = Wallet.default.fromPrivateKey(Buffer.from(privateKey, "hex")).getPublicKey().toString("hex");
    const address = "0x" + keccak256(Buffer.from(publicKey, "hex")).slice(-40);

    setPrivKey(privateKey);
    setPubKey(publicKey);
    setEthAddress(address);
  };

  return (
    <div>
      <h2>Generate Ethereum Account</h2>
      <button onClick={generateNewMnemonic}>Generate New Mnemonic</button>
      <p>Mnemonic: <textarea value={mnemonic} readOnly /></p>
      <p>Private Key: {privKey}</p>
      <p>Public Key: {pubKey}</p>
      <p>Ethereum Address: {ethAddress}</p>
    </div>
  );
};

export default GenerateAccount;
