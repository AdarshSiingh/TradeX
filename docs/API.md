# TradeX API Documentation

Base URL (local): `http://localhost:8000/api`

All protected routes require a valid JWT, sent automatically via an HttpOnly cookie after login. No manual token handling needed on the client — the browser sends it with every request.

---

## Auth

### `POST /auth/signup`
Create a new account.

**Body:**
```json
{ "name": "Addy", "email": "addy@test.com", "password": "123456" }
```

**Response `201`:**
```json
{ "success": true, "message": "Account created successfully", "user": { ... } }
```

---

### `POST /auth/login`
Log in with email and password.

**Body:**
```json
{ "email": "addy@test.com", "password": "123456" }
```

**Response `200`:** Sets JWT cookie, returns user object.

---

### `POST /auth/logout`
Clears the JWT cookie. No body required.

---

### `GET /auth/me`
🔒 Requires auth. Returns the currently logged-in user's fresh data from the database.

---

### `GET /auth/google`
Redirects to Google's OAuth consent screen.

### `GET /auth/google/callback`
Google redirects here after login. Sets JWT cookie, redirects to frontend dashboard.

---

## Stocks

### `GET /stocks`
🔒 Requires auth. Returns all stocks, optionally filtered by search.

**Query params:** `?search=apple` (optional, matches ticker or name, case-insensitive)

---

### `GET /stocks/:ticker`
🔒 Requires auth. Returns a single stock by ticker (e.g. `/stocks/AAPL`).

---

## Orders

### `POST /orders/buy`
🔒 Requires auth. Executes a buy order inside an atomic database transaction.

**Body:**
```json
{ "ticker": "AAPL", "quantity": 5 }
```

**Validation:** quantity must be a positive whole number. Checks user has sufficient balance.

---

### `POST /orders/sell`
🔒 Requires auth. Executes a sell order.

**Body:**
```json
{ "ticker": "AAPL", "quantity": 5 }
```

**Validation:** checks user owns enough shares to sell.

---

## Portfolio

### `GET /portfolio`
🔒 Requires auth. Returns the logged-in user's current holdings with live P&L calculated via a SQL JOIN between `portfolio` and `stocks`.

---

## Transactions

### `GET /transactions`
🔒 Requires auth. Returns the logged-in user's full transaction history, most recent first.

---

## Admin

All admin routes require both authentication AND the `ADMIN` role (`authorize('ADMIN')` middleware). Regular traders receive a `403 Forbidden`.

### `GET /admin/users`
🔒 Admin only. Returns all registered users.

### `PATCH /admin/users/:userId/toggle-status`
🔒 Admin only. Suspends or unsuspends a user (flips `is_active`).

### `GET /admin/stats`
🔒 Admin only. Returns platform-wide statistics.

**Response `200`:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 2,
    "activeUsers": 2,
    "suspendedUsers": 0,
    "totalStocks": 13,
    "totalTrades": 11
  }
}
```

### `POST /admin/stocks`
🔒 Admin only. Adds a new stock to the platform. Automatically subscribes the ticker to the live price feed.

**Body:**
```json
{ "ticker": "NFLX", "name": "Netflix Inc.", "sector": "Entertainment", "price": 450 }
```

**Validation:** ticker must be 1-5 letters, price must be positive.

### `DELETE /admin/stocks/:stockId`
🔒 Admin only. Removes a stock from the platform.

**Validation:** blocks deletion if any user currently holds shares of this stock (checked against the `portfolio` table), to prevent silently wiping out user positions via the `ON DELETE CASCADE` relationship.

**Response `400` (if blocked):**
```json
{ "success": false, "error": "Cannot remove stock — 2 user(s) currently hold shares of it" }
```
---

## WebSocket Events

Connected via Socket.io at the same base URL.

### `priceUpdate` (server → client)
Broadcast whenever a stock's price changes.

```json
{ "ticker": "AAPL", "price": 195.32 }
```

Sent to all connected clients on every Finnhub trade tick, and individually to a client immediately after they connect (using cached prices from Redis). The subscribed ticker list is read dynamically from the database on server startup, and any stock added via the admin panel is automatically subscribed to the live feed without requiring a server restart.

---

## Error Format

All errors follow this shape:

```json
{ "success": false, "error": "Human-readable error message" }
```

Common status codes: `400` (validation), `401` (not logged in), `403` (wrong role), `404` (not found), `409` (conflict, e.g. duplicate email).