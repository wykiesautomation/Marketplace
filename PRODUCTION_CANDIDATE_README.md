# Marketplace Production Candidate 1

## Completed in this pack
- Secure cookie sessions with scrypt password hashing for new seller accounts.
- Demo identity headers removed from browser scripts.
- Stronger security headers, origin checks and login rate limiting.
- Real approved-package download streaming with expiry and download limits.
- Public catalogue verified with 17 active products and existing images.
- Stronger public trust, seller acquisition and marketplace calls to action.

## Mandatory go-live gates
1. Set every value in `env.production.example` through the hosting secret manager.
2. Replace seed users with real admin and seller accounts using scrypt hashes.
3. Attach persistent storage and set `DB_JSON_FILE` to the mounted volume.
4. Test PayFast live ITN from the public HTTPS domain before accepting money.
5. Perform admin, seller, upload, approval, payment and download acceptance tests.
6. Review Terms, Privacy and Refund wording for the operating business.

Do not enable unrestricted public payments until all six gates pass.
