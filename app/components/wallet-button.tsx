"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { address, formatDecimalFixedPoint, lamportsToSol } from "@solana/kit";
import {
  useWallets,
  useConnect,
  useDisconnect,
  useConnectedWallet,
  useIsWalletReady,
} from "@solana/kit-plugin-wallet/react";
import { useBalance } from "../lib/hooks/use-balance";
import { ellipsify } from "../lib/explorer";
import { useCluster } from "./cluster-context";
import { useAppClient } from "../lib/client-provider";

const solFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 9,
});
const subscribeToHydration = () => () => {};

export function WalletButton() {
  const client = useAppClient();
  const wallets = useWallets(client);
  const connected = useConnectedWallet(client);
  const isWalletReady = useIsWalletReady(client);
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );
  const {
    dispatchAsync: connect,
    error: connectError,
    isRunning: isConnecting,
  } = useConnect(client);
  const {
    dispatchAsync: disconnect,
    error: disconnectError,
    isRunning: isDisconnecting,
  } = useDisconnect(client);

  const { getExplorerUrl } = useCluster();
  const [isOpen, setIsOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [clipboardError, setClipboardError] = useState<{
    address: string;
    message: string;
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const walletAddress = connected?.account.address;
  const copied = copiedAddress === walletAddress;
  const balance = useBalance(
    walletAddress ? address(walletAddress) : undefined
  );
  const connectMenuError = connectError;
  const accountMenuError =
    disconnectError ??
    (clipboardError && clipboardError.address === walletAddress
      ? clipboardError.message
      : null);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const closeAndRestoreFocus = () => {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleCopy = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setClipboardError(null);
      setCopiedAddress(walletAddress);
      setTimeout(
        () =>
          setCopiedAddress((current) =>
            current === walletAddress ? null : current
          ),
        2000
      );
    } catch {
      setClipboardError({
        address: walletAddress,
        message: "Unable to copy the address to the clipboard.",
      });
    }
  };

  if (!isHydrated || !isWalletReady) {
    return (
      <span className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground opacity-60">
        Restoring wallet...
      </span>
    );
  }

  if (!connected) {
    return (
      <div className="relative" ref={ref}>
        <button
          ref={triggerRef}
          onClick={() => (isOpen ? close() : open())}
          aria-expanded={isOpen}
          aria-controls={isOpen ? "wallet-options" : undefined}
          className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90"
        >
          Connect Wallet
        </button>

        {isOpen && (
          <div
            id="wallet-options"
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-xl shadow-indigo-950/15"
          >
            <p className="mb-2 text-xs font-medium text-muted">
              Choose a wallet
            </p>
            {wallets.length === 0 ? (
              <p className="text-xs text-slate-500">
                No wallets detected. Install a Solana wallet extension.
              </p>
            ) : (
              <div className="space-y-1">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={async () => {
                      try {
                        await connect(wallet);
                        closeAndRestoreFocus();
                      } catch {
                        // The hook exposes the connection error below.
                      }
                    }}
                    disabled={isConnecting}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-violet-50 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {wallet.icon && (
                      // eslint-disable-next-line @next/next/no-img-element -- wallet-standard icons are data URIs
                      <img
                        src={wallet.icon}
                        alt=""
                        className="h-5 w-5 rounded"
                      />
                    )}
                    <span>{wallet.name}</span>
                  </button>
                ))}
              </div>
            )}
            {isConnecting && (
              <p className="mt-2 text-xs text-slate-500" role="status">
                Connecting...
              </p>
            )}
            {connectMenuError != null && (
              <p
                className="mt-2 break-words text-xs text-destructive [overflow-wrap:anywhere]"
                role="alert"
              >
                {connectMenuError instanceof Error
                  ? connectMenuError.message
                  : String(connectMenuError)}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        ref={triggerRef}
        onClick={() => (isOpen ? close() : open())}
        aria-expanded={isOpen}
        aria-controls={isOpen ? "wallet-options" : undefined}
        aria-label={`Wallet ${walletAddress}`}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-violet-200 bg-gradient-to-r from-violet-950 to-indigo-950 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200/60 transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/15" />
        <span className="font-mono">{ellipsify(walletAddress!, 4)}</span>
        <span aria-hidden="true" className="ml-1 text-white/80">⌄</span>
      </button>

      {isOpen && (
        <div
          id="wallet-options"
          className="absolute right-0 top-full z-50 mt-3 w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl shadow-indigo-950/20 sm:p-5"
        >
          <div className="rounded-2xl bg-gradient-to-r from-fuchsia-100 via-violet-100 to-cyan-100 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xl text-white shadow-md">◎</div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold tracking-tight text-slate-950">Connected Wallet</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {"Solana network connected"}
                </p>
              </div>
              <span className="hidden rounded-full border border-white/80 bg-white/80 px-3 py-2 text-xs font-semibold text-violet-700 sm:inline">{ellipsify(walletAddress!, 4)}</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-sky-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-500">Wallet balance</p>
              <span className="rounded-full bg-white p-2 text-lg text-violet-700 shadow-sm" aria-hidden="true">◉</span>
            </div>
            <p className="mt-2 break-words text-2xl font-extrabold tracking-tight text-slate-950 tabular-nums sm:text-3xl">
              {balance.lamports != null
                ? formatDecimalFixedPoint(solFormatter, lamportsToSol(balance.lamports))
                : balance.isLoading
                  ? "Loading..."
                  : "Unavailable"}
              {balance.lamports != null && <span className="ml-2 text-base font-semibold text-slate-500">SOL</span>}
            </p>
            {balance.error != null && (
              <p className="mt-2 text-xs font-medium text-red-600" role="alert">Unable to load the wallet balance.</p>
            )}
            <p className="mt-2 text-xs text-slate-500">Network balance; Devnet SOL has no real monetary value.</p>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">Wallet address</p>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="min-w-0 flex-1 break-all font-mono text-xs leading-5 text-slate-700">{walletAddress}</p>
              <button
                onClick={handleCopy}
                aria-label={copied ? "Address copied" : "Copy address"}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={getExplorerUrl(`/address/${walletAddress}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-16 items-center gap-3 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 p-3 text-slate-900 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-blue-700 shadow-sm" aria-hidden="true">↗</span>
              <span><span className="block text-sm font-bold">View on Explorer</span><span className="mt-0.5 block text-xs text-slate-500">Open wallet activity</span></span>
            </a>
            <button
              onClick={handleCopy}
              className="flex min-h-16 items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-3 text-left text-slate-900 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-violet-700 shadow-sm" aria-hidden="true">▢</span>
              <span><span className="block text-sm font-bold">{copied ? "Address copied" : "Copy address"}</span><span className="mt-0.5 block text-xs text-slate-500">Copy to clipboard</span></span>
            </button>
          </div>

          <div className="my-4 border-t border-slate-100" />
          <button
            onClick={async () => {
              try {
                await disconnect();
                closeAndRestoreFocus();
              } catch {
                // The hook exposes the disconnection error below.
              }
            }}
            disabled={isDisconnecting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-3.5 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:from-rose-100 hover:to-pink-100 disabled:pointer-events-none disabled:opacity-50"
          >
            <span aria-hidden="true">↪</span>
            {isDisconnecting ? "Disconnecting..." : "Disconnect wallet"}
          </button>
          {accountMenuError != null && (
            <p className="mt-3 break-words text-xs text-red-600 [overflow-wrap:anywhere]" role="alert">
              {accountMenuError instanceof Error ? accountMenuError.message : String(accountMenuError)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
