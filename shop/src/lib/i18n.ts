/**
 * i18n core — one-click Marathi for the whole storefront (v0.12).
 *
 * Design:
 *  - Two locales: "en" (default) and "mr" (Marathi).
 *  - The ACTIVE locale lives in a cookie (`sss_locale`) so the SERVER can
 *    render Marathi directly (no English flash on hard reload, no hydration
 *    mismatch — server HTML and the first client render read the same prop).
 *  - Static UI chrome strings live in `DICT` below; DB-driven strings
 *    (product names, categories, units) flow through the /api/translate
 *    LLM endpoint + the client glossary in `src/lib/mr-names.ts`.
 *  - Festive theme copy (per festival) lives in `FESTIVE_MR`.
 *
 * This module is PURE (no React, no server-only imports) — safe on both
 * the server (layout) and in client components.
 */

import type { FestiveTheme } from "./festive";

export type Locale = "en" | "mr";

/** Cookie that carries the locale between requests. */
export const LOCALE_COOKIE = "sss_locale";

/** Read the locale from a cookie-store style getter (server layouts). */
export function localeFromCookieValue(value?: string | null): Locale {
  return value === "mr" ? "mr" : "en";
}

/* ------------------------------------------------------------------ */
/* Dictionary                                                          */
/* ------------------------------------------------------------------ */

type Entry = { en: string; mr: string };

