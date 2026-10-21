"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnectedWallet } from "@solana/kit-plugin-wallet/react";
import { useAppClient } from "../../lib/client-provider";
import { useCluster } from "../cluster-context";

type RpcSignature = {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: unknown | null;
  confirmationStatus?: string;
};

type TransactionRow = {
  signature: string;
  slot: number;
  blockTime: number | null;
  successful: boolean;
  confirmationStatus: string;
};

export function TransactionHistoryCard() {
  const client = useAppClient();
  const connected = useConnectedWallet(client);
  const { cluster, getExplorerUrl } = useCluster();
  const walletAddress = connected?.account.address;
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError("");
    const endpoint =
      cluster === "mainnet"
        ? "https://api.mainnet-beta.solana.com"
        : cluster === "testnet"
          ? "https://api.testnet.solana.com"
          : "https://api.devnet.solana.com";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getSignaturesForAddress",
          params: [walletAddress, { limit: 10 }],
        }),
      });
      if (!response.ok) throw new Error("Solana RPC request failed");
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "Solana RPC error");
      const rows = (data.result ?? []) as RpcSignature[];
      setTransactions(
        rows.map((tx) => ({
          signature: tx.signature,
          slot: tx.slot,
          blockTime: tx.blockTime,
          successful: tx.err == null,
          confirmationStatus: tx.confirmationStatus ?? "confirmed",
        })),
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message}. Try refreshing in a moment.`
          : "Could not load Devnet transactions.",
      );
    } finally {
      setLoading(false);
    }
  }, [walletAddress, cluster]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  if (!connected) return null;

  const shortSignature = (signature: string) =>
    `${signature.slice(0, 8)}…${signature.slice(-8)}`;

  const formatDate = (timestamp: number | null) =>
    timestamp == null
      ? "Time unavailable"
      : new Intl.DateTimeFormat("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(timestamp * 1000));

  return (
    <section
      id="transactions"
      className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_12px_35px_rgba(30,45,90,0.06)] sm:col-span-2 sm:p-7"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-100 to-violet-100 text-3xl">
            ↔
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              Recent Transactions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest on-chain activity for this wallet · {cluster === "mainnet" ? "Mainnet" : cluster === "testnet" ? "Testnet" : "Devnet"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadTransactions()}
            disabled={loading}
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
          {walletAddress && (
            <a
              href={getExplorerUrl(`/address/${walletAddress}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-100 transition hover:-translate-y-0.5"
            >
              View All on Explorer ↗
            </a>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && transactions.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Loading recent transactions from Solana…
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <div className="text-3xl">🧾</div>
          <p className="mt-3 font-bold text-slate-800">No transactions found</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            If you have used this wallet on this network, try refreshing. Transaction history is network-specific.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-100 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Signature</th>
                  <th className="px-4 py-3 font-semibold">Slot</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Explorer</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.signature} className="border-t border-slate-100 transition hover:bg-blue-50/40">
                    <td className="px-4 py-3">
                      <a href={getExplorerUrl(`/tx/${tx.signature}`)} target="_blank" rel="noopener noreferrer" title={tx.signature} className="font-mono text-blue-700 hover:underline">
                        {shortSignature(tx.signature)}
                      </a>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">{tx.slot.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(tx.blockTime)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tx.successful ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-rose-200 bg-rose-50 text-rose-700"}`}>
                        {tx.successful ? "Success" : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a href={getExplorerUrl(`/tx/${tx.signature}`)} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">View ↗</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {transactions.map((tx) => (
              <article key={tx.signature} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <a href={getExplorerUrl(`/tx/${tx.signature}`)} target="_blank" rel="noopener noreferrer" className="break-all font-mono text-sm font-semibold text-blue-700 hover:underline">
                    {shortSignature(tx.signature)}
                  </a>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${tx.successful ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                    {tx.successful ? "Success" : "Failed"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">Slot {tx.slot.toLocaleString("en-IN")} · {formatDate(tx.blockTime)}</p>
                <a href={getExplorerUrl(`/tx/${tx.signature}`)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:underline">View on Explorer ↗</a>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
