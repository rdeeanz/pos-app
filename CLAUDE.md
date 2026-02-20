# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
npm run dev              # Start development server at http://localhost:3000
npm run build            # Build for production (includes prisma generate)
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run db:up            # Start PostgreSQL via Docker (port 15432)
npm run db:down          # Stop database
npm run db:reset         # Reset database (WARNING: destroys data)
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create and apply database migration
npm run prisma:studio    # Open Prisma Studio GUI at http://localhost:5555
npm run prisma:seed      # Seed database with initial data
```

## Architecture Overview

This is a Next.js 14 Point of Sale application with a **layered architecture**:

```
app/                          # Next.js App Router
├── (auth)/                   # Authentication pages (login, register)
├── (dashboard)/              # Admin dashboard pages
├── (pos)/                    # Cashier/POS interface
└── api/                      # API routes

src/
├── api/                      # API Layer
│   ├── controllers/          # Request handlers (auth, product, sale, user, receiptTemplate)
│   ├── middlewares/          # auth, cacheControl, errorHandler, logger
│   └── validators/           # Zod validation schemas
├── domain/                   # Business Logic Layer
│   ├── auth/                 # Authentication service
│   ├── sales/                # Sale processing, daily/periodic reports
│   ├── products/             # Product management (admin, read-only)
│   ├── payments/             # Cash, QRIS payment services
│   ├── dashboard/            # Dashboard analytics
│   └── webhooks/             # Midtrans webhook handling
├── data/                     # Data Layer
│   ├── repositories/         # Data access (product, sale, user)
│   ├── providers/midtrans/   # Midtrans client
│   └── prisma/client.js      # Prisma client singleton
├── lib/                      # Utilities
│   ├── auth/                 # JWT/cookie handling
│   ├── cache/                # Cache invalidation
│   ├── errors/               # AppError, errorCodes, toHttpResponse
│   ├── images/               # Image optimization
│   ├── storage/              # Supabase storage
│   └── utils/                # CSV export, helpers
└── ui/                       # UI Components
    ├── components/           # Reusable UI components
    ├── pages/                # Page components
    └── utils/                # UI utilities
```

## Key Patterns

### API Route Middleware Pattern
All API routes use middleware composition:
```javascript
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const handler = withErrorHandler(withLogger(loginHandler));
export async function POST(req, ctx) {
  return handler(req, ctx);
}
```

### Error Handling
Use the custom `AppError` class from `src/lib/errors/AppError.js`:
```javascript
import { AppError } from "@/lib/errors/AppError.js";
import { ERROR_CODES } from "@/lib/errors/errorCodes.js";

throw new AppError(ERROR_CODES.VALIDATION_ERROR, "message", 400, details);
```

### Domain Services
Business logic lives in `src/domain/`. For example:
- `src/domain/sales/sale.service.js` - Sale creation, reports, pagination
- `src/domain/auth/auth.service.js` - Login, password changes
- `src/domain/payments/` - Cash and QRIS payment processing

### Repository Pattern
Data access is abstracted through repositories in `src/data/repositories/`:
- `product.repo.js` / `productRead.repo.js`
- `sale.repo.js` / `saleRead.repo.js` / `saleQuery.repo.js`
- `user.repo.js`

## Database

- **PostgreSQL 15** via Docker (port 15432)
- **Prisma schema**: `prisma/schema.prisma`
- **Prisma client output**: `src/generated/prisma/`
- **Seed script**: `prisma/seed.js`

### Key Models
- `User` - Role-based access (OWNER, OPS, CASHIER)
- `Product` - With categories, SKUs, barcodes, pricing
- `Inventory` - Stock tracking (qtyOnHand)
- `Sale` / `SaleItem` - Transactions with line items
- `Payment` - CASH or QRIS methods
- `StockMovement` - Inventory history (SALE, ADJUSTMENT, RESTOCK, REFUND)
- `ReceiptTemplate` - Customizable receipt configuration

## Default Accounts (Development)

```
Owner:   damee@png.id / password123
Cashier: cashier@local.test / password123
```

## Important Notes

- **JavaScript, not TypeScript** - The codebase uses `.js` files
- **No Prisma in browser** - Only use Prisma Client in Server Components, API routes, or Server Actions
- **Indonesian locale** - Dates use `toLocaleDateString("id-ID", ...)` for formatting
- **Role-based access** - OWNER has full access, CASHIER limited to POS operations
