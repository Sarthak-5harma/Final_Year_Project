/* ------------------------------------------------------------------
 *  IssueCredentialPage.tsx
 * ------------------------------------------------------------------ */

import React, { useState } from "react";
import { useEthereum } from "../contexts/EthereumContext";
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Upload, Loader2, ExternalLink } from 'lucide-react';
import { pinPDF } from "../lib/ipfs";
import { toast } from "sonner";

interface IssuedInfo {
  tokenId: string;
  student: string;
  title:   string;
  uri:     string;
}

const IssueCredentialPage: React.FC = () => {
  const { contract, account, isIssuer } = useEthereum();

  const [title,   setTitle]   = useState("");
  const [student, setStudent] = useState("");
  const [file,    setFile]    = useState<File | null>(null);

  const [loading, setLoading]  = useState(false);
  const [issued,  setIssued]   = useState<IssuedInfo | null>(null);

  /* file picker / drop‑zone */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFile(e.target.files?.[0] ?? null);

  /* --------------------------------------------- ISSUE */
  const issue = async () => {
    if (!contract || !isIssuer)      { toast.error("Connect with an issuer wallet"); return; }
    if (!file || !title || !student) { toast.warning("Fill all fields & choose a PDF"); return; }

    try {
      setLoading(true);
      setIssued(null);

      /* 1️⃣  upload PDF to IPFS */
      toast.info("Uploading PDF to IPFS…");
      const uri = await pinPDF(file);                      // ipfs://…

      /* 2️⃣  send tx */
      toast.info("Minting NFT on‑chain…");
      const tx   = await contract.issueCredential(student, uri, title);
      const rcpt = await tx.wait();

      /* 3️⃣  grab event for tokenId */
      const evt  = rcpt.logs
        .map(l => {
          try { return contract.interface.parseLog(l); }
          catch { return null; }
        })
        .find(p => p?.name === "CredentialIssued");

      const tokenId =
        evt && evt.args ? evt.args.tokenId.toString() : "‑";

      setIssued({ tokenId, student, title, uri });

      toast.success(`Credential #${tokenId} issued 🎉`);
      setTitle(""); setStudent(""); setFile(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.reason ?? "Issue failed");
    } finally {
      setLoading(false);
    }
  };

  /* helper */
  const ipfsToGateway = (u: string) =>
    u.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${u.slice(7)}` : u;

  /* --------------------------------------------- UI */
  return (
    <div className="max-w-xl mx-auto mt-16 fade-in">
      <Card className="p-10 shadow-xl">
        <h1 className="text-3xl font-extrabold mb-8 text-brand-700 flex items-center gap-2 justify-center">
          <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Issue Credential
        </h1>
        {/* --- form ------------------------------------------------------ */}
        <input
          className="w-full mb-4 border-2 border-brand-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-brand-400 outline-none transition-all bg-white/80 dark:bg-zinc-900/60"
          placeholder="Credential name (e.g. BSc Computer Science 2025)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          className="w-full mb-4 border-2 border-brand-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-brand-400 outline-none transition-all bg-white/80 dark:bg-zinc-900/60"
          placeholder="Student wallet address"
          value={student}
          onChange={e => setStudent(e.target.value)}
        />
        {/* drop‑zone looks the same whether clicked or dragged */}
        <label className="flex flex-col items-center justify-center gap-2 mb-6 border-2 border-dashed border-brand-200 rounded-2xl py-10 text-slate-500 hover:bg-sky-50/60 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-sky-500" />
          {file ? (
            <span className="font-medium text-slate-700 dark:text-slate-200">{file.name}</span>
          ) : (
            <>
              <span className="text-sm">
                Drag&nbsp;&&nbsp;drop a PDF or <span className="underline">browse</span>
              </span>
              <span className="text-xs text-slate-400">Max&nbsp;10&nbsp;MB</span>
            </>
          )}
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFile}
          />
        </label>
        <Button
          disabled={loading}
          onClick={issue}
          className="w-full text-lg flex items-center justify-center"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Issue
        </Button>
        {!isIssuer && account && (
          <p className="text-center text-xs mt-4 text-rose-500">
            You are not an authorised issuer.
          </p>
        )}
        {/* --- confirmation card --------------------------------------- */}
        {issued && (
          <div className="mt-8 bg-emerald-50/80 text-emerald-700 rounded-xl p-6 text-sm shadow-lg">
            <p className="font-bold mb-2 flex items-center gap-2"><svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Credential minted successfully</p>
            <table className="w-full text-left text-xs">
              <tbody>
                <tr>
                  <th className="pr-2 py-1 font-semibold">Token&nbsp;ID</th>
                  <td>{issued.tokenId}</td>
                </tr>
                <tr>
                  <th className="pr-2 py-1 font-semibold">Title</th>
                  <td>{issued.title}</td>
                </tr>
                <tr>
                  <th className="pr-2 py-1 font-semibold">Student</th>
                  <td className="truncate">{issued.student}</td>
                </tr>
                <tr>
                  <th className="pr-2 py-1 font-semibold align-top">Doc</th>
                  <td>
                    <a
                      href={ipfsToGateway(issued.uri)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sky-600 hover:underline"
                    >
                      View&nbsp;PDF <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default IssueCredentialPage;