export const DICT: Record<string, Entry> = {
  /* ── Shell ─────────────────────────────────────────────────────── */
  "skip.content": { en: "Skip to content", mr: "मजकुराकडे जा" },
  "loader.aria": { en: "Opening the store", mr: "दुकान उघडत आहे" },
  "lang.toggle-aria-en": {
    en: "Switch the whole site to Marathi",
    mr: "संपूर्ण साइट मराठीत बदला",
  },
  "lang.toggle-aria-mr": {
    en: "Switch the whole site to English",
    mr: "संपूर्ण साइट इंग्रजीत बदला",
  },

  /* ── Header ────────────────────────────────────────────────────── */
  "header.search-placeholder": {
    en: "Search atta, milk, soap…",
    mr: "अट्टा, दूध, साबण शोधा…",
  },
  "header.search-aria": { en: "Search products", mr: "उत्पादने शोधा" },
  "nav.shop": { en: "Shop", mr: "दुकान" },
  "nav.deal": { en: "Deal", mr: "ऑफर" },
  "nav.why-us": { en: "Why us", mr: "आम्ही का" },
  "header.basket": { en: "Basket", mr: "टोपली" },
  "header.basket-aria": { en: "Basket", mr: "टोपली" },
  "header.basket-items": {
    en: "items",
    mr: "वस्तू",
  },
  "header.home-aria": {
    en: " — home",
    mr: " — मुख्यपृष्ठ",
  },

  /* ── Mobile nav ────────────────────────────────────────────────── */
  "mnav.home": { en: "Home", mr: "मुख्यपृष्ठ" },
  "mnav.shop": { en: "Shop", mr: "दुकान" },
  "mnav.cart": { en: "Cart", mr: "गाडी" },
  "mnav.primary": { en: "Primary", mr: "मुख्य" },
  "mnav.cart-items": { en: "items in cart", mr: "वस्तू गाडीत" },

  /* ── Home · hero ───────────────────────────────────────────────── */
  "hero.kicker": { en: "Groceries · Pune · 2 hours", mr: "किराणा · पुणे · 2 तास" },
  "hero.line1": { en: "Fresh.", mr: "ताजे." },
  "hero.line2": { en: "Fast.", mr: "झटपट." },
  "hero.line3a": { en: "To your", mr: "तुमच्या" },
  "hero.line3b": { en: "door.", mr: "दारात." },
  "hero.subline": {
    en: "{name} stocks the shelves from the mandi every morning. Groceries at your door in about 2 hours. Pay by COD or UPI.",
    mr: "{name} रोज सकाळी मंडईतून फळ्या भरते. सुमारे 2 तासांत किराणा तुमच्या दारात. COD किंवा UPI ने पेमेंट करा.",
  },
  "hero.cta-shop": { en: "Shop the shelf", mr: "खरेदी सुरू करा" },
  "hero.cta-deal": { en: "Today’s deal", mr: "आजची ऑफर" },
  "hero.badge": { en: "On the counter", mr: "काउंटरवर" },
  "hero.badge-today": { en: "Today", mr: "आज" },
  "hero.sticker": { en: "FRESH · 2 HRS", mr: "ताजे · 2 तास" },
  "hero.img-alt": {
    en: "Fresh stock at {name}, Pune",
    mr: "{name}, पुणे — ताजा माल",
  },
  "hero.fest-alt": {
    en: "{festival} essentials at {name}",
    mr: "{name} — {festival} साठा",
  },

  /* ── Home · marquee ────────────────────────────────────────────── */
  "marquee.1": { en: "Mandi fresh every morning", mr: "रोज सकाळी मंडईतले ताजे" },
  "marquee.2": {
    en: "2-hour delivery across Pune",
    mr: "संपूर्ण पुण्यात 2 तासांत डिलिव्हरी",
  },
  "marquee.3": { en: "COD & UPI accepted", mr: "COD आणि UPI स्वीकारले जाते" },
  "marquee.4": { en: "Open 7 AM to 10 PM", mr: "सकाळी 7 ते रात्री 10" },

  /* ── Home · categories ─────────────────────────────────────────── */
  "home.stalls-title": { en: "The stalls", mr: "आमच्या गाद्या" },
  "home.items-in-store": {
    en: "{n} ITEMS IN STORE",
    mr: "दुकानात {n} वस्तू",
  },
  "home.shop-category": { en: "Shop {cat}", mr: "{cat} खरेदी करा" },

  /* ── Home · deal ───────────────────────────────────────────────── */
  "deal.kicker": { en: "Today’s deal", mr: "आजची ऑफर" },
  "deal.ends-in": { en: "ENDS IN", mr: "संपत आहे" },
  "deal.ends-aria": {
    en: "Time remaining for today’s deal",
    mr: "आजच्या ऑफरसाठी उरलेला वेळ",
  },
  "deal.off": { en: "% off", mr: "% सूट" },
  "countdown.hrs": { en: "hrs", mr: "तास" },
  "countdown.min": { en: "min", mr: "मिनि" },
  "countdown.sec": { en: "sec", mr: "सेक" },
  "deal.add": { en: "Add to basket", mr: "टोपलीत टाका" },
  "deal.added": { en: "Added", mr: "जोडले" },

  /* ── Home · featured + shelf ───────────────────────────────────── */
  "home.picks-title": { en: "Counter picks", mr: "काउंटरवरील निवड" },
  "home.picks-sub": {
    en: "Everything on the shelf",
    mr: "फळीवरील सर्व वस्तू",
  },
  "home.shelf-title": { en: "The whole shelf", mr: "संपूर्ण फळी" },
  "home.clear-filters": { en: "CLEAR FILTERS", mr: "फिल्टर काढा" },
  "home.empty-title": {
    en: "Nothing on this shelf",
    mr: "या फळीवर काही नाही",
  },
  "home.empty-sub": {
    en: "Try another category or clear the search.",
    mr: "दुसरी श्रेणी निवडा किंवा शोध पुसा.",
  },
  "home.error-title": { en: "The shelves are empty", mr: "फळ्या रिकाम्या आहेत" },
  "home.error-load": {
    en: "Failed to load products",
    mr: "उत्पादने लोड होऊ शकली नाहीत",
  },
  "home.try-again": { en: "Try again", mr: "पुन्हा प्रयत्न करा" },
  "home.loading-aria": {
    en: "Loading products",
    mr: "उत्पादने लोड होत आहेत",
  },

  /* ── Home · promise ────────────────────────────────────────────── */
  "promise.kicker": { en: "Why this store", mr: "आमचे दुकान का" },
  "promise.statement": {
    en: "A neighbourhood kirana that wakes before you do. The mandi run happens at dawn, the shelves are stacked by seven, and your basket reaches the door in about two hours.",
    mr: "तुमच्याआधी जागणारे शेजारचे किराणा दुकान. पहाटे मंडईतून माल येतो, सातच्या आत फळ्या भरतात, आणि सुमारे दोन तासांत तुमची टोपली दारात पोहोचते.",
  },
  "promise.stat-1": { en: "Doorstep, across Pune", mr: "दारात, संपूर्ण पुण्यात" },
  "promise.stat-2": { en: "AM to PM, every day", mr: "सकाळी ते रात्री, रोज" },
  "promise.stat-3": { en: "Or UPI, your call", mr: "किंवा UPI, तुमची इच्छा" },
  "promise.img-alt": {
    en: "Fresh produce on the counter at the store",
    mr: "दुकानात काउंटरवर ताजी भाजी आणि फळे",
  },

  /* ── Recently viewed ───────────────────────────────────────────── */
  "recent.title": { en: "Recently viewed", mr: "तुम्ही नुकतेच पाहिले" },
  "recent.sub": {
    en: "Pick up where you left off",
    mr: "जिथे सोडलं तिथून पुढे",
  },

  /* ── Festive strip ─────────────────────────────────────────────── */
  "festive.offers-aria": { en: "{festival} offers", mr: "{festival} ऑफर" },
  "festive.use-code": { en: "Use code {code}", mr: "कोड {code} वापरा" },
  "coupon.code-word": { en: "CODE", mr: "कोड" },

  /* ── Product card ──────────────────────────────────────────────── */
  "card.add": { en: "Add", mr: "जोडा" },
  "card.added": { en: "Added", mr: "जोडले" },
  "card.out-of-stock": { en: "OUT OF STOCK", mr: "स्टॉक नाही" },
  "card.add-aria": {
    en: "Add {name} to basket",
    mr: "{name} टोपलीत टाका",
  },

  /* ── Cart page ─────────────────────────────────────────────────── */
  "cart.title": { en: "Your Cart", mr: "तुमची गाडी" },
  "cart.continue": { en: "Continue shopping", mr: "खरेदी सुरू ठेवा" },
  "cart.loading": { en: "Loading your cart", mr: "तुमची गाडी लोड होत आहे" },
  "cart.empty-title": { en: "Your cart is empty", mr: "तुमची गाडी रिकामी आहे" },
  "cart.empty-sub": {
    en: "Browse our fresh products and add items to your cart.",
    mr: "आमची ताजी उत्पादने पाहा आणि गाडीत वस्तू टाका.",
  },
  "cart.start": { en: "Start Shopping", mr: "खरेदी सुरू करा" },
  "cart.unlock-more": {
    en: "Add {amount} more to unlock free delivery",
    mr: "मोफत डिलिव्हरीसाठी अजून {amount} च्या वस्तू टाका",
  },
  "cart.unlocked": {
    en: "You’ve unlocked free delivery",
    mr: "तुम्हाला मोफत डिलिव्हरी मिळाली आहे",
  },
  "cart.progress-aria": {
    en: "Free delivery progress",
    mr: "मोफत डिलिव्हरी प्रगती",
  },
  "cart.summary": { en: "Order Summary", mr: "ऑर्डर सारांश" },
  "cart.subtotal": { en: "Subtotal", mr: "उपएकूण" },
  "cart.delivery-fee": { en: "Delivery fee", mr: "डिलिव्हरी शुल्क" },
  "cart.free": { en: "FREE", mr: "मोफत" },
  "cart.total": { en: "Total", mr: "एकूण" },
  "cart.proceed": { en: "Proceed to Checkout", mr: "पुढे जा — पेमेंट" },
  "cart.pay-note": {
    en: "Pay by COD or UPI · Free delivery above ₹{n}",
    mr: "COD किंवा UPI · ₹{n} पेक्षा जास्तवर मोफत डिलिव्हरी",
  },
  "cart.checkout": { en: "Checkout", mr: "पेमेंट" },
  "cart.remove-aria": {
    en: "Remove {name} from cart",
    mr: "गाडीतून {name} काढून टाका",
  },

  /* ── Checkout ──────────────────────────────────────────────────── */
  "checkout.title": { en: "Checkout", mr: "पेमेंट" },
  "checkout.back": { en: "Back to cart", mr: "गाडीकडे परत" },
  "checkout.empty-title": { en: "Your cart is empty", mr: "तुमची गाडी रिकामी आहे" },
  "checkout.empty-sub": {
    en: "Add some products before checking out.",
    mr: "पेमेंट करण्यापूर्वी काही उत्पादने गाडीत टाका.",
  },
  "checkout.browse": { en: "Browse Products", mr: "उत्पादने पाहा" },
  "checkout.coupons": { en: "Coupon & Offers", mr: "कूपन आणि ऑफर" },
  "checkout.coupon-placeholder": { en: "Enter coupon code", mr: "कूपन कोड टाका" },
  "checkout.coupon-aria": { en: "Coupon code", mr: "कूपन कोड" },
  "checkout.apply": { en: "Apply", mr: "लागू करा" },
  "checkout.remove": { en: "Remove", mr: "काढा" },
  "checkout.applied": { en: "{code} applied", mr: "{code} लागू झाले" },
  "checkout.applied-save": { en: "you save", mr: "तुम्हाला वाचते" },
  "checkout.applied-freedelivery": { en: "+ free delivery", mr: "+ मोफत डिलिव्हरी" },
  "checkout.delivery-details": { en: "Delivery Details", mr: "डिलिव्हरी तपशील" },
  "checkout.delivery-note": {
    en: "We’ll deliver your order to this address.",
    mr: "तुमची ऑर्डर या पत्त्यावर डिलिव्हर होईल.",
  },
  "checkout.payment-method": { en: "Payment Method", mr: "पेमेंट पद्धत" },
  "checkout.payment-note": {
    en: "Choose how you’d like to pay.",
    mr: "पेमेंट कशाने करायची ते निवडा.",
  },
  "checkout.cod": { en: "Cash on Delivery", mr: "कॅश ऑन डिलिव्हरी" },
  "checkout.cod-sub": {
    en: "Pay in cash when your order arrives.",
    mr: "ऑर्डर आल्यावर रोख पैसे द्या.",
  },
  "checkout.upi": { en: "UPI Payment", mr: "UPI पेमेंट" },
  "checkout.upi-sub": {
    en: "Pay now using any UPI app.",
    mr: "आत्ता कोणत्याही UPI अ‍ॅपमधून पेमेंट करा.",
  },
  "checkout.scan": { en: "Scan to pay", mr: "स्कॅन करून पेमेंट करा" },
  "checkout.pay-to": { en: "Pay to UPI ID", mr: "या UPI आयडीवर पेमेंट करा" },
  "checkout.amount": { en: "Amount to pay:", mr: "देय रक्कम:" },
  "checkout.upi-note": {
    en: "Use order note as reference. Your order will be confirmed once payment is verified.",
    mr: "संदर्भासाठी ऑर्डर नोट वापरा. पेमेंट तपासल्यावर तुमची ऑर्डर पक्की होईल.",
  },
  "checkout.summary": { en: "Order Summary", mr: "ऑर्डर सारांश" },
  "checkout.coupon-line": { en: "Coupon ({code})", mr: "कूपन ({code})" },
  "checkout.place-order": { en: "Place Order", mr: "ऑर्डर द्या" },
  "checkout.placing": { en: "Placing order…", mr: "ऑर्डर दिली जात आहे…" },
  "checkout.secure": {
    en: "Secure checkout — your data is safe",
    mr: "सुरक्षित पेमेंट — तुमचा डेटा सुरक्षित",
  },
  "checkout.f-name": { en: "Full name *", mr: "पूर्ण नाव *" },
  "checkout.f-phone": { en: "Phone number *", mr: "फोन नंबर *" },
  "checkout.f-email": { en: "Email (optional)", mr: "ईमेल (ऐच्छिक)" },
  "checkout.f-address": { en: "Full address *", mr: "पूर्ण पत्ता *" },
  "checkout.f-city": { en: "City", mr: "शहर" },
  "checkout.f-pincode": { en: "Pincode *", mr: "पिनकोड *" },
  "checkout.f-notes": { en: "Order notes (optional)", mr: "ऑर्डर सूचना (ऐच्छिक)" },
  "checkout.p-name": { en: "e.g. Rahul Sharma", mr: "उदा. राहुल शर्मा" },
  "checkout.p-phone": { en: "10-digit mobile", mr: "10 अंकी मोबाईल" },
  "checkout.p-address": {
    en: "House no, building, street, area, landmark",
    mr: "घर क्रमांक, बिल्डिंग, रस्ता, परिसर, लॅंडमार्क",
  },
  "checkout.p-city": { en: "Pune", mr: "पुणे" },
  "checkout.p-notes": {
    en: "e.g. Leave at the door, call before delivery",
    mr: "उदा. दारात ठेवा, आणण्यापूर्वी कॉल करा",
  },
  /* validation + toasts */
  "v.name-required": { en: "Name is required", mr: "नाव आवश्यक आहे" },
  "v.phone-required": { en: "Phone is required", mr: "फोन नंबर आवश्यक आहे" },
  "v.phone-invalid": { en: "Enter a valid phone number", mr: "वैध फोन नंबर टाका" },
  "v.address-required": { en: "Address is required", mr: "पत्ता आवश्यक आहे" },
  "v.pin-required": { en: "Pincode is required", mr: "पिनकोड आवश्यक आहे" },
  "v.pin-invalid": {
    en: "Enter a valid 6-digit pincode",
    mr: "वैध 6 अंकी पिनकोड टाका",
  },
  "v.email-invalid": { en: "Enter a valid email", mr: "वैध ईमेल टाका" },
  "t.cart-empty": { en: "Your cart is empty", mr: "तुमची गाडी रिकामी आहे" },
  "t.fill-required": {
    en: "Please fill all required fields",
    mr: "कृपया सर्व आवश्यक माहिती भरा",
  },
  "t.place-failed": { en: "Failed to place order", mr: "ऑर्डर देता आली नाही" },
  "t.network": { en: "Network error — please try again", mr: "नेटवर्क त्रुटी — पुन्हा प्रयत्न करा" },
  "t.network-short": { en: "Network error", mr: "नेटवर्क त्रुटी" },
  /* coupon engine strings (lib/coupons reasons) */
  "c.enter-code": { en: "Enter a coupon code", mr: "कूपन कोड टाका" },
  "c.not-active": {
    en: "This coupon isn’t active right now",
    mr: "हे कूपन सध्या सक्रिय नाही",
  },
  "c.add-more": {
    en: "Add items worth {amount} more to use {code}",
    mr: "{code} वापरण्यासाठी अजून {amount} च्या वस्तू टाका",
  },
  "c.no-discount": {
    en: "Coupon gives no discount on this cart",
    mr: "या गाडीवर या कूपनाने सूट मिळत नाही",
  },
  "c.invalid": { en: "Invalid coupon", mr: "चुकीचे कूपन" },
  "c.desc-FIRST50": {
    en: "₹50 off orders above ₹499",
    mr: "₹499 पेक्षा जास्त ऑर्डरवर ₹50 सूट",
  },
  "c.desc-FREESHIP": {
    en: "Free delivery on orders above ₹199",
    mr: "₹199 पेक्षा जास्त ऑर्डरवर मोफत डिलिव्हरी",
  },

  /* ── Order confirmation ────────────────────────────────────────── */
  "order.placed": { en: "Order Placed!", mr: "ऑर्डर पक्की!" },
  "order.thanks": {
    en: "Thank you, {name}. We’ve received your order and will call you shortly to confirm.",
    mr: "धन्यवाद, {name}. तुमची ऑर्डर मिळाली आहे — पक्की करण्यासाठी आम्ही लवकरच कॉल करू.",
  },
  "order.number": { en: "Order number", mr: "ऑर्डर नंबर" },
  "order.copy": { en: "Copy order number", mr: "ऑर्डर नंबर कॉपी करा" },
  "order.eta": { en: "Estimated delivery: {date}", mr: "अपेक्षित डिलिव्हरी: {date}" },
  "order.confirm-call": {
    en: "Our team will call {phone} to confirm the delivery time.",
    mr: "डिलिव्हरीची वेळ पक्की करण्यासाठी आमची टीम {phone} वर कॉल करेल.",
  },
  "order.step-placed": { en: "Placed", mr: "दिली" },
  "order.step-confirmed": { en: "Confirmed", mr: "पक्की" },
  "order.step-ontheway": { en: "On the way", mr: "मार्गात" },
  "order.step-delivered": { en: "Delivered", mr: "पोहोचली" },
  "order.items": { en: "Items in your order", mr: "तुमच्या ऑर्डरमधील वस्तू" },
  "order.coupon-line": { en: "Coupon {code}", mr: "कूपन {code}" },
  "order.you-saved": {
    en: "You saved {amount} on this order",
    mr: "या ऑर्डरवर तुम्ही {amount} वाचवले",
  },
  "order.address": { en: "Delivery address", mr: "डिलिव्हरी पत्ता" },
  "order.payment": { en: "Payment", mr: "पेमेंट" },
  "order.upi-id": { en: "UPI ID:", mr: "UPI आयडी:" },
  "order.status": { en: "Status:", mr: "स्थिती:" },
  "order.order-status": { en: "Order status:", mr: "ऑर्डर स्थिती:" },
  "order.notes": { en: "Order notes", mr: "ऑर्डर सूचना" },
  "order.placed-on": { en: "Order placed on {date}", mr: "ऑर्डर दिल्याची तारीख: {date}" },
  "order.help": { en: "Need help? Call us at", mr: "मदत हवी? या नंबरवर कॉल करा" },
  "order.continue": { en: "Continue Shopping", mr: "खरेदी सुरू ठेवा" },
  "order.view-cart": { en: "View Cart", mr: "गाडी पाहा" },
  "st.PENDING": { en: "PENDING", mr: "प्रलंबी" },
  "st.CONFIRMED": { en: "CONFIRMED", mr: "पक्की" },
  "st.PAID": { en: "PAID", mr: "पेमेंट झाले" },
  "st.COD": { en: "COD", mr: "COD" },
  "st.PROCESSING": { en: "PROCESSING", mr: "सुरू आहे" },
  "st.SHIPPED": { en: "SHIPPED", mr: "पाठवले" },
  "st.DELIVERED": { en: "DELIVERED", mr: "पोहोचले" },
  "st.CANCELLED": { en: "CANCELLED", mr: "रद्द" },

  /* ── Product detail ────────────────────────────────────────────── */
  "pd.home": { en: "Home", mr: "मुख्यपृष्ठ" },
  "pd.off": { en: "OFF", mr: "सूट" },
  "pd.read-reviews": { en: "Read reviews", mr: "रीव्ह्ह्यू पाहा" },
  "pd.no-reviews-cta": {
    en: "No reviews yet — be the first to review!",
    mr: "अजून रीव्ह्ह्यू नाहीत — पहिले रीव्ह्ह्यू तुम्ही लिहा!",
  },
  "pd.save": { en: "Save {amount}", mr: "{amount} वाचवा" },
  "pd.tax-note": { en: "Price inclusive of all taxes", mr: "सर्व करांसह किंमत" },
  "pd.out-of-stock": { en: "Out of stock", mr: "स्टॉक नाही" },
  "pd.only-left": {
    en: "Only {n} left — order soon",
    mr: "फक्त {n} शिल्लक — लवकर ऑर्डर करा",
  },
  "pd.in-stock": { en: "In stock", mr: "स्टॉकमध्ये आहे" },
  "pd.add": { en: "Add to Cart", mr: "गाडीत टाका" },
  "pd.added": { en: "Added", mr: "जोडले" },
  "pd.buy-now": { en: "Buy Now", mr: "आता खरेदी करा" },
  "pd.perk-delivery": { en: "Free delivery ₹500+", mr: "₹500+ वर मोफत डिलिव्हरी" },
  "pd.perk-quality": { en: "Quality assured", mr: "गुणवत्तेची खात्री" },
  "pd.perk-returns": { en: "Easy returns", mr: "सुलभ परतावा" },
  "pd.description": { en: "Description", mr: "माहिती" },
  "pd.reviews": { en: "Reviews", mr: "रीव्ह्ह्यू" },
  "pd.review-count": { en: "{n} reviews", mr: "{n} रीव्ह्ह्यू" },
  "pd.review-count-one": { en: "{n} review", mr: "{n} रीव्ह्ह्यू" },
  "pd.based-on": { en: "Based on {n} reviews", mr: "{n} रीव्ह्ह्यूंच्या आधारे" },
  "pd.no-reviews": { en: "No reviews yet", mr: "अजून रीव्ह्ह्यू नाहीत" },
  "pd.write-review": { en: "Write a review", mr: "रीव्ह्ह्यू लिहा" },
  "pd.your-name": { en: "Your name", mr: "तुमचे नाव" },
  "pd.star": { en: "{n} star", mr: "{n} तारा" },
  "pd.share": {
    en: "Share your experience (optional)",
    mr: "तुमचा अनुभव लिहा (ऐच्छिक)",
  },
  "pd.cancel": { en: "Cancel", mr: "रद्द" },
  "pd.submit": { en: "Submit", mr: "पाठवा" },
  "pd.related": { en: "You might also like", mr: "हेही आवडेल" },
  "pd.added-toast": {
    en: "{qty} × {name} added to cart",
    mr: "{qty} × {name} गाडीत टाकले",
  },
  "pd.add-failed": { en: "Failed to add to cart", mr: "गाडीत टाकता आले नाही" },
  "pd.try-again": {
    en: "Failed — please try again",
    mr: "अयशस्वी — कृपया पुन्हा प्रयत्न करा",
  },
  "pd.name-required": { en: "Please enter your name", mr: "कृपया तुमचे नाव लिहा" },
  "pd.submit-failed": { en: "Failed to submit", mr: "पाठवता आले नाही" },

  /* ── Misc ──────────────────────────────────────────────────────── */
  "notfound.title": { en: "Page not found", mr: "पान सापडले नाही" },
  "notfound.sub": {
    en: "The page you are looking for doesn’t exist or has been moved.",
    mr: "तुम्ही शोधत असलेले पान अस्तित्वात नाही किंवा हलवले गेले आहे.",
  },
  "notfound.back": { en: "Back to Home", mr: "मुख्यपृष्ठावर परत" },
  "toast.close": { en: "Close notification", mr: "सूचना बंद करा" },
  "stepper.decrease": { en: "Decrease quantity", mr: "संख्या कमी करा" },
  "stepper.increase": { en: "Increase quantity", mr: "संख्या वाढवा" },
  "scrolltop.aria": { en: "Scroll back to top", mr: "वर परत जा" },
  "store.call-us": { en: "Call us", mr: "आम्हाला कॉल करा" },
};

