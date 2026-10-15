import { Phone, MapPin, Clock, Truck, ShieldCheck, Zap, Heart } from "lucide-react";
import { STORE_CONFIG } from "@/lib/config";

export function StoreFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto w-full bg-slate-900 text-slate-300">
      {/* Top colorful strip */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3 text-xs font-semibold sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" /> 10-min quick commerce
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" /> Free delivery above ₹500
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Quality assured
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Open 7 AM – 10 PM
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                🛒
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {STORE_CONFIG.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  Your local grocery store
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Fresh groceries, dairy and household essentials delivered to your
              doorstep across Pune. Order online — pay by COD or UPI.
            </p>
            {/* Social-style emoji icons */}
            <div className="mt-4 flex gap-2">
              {[
                { e: "📞", l: "Call" },
                { e: "💬", l: "WhatsApp" },
                { e: "📷", l: "Instagram" },
                { e: "📘", l: "Facebook" },
              ].map((s) => (
                <a
                  key={s.l}
                  href="#"
                  aria-label={s.l}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-base transition hover:scale-110 hover:bg-emerald-600"
                >
                  {s.e}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold text-white">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-emerald-400" />
                <a
                  href={`tel:${STORE_CONFIG.phone.replace(/\s+/g, "")}`}
                  className="hover:text-emerald-400"
                >
                  {STORE_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-amber-400" />
                <span>{STORE_CONFIG.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-rose-400" />
                <span>Open daily • 7:00 AM – 10:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <p className="text-sm font-semibold text-white">Shop</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>
                <a href="/" className="hover:text-emerald-400">
                  🛍️ All Products
                </a>
              </li>
              <li>
                <a
                  href="/?category=Groceries"
                  className="hover:text-emerald-400"
                >
                  🍚 Groceries
                </a>
              </li>
              <li>
                <a href="/?category=Dairy" className="hover:text-emerald-400">
                  🥛 Dairy
                </a>
              </li>
              <li>
                <a href="/?category=Snacks" className="hover:text-emerald-400">
                  🍪 Snacks
                </a>
              </li>
              <li>
                <a href="/cart" className="hover:text-emerald-400">
                  🛒 My Cart
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-sm font-semibold text-white">Help &amp; Info</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>🎁 Free delivery on orders above ₹500</li>
              <li>↩️ Easy returns within 24 hours</li>
              <li>💳 COD &amp; UPI accepted</li>
              <li>🚚 Delivery in 2 hours across Pune</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {year} {STORE_CONFIG.name}. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with{" "}
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> for Bro
            · Designed &amp; developed by{" "}
            <a
              href="https://omkardile.is-a.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-400 underline-offset-2 hover:text-emerald-300 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
            >
              Omkar Kardile
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
