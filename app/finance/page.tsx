
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const formatINR = (amount: number) =>
  amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export default function FinancePage() {
  const [loanAmount, setLoanAmount] = useState(300000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(5);
  const [message, setMessage] = useState("");

  const emi = useMemo(() => {
    const months = years * 12;
    const monthlyRate = rate / 1200;

    if (monthlyRate === 0) return loanAmount / months;

    const factor = Math.pow(1 + monthlyRate, months);
    return (loanAmount * monthlyRate * factor) / (factor - 1);
  }, [loanAmount, rate, years]);

  const totalPayment = emi * years * 12;
  const totalInterest = totalPayment - loanAmount;

  return (
    <main className="min-h-screen bg-[#f7f8fd] text-slate-900">
      <header className="flex min-h-[76px] items-center justify-between gap-3 border-b bg-white px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 text-xl font-black text-white">
            S
          </div>
          <span className="text-xl font-extrabold">
            Singnar<span className="text-violet-600"> EDU</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <Link href="/" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-violet-50">
            Home
          </Link>
          <Link href="/marketplace" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-violet-50">
            Shop
          </Link>
          <Link href="/rewards" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-violet-50">
            Rewards
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#dce6ff] via-[#e9e1ff] to-[#d8f7f0] p-6 sm:p-10">
          <div className="max-w-3xl">
            <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-bold uppercase tracking-wider text-violet-700">
              Student financial hub
            </span>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
              Your education.
              <br />
              <span className="text-violet-700">Your financial future.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Explore student banking options, understand education loans,
              estimate repayments and learn to make informed financial decisions.
            </p>
            <a
              href="#calculator"
              className="mt-6 inline-flex rounded-xl bg-violet-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-violet-700"
            >
              Calculate your EMI →
            </a>
          </div>
          <div className="pointer-events-none absolute bottom-4 right-8 hidden text-8xl sm:block">
            🎓
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <a href="#cards" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="text-3xl">💳</div>
            <h2 className="mt-4 text-lg font-extrabold">Student credit cards</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Understand eligibility, fees, credit limits and benefits.
            </p>
            <p className="mt-4 font-bold text-violet-700">Explore options →</p>
          </a>

          <a href="#loans" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="text-3xl">🎓</div>
            <h2 className="mt-4 text-lg font-extrabold">Education loans</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Learn about study costs, repayment and lender requirements.
            </p>
            <p className="mt-4 font-bold text-blue-700">Explore loans →</p>
          </a>

          <a href="#calculator" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="text-3xl">🧮</div>
            <h2 className="mt-4 text-lg font-extrabold">EMI calculator</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Estimate monthly payments and total interest.
            </p>
            <p className="mt-4 font-bold text-emerald-700">Calculate EMI →</p>
          </a>
        </section>

        <section id="cards" className="mt-10 scroll-mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
            Banking and credit
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Student credit cards
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Learn about common options. These are educational examples, not live offers.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl">
                  💳
                </div>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                  Learning guide
                </span>
              </div>
              <h3 className="mt-4 text-xl font-extrabold">Secured credit card</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Some cards require a fixed deposit as security. Check the
                provider's deposit, fees, interest and eligibility conditions.
              </p>
              <button
                onClick={() => setMessage("A secured card may require a fixed deposit. Compare the actual provider's fees, deposit rules and repayment terms before applying.")}
                className="mt-5 w-full rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 font-bold text-violet-700 hover:bg-violet-100"
              >
                Learn how it works
              </button>
            </article>

            <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  🏦
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Learning guide
                </span>
              </div>
              <h3 className="mt-4 text-xl font-extrabold">Student banking benefits</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Learn about student accounts, debit cards and eligible
                discounts. Credit products depend on provider rules.
              </p>
              <button
                onClick={() => setMessage("Before applying for any credit product, check age and income requirements, fees, interest rates, late-payment charges and the full terms.")}
                className="mt-5 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-bold text-blue-700 hover:bg-blue-100"
              >
                Understand your options
              </button>
            </article>
          </div>
        </section>

        <section id="loans" className="mt-10 scroll-mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Plan your education
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Education loan guide
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
            Education loans may help cover eligible tuition and related study
            expenses. Terms, collateral, co-applicant requirements, interest
            rates and eligibility vary by lender and course.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["01", "Estimate the cost", "Calculate tuition, accommodation, books and other eligible expenses."],
              ["02", "Compare the terms", "Review interest rates, fees, repayment start date and total cost."],
              ["03", "Verify the lender", "Use an authorised bank or regulated lending partner and read its official terms."],
            ].map(([number, title, description]) => (
              <div key={number} className="rounded-xl bg-slate-50 p-4">
                <span className="text-sm font-black text-violet-600">{number}</span>
                <h3 className="mt-2 font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setMessage("Live lender comparisons and applications are not connected yet. This prototype does not collect documents or submit loan applications.")}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
          >
            Explore loan providers
          </button>
        </section>

        <section id="calculator" className="mt-10 scroll-mt-6 rounded-[26px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
            Free planning tool
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Education loan EMI calculator
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Change the values to see an approximate monthly repayment.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="space-y-7">
              <div>
                <div className="flex justify-between gap-3 text-sm">
                  <label htmlFor="loanAmount" className="font-semibold">Loan amount</label>
                  <span className="font-extrabold text-violet-700">{formatINR(loanAmount)}</span>
                </div>
                <input id="loanAmount" type="range" min="50000" max="2000000" step="10000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="mt-4 w-full accent-violet-600" />
                <div className="mt-1 flex justify-between text-xs text-slate-400"><span>₹50,000</span><span>₹20,00,000</span></div>
              </div>

              <div>
                <div className="flex justify-between gap-3 text-sm">
                  <label htmlFor="rate" className="font-semibold">Annual interest rate</label>
                  <span className="font-extrabold text-violet-700">{rate.toFixed(1)}%</span>
                </div>
                <input id="rate" type="range" min="5" max="20" step="0.5" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-4 w-full accent-violet-600" />
                <div className="mt-1 flex justify-between text-xs text-slate-400"><span>5%</span><span>20%</span></div>
              </div>

              <div>
                <div className="flex justify-between gap-3 text-sm">
                  <label htmlFor="years" className="font-semibold">Repayment period</label>
                  <span className="font-extrabold text-violet-700">{years} years</span>
                </div>
                <input id="years" type="range" min="1" max="15" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="mt-4 w-full accent-violet-600" />
                <div className="mt-1 flex justify-between text-xs text-slate-400"><span>1 year</span><span>15 years</span></div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-violet-700 to-blue-600 p-6 text-white sm:p-8">
              <p className="text-sm text-white/75">Estimated monthly EMI</p>
              <p className="mt-2 text-4xl font-black">{formatINR(emi)}</p>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between gap-3 border-b border-white/20 pb-3 text-sm">
                  <span className="text-white/75">Principal</span>
                  <span className="font-bold">{formatINR(loanAmount)}</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-white/20 pb-3 text-sm">
                  <span className="text-white/75">Estimated interest</span>
                  <span className="font-bold">{formatINR(totalInterest)}</span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-white/75">Total repayment</span>
                  <span className="font-bold">{formatINR(totalPayment)}</span>
                </div>
              </div>
              <p className="mt-6 text-xs leading-5 text-white/70">
                Estimate only. Actual lender calculations, fees and terms may differ.
              </p>
            </div>
          </div>
        </section>

        {message && (
          <div role="status" className="mt-6 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-900">
            {message}
            <button onClick={() => setMessage("")} className="ml-3 font-bold underline">
              Dismiss
            </button>
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <strong>Prototype notice:</strong> No actual credit cards or loans are
          offered through this page. No personal financial information is
          collected. Connect only verified providers and publish their real
          terms before launching applications.
        </section>

        <footer className="py-8 text-center text-xs text-slate-400">
          Singnar EDU · Student Finance · Prototype
        </footer>
      </div>
    </main>
  );
}