/* ------------------------------------------------------------------ */
/* Categories (static — used by filter pills, tiles, footer)           */
/* ------------------------------------------------------------------ */

export const CATEGORY_MR: Record<string, string> = {
  All: "सर्व",
  Groceries: "किराणा",
  Dairy: "दुग्धजन्य",
  Snacks: "नाश्ता",
  Beverages: "पेय",
  "Personal Care": "वैयक्तिक काळजी",
  Household: "घरगुती",
  Bakery: "बेकरी",
  "Fruits & Vegetables": "फळे आणि भाज्या",
};

/** Translate a category name for a locale (identity for "en"). */
export function categoryFor(locale: Locale, cat: string): string {
  if (locale !== "mr") return cat;
  return CATEGORY_MR[cat] ?? cat;
}

/* ------------------------------------------------------------------ */
/* Festive theme copy (per theme id) — Marathi variants                */
/* ------------------------------------------------------------------ */

export interface FestiveStrings {
  festival: string;
  greeting: string;
  kicker: string;
  headline: string;
  subline: string;
  sectionTitle: string;
  sectionSub: string;
  badgeLabel: string;
  couponText: string;
  endsLabel: string;
}

/** Keyed by FestiveTheme.id + "id:field-overrides" for year-specific lines. */
export const FESTIVE_MR: Record<string, FestiveStrings> = {
  diwali: {
    festival: "दिवाळी",
    greeting: "दिवाळी धमाका — प्रत्येक फळीवर सणाच्या ऑफर",
    kicker: "दिवाळी 2026 · 8 नोव्हेंबर",
    headline: "दिवाळीचा\nसाठा उजळवा.",
    subline:
      "सणाच्या गरजेच्या वस्तू, मिठाई आणि रोजचा माल — लक्ष्मी पूजेआधी संपूर्ण पुण्यात डिलिव्हरी.",
    sectionTitle: "दिवाळी खास निवड",
    sectionSub: "सणाच्या आठवड्यासाठी आवडत्या वस्तू",
    badgeLabel: "दिवाळी ऑफर",
    couponText: "₹299 पेक्षा जास्त ऑर्डरवर 10% सूट (जास्तीत जास्त ₹150)",
    endsLabel: "सणाच्या ऑफर 14 नोव्हेंबरला संपतात",
  },
  christmas: {
    festival: "ख्रिसमस",
    greeting: "ख्रिसमस आठवडा — केक, कुकीज आणि सणाचा साठा",
    kicker: "ख्रिसमस · 25 डिसेंबर",
    headline: "ख्रिसमसच्या\nजेवणासाठी सर्व काही.",
    subline:
      "बेकिंगचे साहित्य, कुकीज, पेय आणि गोड पदार्थ — संपूर्ण पुण्यात डिलिव्हरी.",
    sectionTitle: "ख्रिसमस निवड",
    sectionSub: "बेकिंग, गोड पदार्थ आणि सणाचा साठा",
    badgeLabel: "ख्रिसमस ऑफर",
    couponText: "₹399 पेक्षा जास्त ऑर्डरवर ₹50 सूट",
    endsLabel: "ऑफर 27 डिसेंबरला संपतात",
  },
  "new-year": {
    festival: "नववर्ष",
    greeting: "नवे वर्ष, नवा साठा — पार्टी आणि घरगुती वस्तू",
    kicker: "नववर्ष 2027",
    headline: "नवे वर्ष,\nनव्या फळ्या.",
    subline:
      "2027 ची सुरुवात पक्क्या तयारीने करा — पार्टी स्नॅक्स, पेय आणि रोजच्या गरजेच्या वस्तू.",
    sectionTitle: "नववर्ष निवड",
    sectionSub: "2027 साठी पार्टी आणि घराच्या वस्तू",
    badgeLabel: "नववर्ष ऑफर",
    couponText: "₹299 पेक्षा जास्त ऑर्डरवर 7% सूट (जास्तीत जास्त ₹100)",
    endsLabel: "ऑफर 5 जानेवारीला संपतात",
  },
  sankranti: {
    festival: "मकर संक्रांत",
    greeting: "संक्रांत स्पेशल — तीळ, गूळ आणि सणाचे पदार्थ",
    kicker: "मकर संक्रांत · 14 जानेवारी",
    headline: "तिळगूळ घ्या,\nगोड गोड बोला.",
    subline:
      "तीळ, गूळ आणि सणाच्या वस्तू — पुणेकरांची संक्रांतची तयारी, डिलिव्हरीसह.",
    sectionTitle: "संक्रांत निवड",
    sectionSub: "तीळ, गूळ आणि सणाच्या वस्तू",
    badgeLabel: "संक्रांत ऑफर",
    couponText: "₹199 पेक्षा जास्त ऑर्डरवर ₹20 सूट",
    endsLabel: "ऑफर 16 जानेवारीला संपतात",
  },
  "republic-day": {
    festival: "प्रजासत्ताक दिन",
    greeting: "प्रजासत्ताक दिन ऑफर — तिरंग्या ढंगाचा साठा",
    kicker: "प्रजासत्ताक दिन · 26 जानेवारी",
    headline: "प्रजासत्ताक दिनाचा\nसाठा सेल.",
    subline:
      "स्वयंपाकघरातील अत्यावश्यक वस्तू प्रामाणिक किमतीत — संपूर्ण पुण्यात डिलिव्हरी.",
    sectionTitle: "प्रजासत्ताक दिन निवड",
    sectionSub: "रोजच्या वस्तू, सणाच्या किंमती",
    badgeLabel: "प्रजासत्ताक ऑफर",
    couponText: "₹499 पेक्षा जास्त ऑर्डरवर ₹75 सूट",
    endsLabel: "ऑफर 28 जानेवारीला संपतात",
  },
  valentines: {
    festival: "व्हॅलेंटाईन आठवडा",
    greeting: "व्हॅलेंटाईन आठवडा — चॉकलेट, स्नॅक्स आणि डेट-नाईटच्या वस्तू",
    kicker: "व्हॅलेंटाईन डे · 14 फेब्रुवारी",
    headline: "संध्याकाळ तुमची,\nस्नॅक्स आमचे.",
    subline: "चॉकलेट, पेय आणि डेट-नाईटचे पदार्थ — काही तासांत डिलिव्हरी.",
    sectionTitle: "व्हॅलेंटाईन निवड",
    sectionSub: "चॉकलेट, पेय आणि डेट-नाईटचे पदार्थ",
    badgeLabel: "व्हॅलेंटाईन ऑफर",
    couponText: "₹299 पेक्षा जास्त ऑर्डरवर ₹40 सूट",
    endsLabel: "ऑफर 15 फेब्रुवारीला संपतात",
  },
  holi: {
    festival: "होळी",
    greeting: "होळी है — रंग, गुजिया साहित्य आणि पार्टीचा साठा",
    kicker: "होळी · 22 मार्च 2027",
    headline: "रंग उडाले,\nथंड पेय तयार.",
    subline: "रंग, गुजियाचे साहित्य, पेय आणि होळी पार्टीसाठी स्नॅक्स.",
    sectionTitle: "होळी निवड",
    sectionSub: "पार्टीचा साठा आणि गुजिया साहित्य",
    badgeLabel: "होळी ऑफर",
    couponText: "₹249 पेक्षा जास्त ऑर्डरवर ₹30 सूट",
    endsLabel: "ऑफर 24 मार्चला संपतात",
  },
  "gudi-padwa": {
    festival: "गुढीपाडवा",
    greeting: "गुढीपाडवा — महाराष्ट्रीय नववर्षाचा साठा",
    kicker: "गुढीपाडवा · एप्रिल 2027",
    headline: "नव्या वर्षाची\nगुढी उभारा.",
    subline:
      "पुरणपोळीचे साहित्य, सणाचा किराणा आणि पुणेकरांचा नववर्षाचा साठा.",
    sectionTitle: "गुढीपाडवा निवड",
    sectionSub: "पुरणपोळी साहित्य आणि सणाचा किराणा",
    badgeLabel: "पाडवा ऑफर",
    couponText: "₹249 पेक्षा जास्त ऑर्डरवर ₹25 सूट",
    endsLabel: "ऑफर 10 एप्रिलला संपतात",
  },
  "independence-day": {
    festival: "स्वातंत्र्य दिन",
    greeting: "स्वातंत्र्य दिन ऑफर — पूर्ण किमतीपासून स्वातंत्र्य",
    kicker: "स्वातंत्र्य दिन · 15 ऑगस्ट",
    headline: "स्वातंत्र्य आठवड्याचा\nसाठा सेल.",
    subline:
      "रोजच्या गरजेच्या वस्तू प्रामाणिक किमतीत — संपूर्ण पुण्यात डिलिव्हरी.",
    sectionTitle: "स्वातंत्र्य दिन निवड",
    sectionSub: "रोजच्या वस्तू, प्रामाणिक किमती",
    badgeLabel: "स्वातंत्र्य ऑफर",
    couponText: "₹399 पेक्षा जास्त ऑर्डरवर ₹50 सूट",
    endsLabel: "ऑफर 17 ऑगस्टला संपतात",
  },
  "ganesh-chaturthi": {
    festival: "गणेश चतुर्थी",
    greeting: "गणपती बाप्पा मोरया — उत्सवाचा साठा आणि मोदक साहित्य",
    kicker: "गणेश चतुर्थी · सप्टेंबर 2027",
    headline: "गणपती उत्सव,\nपुणेकर पद्धतीने.",
    subline:
      "मोदक साहित्य, प्रसादाच्या वस्तू आणि बाप्पांच्या दहा दिवसांचा सण सामान.",
    sectionTitle: "गणपती उत्सव निवड",
    sectionSub: "मोदक आणि प्रसाद साहित्य",
    badgeLabel: "उत्सव ऑफर",
    couponText: "₹299 पेक्षा जास्त ऑर्डरवर 10% सूट (जास्तीत जास्त ₹150)",
    endsLabel: "ऑफर 13 सप्टेंबरला संपतात",
  },
  navratri: {
    festival: "नवरात्र",
    greeting: "नवरात्र स्पेशल — उपवासाचे साहित्य आणि गरबा रात्रींचा साठा",
    kicker: "नवरात्र · ऑक्टोबर 2027",
    headline: "नऊ रात्री,\nभरपूर साठा.",
    subline:
      "उपवासाचे साहित्य, साबुदाणा, स्नॅक्स आणि गरबा रात्रींसाठी पेय.",
    sectionTitle: "नवरात्र निवड",
    sectionSub: "उपवास साहित्य आणि गरबा रात्रींचा साठा",
    badgeLabel: "नवरात्र ऑफर",
    couponText: "₹299 पेक्षा जास्त ऑर्डरवर 10% सूट (जास्तीत जास्त ₹120)",
    endsLabel: "ऑफर 10 ऑक्टोबरला संपतात",
  },
};

