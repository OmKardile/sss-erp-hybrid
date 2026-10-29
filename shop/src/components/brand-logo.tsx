import type { SVGProps } from "react";

/**
 * Hard-coded brand logo — the user-supplied mark inlined as SVG markup.
 *
 * Why inline instead of <img src="/logo.svg">: the site had production
 * incidents where a stale `/logo.svg` (same URL, old content) survived
 * CDN/browser caching after deploys, so users kept seeing the old logo.
 * Inline SVG ships inside the HTML document itself — there is no asset
 * fetch to cache, so the logo can never go stale.
 *
 * The wordmark is typeset in Poppins (loaded via next/font in layout —
 * `--font-poppins`) so it renders in its designed typeface on every
 * device, with the original system-font fallbacks if Poppins is ever
 * unavailable.
 */

const POPPINS_STACK =
  "var(--font-poppins), Poppins, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

/** The 120×120 brand tile: emerald rounded square, white shopping bag
 *  with the "S" monogram, amber leaf sprig. Shared by mark + lockup. */
function LogoTile() {
  return (
    <g transform="translate(10 10)">
      <rect width={120} height={120} rx={28} fill="#065f46" />
      <path
        d="M60 36C58 24 68 16 82 16C84 28 74 38 60 36Z"
        fill="#F2A93B"
      />
      <path
        d="M47 56V46C47 32 73 32 73 46V56"
        fill="none"
        stroke="#FFF8EC"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <rect x={32} y={52} width={56} height={48} rx={9} fill="#FFF8EC" />
      <path
        d="M69 66C66 60 51 60 51 69C51 78 69 74 69 83C69 92 54 92 51 86"
        fill="none"
        stroke="#065f46"
        strokeWidth={6.5}
        strokeLinecap="round"
      />
    </g>
  );
}

type LogoProps = SVGProps<SVGSVGElement>;

/** Square mark — tight spaces (mobile header). */
export function BrandLogoMark({ className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 140 140"
      role="img"
      aria-label="Shubham Super Shopee"
      className={className}
      {...props}
    >
      <title>Shubham Super Shopee</title>
      <LogoTile />
    </svg>
  );
}

/** Full lockup — tile + "Shubham / Super Shopee" wordmark + tagline. */
export function BrandLogoLockup({ className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 520 140"
      role="img"
      aria-label="Shubham Super Shopee — fresh groceries, delivered in Pune"
      className={className}
      {...props}
    >
      <title>Shubham Super Shopee</title>
      <LogoTile />
      <g fontFamily={POPPINS_STACK}>
        <text
          x={150}
          y={68}
          fontSize={46}
          fontWeight={800}
          fill="#FFF8EC"
          letterSpacing="-1"
        >
          Shubham
        </text>
        <text x={151} y={102} fontSize={29} fontWeight={600} fill="#F2A93B">
          Super Shopee
        </text>
        <text
          x={152}
          y={124}
          fontSize={13}
          fontWeight={500}
          fill="#9fc4b7"
          letterSpacing="0.5"
        >
          Fresh groceries, delivered in Pune
        </text>
      </g>
    </svg>
  );
}
