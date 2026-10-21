"use client";

import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { address, formatDecimalFixedPoint, lamportsToSol } from "@solana/kit";
import { useConnectedWallet } from "@solana/kit-plugin-wallet/react";
import { ActionsPanel } from "./components/actions/actions-panel";
import { useAppClient } from "./lib/client-provider";
import { useBalance } from "./lib/hooks/use-balance";
import { WalletButton } from "./components/wallet-button";

const navigation = [
  { label: "Home", icon: "⌂", href: "#home" },
  { label: "Wallet", icon: "▣", href: "#wallet" },
  { label: "Transactions", icon: "◷", href: "#transactions" },
  { label: "Shop", icon: "🛍", href: "/marketplace" },
  { label: "Finance", icon: "💳", href: "/finance" },
  { label: "Rewards", icon: "🎁", href: "/rewards" },
  { label: "Settings", icon: "⚙", href: "#settings" },
];
const solFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 });
const chartRanges = ["1D", "1W", "1M", "3M", "6M", "1Y", "MAX"] as const;
type ChartRange = (typeof chartRanges)[number];
type ChartPoint = { timestamp: number; price: number; time: string };

function SolanaLogo() {
  return (
    <svg viewBox="0 0 397.7 311.7" className="h-7 w-7" role="img" aria-label="Solana logo">
      <defs><linearGradient id="solana-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9945FF" /><stop offset="100%" stopColor="#14F195" />
      </linearGradient></defs>
      <path fill="url(#solana-gradient)" d="M64 237h280c4 0 5 4 3 7l-49 49c-1 1-3 2-4 2H14c-4 0-5-4-3-7l49-49c1-1 2-2 4-2Z" />
      <path fill="url(#solana-gradient)" d="M64 119h280c4 0 5 4 3 7l-49 49c-1 1-3 2-4 2H14c-4 0-5-4-3-7l49-49c1-1 2-2 4-2Z" />
      <path fill="url(#solana-gradient)" d="M64 1h280c4 0 5 4 3 7l-49 49c-1 1-3 2-4 2H14c-4 0-5-4-3-7L60 3c1-1 2-2 4-2Z" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {visible ? <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></> :
      <><path d="m3 3 18 18" /><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.9" /><path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.4 0 2.7-.3 3.8-.8" /></>}
    </svg>
  );
}