/** Year-specific overrides (DIWALI_2027 spreads DIWALI_2026 + new lines). */
export const FESTIVE_MR_OVERRIDES: Record<string, Partial<FestiveStrings>> = {
  "diwali:2027": {
    kicker: "दिवाळी 2027 · ऑक्टोबरच्या शेवटी",
    endsLabel: "सणाच्या ऑफर 8 नोव्हेंबरला संपतात",
  },
};

/* ------------------------------------------------------------------ */
/* Dates (deterministic Marathi months — hydration-safe, no ICU drift) */
/* ------------------------------------------------------------------ */

/** Marathi month names (Gregorian), index 1-12. Hand-written so the
 *  server render and the client render produce the EXACT same string
 *  (Intl "mr-IN" output can drift between ICU builds — v0.10.2 lesson). */
const MR_MONTHS = [
  "",
  "जानेवारी",
  "फेब्रुवारी",
  "मार्च",
  "एप्रिल",
  "मे",
  "जून",
  "जुलै",
  "ऑगस्ट",
  "सप्टेंबर",
  "ऑक्टोबर",
  "नोव्हेंबर",
  "डिसेंबर",
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * Locale-aware date+time for order/review timestamps.
 * "en" keeps the existing en-IN style ("05 Nov 2026, 03:24 pm");
 * "mr" renders fully in Marathi ("05 नोव्हें 2026, 03:24 pm").
 */
export function formatDateFor(
  locale: Locale,
  date: Date | string,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const day = pad2(d.getDate());
  const year = d.getFullYear();
  let h = d.getHours();
  const pm = h >= 12;
  h = h % 12 || 12;
  const min = pad2(d.getMinutes());
  const time = `${pad2(h)}:${min} ${pm ? "pm" : "am"}`;
  if (locale === "mr") {
    return `${day} ${MR_MONTHS[d.getMonth() + 1]} ${year}, ${time}`;
  }
  const EN_MONTHS = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${day} ${EN_MONTHS[d.getMonth() + 1]} ${year}, ${time}`;
}

/** Date-only variant ("05 नोव्हें 2026" / "05 Nov 2026") — ETAs. */
export function formatDateOnlyFor(
  locale: Locale,
  date: Date | string,
): string {
  const full = formatDateFor(locale, date);
  // strip the ", HH:mm am/pm" tail
  const cut = full.lastIndexOf(", ");
  return cut === -1 ? full : full.slice(0, cut);
}

/* ------------------------------------------------------------------ */
/* Translator                                                          */
/* ------------------------------------------------------------------ */

/**
 * Look up `key` for `locale`, interpolating `{var}` placeholders.
 * Falls back to English, then to the key itself (never crashes).
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const entry = DICT[key];
  let s: string;
  if (!entry) {
    s = key;
  } else {
    s = locale === "mr" ? entry.mr : entry.en;
  }
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{${k}}`).join(String(v));
    }
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* Festive theme localization                                          */
/* ------------------------------------------------------------------ */

