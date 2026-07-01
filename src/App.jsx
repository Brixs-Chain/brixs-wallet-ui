import React, { useState } from 'react';
import './index.css';
import './footer.css';

const RPC_URL = import.meta.env.VITE_RPC_URL || "https://rpc-testnet.brixs.space";

function App() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [githubConnected, setGithubConnected] = useState(false);

  const addToMetaMask = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask first!');
      return;
    }
    try {
      // 1. Connect wallet and get address
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }

      // 2. Try to switch to the Brixs chain
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x76ADF1' }], // 7777777
        });
      } catch (switchError) {
        // 3. If chain is not added (error 4902), add it!
        if (switchError.code === 4902) {
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
        } else {
          throw switchError; // If error is something else (e.g. user rejected), throw it
        }
      }
    } catch (err) {
      console.error(err);
      alert('MetaMask Error: ' + err.message);
    }
  };

  const handleGithubConnect = () => {
    setGithubConnected(true);
  };

  const fundWallet = async () => {
    if (!githubConnected) {
      setError('ERROR: MUST VERIFY IDENTITY WITH GITHUB');
      return;
    }
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      setError('ERROR: INVALID WALLET ADDRESS');
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

      if (data.success || data.amount) {
        setResult(data);
      } else {
        setError(data.error || 'ERROR: FAILED TO FUND WALLET');
      }
    } catch (err) {
      setError('ERROR: NODE IS OFFLINE');
    }
    setLoading(false);
  };

  return (
    <>
      <header className="top-header">
        <div className="brand">
          <img src="/logos/full_logo/full_logo_black_on_transparent.svg" alt="Brixs Chain" />
        </div>
        <div className="header-links">
          <a href="https://docs.brixs.space" className="support-link" target="_blank" rel="noreferrer">DEVELOPER DOCS</a>
          <a href="https://brixs.space" className="build-btn" target="_blank" rel="noreferrer">BUILD ON BRIXS ↗</a>
        </div>
      </header>

      <main className="main-content">
        <p className="brx-kicker"><b></b> TESTNET // FAUCET</p>

        <div className="faucet-card">
          <div className="faucet-card-inner">
            <div className="info-row">
              <div className="info-box">
                <img src="/logos/icon_logo/icon_black_on_transparent.svg" alt="Network" />
                Brixs Testnet
              </div>
              <div className="info-box">
                <img src="/logos/icon_logo/icon_black_on_transparent.svg" alt="Token" />
                BRIXS
              </div>
            </div>

            <button className="metamask-btn" onClick={addToMetaMask}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12h4l2-9 5 18 4-13 4 5h3"/>
              </svg>
              ADD NETWORK IN METAMASK
            </button>

            <div className="auth-group">
              <p className="brx-kicker" style={{marginBottom: '12px'}}><b></b> VERIFY IDENTITY</p>
              
              <button 
                className={`auth-btn ${githubConnected ? 'connected' : ''}`}
                onClick={handleGithubConnect}
              >
                <svg viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                {githubConnected ? 'GITHUB VERIFIED' : 'GITHUB'}
              </button>
            </div>

            <div className="input-group">
              <p className="brx-kicker" style={{marginBottom: '12px'}}><b></b> WALLET ADDRESS</p>
              <input
                type="text"
                className="address-input"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <button 
              className="claim-btn"
              onClick={fundWallet}
              disabled={loading}
            >
              {loading ? 'PROCESSING...' : 'CLAIM TOKENS'}
            </button>

            {error && (
              <div className="result-box error">
                {error}
              </div>
            )}

            {result && (
              <div className="result-box success">
                SUCCESS // TOKENS DISPATCHED
                {result.amount && <small>AMOUNT: {result.amount} BRIXS</small>}
                {result.txHash && <small>TX: {result.txHash.slice(0, 30)}...</small>}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bottom-footer">
        <div className="footer-links">
          <a href="https://brixs.space/privacy" className="footer-btn" target="_blank" rel="noreferrer">Privacy Policy</a>
          <a href="https://brixs.space/terms" className="footer-btn" target="_blank" rel="noreferrer">Terms & Conditions</a>
          <a href="https://brixs.space/contact" className="footer-btn" target="_blank" rel="noreferrer">Contact</a>
          <a href="https://brixs.space/support" className="footer-btn" target="_blank" rel="noreferrer">Support</a>
        </div>
        <div className="social-links">
          <a href="#" aria-label="Twitter/X">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" aria-label="GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          </a>
          <a href="#" aria-label="Discord">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 01-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          </a>
        </div>
      </footer>
    </>
  );
}

export default App;
