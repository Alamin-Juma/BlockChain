import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GenerateAccount from "./components/GenerateAccount";
import SignTransaction from "./components/SignTransaction";
function App() {
  const [privKey, setPrivKey] = useState("");
  const [ethAddress, setEthAddress] = useState("");

  return (
  
      <div>
      <h1>Ethereum Account Generator & Signer</h1>
      <GenerateAccount setPrivKey={setPrivKey} setEthAddress={setEthAddress} />
      {privKey && ethAddress && <SignTransaction privKey={privKey} ethAddress={ethAddress} />}
    </div>
    
  )
}

export default App
