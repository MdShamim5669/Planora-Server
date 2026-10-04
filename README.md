# Planora Server (Backend API)

RESTful API backend for the **Planora** event management platform, built with Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, and SSLCommerz payment integration.

---

## Features

- **JWT Authentication & RBAC**: Secure authentication using HS256 JWTs and bcryptjs password hashing. Supports `USER` and `ADMIN` roles.
- **Event Management**: Support for 4 event categories:
  - Public Free
  - Public Paid
  - Private Free
  - Private Paid
- **Host Moderation**: Event hosts have granular controls to approve, reject, or ban attendees.
- **Invitations**: Direct invite-by-email system with acceptance/payment flows.
- **Payment Processing**: Full integration with SSLCommerz hosted checkout, including IPN server notifications, callback verification, and transaction idempotency.
- **Ratings & Reviews**: Attendee reviews with 7-day edit/delete window after event start date.
- **Admin Dashboard**: Platform-wide monitoring, event curation (Featured event), and user moderation.

---

## Tech Stack

- **Runtime & Language**: Node.js 20+ LTS, TypeScript
- **Web Framework**: Express.js
- **Database & ORM**: PostgreSQL 15+, Prisma ORM
- **Authentication**: JWT (`jsonwebtoken`), `bcryptjs`
- **Validation**: Zod
- **Security**: Helmet, CORS, Express Rate Limit
- **Payment Gateway**: SSLCommerz

---

## Getting Started

### 1. Prerequisites

- Node.js 20.x or higher
- PostgreSQL instance running locally or on a cloud provider (e.g., Neon, Supabase)

### 2. Installation

```bash
cd Backend
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/planora_db` |
| `PORT` | API HTTP port | `5000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `JWT_SECRET` | Signing secret (min 32 chars) | Random 32+ string |
| `JWT_EXPIRES_IN` | Token validity | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `SERVER_URL` | Backend URL for callbacks | `http://localhost:5000` |
| `SSLCZ_STORE_ID` | SSLCommerz Store ID | Sandbox store ID |
| `SSLCZ_STORE_PASSWORD` | SSLCommerz Store Password | Sandbox store password |
| `SSLCZ_IS_LIVE` | Live vs Sandbox mode | `false` |
| `ADMIN_NAME` | Initial Admin display name | `System Admin` |
| `ADMIN_EMAIL` | Initial Admin email | `admin@planora.com` |
| `ADMIN_PASSWORD` | Initial Admin password | `AdminPassword123` |

### 4. Database Migration & Seeding

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the initial admin account
npm run prisma:seed
```

### 5. Running the Server

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## API Endpoints Reference

All endpoints are prefixed with `/api/v1`:

| Module | Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Public | Register new user |
| | `POST` | `/auth/login` | Public | Log in user and receive JWT |
| | `GET` | `/auth/me` | User | Get current user profile |
| **Users** | `PATCH` | `/users/me` | User | Update name and phone |
| | `PATCH` | `/users/me/notifications` | User | Toggle notification preferences |
| **Events** | `GET` | `/events` | Optional | Search, filter, and paginate events |
| | `GET` | `/events/featured` | Public | Get featured / nearest upcoming event |
| | `GET` | `/events/upcoming` | Public | Get up to 9 upcoming public events |
| | `GET` | `/events/mine` | User | List events created by user |
| | `GET` | `/events/:id` | Optional | Get event details with viewer context |
| | `POST` | `/events` | User | Create a new event |
| | `PATCH` | `/events/:id` | Owner | Update event (fee/visibility locked if joined) |
| | `DELETE` | `/events/:id` | Owner / Admin | Delete an event |
| **Participations** | `POST` | `/events/:id/join` | User | Join free event (Public: approved, Private: pending) |
| | `GET` | `/events/:id/participants` | Owner | List participants for event |
| | `PATCH` | `/participations/:id/approve` | Owner | Approve pending request |
| | `PATCH` | `/participations/:id/reject` | Owner | Reject pending request |
| | `PATCH` | `/participations/:id/ban` | Owner | Ban participant |
| | `GET` | `/participations/mine` | User | List user's joined/requested events |
| **Invitations** | `POST` | `/events/:id/invitations` | Owner | Send invitation by email |
| | `GET` | `/events/:id/invitations` | Owner | List event invitations |
| | `GET` | `/invitations/mine` | User | List pending invitations for user |
| | `POST` | `/invitations/:id/accept` | User | Accept invitation (free events only) |
| | `POST` | `/invitations/:id/decline` | User | Decline invitation |
| **Payments** | `POST` | `/payments/init` | User | Initialize SSLCommerz payment session |
| | `POST` | `/payments/success` | Gateway | Browser POST success callback |
| | `POST` | `/payments/fail` | Gateway | Browser POST failure callback |
| | `POST` | `/payments/cancel` | Gateway | Browser POST cancel callback |
| | `POST` | `/payments/ipn` | Gateway | Server IPN notification |
| | `GET` | `/payments/mine` | User | User's payment history |
| **Reviews** | `GET` | `/events/:id/reviews` | Public | List reviews with average rating |
| | `POST` | `/events/:id/reviews` | User | Post review (approved attendee, past start date) |
| | `PATCH` | `/reviews/:id` | Author | Update review (within 7 days) |
| | `DELETE` | `/reviews/:id` | Author | Delete review (within 7 days) |
| | `GET` | `/reviews/mine` | User | List user's posted reviews |
| **Admin** | `GET` | `/admin/stats` | Admin | Overview statistics counts |
| | `GET` | `/admin/events` | Admin | List all events across platform |
| | `GET` | `/admin/users` | Admin | List all users across platform |
| | `DELETE` | `/admin/events/:id` | Admin | Delete any inappropriate event |
| | `DELETE` | `/admin/users/:id` | Admin | Delete user account |
| | `PATCH` | `/admin/events/:id/feature` | Admin | Set/unset featured public event |
