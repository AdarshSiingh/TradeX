# TradeX Database Schema

PostgreSQL (hosted on Neon). All tables use `SERIAL` primary keys and `TIMESTAMPTZ` for timestamps.

---

## `users`

Stores every registered account — both email/password and Google OAuth users.

| Column      | Type          | Notes                                      |
|-------------|---------------|---------------------------------------------|
| id          | SERIAL        | Primary key                                 |
| name        | VARCHAR(100)  | Required                                    |
| email       | VARCHAR(255)  | Unique, required                            |
| password    | VARCHAR(255)  | NULL for Google OAuth users                 |
| role        | VARCHAR(20)   | `TRADER` or `ADMIN`, defaults to `TRADER`   |
| google_id   | VARCHAR(255)  | Unique, NULL for email/password users       |
| balance     | DECIMAL(15,2) | Starts at $100,000 virtual cash             |
| is_active   | BOOLEAN       | Used for admin suspend/unsuspend            |
| created_at  | TIMESTAMPTZ   | Auto-set on creation                        |

---

## `stocks`

The tradable stocks available on the platform.

| Column        | Type          | Notes                                  |
|---------------|---------------|------------------------------------------|
| id            | SERIAL        | Primary key                              |
| ticker        | VARCHAR(10)   | Unique (e.g. `AAPL`)                     |
| name          | VARCHAR(100)  | Company name                             |
| sector        | VARCHAR(50)   | Optional                                 |
| current_price | DECIMAL(10,2) | Updated live via Finnhub WebSocket feed  |
| created_at    | TIMESTAMPTZ   | Auto-set on creation                     |

---

## `portfolio`

Tracks how many shares of each stock a user currently owns, and their average buy price (cost basis).

| Column        | Type          | Notes                                          |
|---------------|---------------|--------------------------------------------------|
| id            | SERIAL        | Primary key                                      |
| user_id       | INTEGER       | FK → `users.id`, cascades on delete              |
| stock_id      | INTEGER       | FK → `stocks.id`, cascades on delete             |
| quantity      | INTEGER       | Current shares owned                             |
| avg_buy_price | DECIMAL(10,2) | Weighted average price paid across all purchases |

`UNIQUE(user_id, stock_id)` — one row per user per stock. Buying more of a stock you already own updates this row (recalculating the weighted average) rather than creating a new one.

---

## `orders`

Every buy/sell action ever placed, regardless of outcome.

| Column     | Type          | Notes                             |
|------------|---------------|--------------------------------------|
| id         | SERIAL        | Primary key                          |
| user_id    | INTEGER       | FK → `users.id`                      |
| stock_id   | INTEGER       | FK → `stocks.id`                     |
| type       | VARCHAR(4)    | `BUY` or `SELL`                      |
| quantity   | INTEGER       | Must be > 0                          |
| price      | DECIMAL(10,2) | Price at time of execution           |
| status     | VARCHAR(10)   | `COMPLETED` or `CANCELLED`           |
| created_at | TIMESTAMPTZ   | Auto-set on creation                 |

---

## `transactions`

The financial record tied to each completed order — separated from `orders` since an order represents *intent*, while a transaction represents the *actual financial event*.

| Column     | Type          | Notes                          |
|------------|---------------|-----------------------------------|
| id         | SERIAL        | Primary key                       |
| user_id    | INTEGER       | FK → `users.id`                   |
| order_id   | INTEGER       | FK → `orders.id`                  |
| stock_id   | INTEGER       | FK → `stocks.id`                  |
| type       | VARCHAR(4)    | `BUY` or `SELL`                   |
| quantity   | INTEGER       |                                    |
| price      | DECIMAL(10,2) | Price per share                   |
| total      | DECIMAL(15,2) | `quantity × price`                |
| created_at | TIMESTAMPTZ   | Auto-set on creation               |

## Relationships

```text
users (1) ─────< portfolio >───── (1) stocks
   │
   ├─────< orders >────────────── (1) stocks
   │
   └─────< transactions >──────── (1) stocks

orders (1) ────────────────────── (1) transactions
```

### Relationship Summary

- **One User → Many Portfolio Entries**
- **One Stock → Many Portfolio Entries**

- **One User → Many Orders**
- **One Stock → Many Orders**

- **One User → Many Transactions**
- **One Stock → Many Transactions**

- **One Order → One Transaction**

Every `portfolio`, `orders`, and `transactions` row cascades on delete if the parent `user` or `stock` is removed (`ON DELETE CASCADE`), keeping the database consistent without orphaned rows.

## Atomicity

Buy/sell operations run inside a PostgreSQL transaction (`BEGIN` / `COMMIT` / `ROLLBACK`) spanning: balance check → balance update → portfolio update → order insert → transaction insert. If any step fails, the entire operation rolls back, preventing partial updates (e.g. balance deducted but shares never credited).