// frontend/src/pages/ViewStudentCredentialPage.tsx
import React, { useState } from 'react';
import { useEthereum } from '../contexts/EthereumContext';
import { BigNumber } from 'ethers';

interface Credential {
  tokenId: string;
  uri: string;
}

const ViewStudentCredentialPage: React.FC = () => {
  const { contract } = useEthereum();

  const [address, setAddress]       = useState<string>('');
  const [creds, setCreds]           = useState<Credential[] | null>(null);
  const [loading, setLoading]       = useState<boolean>(false);
  const [error,   setError]         = useState<string>('');

  const ipfsToGateway = (uri: string) =>
    uri.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${uri.slice(7)}` : uri;

  const fetchCredentials = async () => {
    if (!contract) { setError('Connect wallet first'); return; }
    if (!address)   { setError('Enter an address');   return; }

    setLoading(true); setError(''); setCreds(null);

    try {
      const bal: BigNumber = await contract.balanceOf(address);
      const total = bal.toNumber();
      const list: Credential[] = [];

      for (let i = 0; i < total; i++) {
        const tokenIdBN: BigNumber = await contract.tokenOfOwnerByIndex(address, i);
        const tokenId = tokenIdBN.toString();
        try {
          const uri: string = await contract.tokenURI(tokenId);
          list.push({ tokenId, uri });
        } catch {
          list.push({ tokenId, uri: '(revoked or inaccessible)' });
        }
      }
      setCreds(list);
    } catch (e: any) {
      console.error(e);
      setError('Failed to fetch credentials (see console)');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>View Student Credentials</h2>
      <p>Enter a wallet address to list all credential NFTs held by that address.</p>

      <input
        style={{ width: '100%', padding: 6 }}
        placeholder="0x1234…"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button onClick={fetchCredentials} disabled={loading} style={{ marginTop: 10 }}>
        {loading ? 'Loading…' : 'Fetch'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {creds && (
        <div style={{ marginTop: 20 }}>
          {creds.length === 0 ? (
            <p>No credentials found.</p>
          ) : (
            <ul>
              {creds.map((c) => (
                <li key={c.tokenId} style={{ marginBottom: 6 }}>
                  Token&nbsp;{c.tokenId}:{' '}
                  {c.uri.startsWith('http') || c.uri.startsWith('ipfs://') ? (
                    <a href={ipfsToGateway(c.uri)} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    <span>{c.uri}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewStudentCredentialPage;