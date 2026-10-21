
"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useConnectedWallet } from "@solana/kit-plugin-wallet/react";
import { useAppClient } from "../../lib/client-provider";

export function ReceiveSolCard() {
  const client = useAppClient();
  const connected = useConnectedWallet(client);
  const [copied, setCopied] = useState(false);

  if (!connected) return null;

  const walletAddress = String(connected.account.address);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 text-slate-900 shadow-[0_4px_20px_rgba(30,45,90,0.05)] transition-shadow duration-200 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
          ↓
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Receive SOL</h2>
          <p className="mt-1 text-sm text-slate-500">
            Share your address to receive payments.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center rounded-2xl border border-emerald-100 bg-white p-5">
        <div className="rounded-xl bg-white p-2">
          <QRCodeSVG
            value={walletAddress}
            size={176}
            level="M"
            bgColor="#ffffff"
            fgColor="#172554"
          />
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Your public wallet address
        </p>

        <p className="mt-2 w-full break-all text-center font-mono text-xs leading-5 text-slate-600">
          {walletAddress}
        </p>

        <button
          type="button"
          onClick={copyAddress}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          {copied ? "✓ Address copied!" : "▢ Copy wallet address"}
        </button>
      </div>

      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
        Only share your public address. Make sure the sender uses the same
        Solana network.
      </p>
    </div>
  );
}
