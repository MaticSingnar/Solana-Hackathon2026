
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  category: string;
  icon: string;
  description: string;
  originalPrice: number;
  price: number;
  color: string;
  tag: string;
};

const productColors: Record<string, string> = {
  Electronics: "from-blue-100 to-violet-100",
  Stationery: "from-yellow-100 to-pink-100",
  Accessories: "from-orange-100 to-rose-100",
};


const categories = [
  "All Products",
  "Electronics",
  "Stationery",
  "Accessories",
];

const money = (amount: number) =>
  amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [notice, setNotice] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoadingProducts(true);
        setProductsError("");
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Could not load products from the database.");
        const data = await response.json();
        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("The products API returned an unexpected response.");
        }

        // The seed script was run twice, so hide duplicate names/categories for now.
        const seen = new Set<string>();
        const uniqueProducts = data.products.filter((item: any) => {
          const key = `${item.name}::${item.category}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const mappedProducts: Product[] = uniqueProducts.map((item: any) => {
          const originalPrice = Number(item.price);
          const discount = Number(item.discount || 0);
          const price = Math.round(originalPrice * (100 - discount) / 100);
          const icon = item.image || "📦";
          const tag = discount > 0 ? `${discount}% OFF` : "Student essential";
          return {
            id: Number(item.id),
            name: item.name,
            category: item.category,
            icon,
            description: item.description || "A useful product for student life",
            originalPrice,
            price,
            color: productColors[item.category] || "from-slate-100 to-indigo-100",
            tag,
          };
        });

        if (!cancelled) setProducts(mappedProducts);
      } catch (error) {
        if (!cancelled) {
          setProductsError(error instanceof Error ? error.message : "Could not load products.");
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }

    loadProducts();
    return () => { cancelled = true; };
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All Products" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const cartItems = useMemo(
    () =>
      products
        .filter((product) => (cart[product.id] ?? 0) > 0)
        .map((product) => ({
          ...product,
          quantity: cart[product.id],
        })),
    [cart]
  );

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const total = cartItems.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  const savings = cartItems.reduce(
    (sum, product) =>
      sum +
      (product.originalPrice - product.price) * product.quantity,
    0
  );

  function changeQuantity(id: number, amount: number) {
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[id] ?? 0) + amount;

      if (quantity <= 0) {
        delete next[id];
      } else {
        next[id] = quantity;
      }

      return next;
    });
    setNotice("");
  }

  return (
    <main className="min-h-screen bg-[#f7f9fd] text-[#101735]">
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 text-xl font-black text-white">
            S
          </div>
          <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Singnar<span className="text-violet-600"> EDU</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="hidden rounded-full px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-violet-50 sm:block"
          >
            Home
          </Link>
          <button
            onClick={() => {
              setShowCart(true);
              setNotice("");
            }}
            className="rounded-full bg-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            🛒 Cart ({cartCount})
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#dce8ff] via-[#e8ddff] to-[#d9f7f8] p-6 sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-700">
              Student exclusive marketplace
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Shop smarter.
              <br />
              <span className="text-violet-700">Save more.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-700 sm:text-base">
              Discover electronics, stationery and campus essentials at
              student-friendly prices.
            </p>
            <a
              href="#products"
              className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
            >
              Explore products →
            </a>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-10 h-60 w-60 rounded-full bg-violet-300/40 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-8 hidden text-8xl sm:block lg:right-24 lg:text-9xl">
            🎓
          </div>
          <div className="pointer-events-none absolute bottom-8 right-12 hidden rotate-[-8deg] text-6xl sm:block lg:right-44">
            💻
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <span className="text-2xl">🎓</span>
            <p className="mt-2 font-bold">Student-first deals</p>
            <p className="mt-1 text-sm text-slate-500">
              Products for student life
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <span className="text-2xl">🏷️</span>
            <p className="mt-2 font-bold">Clear discounts</p>
            <p className="mt-1 text-sm text-slate-500">
              Compare original and offer prices
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <span className="text-2xl">🔒</span>
            <p className="mt-2 font-bold">Digital payments</p>
            <p className="mt-1 text-sm text-slate-500">
              Solana wallet integration planned for checkout
            </p>
          </div>
        </section>

        <section id="products" className="mt-9 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
                Find your essentials
              </p>
              <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                Student marketplace
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Products loaded from the Singnar EDU database.
              </p>
            </div>

            <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:w-80">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  category === item
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-violet-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {loadingProducts && (
            <div className="mt-5 rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
              Loading products from the database...
            </div>
          )}

          {!loadingProducts && productsError && (
            <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              {productsError} Make sure the Next.js server is running and try refreshing the page.
            </div>
          )}

          {!loadingProducts && !productsError && <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-[22px] border border-slate-100 bg-white p-3 shadow-[0_4px_18px_rgba(30,45,90,0.04)] transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`relative flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br ${product.color}`}
                >
                  <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm">
                    {product.tag}
                  </span>
                  <span className="text-7xl transition duration-200 group-hover:scale-110">
                    {product.icon}
                  </span>
                </div>

                <div className="px-2 pb-2 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {product.category}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{product.name}</h3>
                  <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">
                    {product.description}
                  </p>

                  <div className="mt-3">
                    <p className="text-xs text-slate-400 line-through">
                      {money(product.originalPrice)}
                    </p>
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <p className="text-xl font-extrabold text-violet-700">
                        {money(product.price)}
                      </p>
                      <p className="text-xs font-bold text-emerald-600">
                        Save {money(product.originalPrice - product.price)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => changeQuantity(product.id, 1)}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
                  >
                    {cart[product.id]
                      ? `✓ Added (${cart[product.id]}) · Add more`
                      : "＋ Add to Cart"}
                  </button>
                </div>
              </article>
            ))}
          </div>}

          {!loadingProducts && !productsError && filteredProducts.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-3xl">🔎</p>
              <p className="mt-3 font-bold">No products found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or category.
              </p>
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs leading-5 text-slate-400">
          Singnar EDU · Student shopping made simpler
          <br />
Product catalogue is loaded from the database. Prices are displayed using the saved discount values.
        </footer>
      </div>

      {showCart && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/40"
          onClick={() => setShowCart(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-extrabold">Your cart</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {cartCount} item{cartCount === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                aria-label="Close cart"
                className="rounded-xl bg-slate-100 px-3 py-2 font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-5xl">🛒</p>
                  <h3 className="mt-4 font-bold">Your cart is empty</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Add products from the marketplace to get started.
                  </p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white"
                  >
                    Browse products
                  </button>
                </div>
              ) : (
                cartItems.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-3 rounded-2xl border border-slate-100 p-3"
                  >
                    <div
                      className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${product.color} text-4xl`}
                    >
                      {product.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{product.name}</p>
                      <p className="mt-1 text-sm font-extrabold text-violet-700">
                        {money(product.price * product.quantity)}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          onClick={() => changeQuantity(product.id, -1)}
                          aria-label={`Decrease ${product.name} quantity`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 font-bold"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold">
                          {product.quantity}
                        </span>
                        <button
                          onClick={() => changeQuantity(product.id, 1)}
                          aria-label={`Increase ${product.name} quantity`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 font-bold"
                        >
                          +
                        </button>
                        <button
                          onClick={() =>
                            setCart((current) => {
                              const next = { ...current };
                              delete next[product.id];
                              return next;
                            })
                          }
                          className="ml-auto text-xs font-semibold text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && !showCheckout && (
              <div className="border-t border-slate-100 p-5">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Estimated savings</span>
                  <span className="font-bold text-emerald-600">
                    {money(savings)}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-lg font-extrabold">
                  <span>Total</span>
                  <span>{money(total)}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Test checkout creates an order in the database. No payment will be collected.
                </p>
                <button
                  onClick={() => {
                    setShowCheckout(true);
                    setNotice("");
                  }}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-3.5 font-bold text-white"
                >
                  Continue to Checkout →
                </button>
              </div>
            )}

            {cartItems.length > 0 && showCheckout && (
              <form
                className="border-t border-slate-100 p-5"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setSubmittingOrder(true);
                  setNotice("");
                  try {
                    const response = await fetch("/api/orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        customerName,
                        email,
                        phone,
                        address,
                        items: cartItems.map((item) => ({
                          productId: item.id,
                          quantity: item.quantity,
                        })),
                      }),
                    });
                    const result = await response.json();
                    if (!response.ok || !result.success) {
                      throw new Error(result.error || "Could not create your order.");
                    }
                    setNotice(`Order #${result.order.id} created successfully. This is a test order; no payment was collected.`);
                    setCart({});
                    setShowCheckout(false);
                    setCustomerName("");
                    setEmail("");
                    setPhone("");
                    setAddress("");
                  } catch (error) {
                    setNotice(error instanceof Error ? error.message : "Could not create your order. Please try again.");
                  } finally {
                    setSubmittingOrder(false);
                  }
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-extrabold">Delivery details</h3>
                  <button type="button" onClick={() => setShowCheckout(false)} className="text-sm font-semibold text-violet-700">
                    Back to cart
                  </button>
                </div>
                <label className="mb-3 block text-sm font-semibold">Full name
                  <input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-500" placeholder="Your full name" />
                </label>
                <label className="mb-3 block text-sm font-semibold">Email
                  <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-500" placeholder="you@example.com" />
                </label>
                <label className="mb-3 block text-sm font-semibold">Phone number
                  <input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-500" placeholder="Contact number" />
                </label>
                <label className="mb-3 block text-sm font-semibold">Delivery address
                  <textarea required value={address} onChange={(event) => setAddress(event.target.value)} rows={3} className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-500" placeholder="House, street, town, state, PIN code" />
                </label>
                <div className="mb-3 flex items-center justify-between text-lg font-extrabold">
                  <span>Order total</span><span>{money(total)}</span>
                </div>
                <button disabled={submittingOrder} type="submit" className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
                  {submittingOrder ? "Creating order..." : "Place Test Order →"}
                </button>
                <p className="mt-2 text-xs leading-5 text-slate-400">This creates a pending test order and does not charge your payment method.</p>
              </form>
            )}
            {notice && (
              <p role="status" className="m-5 mt-0 rounded-xl bg-violet-50 p-3 text-sm text-violet-800">
                {notice}
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
