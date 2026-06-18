import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, Coins, ArrowRight, Activity } from 'lucide-react';
import './index.css';

const RPC_URL = import.meta.env.VITE_RPC_URL || "https://brixs-core-node.onrender.com";
const ADMIN_PK = import.meta.env.VITE_ADMIN_PK;

function App() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState("0.0");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  const createWallet = () => {
    const newWallet = ethers.Wallet.createRandom();
    setWallet(newWallet);
    setBalance("0.0");
    setTxHash("");
  };

  const fetchBalance = async () => {
    if (!wallet) return;
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const bal = await provider.getBalance(wallet.address);
      setBalance(ethers.formatEther(bal));
    } catch (e) {
      console.error("Node might be offline");
    }
  };

  const claimTokens = async () => {
    if (!wallet) return;
    setLoading(true);
    setTxHash("");
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const admin = new ethers.Wallet(ADMIN_PK, provider);
      
      const tx = await admin.sendTransaction({
        to: wallet.address,
        value: ethers.parseEther("10.0")
      });
      
      await tx.wait();
      setTxHash(tx.hash);
      await fetchBalance();
    } catch (e) {
      alert("Failed to claim. Is the Brixs Node running on localhost:8545?");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (wallet) {
      const interval = setInterval(fetchBalance, 3000);
      return () => clearInterval(interval);
    }
  }, [wallet]);

  return (
    <div className="app-container">
      <div className="glass-panel wallet-card">
        <div className="header">
          <Activity className="icon-pulse" color="#00ffcc" size={32} />
          <h1>Brixs Wallet</h1>
        </div>
        
        {!wallet ? (
          <div className="onboarding">
            <p>Welcome to the Sovereign L2.</p>
            <button className="primary-btn" onClick={createWallet}>
              <Wallet size={20} /> Create New Wallet
            </button>
          </div>
        ) : (
          <div className="dashboard">
            <div className="balance-section">
              <h2>{balance} <span className="currency">BRIXS</span></h2>
              <p className="subtitle">Native Gas Token</p>
            </div>
            
            <div className="address-box">
              <span className="label">Your Address:</span>
              <code className="address">{wallet.address.slice(0,10)}...{wallet.address.slice(-8)}</code>
            </div>

            <button className="primary-btn claim-btn" onClick={claimTokens} disabled={loading}>
              <Coins size={20} /> {loading ? "Claiming via Sequencer..." : "Claim 10 Testnet BRIXS"}
            </button>

            {txHash && (
              <div className="tx-success">
                <p>✅ Tokens received!</p>
                <small>Tx: {txHash.slice(0, 15)}...</small>
              </div>
            )}
            
            <div className="private-key-warning">
              <p>⚠️ Do not share your private key</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
