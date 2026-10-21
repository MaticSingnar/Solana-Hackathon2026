# SingnarPay — Solana Student Payments

**SingnarPay** is a student-focused payment platform built with Next.js and Solana. It aims to simplify digital payments for students through wallet integration, student marketplace checkout, token features, and rewards.

## Features

- **Solana Wallet:** Connect and disconnect a wallet.
- **Balance Dashboard:** View SOL balance and an estimated INR equivalent.
- **SOL Transfers:** Send and receive SOL on Solana Devnet.
- **Memo Transactions:** Attach a memo to a Solana transaction.
- **SPL Token Tools:** Create a token mint, mint tokens, and transfer tokens.
- **Portfolio Chart:** View SOL market-price history converted to an estimated INR value.
- **Student Marketplace:** Browse products and place test orders.
- **Finance and Rewards:** Dedicated pages for finance-related features and student rewards.

## Tech Stack

- Next.js
- React and TypeScript
- Solana
- Prisma ORM
- SQLite
- Recharts
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js and npm
- A Solana-compatible wallet for Devnet testing

### Installation

1. Clone or download this repository.
2. Open a terminal in the project directory.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create your local `.env` file using `.env.example` as a reference. Never commit API keys, credentials, or other secrets.
5. Configure the database according to the Prisma schema and migration files.
6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000).

### Solana Network

SingnarPay is configured for **Solana Devnet** testing. Use test SOL and verify the selected network before making transactions.

## Important Limitations

- Devnet SOL has no real monetary value.
- Marketplace checkout currently creates test orders; it does not collect real payments.
- INR amounts are estimates based on market-price and currency-conversion data.
- Credit cards, loans, EMI, and merchant discounts should be treated as planned features unless their complete functionality is implemented.

## Security

- Never publish wallet seed phrases, private keys, API secrets, or `.env` files.
- Local database files and generated build folders should remain excluded from the repository.
- Review environment variables and configuration files before deploying.

## Project Purpose

SingnarPay explores how Solana can support student-oriented payment experiences, digital assets, and marketplace workflows.

Built for the Solana Hackathon 2026.
