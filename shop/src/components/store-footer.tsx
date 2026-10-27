import { Phone, MapPin, Clock, Truck, ShieldCheck, Heart } from "lucide-react";
import { STORE_CONFIG } from "@/lib/config";

export function StoreFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto w-full bg-stone-950 text-stone-300">
      {/* Specular top edge — glass divider into the page */}
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:px-6 lg:px-8 lg:pb-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <img
              src="/logo.svg"
              alt={STORE_CONFIG.name}
              width={149}
              height={40}
              className="h-10 w-auto"
            />
            <p className="mt-4 text-sm leading-relaxed text-stone-400">
              Fresh groceries, dairy and household essentials delivered to your
              doorstep across Pune. Order online — pay by COD or UPI.
            </p>
            <a
              href={`tel:${STORE_CONFIG.phone.replace(/\s+/g, "")}`}
              aria-label="Call us"
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-xs font-semibold text-stone-200 backdrop-blur transition-colors hover:bg-white/10"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden /> Call us
            </a>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold text-white">Contact</p>
            <ul className="mt-3 space-y-2.5 text-sm text-stone-400">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                <a
                  href={`tel:${STORE_CONFIG.phone.replace(/\s+/g, "")}`}
                  className="hover:text-emerald-300"
                >
                  {STORE_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                <span>{STORE_CONFIG.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                <span>Open daily · 7:00 AM – 10:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <p className="text-sm font-semibold text-white">Shop</p>
            <ul className="mt-3 space-y-2.5 text-sm text-stone-400">
              <li>
                <a href="/" className="hover:text-emerald-300">
                  All Products
                </a>
              </li>
              <li>
                <a
                  href="/?category=Groceries"
                  className="hover:text-emerald-300"
                >
                  Groceries
                </a>
              </li>
              <li>
                <a href="/?category=Dairy" className="hover:text-emerald-300">
                  Dairy
                </a>
              </li>
              <li>
                <a href="/?category=Snacks" className="hover:text-emerald-300">
                  Snacks
                </a>
              </li>
              <li>
                <a
                  href="/?category=Fruits%20%26%20Vegetables"
                  className="hover:text-emerald-300"
                >
                  Fruits &amp; Vegetables
                </a>
              </li>
              <li>
                <a href="/cart" className="hover:text-emerald-300">
                  My Cart
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-sm font-semibold text-white">Help &amp; Info</p>
            <ul className="mt-3 space-y-2.5 text-sm text-stone-400">
              <li className="flex items-start gap-2">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                <span>Free delivery above ₹500</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                <span>Easy returns within 24 hours</span>
              </li>
              <li>
                <span>COD &amp; UPI accepted</span>
              </li>
              <li>
                <span>Delivery in 2 hours across Pune</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-stone-800 pt-6 text-xs text-stone-500 sm:flex-row sm:items-center">
          <p>© {year} {STORE_CONFIG.name}. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-1.5">
            Crafted with{" "}
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" aria-hidden /> for Bro
            · Designed &amp; developed by{" "}
            <a
              href="https://omkardile.is-a.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-400 underline-offset-2 hover:text-emerald-300 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
            >
              Omkar Kardile
            </a>
            · Animated icons by{" "}
            <a
              href="https://lordicon.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-400 underline-offset-2 hover:text-emerald-300 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
            >
              Lordicon
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
