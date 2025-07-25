import React, { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { useEthereum } from '../contexts/EthereumContext';
import Card   from '../components/ui/Card';
import Button from '../components/ui/Button';
import QrModal from '../components/QrModal';
import { QrCode } from 'lucide-react';

interface Credential {
  tokenId: string;
  uri:     string;
  title:   string;
  uniName: string;
}

const ipfsToGW = (u:string)=> u.startsWith('ipfs://')
  ? `https://ipfs.io/ipfs/${u.slice(7)}` : u;

const CredentialsPage:React.FC = () => {
  const { contract, account, isIssuer } = useEthereum();

  const [myCreds, setMyCreds]           = useState<Credential[]>([]);
  const [loadingMine, setLoadingMine]   = useState(false);

  const [addr,setAddr]                  = useState('');
  const [otherCreds,setOtherCreds]      = useState<Credential[]>([]);
  const [loadingOther,setLoadingOther]  = useState(false);
  const [err,setErr]                    = useState('');

  const [qrUrl,setQrUrl]                = useState<string|null>(null);

  // Helper to fetch all creds for an owner (student)
  const fetchAll = async(owner:string):Promise<Credential[]>=>{
    if(!contract) return [];
    const bal:BigNumber = await contract.balanceOf(owner);
    const total = bal.toNumber();
    const out:Credential[] = [];
    for(let i=0;i<total;i++){
      const idBN:BigNumber = await contract.tokenOfOwnerByIndex(owner,i);
      const id              = idBN.toString();
      try{
        const [uri,issuer,title] = await Promise.all([
          contract.tokenURI(id),
          contract.credentialIssuer(id),
          contract.certificateTitle(id)
        ]);
        const uni = await contract.universityNames(issuer);
        out.push({tokenId:id,uri,title,uniName:uni});
      }catch{ /* revoked */ }
    }
    return out;
  };

  // Helper to fetch all creds issued by this university (issuer)
  // Now also returns the student address for each credential
  const fetchIssuedByMe = async (studentAddr?: string): Promise<(Credential & { student: string })[]> => {
    if (!contract || !account) return [];
    const logs = await contract.queryFilter(contract.filters.CredentialIssued(account));
    const out: (Credential & { student: string })[] = [];
    for (const l of logs) {
      const tokenId = l.args?.tokenId?.toString();
      const to = l.args?.to?.toLowerCase();
      const title = l.args?.title;
      if (studentAddr && to !== studentAddr.toLowerCase()) continue;
      try {
        const uri = await contract.tokenURI(tokenId);
        const uni = await contract.universityNames(account);
        out.push({ tokenId, uri, title, uniName: uni, student: l.args?.to });
      } catch { /* revoked or inaccessible */ }
    }
    return out;
  };

  /* auto‑load mine */
  useEffect(()=>{
    if(!contract||!account){setMyCreds([]);return;}
    setLoadingMine(true);
    fetchAll(account).then(setMyCreds).finally(()=>setLoadingMine(false));
  },[contract,account]);

  // search others (for students, unchanged)
  const handleSearch=async()=>{
    if (!isIssuer) return;
    if(!addr){setErr('Enter student address or leave blank for all');return;}
    setErr(''); setLoadingOther(true);
    fetchIssuedByMe(addr)
      .then((creds) => setOtherCreds(creds))
      .catch(()=>setErr('Fetch failed'))
      .finally(()=>setLoadingOther(false));
  };

  /* table component */
  const Table:React.FC<{list:Credential[], getOwner?:(c:Credential)=>string}> = ({list,getOwner})=>(
    <div className="overflow-x-auto rounded-2xl shadow-lg bg-white/60 dark:bg-zinc-900/60">
      <table className="min-w-full text-sm">
        <thead className="bg-gradient-to-r from-sky-100 via-purple-100 to-white dark:from-zinc-800 dark:via-zinc-900">
          <tr>
            <th className="px-4 py-3 font-semibold text-brand-700">ID</th>
            <th className="px-4 py-3 font-semibold text-brand-700">Title</th>
            <th className="px-4 py-3 font-semibold text-brand-700">University</th>
            <th className="px-4 py-3 font-semibold text-brand-700">Doc</th>
            <th className="px-4 py-3 font-semibold text-brand-700 text-center">QR</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8 text-slate-400">No credentials found.</td></tr>
          ) : list.map((c, i) => (
            <tr key={c.tokenId} className={i%2===0 ? 'bg-white/80 dark:bg-zinc-900/40' : 'bg-slate-50 dark:bg-zinc-800/40'}>
              <td className="px-4 py-3 font-mono text-brand-700">{c.tokenId}</td>
              <td className="px-4 py-3">{c.title}</td>
              <td className="px-4 py-3">{c.uniName}</td>
              <td className="px-4 py-3">
                <a href={ipfsToGW(c.uri)} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1 text-brand-600 hover:underline hover:text-brand-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  View
                </a>
              </td>
              <td className="px-4 py-3 text-center">
                <Button variant="ghost" className="p-2" onClick={()=>
                  setQrUrl(`${location.origin}/verify/${c.tokenId}?owner=${getOwner ? getOwner(c) : account}`)}>
                  <QrCode className="w-5 h-5 text-brand-600" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return(
    <div className="space-y-16 fade-in max-w-4xl mx-auto py-10">
      {/* ----- My creds ----- */}
      <Card className="mb-8">
        <h2 className="text-3xl font-extrabold mb-6 text-brand-700 flex items-center gap-2">
          My Credentials
        </h2>
        {!account ? <p className="text-lg text-slate-500">Connect wallet.</p> :
         loadingMine ? <p className="text-lg text-slate-500">Loading…</p> :
         myCreds.length===0 ? <p className="text-lg text-slate-400">No credentials found.</p> :
         <Table list={myCreds} getOwner={()=>account}/>} 
      </Card>

      {/* ----- Search section ----- */}
      <Card>
        <h2 className="text-3xl font-extrabold mb-6 text-brand-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
          {isIssuer ? 'Search Issued Certificates' : 'Search Another Address'}
        </h2>
        {!isIssuer ? (
          <p className="text-lg text-rose-600 mb-3 font-semibold">You are not allowed to search issued certificates.</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input className="flex-1 border-2 border-brand-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-brand-400 outline-none transition-all bg-white/80 dark:bg-zinc-900/60"
                     value={addr} onChange={e=>setAddr(e.target.value.trim())}
                     placeholder="Student address (Issued by you)" />
              <Button onClick={handleSearch} disabled={loadingOther} className="text-lg min-w-[120px]">
                {loadingOther ? 'Loading…' : 'Search'}
              </Button>
            </div>
            {err && <p className="text-lg text-rose-600 mb-3 font-semibold">{err}</p>}
            {otherCreds.length>0 && !err &&
              <Table list={otherCreds} getOwner={c=>(c as any).student}/>} 
            {(!loadingOther && otherCreds.length===0 && (addr||otherCreds.length===0) && !err) &&
              <p className="text-lg text-slate-400">No credentials found.</p>}
          </>
        )}
      </Card>

      {qrUrl && <QrModal url={qrUrl} onClose={()=>setQrUrl(null)}/>} 
    </div>
  );
};
export default CredentialsPage;
