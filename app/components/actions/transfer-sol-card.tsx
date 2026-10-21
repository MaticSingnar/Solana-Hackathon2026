
"use client";

import { useState } from "react";
import { address, sol, solToLamports, type Lamports } from "@solana/kit";
import { useConnectedWallet } from "@solana/kit-plugin-wallet/react";
import { toast } from "sonner";
import { useAppClient } from "../../lib/client-provider";
import { useSend } from "../../lib/hooks/use-send";
import { isCustomProgramError } from "../../lib/errors";

const SYSTEM_PROGRAM_ERROR__RESULT_WITH_NEGATIVE_LAMPORTS = 1;

export function TransferSolCard() {
  const client = useAppClient();
  const connected = useConnectedWallet(client);
  const { run, isSending } = useSend();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.01");
  const amountError = getSolAmountError(amount);

  const handleTransfer = async () => {
    const normalizedRecipient = recipient.trim();

    if (!connected?.signer || !normalizedRecipient) return;

    const signer = connected.signer;

    let destination;
    try {
      destination = address(normalizedRecipient);
    } catch {
      toast.error("Invalid recipient address");
      return;
    }

    let transferAmount: Lamports;
    try {
      transferAmount = solToLamports(sol(amount));
    } catch {
      toast.error("Invalid amount");
      return;
    }

    await run(
      () =>
        client.system.instructions
          .transferSol({
            source: signer,
            destination,
            amount: transferAmount,
          })
          .sendTransaction(),
      "SOL transfer sent",
      (error) =>
        isCustomProgramError(
          error,
          SYSTEM_PROGRAM_ERROR__RESULT_WITH_NEGATIVE_LAMPORTS
        )
          ? "Insufficient SOL balance. Enter a smaller amount and leave enough SOL for transaction fees."
          : undefined
    );
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 text-slate-900 shadow-[0_4px_20px_rgba(30,45,90,0.06)] transition-shadow duration-200 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600">
          ↗
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Transfer SOL</h2>
          <p className="mt-1 text-sm text-slate-500">
            Send SOL to any Solana address.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <label
          htmlFor="sol-recipient"
          className="block text-sm font-semibold text-slate-800"
        >
          Recipient address
        </label>

        <input
          id="sol-recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter recipient wallet address"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />

        <label
          htmlFor="sol-amount"
          className="block pt-2 text-sm font-semibold text-slate-800"
        >
          Amount (SOL)
        </label>

        <input
          id="sol-amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
          step="0.01"
          placeholder="0.01"
          aria-describedby={amountError ? "sol-amount-error" : undefined}
          aria-invalid={amountError != null}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />

        {amountError && (
          <p id="sol-amount-error" className="text-sm text-red-600">
            {amountError}
          </p>
        )}

        <button
          type="button"
          onClick={handleTransfer}
          disabled={isSending || !recipient.trim() || amountError != null}
          className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <span className="text-xl">→</span>
          {isSending ? "Sending..." : "Send SOL"}
        </button>

        <p className="text-center text-xs text-slate-400">
          Review the recipient and amount in Phantom before approving.
        </p>
      </div>
    </div>
  );
}

function getSolAmountError(amount: string): string | null {
  try {
    const lamports = solToLamports(sol(amount));
    return lamports > 0n
      ? null
      : "Amount must be greater than zero";
  } catch {
    return "Enter a valid SOL amount";
  }
}
