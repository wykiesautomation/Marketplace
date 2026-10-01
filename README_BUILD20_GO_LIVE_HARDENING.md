# Software Tools Marketplace - Build20 Go-Live Hardening

Build20 adds go-live hardening on top of Build19:

- Real seller product listing submission.
- Admin product approval/rejection.
- PayFast ITN validation helper and diagnostics.
- Terms, privacy and refund policy pages.
- GitHub-safe `.gitignore`.
- Basic security headers and rate-limit shell.
- 5% platform fee and seller payout ledger retained.

## Run

```bash
npm install
npm run db:verify
npm run storage:audit
npm run payfast:test
npm start
```

Open:

```text
http://localhost:3000
```

## Public launch readiness

This is suitable for controlled launch testing. Before public launch, configure real `.env`, real PayFast merchant details and test ITN callbacks from an externally reachable HTTPS URL.
