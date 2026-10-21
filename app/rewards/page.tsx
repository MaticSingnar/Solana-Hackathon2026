
"use client";

import Link from "next/link";
import { useState } from "react";

type RewardActivity = {
  id: number;
  title: string;
  description: string;
  points: number;
  icon: string;
  completed: boolean;
};

export default function RewardsPage() {
  const [points, setPoints] = useState(0);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const [activities, setActivities] = useState<RewardActivity[]>([
    {
      id: 1,
      title: "Daily check-in",
      description: "Visit Singnar EDU and check in.",
      points: 5,
      icon: "📅",
      completed: false,
    },
    {
      id: 2,
      title: "Complete a learning challenge",
      description: "Finish a quiz or learning activity.",
      points: 20,
      icon: "📚",
      completed: false,
    },
    {
      id: 3,
      title: "Explore the marketplace",
      description: "Browse student products and offers.",
      points: 10,
      icon: "🛍️",
      completed: false,
    },
    {
      id: 4,
      title: "Refer a student",
      description: "Preview the referral reward feature.",
      points: 25,
      icon: "🤝",
      completed: false,
    },
  ]);

  function claimReward(activity: RewardActivity) {
    if (activity.completed) return;

    setPoints((current) => current + activity.points);
    setClaimed((current) => [...current, String(activity.id)]);
    setActivities((current) =>
      current.map((item) =>
        item.id === activity.id ? { ...item, completed: true } : item
      )
    );
    setHistory((current) => [
      `${activity.title} · +${activity.points} points`,
      ...current,
    ]);
    setNotice(
      `Demo reward added: ${activity.points} points for "${activity.title}". These points have no cash or SOL value.`
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fd] text-[#151832]">
      <header className="flex min-h-[76px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 text-xl font-black text-white">
            S
          </div>
          <span className="text-xl font-extrabold">
            Singnar<span className="text-violet-600"> EDU</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-slate-600 hover:bg-violet-50"
          >
            Home
          </Link>
          <Link
            href="/marketplace"
            className="rounded-lg px-3 py-2 text-slate-600 hover:bg-violet-50"
          >
            Shop
          </Link>
          <Link
            href="/finance"
            className="rounded-lg px-3 py-2 text-slate-600 hover:bg-violet-50"
          >
            Finance
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-10">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-500 p-6 text-white sm:p-10">
          <div className="pointer-events-none absolute -right-8 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                Student rewards programme
              </span>
              <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
                Learn more.
                <br />
                Earn rewards.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                Complete learning activities, explore student benefits, and
                collect Singnar points. Future rewards may include SOL if a
                funded and compliant programme is launched.
              </p>
              <a
                href="#activities"
                className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-bold text-violet-700 transition hover:bg-violet-50"
              >
                Explore activities ↓
              </a>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm md:min-w-64">
              <div className="text-4xl">🎁</div>
              <p className="mt-5 text-sm font-medium text-white/75">
                Your demo balance
              </p>
              <p className="mt-1 text-4xl font-black">
                {points.toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-sm text-white/75">Singnar points</p>
              <div className="mt-5 rounded-xl bg-white/10 p-3 text-xs leading-5 text-white/80">
                Demo points only. They are not redeemable and have no monetary
                or SOL value.
              </div>
            </div>
          </div>
        </section>

        <section id="activities" className="mt-10 scroll-mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
                Earn points
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Student activities
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Select an activity to preview how rewards work.
              </p>
            </div>
            <span className="rounded-full bg-violet-100 px-3 py-2 text-xs font-bold text-violet-700">
              {activities.filter((activity) => activity.completed).length}/
              {activities.length} completed
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {activities.map((activity) => (
              <article
                key={activity.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-2xl">
                    {activity.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-extrabold">{activity.title}</h3>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        +{activity.points} pts
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {activity.description}
                    </p>
                    <button
                      disabled={activity.completed}
                      onClick={() => claimReward(activity)}
                      className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-bold transition ${
                        activity.completed
                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                          : "bg-violet-600 text-white hover:bg-violet-700"
                      }`}
                    >
                      {activity.completed ? "✓ Completed" : "Try demo activity"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {notice && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-800"
            >
              {notice}
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                ◎
              </div>
              <div>
                <h2 className="text-xl font-extrabold">Future SOL rewards</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Solana wallet integration
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              A future version could allow eligible students to redeem rewards
              under published programme rules. This requires funding, secure
              wallet integration, identity and abuse controls where applicable,
              and regulatory review.
            </p>
            <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <strong>Not active yet:</strong> no SOL is sent, no wallet is
              connected here, and demo points cannot be exchanged for money.
            </div>
            <button
              onClick={() =>
                alert(
                  "SOL redemption is not available in this demo. No wallet transaction has been made."
                )
              }
              className="mt-5 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-500"
            >
              SOL redemption — coming later
            </button>
          </article>

          <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                📜
              </div>
              <div>
                <h2 className="text-xl font-extrabold">Rewards history</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Activities completed in this session
                </p>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center">
                <p className="text-3xl">🧾</p>
                <p className="mt-3 font-bold">No rewards yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Complete a demo activity to see it here.
                </p>
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {history.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4"
                  >
                    <span className="text-sm font-semibold">{item.split(" · ")[0]}</span>
                    <span className="shrink-0 text-sm font-extrabold text-emerald-700">
                      {item.split(" · ")[1]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs leading-5 text-slate-400">
          Singnar EDU Rewards · Prototype only · No cash or cryptocurrency
          payouts are enabled.
        </footer>
      </div>
    </main>
  );
}