export interface LocalizedFestive {
  festival: string;
  greeting: string;
  kicker: string;
  headline: string;
  subline: string;
  sectionTitle: string;
  sectionSub: string;
  badgeLabel: string;
  couponText: string;
  endsLabel: string;
}

/**
 * Localize a festive theme's customer-facing copy. Unknown themes fall
 * back to their English strings. Year-specific variants (e.g. DIWALI_2027
 * re-uses id "diwali" with a different kicker/endsLabel) apply the
 * `id:year` override when the English kicker mentions that year.
 */
export function festiveFor(theme: FestiveTheme, locale: Locale): LocalizedFestive {
  const en: LocalizedFestive = {
    festival: theme.festival,
    greeting: theme.greeting,
    kicker: theme.kicker,
    headline: theme.headline,
    subline: theme.subline,
    sectionTitle: theme.sectionTitle,
    sectionSub: theme.sectionSub,
    badgeLabel: theme.badgeLabel,
    couponText: theme.coupon?.text ?? "",
    endsLabel: theme.endsLabel,
  };
  if (locale !== "mr") return en;

  let base = FESTIVE_MR[theme.id];
  if (!base) return en;
  const yearMatch = theme.kicker.match(/(20\d{2})/);
  if (yearMatch) {
    const ov = FESTIVE_MR_OVERRIDES[`${theme.id}:${yearMatch[1]}`];
    if (ov) base = { ...base, ...ov };
  }
  return {
    festival: base.festival,
    greeting: base.greeting,
    kicker: base.kicker,
    headline: base.headline,
    subline: base.subline,
    sectionTitle: base.sectionTitle,
    sectionSub: base.sectionSub,
    badgeLabel: base.badgeLabel,
    couponText: base.couponText,
    endsLabel: base.endsLabel,
  };
}
