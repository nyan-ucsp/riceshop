## Future plan and roadmap

### Short-term (0–4 weeks)
- **Stabilize and harden backend**
  - Add request validation (e.g., Zod/Joi) for all `/api/*` routes
  - Enforce auth middleware on admin CRUD routes consistently; add role-based checks
  - Add pagination/sorting/filtering for `GET /api/products` and `GET /api/orders`
  - Introduce rate limiting and CORS hardening; helmet for secure headers
- **Improve ordering flow**
  - Persist carts server-side with IDs; recover cart on reload
  - Add order status timeline (created → confirmed → packed → shipped → delivered)
  - Support order cancellation window prior to confirmation
- **Email deliverability**
  - Switch to a provider (SendGrid/SES) with domain DKIM/SPF; add retries/backoff via a queue
  - Add email logs table and admin email log viewer
- **Internationalization**
  - Centralize language detection precedence (header → preference → default)
  - Ensure currency/date/number formatting per locale; MMK formatting everywhere
- **Admin UX**
  - Bulk product upload via CSV with validation and dry-run
  - Product image optimization and S3 + CDN offload for `/uploads`
- **Quality and tests**
  - Unit tests for email service, OTP flow, and analytics aggregation
  - E2E happy-path for purchase → OTP → confirm → delivery email (Cypress/Playwright)

### Mid-term (1–3 months)
- **Customer accounts (optional)**
  - Email + OTP login, view order history, reorder, address book
  - Guest checkout remains supported
- **Payments and checkout**
  - Integrate payment provider(s); support COD and prepaid
  - Compute totals with discounts, delivery fees, coupons, and tax
- **Inventory & catalog**
  - Stock tracking, reservations during checkout, low-stock alerts
  - Product categories, tags, search, and SEO-friendly URLs
  - Variants (size/weight), price history, cost margins in analytics
- **Admin roles and auditing**
  - RBAC: Owner, Manager, Support
  - Audit log for sensitive admin actions (user mgmt, price changes)
- **Observability**
  - Structured logging, request IDs, error tracking (Sentry)
  - Metrics dashboards (Prometheus/Grafana or provider equivalent)
- **Performance**
  - Server-side caching (e.g., Redis) for product lists and analytics
  - Image processing pipeline; WebP/AVIF; lazy loading on frontend
- **CI/CD and environments**
  - Automated tests on PRs, preview deployments, lint/type checks
  - Containerize backend; one-click deploy to staging/prod

### Long-term (3–6+ months)
- **Mobile and PWA**
  - Full PWA: offline cart, push notifications for order status
  - Optional React Native/Flutter lightweight app
- **Advanced analytics**
  - Cohort analysis, repeat purchase rate, LTV, abandoned checkout
  - Profit analytics using `cost` field; exportable reports (CSV/PDF)
- **Personalization and marketing**
  - Recommended products, cross-sell/upsell
  - Campaign emails/SMS (opt-in) with segmentation by locale and behavior
- **Scalability and resilience**
  - Job queues for emails/notifications; idempotent workers
  - Blue/green or canary deployments, automated DB backups/restore drills
- **Compliance and security**
  - Data retention policy, PII minimization, consent management
  - 2FA for admins, password rotation policies, secrets manager
  - Regular dependency and vulnerability scans

### Quick wins to do next
- **Add pagination** to `GET /api/orders` and `GET /api/products`
- **Install helmet and rate limiter**; tighten CORS to known frontends
- **Move uploads to S3** with signed URLs + CDN
- **Introduce a queue** (BullMQ) for emails and OTP sending
- **Add Cypress/Playwright E2E** for the purchase + OTP flow
