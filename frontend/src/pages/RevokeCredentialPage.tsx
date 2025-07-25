import React, { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { toast } from "sonner";
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Trash2, Loader2 } from 'lucide-react';
import { useEthereum } from "../contexts/EthereumContext";

interface Row {
  id: number;
  student: string;
  title: string;
  status: "Valid" | "Revoked";
}

const RevokeCredentialPage: React.FC = () => {
  const { contract, account, isIssuer } = useEthereum();

  /* ─────────────── state ─────────────── */
  const [tokenInput, setTokenInput] = useState("");
  const [searchAddr, setSearchAddr] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  /* ─────────── helpers ─────────── */
  /** refresh table */
  const loadIssued = async (addrOverride?: string) => {
    if (!contract || !isIssuer) return;

    const issuer = account as string;
    const studentFilter = addrOverride?.toLowerCase();

    const logs = await contract.queryFilter(
      contract.filters.CredentialIssued(issuer)
    );

    const data: Row[] = [];
    for (const l of logs) {
      const id = (l.args?.tokenId as BigNumber).toNumber();
      const student = l.args?.to as string;
      const title = l.args?.title as string;

      let status: Row["status"] = "Valid";
      try {
        await contract.ownerOf(id);
      } catch {
        status = "Revoked";
      }

      if (!studentFilter || student.toLowerCase() === studentFilter) {
        data.push({ id, student, title, status });
      }
    }
    data.sort((a, b) => a.id - b.id);
    setRows(data);
  };

  /** revoke with guards */
  const revoke = async (id: number) => {
    if (!contract || !isIssuer) {
      toast.error("Connect with an issuer wallet"); return;
    }
    setBusyId(id);
    try {
      // already burned?
      try { await contract.ownerOf(id); }
      catch { toast.info("Token already revoked"); return; }

      const tx = await contract.revokeCredential(id);
      await tx.wait();
      toast.success(`Token ${id} revoked 🎉`);
    } catch (err: any) {
      const msg = err?.error?.message || err?.reason || "Revoke failed";
      toast.error(msg);
    } finally {
      setBusyId(null);
      await loadIssued(searchAddr);
    }
  };

  /* ─────────── effects ─────────── */
  useEffect(() => {
    if (contract && isIssuer) loadIssued();
  }, [contract, account, isIssuer]);   // 🟢 key change: depend on isIssuer

  /* ─────────────── ui ─────────────── */
  return (
    <div className="max-w-5xl mx-auto py-12 fade-in space-y-12">
      <Card className="p-10 shadow-xl mb-8">
        <h1 className="text-3xl font-extrabold mb-8 text-brand-700 flex items-center gap-2 justify-center">
          Revoke Credential
        </h1>
        <input
          className="w-full mb-4 border-2 border-brand-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-brand-400 outline-none transition-all bg-white/80 dark:bg-zinc-900/60"
          placeholder="Token ID to revoke"
          value={tokenInput}
          onChange={e => setTokenInput(e.target.value)}
        />
        <Button
          disabled={
            !tokenInput ||
            busyId !== null ||
            rows.some(r => r.id === Number(tokenInput) && r.status === "Revoked")
          }
          onClick={() => revoke(Number(tokenInput))}
          className="w-full text-lg flex items-center justify-center btn-danger"
        >
          {busyId === Number(tokenInput) && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Revoke
        </Button>
      </Card>
      <Card className="p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-brand-700 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
          Tokens You Issued
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            className="flex-1 border-2 border-brand-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-brand-400 outline-none transition-all bg-white/80 dark:bg-zinc-900/60"
            placeholder="Student address (optional)"
            value={searchAddr}
            onChange={e => setSearchAddr(e.target.value)}
          />
          <Button onClick={() => loadIssued(searchAddr)} className="text-lg min-w-[120px]">Search</Button>
          {searchAddr && (
            <Button variant="ghost" onClick={() => { setSearchAddr(""); loadIssued(); }} className="text-sm">Clear</Button>
          )}
        </div>
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white/60 dark:bg-zinc-900/60">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-sky-100 via-purple-100 to-white dark:from-zinc-800 dark:via-zinc-900">
              <tr className="text-brand-700">
                <th className="px-4 py-3 font-semibold">Token  ID</th>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No issued credentials found.
                  </td>
                </tr>
              )}
              {rows.map(r => (
                <tr key={r.id} className="even:bg-slate-50/40">
                  <td className="px-4 py-3 font-mono text-brand-700">{r.id}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.student.slice(0, 6)}…{r.student.slice(-4)}</td>
                  <td className="px-4 py-3">{r.title}</td>
                  <td className="px-4 py-3">
                    {r.status === "Valid" ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">Valid</span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-semibold">Revoked</span>
                    )}
                  </td>
                  <td className="px-2 text-center">
                    {r.status === "Valid" && (
                      <Button
                        variant="ghost"
                        onClick={() => revoke(r.id)}
                        disabled={busyId !== null}
                        className="p-2"
                      >
                        {busyId === r.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isIssuer && account && (
          <p className="text-center text-xs mt-4 text-rose-500">
            You are not an authorised issuer.
          </p>
        )}
      </Card>
    </div>
  );
};

export default RevokeCredentialPage;
