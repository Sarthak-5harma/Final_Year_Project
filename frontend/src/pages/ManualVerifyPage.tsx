/* ------------------------------------------------------------------
 * ManualVerifyPage.tsx
 * ----------------------------------------------------------------- */
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEthereum } from "../contexts/EthereumContext";
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';

interface UniOption { addr: string; name: string; }

const ManualVerifyPage: React.FC = () => {
  const { contract } = useEthereum();

  /* form state --------------------------------------------------- */
  const [tokenId,     setTokenId]     = useState("");
  const [studentAddr, setStudent]     = useState("");
  const [uniList,     setUniList]     = useState<UniOption[]>([]);
  const [selectedUni, setSelectedUni] = useState<string>("");

  /* result panel ------------------------------------------------- */
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<null | {
    ok:        boolean;
    msg:       string;
    owner?:    string;
    issuer?:   string;
    uniName?:  string;
    docUrl?:   string;
  }>(null);

  /* ------------------------------------------------ load unis */
  useEffect(() => {
    const run = async () => {
      if (!contract) return;
      try {
        const count: number = await contract.getUniversityCount();
        const opts: UniOption[] = [];
        for (let i = 0; i < count; i++) {
          const [addr, name] = await contract.getUniversityAtIndex(i);
          opts.push({ addr, name });
        }
        setUniList(opts);
        if (opts.length) setSelectedUni(opts[0].addr);
      } catch (err) {
        console.error(err);
        toast.error("Could not load university list");
      }
    };
    run();
  }, [contract]);

  /* ------------------------------------------------ verify */
  const verify = async () => {
    if (!contract) { toast.error("Connect wallet"); return; }
    if (!tokenId || !studentAddr || !selectedUni) {
      toast.warning("Please fill all fields"); return;
    }

    setLoading(true);
    setResult(null);

    try {
      /* 1️⃣  owner check --------------------------------------- */
      let owner: string;
      try {
        owner = await contract.ownerOf(tokenId);
      } catch {
        setResult({
          ok: false,
          msg: "Token does not exist – revoked or never issued"
        });
        return;
      }

      if (owner.toLowerCase() !== studentAddr.toLowerCase()) {
        setResult({
          ok:  false,
          msg: "Owner mismatch",
          owner
        });
        return;
      }

      /* 2️⃣  issuer check -------------------------------------- */
      let issuer: string;
      try {
        issuer = await contract.credentialIssuer(tokenId);
      } catch {
        setResult({
          ok: false,
          msg: "Issuer lookup failed – token may be revoked"
        });
        return;
      }

      if (issuer.toLowerCase() !== selectedUni.toLowerCase()) {
        const name = uniList.find(u => u.addr.toLowerCase() === issuer.toLowerCase())?.name;
        setResult({
          ok: false,
          msg: "Issuer mismatch",
          issuer,
          uniName: name
        });
        return;
      }

      /* ✅ all good ------------------------------------------- */
      const uniName = uniList.find(u => u.addr.toLowerCase() === issuer.toLowerCase())?.name;
      let docUrl = '';
      try {
        const uri = await contract.tokenURI(tokenId);
        docUrl = uri.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${uri.slice(7)}` : uri;
      } catch {}
      setResult({
        ok:  true,
        msg: "Credential is VALID",
        owner,
        issuer,
        uniName,
        docUrl
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.reason ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* tiny helper */
  const shrink = (addr?: string) =>
    addr ? `${addr.slice(0,6)}…${addr.slice(-4)}` : "";

  /* ------------------------------------------------ UI */
  return (
    <div className="max-w-lg mx-auto mt-16 fade-in">
      <Card className="p-10 shadow-xl">
        <h1 className="text-3xl font-extrabold mb-8 text-brand-700 flex items-center gap-2 justify-center">
          Manual Verification
        </h1>
        <div className="space-y-4">
          <input
            className="w-full border-2 border-brand-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-brand-400 outline-none transition-all bg-white/80 dark:bg-zinc-900/60"
            placeholder="Token ID"
            value={tokenId}
            onChange={e => setTokenId(e.target.value)}
          />
          <input
            className="w-full border-2 border-brand-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-brand-400 outline-none transition-all bg-white/80 dark:bg-zinc-900/60"
            placeholder="Student address"
            value={studentAddr}
            onChange={e => setStudent(e.target.value)}
          />
          <select
            className="w-full border-2 border-brand-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-brand-400 outline-none transition-all bg-white/80 dark:bg-zinc-900/60"
            value={selectedUni}
            onChange={e => setSelectedUni(e.target.value)}
          >
            {uniList.map(u => (
              <option value={u.addr} key={u.addr}>
                {u.name} ({shrink(u.addr)})
              </option>
            ))}
          </select>
          <Button
            disabled={loading}
            onClick={verify}
            className="w-full text-lg flex items-center justify-center"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Verify
          </Button>
        </div>
        {/* result panel */}
        {result && (
          <div className={`mt-8 p-6 rounded-xl text-center shadow-lg
                      ${result.ok ? "bg-emerald-50/80 text-emerald-700"
                                   : "bg-rose-50/80 text-rose-700"}`}>
            <span className="inline-flex items-center gap-1 text-xl font-bold mb-2">
              {result.ok ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {result.msg}
            </span>
            {result.owner  && <p className="text-xs mt-1">Owner: {shrink(result.owner)}</p>}
            {result.issuer && (
              <p className="text-xs">
                Issuer: {result.uniName ? `${result.uniName} ` : ""}{shrink(result.issuer)}
              </p>
            )}
            {result.ok && result.docUrl && (
              <a
                href={result.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 inline-flex items-center gap-2 justify-center w-full text-base"
              >
                <FileText className="w-5 h-5" /> View Document
              </a>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManualVerifyPage;
