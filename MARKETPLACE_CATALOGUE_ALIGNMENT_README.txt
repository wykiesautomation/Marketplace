MARKETPLACE CATALOGUE ALIGNMENT - BUILD 27

Updated the Marketplace catalogue price and customer-facing description fields to match the owner-supplied Wykies Automation public catalogue.

Production files aligned:
- data/db.json
- db.json
- app.js embedded catalogue
- api-client.js fallback catalogue

VisionEdge retains the customer-facing price prefix "From". All other listed products use fixed once-off catalogue prices as displayed in the supplied public catalogue.

After deployment, hard-refresh products.html and spot-check product detail and checkout amounts before accepting live payments.
