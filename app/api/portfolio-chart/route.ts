
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ranges: Record<string, { interval: string; limit: number }> = {
  "1D": { interval: "15m", limit: 96 },
  "1W": { interval: "1h", limit: 168 },
  "1M": { interval: "4h", limit: 180 },
  "3M": { interval: "12h", limit: 180 },
  "6M": { interval: "1d", limit: 180 },
  "1Y": { interval: "1d", limit: 365 },
  MAX: { interval: "1d", limit: 1000 },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "1D";
    const settings = ranges[range] ?? ranges["1D"];

    const [candlesResponse, fxResponse] = await Promise.all([
      fetch(
        `https://data-api.binance.vision/api/v3/klines?symbol=SOLUSDT&interval=${settings.interval}&limit=${settings.limit}`,
        { cache: "no-store" }
      ),
      fetch("https://open.er-api.com/v6/latest/USD", {
        cache: "no-store",
      }),
    ]);

    if (!candlesResponse.ok) {
      throw new Error("Binance market data is unavailable.");
    }

    if (!fxResponse.ok) {
      throw new Error("INR exchange-rate data is unavailable.");
    }

    const candles = await candlesResponse.json();
    const fx = await fxResponse.json();

    if (!fx.rates?.INR) {
      throw new Error("Could not obtain the USD-to-INR rate.");
    }

    // USDT is treated as approximately equal to USD.
    const usdtToInr = Number(fx.rates.INR);

    const prices = candles.map((candle: (string | number)[]) => {
      const timestamp = Number(candle[0]);
      const priceUsdt = Number(candle[4]);

      return {
        timestamp,
        price: priceUsdt * usdtToInr,
        time:
          range === "1D" || range === "1W"
            ? new Date(timestamp).toLocaleString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "numeric",
                month: "short",
              })
            : new Date(timestamp).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: range === "1Y" || range === "MAX"
                  ? "2-digit"
                  : undefined,
              }),
      };
    });

    return NextResponse.json({
      prices,
      range,
      currency: "INR",
      usdtToInr,
      updatedAt: Date.now(),
      source: "Binance SOLUSDT + USD/INR reference rate",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load market data.",
      },
      { status: 502 }
    );
  }
}
