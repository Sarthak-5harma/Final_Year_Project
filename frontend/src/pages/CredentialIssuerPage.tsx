import React, { useState, useContext } from 'react';
import { Web3Context } from '../contexts/EthereumContext';

interface IssuerInfo {
  address: string;
  name: string;
}

const CredentialIssuerPage: React.FC = () => {
  const { contract, currentAccount } = useContext(Web3Context);
  const [tokenId, setTokenId] = useState<string>('');
  const [issuerInfo, setIssuerInfo] = useState<IssuerInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIssuerInfo(null);
    if (!contract || !currentAccount) {
      setErrorMessage('Please connect your wallet to lookup credential issuer.');
      return;
    }
    if (!tokenId) {
      setErrorMessage('Please enter a token ID.');
      return;
    }
    try {
      setLoading(true);
      const contractAny = contract as any;
      const issuerAddr: string = await contractAny.credentialIssuer(tokenId);
      if (!issuerAddr || issuerAddr === '0x0000000000000000000000000000000000000000') {
        setErrorMessage('Credential not found or invalid token ID.');
      } else {
        const issuerName: string = await contractAny.universityNames(issuerAddr);
        setIssuerInfo({
          address: issuerAddr,
          name: issuerName || 'Unknown'
        });
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Failed to lookup issuer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 mt-8">
      <h2 className="text-2xl font-bold mb-4">Credential Issuer</h2>
      <form onSubmit={handleLookup}>
        <div className="mb-4">
          <label className="block font-medium mb-1">Token ID:</label>
          <input 
            type="text" 
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter token ID"
          />
        </div>
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !currentAccount}
        >
          {loading ? 'Searching...' : 'Lookup Issuer'}
        </button>
      </form>
      {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}
      {issuerInfo && (
        <div className="mt-6">
          <p><span className="font-semibold">Issuer Address:</span> <span className="font-mono break-all">{issuerInfo.address}</span></p>
          <p><span className="font-semibold">University Name:</span> {issuerInfo.name}</p>
        </div>
      )}
    </div>
  );
};

export default CredentialIssuerPage;
