"use client";

import { useState } from "react";
import { address, generateKeyPairSigner, type Address } from "@solana/kit";
import { useConnectedWallet } from "@solana/kit-plugin-wallet/react";
import { toast } from "sonner";
import { useAppClient } from "../../lib/client-provider";
import { useCluster } from "../cluster-context";
import { useSend } from "../../lib/hooks/use-send";
import { ellipsify } from "../../lib/explorer";
import { isCustomProgramError } from "../../lib/errors";


const TOKEN_NAME = "SingnarPay Student Token";
const TOKEN_SYMBOL = "SING";
const DECIMALS = 9;
const INITIAL_SUPPLY = "1000000";

const BASE_UNITS_PER_TOKEN = 10n ** BigInt(DECIMALS);
const MAX_TOKEN_AMOUNT = (1n << 64n) - 1n;
const TOKEN_AMOUNT_PATTERN = new RegExp(`^(\\d+)(?:\\.(\\d{1,${DECIMALS}}))?$`);
const TOKEN_PROGRAM_ERROR__INSUFFICIENT_FUNDS = 1;

function toBaseUnits(amount: string): bigint {
  const normalizedAmount = amount.trim();
  const match = TOKEN_AMOUNT_PATTERN.exec(normalizedAmount);
  if (!match) {
    throw new Error(`Enter an amount with up to ${DECIMALS} decimal places`);
  }

  const [, whole, fraction = ""] = match;
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "");
  if (normalizedWhole.length > 20) {
    throw new Error("Amount exceeds the maximum token amount");
  }

  const units =
    BigInt(normalizedWhole) * BASE_UNITS_PER_TOKEN +
    BigInt(fraction.padEnd(DECIMALS, "0"));

  if (units <= 0n) {
    throw new Error("Amount must be greater than zero");
  }
  if (units > MAX_TOKEN_AMOUNT) {
    throw new Error("Amount exceeds the maximum token amount");
  }

  return units;
}

function getTokenAmountError(amount: string): string | null {
  try {
    toBaseUnits(amount);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid amount";
  }
}

export function TokenCard() {
  const client = useAppClient();
  const connected = useConnectedWallet(client);
  const { getExplorerUrl } = useCluster();
  const { run, isSending } = useSend();

  const [mint, setMint] = useState<Address | null>(null);
  const [hasMinted, setHasMinted] = useState(false);
  const [mintAmount, setMintAmount] = useState(INITIAL_SUPPLY);
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("10");
  const mintAmountError = getTokenAmountError(mintAmount);
  const transferAmountError = getTokenAmountError(transferAmount);

  const handleCreateMint = async () => {
    const signer = connected?.signer;
    if (!signer) return;

    const newMint = await generateKeyPairSigner();
    const signature = await run(
      () =>
        client.token.instructions
          .createMint({
            newMint,
            decimals: DECIMALS,
            mintAuthority: signer.address,
          })
          .sendTransaction(),
      "Token mint created"
    );
    if (signature) setMint(newMint.address);
  };

  const handleMint = async () => {
    const signer = connected?.signer;
    if (!signer || !mint) return;

    let amount: bigint;
    try {
      amount = toBaseUnits(mintAmount);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid amount");
      return;
    }

    const signature = await run(
      () =>
        client.token.instructions
          .mintToATA({
            mint,
            owner: signer.address,
            mintAuthority: signer,
            amount,
            decimals: DECIMALS,
          })
          .sendTransaction(),
      "Tokens minted to your wallet"
    );
    if (signature) setHasMinted(true);
  };

  const handleTransfer = async () => {
    const signer = connected?.signer;
    const normalizedRecipient = recipient.trim();
    if (!signer || !mint || !normalizedRecipient) return;

    let destination: Address;
    try {
      destination = address(normalizedRecipient);
    } catch {
      toast.error("Invalid recipient address");
      return;
    }

    let amount: bigint;
    try {
      amount = toBaseUnits(transferAmount);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid amount");
      return;
    }

    await run(
      () =>
        client.token.instructions
          .transferToATA({
            mint,
            authority: signer,
            recipient: destination,
            amount,
            decimals: DECIMALS,
          })
          .sendTransaction(),
      "Tokens transferred",
      (error) =>
        isCustomProgramError(error, TOKEN_PROGRAM_ERROR__INSUFFICIENT_FUNDS)
          ? "Insufficient balance. Make sure you have enough tokens to transfer and enough SOL for transaction fees and recipient account creation."
          : undefined
    );
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-cyan-50/80 p-6 shadow-[0_12px_35px_rgba(16,145,105,0.08)]">
      <div className="mb-5 flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-200 to-teal-100 text-3xl shadow-sm">🪙</div><div><h2 className="text-xl font-extrabold tracking-tight text-slate-900">Create Mint</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Create an SPL token mint, then mint and transfer with the{" "}
        <code className="font-mono">@solana-program/token</code> kit plugin —
        associated token accounts are created for you.</p></div></div>

      {!mint ? (
        <button
          onClick={handleCreateMint}
          disabled={isSending}
          className="mt-4 w-full cursor-pointer rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:pointer-events-none disabled:opacity-50"
        >
          {isSending ? "Creating..." : `Create mint (${DECIMALS} decimals)`}
        </button>
      ) : (
        <div className="mt-4 space-y-5">
          <p className="text-xs text-muted">
            Mint:{" "}
            <a
              href={getExplorerUrl(`/address/${mint}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono underline"
            >
              {ellipsify(mint)}
            </a>
          </p>

          <div className="space-y-3">
            <label
              htmlFor="token-mint-amount"
              className="block text-sm font-semibold text-slate-700"
            >
              Amount to mint
            </label>
            <input
              id="token-mint-amount"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              type="number"
              min="0"
              step="0.000000001"
              placeholder="Amount to mint"
              aria-describedby={
                mintAmountError ? "token-mint-amount-error" : undefined
              }
              aria-invalid={mintAmountError != null}
              className="w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
            {mintAmountError && (
              <p
                id="token-mint-amount-error"
                className="text-xs text-destructive"
              >
                {mintAmountError}
              </p>
            )}
            <button
              onClick={handleMint}
              disabled={isSending || mintAmountError != null}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:pointer-events-none disabled:opacity-50"
            >
              {isSending ? "Working..." : "Mint to my wallet"}
            </button>
          </div>

          {hasMinted && (
            <div className="space-y-3 border-t border-border-low pt-5">
              <label
                htmlFor="token-recipient"
                className="block text-sm font-semibold text-slate-700"
              >
                Recipient address
              </label>
              <input
                id="token-recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Recipient address"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 font-mono text-xs text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              <label
                htmlFor="token-transfer-amount"
                className="block text-sm font-semibold text-slate-700"
              >
                Amount to transfer
              </label>
              <input
                id="token-transfer-amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                type="number"
                min="0"
                step="0.000000001"
                placeholder="Amount to transfer"
                aria-describedby={
                  transferAmountError
                    ? "token-transfer-amount-error"
                    : undefined
                }
                aria-invalid={transferAmountError != null}
                className="w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              {transferAmountError && (
                <p
                  id="token-transfer-amount-error"
                  className="text-xs text-destructive"
                >
                  {transferAmountError}
                </p>
              )}
              <button
                onClick={handleTransfer}
                disabled={
                  isSending || !recipient.trim() || transferAmountError != null
                }
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:pointer-events-none disabled:opacity-50"
              >
                {isSending ? "Working..." : "Transfer tokens"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
