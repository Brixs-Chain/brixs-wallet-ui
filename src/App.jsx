import React, { useState } from 'react';
import './index.css';

const RPC_URL = import.meta.env.VITE_RPC_URL || "https://brixs-core-node.onrender.com";

function App() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const addToMetaMask = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask first!');
      return;
    }
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x76ADF1',
          chainName: 'Brixs Chain Testnet',
          nativeCurrency: { name: 'BRIXS', symbol: 'BRIXS', decimals: 18 },
          rpcUrls: [RPC_URL],
          blockExplorerUrls: [],
        }],
      });
      alert('✅ Brixs Chain Testnet added to MetaMask!');
    } catch (err) {
      alert('Failed to add network: ' + err.message);
    }
  };

  const fundWallet = async () => {
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      setError('Please enter a valid wallet address (0x...)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${RPC_URL}/faucet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to fund wallet');
      }
    } catch (err) {
      setError('Node is offline. Try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className="glass-panel wallet-card">
        <div className="header">
          <div className="logo-icon">⛓️</div>
          <h1>Brixs Chain <span className="accent">Faucet</span></h1>
          <p className="subtitle">Get free testnet BRIXS tokens to build on our chain</p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Add Brixs Testnet to MetaMask</h3>
              <p>Click below to auto-add our network to your wallet</p>
              <button className="secondary-btn" onClick={addToMetaMask}>
                🦊 Add to MetaMask
              </button>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Paste Your Wallet Address</h3>
              <p>Copy your MetaMask address and paste it below</p>
              <input
                type="text"
                className="address-input"
                placeholder="0x1234...abcd"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Receive 100 BRIXS</h3>
              <p>Click fund and check your MetaMask balance</p>
              <button 
                className="primary-btn" 
                onClick={fundWallet} 
                disabled={loading}
              >
                {loading ? '⏳ Sending tokens...' : '🚀 Fund My Wallet'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-box">
            ❌ {error}
          </div>
        )}

        {result && (
          <div className="success-box">
            <p>✅ Successfully sent <strong>{result.amount} BRIXS</strong> to your wallet!</p>
            <small>Tx: {result.txHash.slice(0, 20)}...</small>
          </div>
        )}

        <div className="network-info">
          <h4>Network Details</h4>
          <div className="info-grid">
            <div><span>Network</span><strong>Brixs Chain Testnet</strong></div>
            <div><span>Chain ID</span><strong>7777777</strong></div>
            <div><span>Token</span><strong>BRIXS</strong></div>
            <div><span>RPC</span><strong className="rpc-url">{RPC_URL}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
