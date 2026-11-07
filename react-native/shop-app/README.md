# shop-app — Shubham Super Shopee (customer)

React Native (Expo 58 / RN 0.88) storefront for Shubham Super Shopee, Pune.
Ported from the Next.js web storefront (`shop/` in the hybrid repo).

## Screens

- **Home** — hero, search, category chips, Deal of the Day (IST-rotating), product grid
- **Product** — photo, price sticker, perks, description, reviews, buy box
- **Cart** — steppers, free-delivery progress, coupons, summary
- **Checkout** — delivery form (validated), COD / UPI (UPI intent deep-link), coupon
- **Order confirm** — order number, tracker, items, totals, address
- **Orders** — lookup by order number + local order history
- **Settings** — language, live API base URL, store info

## Data modes

- **DEMO** (default): bundled 16-product catalog, local orders. Fully offline.
- **LIVE**: Settings → "Live store API" → your deployed storefront URL
  (e.g. `https://shubham-super-shopee.vercel.app`). Uses the same REST API
  as the website. The cart session cookie is managed by the app.

## i18n

One-click EN ↔ मराठी (header pill on Home, or Settings). Same dictionary +
grocery glossary as the web storefront (`src/lib/i18n.ts`, `src/lib/glossary.ts`);
fonts swap to Noto Sans Devanagari automatically in Marathi mode.

## QA (2026-11-06, Expo Web + headless browser)

Home/browse/search/categories ✓, product detail + reviews ✓, add to cart ✓,
coupon reject (FIRST50 < ₹499) ✓, coupon apply (FREESHIP) ✓, cart → checkout
carry-over ✓, COD order placed (SSS-20261106-…) ✓, order history ✓, EN↔MR
whole-site flip + reload persistence ✓, product-name glossary translation ✓,
unit translation ✓, placeholder audit (27 interpolated keys) ✓.
