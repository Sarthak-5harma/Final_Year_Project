import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEthereum } from '../contexts/EthereumContext';
import Card from '../components/ui/Card';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

const VerifyPage:React.FC = () => {
  const { contract } = useEthereum();
  const { tokenId }  = useParams();
  const [q] = useSearchParams();
  const expectedOwner = (q.get('owner')||'').toLowerCase();

  const [status,setStatus]   = useState('Checking…');
  const [title,setTitle]     = useState<string|null>(null);
  const [issuer,setIssuer]   = useState<{addr:string,name:string}|null>(null);
  const [docUrl, setDocUrl]  = useState<string|null>(null);

  useEffect(()=>{
    const run=async()=>{
      if(!contract){setStatus('Connect wallet');return;}
      try{
        const [owner,iss,title,uri] = await Promise.all([
          contract.ownerOf(tokenId),
          contract.credentialIssuer(tokenId),
          contract.certificateTitle(tokenId),
          contract.tokenURI(tokenId)
        ]);
        const uniName = await contract.universityNames(iss);
        setTitle(title); setIssuer({addr:iss,name:uniName});
        const ok = expectedOwner? owner.toLowerCase()===expectedOwner : true;
        setStatus(ok?'✅ Credential VALID':'❌ Owner mismatch / revoked');
        if (ok && uri) {
          setDocUrl(uri.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${uri.slice(7)}` : uri);
        } else {
          setDocUrl(null);
        }
      }catch{ setStatus('❌ Invalid or revoked'); setDocUrl(null);}
    };
    if(tokenId) run();
  },[contract,tokenId,expectedOwner]);

  return(
    <Card className="mx-auto max-w-lg fade-in text-center space-y-6 p-10 mt-16 shadow-xl">
      <div className="flex flex-col items-center gap-2">
        <span className="inline-flex items-center gap-2 text-3xl font-extrabold mb-2">
          <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Verify Credential
        </span>
        <span className={
          status.startsWith('✅') ? 'inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-lg font-semibold' :
          status.startsWith('❌') ? 'inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-3 py-1 rounded-full text-lg font-semibold' :
          'inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-lg font-semibold'
        }>
          {status.startsWith('✅') && <CheckCircle className="w-5 h-5" />} 
          {status.startsWith('❌') && <XCircle className="w-5 h-5" />} 
          {status.replace(/^✅ |^❌ /, '')}
        </span>
      </div>
      <div className="bg-white/70 dark:bg-zinc-900/60 rounded-xl shadow p-6 space-y-2">
        <div className="flex justify-between text-slate-500 text-sm">
          <span>Token ID:</span>
          <span className="font-mono text-brand-700">{tokenId}</span>
        </div>
        {title && <div className="flex justify-between"><span>Title:</span> <span className="font-semibold">{title}</span></div>}
        {issuer && (
          <div className="flex justify-between">
            <span>Issuer:</span>
            <span className="font-semibold flex items-center gap-1">{issuer.name||'(unnamed)'} <span className="font-mono text-xs">{issuer.addr.slice(0,6)}…</span></span>
          </div>
        )}
        {expectedOwner && <div className="flex justify-between"><span>Expected owner:</span> <span className="font-mono text-xs">{expectedOwner.slice(0,6)}…</span></div>}
        {docUrl && status.startsWith('✅') && (
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-4 inline-flex items-center gap-2 justify-center w-full text-base"
          >
            <FileText className="w-5 h-5" /> View Document
          </a>
        )}
      </div>
    </Card>
  );
};
export default VerifyPage;
