import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractJson from '../abi/AcademicCredential.json';   // ← use compiled ABI JSON

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const ISSUER_ROLE = ethers.utils.id('ISSUER_ROLE');          // keccak256 role id

/* ---------- context shape ---------- */
interface EthereumCtx {
  provider: ethers.providers.Web3Provider | null;
  signer:   ethers.Signer | null;
  account:  string | null;
  contract: ethers.Contract | null;

  /* role flags */
  isAdmin:  boolean;
  isIssuer: boolean;

  connectWallet: () => Promise<void>;
}
const EthereumContext = createContext<EthereumCtx | undefined>(undefined);
export const useEthereum = () => {
  const ctx = useContext(EthereumContext);
  if (!ctx) throw new Error('useEthereum must be inside provider');
  return ctx;
};

/* ---------- provider ---------- */
export const EthereumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider]   = useState<ethers.providers.Web3Provider | null>(null);
  const [signer,   setSigner]     = useState<ethers.Signer | null>(null);
  const [account,  setAccount]    = useState<string | null>(null);
  const [contract, setContract]   = useState<ethers.Contract | null>(null);
  const [isAdmin,  setIsAdmin]    = useState(false);
  const [isIssuer, setIsIssuer]   = useState(false);

  /* helper to evaluate roles */
  const evaluateRoles = async (addr: string, ctr: ethers.Contract) => {
    try {
      const admin  = await ctr.hasRole(ethers.constants.HashZero, addr);
      const issuer = await ctr.hasRole(ISSUER_ROLE, addr);
      setIsAdmin(admin);
      setIsIssuer(issuer);
    } catch (err) {
      console.error('role check failed:', err);
      setIsAdmin(false);
      setIsIssuer(false);
    }
  };

  /* connect wallet */
  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert('Install MetaMask');
      return;
    }
    const web3 = new ethers.providers.Web3Provider((window as any).ethereum, 'any');
    await web3.send('eth_requestAccounts', []);
    const signer = web3.getSigner();
    const addr   = await signer.getAddress();

    const ctr = new ethers.Contract(contractAddress, contractJson.abi, signer);
    (window as any).dappContract = ctr;
    setProvider(web3);
    setSigner(signer);
    setAccount(addr);
    setContract(ctr);

    await evaluateRoles(addr, ctr);
  };

  /* auto‑connect if already authorised */
  useEffect(() => {
    if ((window as any).ethereum) {
      const web3 = new ethers.providers.Web3Provider((window as any).ethereum, 'any');
      web3.listAccounts().then(async (accs: string[]) => {
        if (accs.length) {
          const signer = web3.getSigner();
          const ctr    = new ethers.Contract(contractAddress, contractJson.abi, signer);
          (window as any).dappContract = ctr;
          setProvider(web3); setSigner(signer); setAccount(accs[0]); setContract(ctr);
          await evaluateRoles(accs[0], ctr);
        }
      });
    }
  }, []);

  return (
    <EthereumContext.Provider value={{
      provider, signer, account, contract,
      isAdmin, isIssuer,
      connectWallet
    }}>
      {children}
    </EthereumContext.Provider>
  );
};