export default function Home() {
  const client = useAppClient();
  const connected = useConnectedWallet(client);
  const walletAddress = connected?.account.address;
  const balance = useBalance(walletAddress ? address(walletAddress) : undefined);

  const [showBalance, setShowBalance] = useState(false);
  const [chartRange, setChartRange] = useState<ChartRange>("1D");
  const [portfolioHistory, setPortfolioHistory] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState("");
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [solPriceInr, setSolPriceInr] = useState<number | null>(null);
  const [priceUnavailable, setPriceUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadSolPrice() {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=inr", { cache: "no-store" });
        if (!response.ok) throw new Error("Could not fetch SOL price");
        const data = await response.json();
        const price = data?.solana?.inr;
        if (!cancelled && typeof price === "number") {
          setSolPriceInr(price);
          setPriceUnavailable(false);
        } else if (!cancelled) setPriceUnavailable(true);
      } catch {
        if (!cancelled) setPriceUnavailable(true);
      }
    }
    void loadSolPrice();
    const timer = window.setInterval(() => void loadSolPrice(), 60_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadChart() {
      try {
        setChartLoading(true);
        setChartError("");
        const response = await fetch(`/api/portfolio-chart?range=${chartRange}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load market data.");
        if (!cancelled) {
          setPortfolioHistory(data.prices ?? []);
          setFxRate(typeof data.usdtToInr === "number" ? data.usdtToInr : null);
        }
      } catch (error) {
        if (!cancelled) setChartError(error instanceof Error ? error.message : "Unable to load chart.");
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    }
    void loadChart();
    const timer = window.setInterval(() => void loadChart(), 60_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [chartRange]);

  const solBalance = balance.lamports != null
    ? Number(formatDecimalFixedPoint(solFormatter, lamportsToSol(balance.lamports)))
    : null;
  const inrBalance = solBalance != null && solPriceInr != null ? solBalance * solPriceInr : null;

  const chartData = useMemo(() => portfolioHistory.map((point) => ({
    ...point,
    value: solBalance != null && walletAddress ? point.price * solBalance : point.price,
  })), [portfolioHistory, solBalance, walletAddress]);

  return (
    <main id="home" className="min-h-screen bg-[#f7f9fd] text-[#101735]">
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/70 bg-white/95 px-5 backdrop-blur-md sm:px-8">
        <a href="#home" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 text-2xl font-black text-white">S</div>
          <span className="text-2xl font-extrabold tracking-tight">Singnar<span className="text-violet-600">EDU</span></span>
        </a>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Devnet</span>
          <WalletButton />
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-[76px] hidden h-[calc(100vh-76px)] w-[272px] shrink-0 flex-col border-r border-slate-200/70 bg-white p-6 lg:flex">
          <nav className="space-y-2">{navigation.map((item, index) => (
            <a key={item.label} href={item.href} className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] font-medium transition ${index === 0 ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50 hover:text-violet-700"}`}>
              <span className="w-5 text-xl">{item.icon}</span>{item.label}
            </a>
          ))}</nav>
          <div className="mt-auto rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 p-5">
            <div className="text-3xl">🎓</div><p className="mt-3 font-bold text-violet-700">Student Payments</p>
            <p className="mt-1 font-bold text-violet-700">Made Simple</p>
            <p className="mt-3 text-xs leading-5 text-slate-500">Simple payments for student life, powered by Solana.</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7 xl:px-7">
          <section className="relative mb-4 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#dce8ff] via-[#e9e0ff] to-[#d9f7f8] px-6 py-7 sm:px-10 sm:py-8">
            <div className="pointer-events-none absolute -right-5 -top-12 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl" />
            <div className="relative max-w-4xl">
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl xl:text-4xl">Singnar<span className="text-violet-600">Pay</span>{" "}— Student Payments Made Simple</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-lg">Send, receive and track SOL payments easily with your student wallet.</p>
            </div>
            <div className="pointer-events-none absolute bottom-[-24px] right-8 hidden text-8xl opacity-20 xl:block">🎓</div>
          </section>

          <section id="wallet" className="mb-4 scroll-mt-24 rounded-[24px] border border-white bg-gradient-to-r from-[#eef0ff] to-[#e9edff] p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#101735] text-3xl text-white"><SolanaLogo /></div>
                <div><p className="text-sm font-semibold">Wallet &amp; Payment Actions</p><p className="mt-1 text-xl font-extrabold sm:text-2xl">Your Solana Wallet</p><p className="mt-1 text-sm text-slate-500">Your live balance, displayed in SOL and INR.</p></div>
              </div>
              <div className="min-w-0 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm sm:min-w-[270px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-500">Total balance</span>
                  <button type="button" onClick={() => setShowBalance((current) => !current)} aria-label={showBalance ? "Hide balance" : "Show balance"} aria-pressed={showBalance} className="rounded-lg p-2 text-violet-700 transition hover:bg-violet-50"><EyeIcon visible={showBalance} /></button>
                </div>
                {showBalance ? <>
                  <p className="mt-1 break-words text-2xl font-extrabold tabular-nums text-[#101735]">{solBalance != null ? `${solBalance.toLocaleString("en-IN", { maximumFractionDigits: 4 })} SOL` : balance.isLoading ? "Loading balance..." : "Balance unavailable"}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{inrBalance != null ? `≈ ${inrBalance.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })}` : priceUnavailable ? "SOL/INR price unavailable" : "Loading SOL/INR price..."}</p>
                </> : <>
                  <p className="mt-1 text-2xl font-extrabold tracking-widest text-[#101735]">••••••</p><p className="mt-1 text-sm text-slate-500">SOL and INR hidden</p>
                </>}
                {!walletAddress && <p className="mt-2 text-xs text-slate-500">Connect your wallet to view your balance.</p>}
                {balance.error != null && walletAddress && <p className="mt-2 text-xs text-red-600" role="alert">Unable to load the wallet balance.</p>}
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">INR is an estimated market value, not a cash balance. Devnet SOL is for testing and has no real monetary value.</p>
          </section>

          <section className="mb-4 rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(30,45,90,0.04)] sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-lg font-extrabold text-[#101735]">{walletAddress && solBalance != null ? "Estimated SOL portfolio value" : "SOL market price"}</h2><p className="mt-1 text-sm text-slate-500">Live-updating Binance market data · INR estimate</p></div>
              <div className="flex flex-wrap gap-1">{chartRanges.map((range) => (
                <button key={range} type="button" onClick={() => setChartRange(range)} aria-pressed={chartRange === range} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${chartRange === range ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-violet-50"}`}>{range}</button>
              ))}</div>
            </div>
            {chartLoading && <p className="mb-2 text-sm text-slate-500">Loading market data...</p>}
            {chartError && <p className="mb-2 text-sm text-red-600" role="alert">{chartError}</p>}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs><linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} /><stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} minTickGap={25} />
                  <YAxis width={80} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
                  <Tooltip formatter={(value) => [
                    `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
                    walletAddress && solBalance != null ? "Estimated SOL value" : "SOL price",
                  ]} />
                  <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} fill="url(#portfolioFill)" activeDot={{ r: 5 }} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-slate-400">Prices convert SOL/USDT to INR using a separate USD/INR reference rate.{fxRate != null ? ` Current reference rate: ₹${fxRate.toFixed(2)} per USD.` : ""} Data refreshes every 60 seconds. Devnet SOL has no real monetary value.</p>
          </section>

          <section className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(30,45,90,0.04)] sm:p-6"><ActionsPanel /></section>
          <footer className="py-6 text-center text-xs text-slate-400">SingnarPay · Built for students on Solana · Devnet test environment</footer>
        </div>
      </div>
    </main>
  );
}
