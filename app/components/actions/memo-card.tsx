"use client";

import { useState } from "react";
import { useConnectedWallet } from "@solana/kit-plugin-wallet/react";
import { useAppClient } from "../../lib/client-provider";
import { useSend } from "../../lib/hooks/use-send";

// Maximum memo payload that fits Solana's 1,232-byte packet limit with one signer.
const MAX_MEMO_BYTES = 509;
const textEncoder = new TextEncoder();

export function MemoCard() {
  const client = useAppClient();
  const connected = useConnectedWallet(client);
  const { run, isSending } = useSend();
  const [memo, setMemo] = useState("Hello from SingnarPay");
  const memoError = getMemoError(memo);

  const handleMemo = async () => {
    if (!connected?.signer || memoError) return;
    const signer = connected.signer;

    await run(
      () =>
        client.memo.instructions
          .addMemo({ memo, signers: [signer] })
          .sendTransaction(),
      "Memo posted"
    );
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-blue-50/80 p-6 shadow-[0_12px_35px_rgba(91,63,180,0.09)]">
      <div className="mb-5 flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-200 to-purple-100 text-3xl shadow-sm">📝</div><div><h2 className="text-xl font-extrabold tracking-tight text-slate-900">Post Memo</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Attach an on-chain note with the SPL Memo program via the
        @solana-program/memo kit plugin.</p></div></div>
      <div className="mt-4 space-y-3">
        <label htmlFor="memo-text" className="mb-2 block text-sm font-semibold text-slate-700">
          Memo
        </label>
        <input
          id="memo-text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Your memo"
          aria-describedby={memoError ? "memo-text-error" : undefined}
          aria-invalid={memoError != null}
          className="w-full rounded-xl border border-violet-200 bg-white/90 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
        />
        {memoError && (
          <p id="memo-text-error" className="text-xs text-destructive">
            {memoError}
          </p>
        )}
        <button
          onClick={handleMemo}
          disabled={isSending || memoError != null}
          className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:pointer-events-none disabled:opacity-50"
        >
          {isSending ? "Posting..." : "Post memo"}
        </button>
      </div>
    </div>
  );
}

function getMemoError(memo: string): string | null {
  if (!memo) return "Memo cannot be empty";

  const byteLength = textEncoder.encode(memo).length;
  return byteLength <= MAX_MEMO_BYTES
    ? null
    : `Memo must be ${MAX_MEMO_BYTES} UTF-8 bytes or fewer`;
}
