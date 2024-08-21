import React, { useState } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { createWeb3Modal, defaultConfig, useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider, useDisconnect } from '@web3modal/ethers/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircularProgress } from '@mui/material';
import './App.css';
import ABI from "./ABI.json"
import { CONTRACT_ADDRESS } from "./constants"

// 1. Get projectId
const projectId = '8ad813f72792250629f434f63aa93b32'

// 2. Set chains
const bnb_tesnet = {
  chainId: 97,
  name: 'BNB Chain',
  currency: 'BNB',
  explorerUrl: 'https://testnet.bscscan.com',
  rpcUrl: 'https://bsc-testnet.core.chainstack.com/a6ac3e4320de6a11032f3eba5d3a0d1e'
}

// 3. Create a metadata object
const metadata = {
  name: 'Portfolio Token dApp',
  description: 'Portfolio token minting dApp',
  url: 'https://mywebsite.com', // origin must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/']
}


// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1 // used for the Coinbase SDK
})

// 5. Create a AppKit instance
createWeb3Modal({
  ethersConfig,
  chains: [bnb_tesnet],
  projectId,
  enableAnalytics: true // Optional - defaults to your Cloud configuration
})

function App() {
  const [minting, setMinting] = useState(false);
  const [amount, setAmount] = useState(1);

  const { open } = useWeb3Modal()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()



  const connectWallet = async () => {
    try {
      open()
    } catch (error) {
      toast.error("Connection error.");
    }
  };


  const disconnectWallet = async () => {
    try {
      disconnect()
    } catch (error) {
      toast.error("Disonnection error.");
    }
  };

  const mintToken = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }

    try {
      setMinting(true)
      const browserProvider = new BrowserProvider(walletProvider);
      const signer = await browserProvider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const mintAmount = BigInt(amount) * BigInt(10 ** 18);
      console.log("🚀 ~ mintToken ~ mintAmount:", mintAmount);

      const tx = await contractInstance.mint(mintAmount, {
        gasLimit: 500000
      });

      const result = await tx.wait();
      if(result && result.status === 1) {
        console.log("🚀 ~ mintToken ~ result:", result);
        toast.success("Minted successfully!");
        setMinting(false)
      }
    } catch (error) {
      setMinting(false)
      console.error("Minting error:", error);
      toast.error("Minting failed. Try again!");
    }
  };


  return (
    <div className="App">
      <h2 className='heading'>Portfolio Token Minting dApp</h2>
      <div className="container">
        <div className="mint-section">
          <input
            min={1}
            type="number"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;

              // Regular expression to check if the value is a positive integer without leading zeros
              const isValid = /^[1-9]\d*$/.test(value);

              if (isValid) {
                setAmount(value);
              }
            }}
            placeholder="Amount to mint"
          />
          <button className='btnMint' onClick={mintToken}  disabled={minting}>
            {minting ? (
              <CircularProgress size={15} sx={{ color: '#fff', }} />
            ) : (
              `Mint`
            )}
          </button>
        </div>
        <div className="wallet-section">
          <button className="btn" onClick={isConnected ? disconnectWallet : connectWallet}
          >
            {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
          </button>
          <p>{address ? `${address.slice(0, 6)}.......${address.slice(-4)}` : 'Wallet Not Connected'}</p>
        </div>
      </div>
      <span className='footer'>
        Made by{" "} 
        <a style={{ color: "#000", marginLeft: "5px" }} href="https://github.com/rust-master" target="_blank" rel="noreferrer">
          {" "}Rust Master <span style={{ color: "#00ddf1" }}>❤️</span>{" "}
        </a>
      </span>
      <ToastContainer />
    </div>
  );
}

export default App;
