# Carflex - Automobile Subscription Platform

## Overview

Carflex is a web-based automobile subscription platform that enables customers to subscribe to flexible monthly or annual car subscription plans. The platform offers three tiers (Budget, Midrange, and Luxury) and provides features like vehicle swapping, mileage tracking, and comprehensive insurance coverage without long-term ownership commitments.

The application is built as a full-stack TypeScript application with a React frontend and Express backend, designed for deployment on VPS infrastructure with enterprise-grade security measures.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18+ with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design system

**Design System:**
- Premium automotive aesthetic inspired by Tesla, Porsche/BMW digital services
- Custom theme with HSL color variables supporting light/dark modes
- Typography hierarchy using Inter/Poppins fonts
- Sophisticated component variants with elevation states (hover/active)
- Responsive grid system with generous whitespace

**State Management:**
- AuthContext for global authentication state (user, token, login/logout handlers)
- React Query for API data fetching, caching, and mutations
- Local state management with React hooks for component-level state

**Key Pages:**
- Public: Home, Packs (subscription plans), About, Contact
- Authentication: Login/Register combined page
- Protected: User Dashboard (subscription management, profile, payment history)
- Admin: Dashboard (statistics), Users, Subscriptions, Packs management

### Backend Architecture

**Technology Stack:**
- Node.js with Express framework
- TypeScript for type safety across frontend and backend
- Drizzle ORM for database operations
- Neon serverless PostgreSQL driver with WebSocket support

**API Design:**
- RESTful API structure with resource-based routing
- Bearer token authentication using JWT
- Role-based access control (user/admin roles)
- Modular route organization

**Security Layer (Multi-tier):**
- HTTP security headers via Helmet.js (CSP, HSTS, X-Frame-Options, etc.)
- Three-tier rate limiting:
  - Auth endpoints: 5 requests per 15 minutes
  - General API: 100 requests per 15 minutes  
  - Admin endpoints: 50 requests per 15 minutes
- Input sanitization and validation with Zod schemas
- Password strength requirements and suspicious pattern detection
- CORS configuration with credential support
- Request size limits to prevent DoS attacks

**Authentication & Authorization:**
- JWT-based authentication with 7-day token expiration
- bcrypt for password hashing
- Middleware chain: authMiddleware → adminMiddleware for protected routes
- Token stored in localStorage on client, validated on each request
- Automatic login after successful registration

**Data Access Layer:**
- Storage abstraction layer (`storage.ts`) providing clean interface to database operations
- Drizzle ORM for type-safe database queries
- Transaction support for complex operations

### Database Design

**Schema (PostgreSQL):**

**users table:**
- Stores user accounts with email/password authentication
- Tracks role (user/admin) for authorization
- Stores Stripe customer/subscription IDs for payment integration
- Fields: id (UUID), email, password (hashed), name, phone, address, role, stripeCustomerId, stripeSubscriptionId, createdAt

**packs table:**
- Defines subscription plan offerings
- Supports monthly and yearly pricing tiers
- Configurable mileage limits and features array
- Fields: id (UUID), name, subtitle, priceMonthly, priceYearly, mileageLimit, features (text array), isPopular, createdAt

**subscriptions table:**
- Links users to their active subscription packs
- Tracks subscription lifecycle (status, dates, mileage)
- Vehicle assignment tracking
- Fields: id (UUID), userId (FK), packId (FK), status, billingPeriod, vehicle, mileageUsed, startDate, nextBillingDate, endDate, createdAt

**payments table:**
- Payment transaction history
- Links to both subscriptions and users
- Fields: id (UUID), subscriptionId (FK), userId (FK), amount, stripePaymentIntentId, status, paidAt, createdAt

**Relations:**
- users → subscriptions (one-to-many)
- packs → subscriptions (one-to-many)
- subscriptions → payments (one-to-many)
- Cascade deletes on user/subscription deletion

### External Dependencies

**Payment Processing:**
- Stripe SDK integration for subscription billing (fully implemented)
- Client: @stripe/stripe-js and @stripe/react-stripe-js
- Stripe Checkout Sessions for secure payment processing with credit card and Apple Pay
- Webhook endpoint (/api/webhooks/stripe) with signature verification for event handling
- Idempotent webhook processing prevents duplicate subscriptions and payments
- Supports: checkout.session.completed, invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted
- Customer and subscription ID storage in user records for webhook reconciliation
- Raw body preservation for webhook signature verification

**Email Services:**
- Planned integration for transactional emails (subscription updates, payment receipts)

**Database:**
- Neon serverless PostgreSQL with WebSocket pooling
- Connection pooling via @neondatabase/serverless
- Drizzle Kit for schema migrations

**Security & Infrastructure:**
- Helmet.js for HTTP security headers
- express-rate-limit for API rate limiting
- bcryptjs for password hashing
- jsonwebtoken for JWT creation/verification
- CORS middleware for cross-origin request handling

**UI Component Libraries:**
- Radix UI primitives (26+ components: dialog, dropdown, accordion, etc.)
- Class Variance Authority for component variant management
- Tailwind CSS with PostCSS/Autoprefixer
- Lucide React for icons
- React Icons for brand icons (Stripe, social media)

**Development Tools:**
- Vite with runtime error overlay and development plugins
- TSX for TypeScript execution in development
- ESBuild for production builds
- Drizzle Kit for database management
- Zod for runtime schema validation

## Deployment Configuration

### Environment Detection

The application automatically detects the environment using:
- **Development**: Neither `REPLIT_DEPLOYMENT` nor `NODE_ENV` set to production values
- **Production**: `REPLIT_DEPLOYMENT=1` (automatically set by Replit) **OR** `NODE_ENV=production` (set by Replit Autoscale)

**Important**: The code checks BOTH variables for maximum compatibility across all Replit deployment types (Autoscale and Reserved VM).

In development mode, the server uses Vite middleware for hot module replacement.
In production mode, the server serves static files from the `dist` directory built by Vite.

### Required Environment Variables (Production)

**Database:**
- `DATABASE_URL` - PostgreSQL connection string (Neon serverless)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Individual PostgreSQL credentials

**Authentication:**
- `SESSION_SECRET` - JWT signing secret (minimum 32 characters)


**Stripe (Payment Processing):**
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_live_... for production)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret (whsec_...)
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key (pk_live_... for production)

**Application:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (production/development)
- `REPLIT_DEPLOYMENT` - Automatically set to "1" by Replit in production

### Deployment Process

1. **Build Command**: `npm run build`
   - Builds frontend with Vite → `dist/assets`
   - Bundles backend with esbuild → `dist/index.js`

2. **Start Command**: `npm run start`
   - Runs `NODE_ENV=production node dist/index.js`
   - Detects production via `REPLIT_DEPLOYMENT=1` or `NODE_ENV=production`
   - Serves static files from `dist` directory

3. **Environment Variables**: Configured in Replit Secrets for production deployment

### CORS Configuration

- **Development**: Allows localhost:5000 and 127.0.0.1:5000
- **Production**: Allows all origins (Replit handles domain routing)

### Security Headers (Helmet.js)

Applied in all environments:
- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS) with preload
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Additional security headers for XSS protection