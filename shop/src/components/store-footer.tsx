import { Package, Phone, MapPin, Clock } from "lucide-react";
import { STORE_CONFIG } from "@/lib/config";

export function StoreFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto w-full border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {STORE_CONFIG.name}
                </p>
                <p className="text-[11px] text-slate-500">Your local grocery store</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Fresh groceries, dairy and household essentials delivered to your
              doorstep across Pune. Order online — pay by COD or UPI.
            </p>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold text-slate-900">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-emerald-600" />
                <a
                  href={`tel:${STORE_CONFIG.phone.replace(/\s+/g, "")}`}
                  className="hover:text-emerald-700"
                >
                  {STORE_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>{STORE_CONFIG.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>Open daily • 7:00 AM – 10:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <p className="text-sm font-semibold text-slate-900">Shop</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="/" className="hover:text-emerald-700">All Products</a></li>
              <li><a href="/?category=Groceries" className="hover:text-emerald-700">Groceries</a></li>
              <li><a href="/?category=Dairy" className="hover:text-emerald-700">Dairy</a></li>
              <li><a href="/?category=Snacks" className="hover:text-emerald-700">Snacks</a></li>
              <li><a href="/cart" className="hover:text-emerald-700">My Cart</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-sm font-semibold text-slate-900">Help</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Free delivery on orders above ₹500</li>
              <li>Easy returns within 24 hours</li>
              <li>COD &amp; UPI accepted</li>
              <li>Delivery in 2 hours across Pune</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>
            © {year} {STORE_CONFIG.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Crafted with <span className="text-rose-500">&#9829;</span> for Bro · Designed &amp; developed by{" "}
            <a
              href="https://omkardile.is-a.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
            >
              Omkar Kardile
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
