# Wallet App

A high-consistency distributed wallet system built with Node.js, TypeScript, Express, and Prisma — designed to handle real-world financial operations safely at scale.

---

## Features

### Functional
- Create a wallet for a user
- Load money (add funds to wallet)
- Transfer money between user wallets
- View transaction history

### Non-Functional
- Atomic transactions — every operation is all-or-nothing
- High consistency — no dirty reads, no phantom data (RepeatableRead isolation)
- Saga pattern for distributed transactions
- Horizontal sharding across multiple databases

---

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **ORM:** Prisma
- **Database:** PostgreSQL (2 shards)
- **Containerization:** Docker

---

## Architecture

### Database Sharding
The app uses **2 PostgreSQL shards** managed via Prisma with separate schema and migration files per shard:

```
prisma/
  shard1/
    schema.prisma
    migrations/
  shard2/
    schema.prisma
    migrations/

generated/
  prisma/
    shard1/   ← Prisma client for shard 1
    shard2/   ← Prisma client for shard 2
```

Each shard has its own Prisma client using the `@prisma/adapter-pg` driver adapter. A `ShardResolver` routes each user to the correct shard based on their `userId`.

### Transaction Safety
All wallet operations run inside Prisma transactions with `RepeatableRead` isolation level — ensuring no two concurrent requests can create duplicate wallets or cause inconsistent balance updates.

---

## Database Schema

### Wallet
| Column | Type | Description |
|---|---|---|
| id | BigInt | Primary key |
| user_id | BigInt | Unique user identifier |
| balance | BigInt | Current balance |
| version | Int | Optimistic locking version |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last updated timestamp |

### Transaction
| Column | Type | Description |
|---|---|---|
| id | BigInt | Primary key |
| from_user | BigInt | Sender user ID |
| to_user | BigInt | Receiver user ID |
| amount | BigInt | Transfer amount |
| status | Enum | PENDING / DEBITED / CREDITED / FAILED |
| idempotency_key | String | Prevents duplicate transactions |

### Ledger
| Column | Type | Description |
|---|---|---|
| id | BigInt | Primary key |
| user_id | BigInt | User ID |
| transaction_id | BigInt | Linked transaction |
| amount | BigInt | Amount |
| type | Enum | CREDIT / DEBIT |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Docker

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/wallet-app.git
cd wallet-app

# 2. Install dependencies
npm install

# 3. Start databases
docker-compose up -d

# 4. Generate Prisma clients
npm run generate

# 5. Run migrations on both shards
npm run migrate

# 6. Start the server
npm run dev
```

### Environment Variables

```env
DB_SHARD1=postgresql://postgres:postgres@localhost:5433/wallet-shard1
DB_SHARD2=postgresql://postgres:postgres@localhost:5434/wallet-shard2
PORT=3000
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run generate` | Generate Prisma clients for both shards |
| `npm run migrate` | Run migrations on both shards |

---


