"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * FloatingProduce — the "images everywhere" hero layer: circular
 * product photos floating at multiple parallax depths with gentle
 * idle bobbing. Purely decorative (aria-hidden, pointer-events-none).
 */
type ProduceSpec = {
  src: string;
  className: string;
  size: string;
  depth: number;
  ring: string;
  halo: string;
  dur: number;
  delay: number;
  rot: string;
  shadow: string;
};

const PRODUCE: ProduceSpec[] = [
  {
    src: "/products/banana.jpg",
    className: "right-[4%] top-[6%] hidden sm:block",
    size: "h-24 w-24 md:h-28 md:w-28",
    depth: -70,
    ring: "ring-amber-300/70",
    halo: "bg-amber-300/45",
    dur: 7,
    delay: 0,
    rot: "-6deg",
    shadow: "shadow-[0_18px_44px_rgba(180,120,20,0.35)]",
  },
  {
    src: "/products/tomato.jpg",
    className: "right-[16%] bottom-[10%] hidden md:block",
    size: "h-20 w-20 lg:h-24 lg:w-24",
    depth: -110,
    ring: "ring-rose-300/70",
    halo: "bg-rose-300/50",
    dur: 6,
    delay: 0.8,
    rot: "5deg",
    shadow: "shadow-[0_16px_40px_rgba(190,50,60,0.32)]",
  },
  {
    src: "/products/milk-gold.jpg",
    className: "left-[2%] top-[30%] hidden lg:block",
    size: "h-20 w-20",
    depth: -55,
    ring: "ring-sky-300/70",
    halo: "bg-sky-300/45",
    dur: 7.5,
    delay: 1.6,
    rot: "4deg",
    shadow: "shadow-[0_16px_40px_rgba(40,120,180,0.3)]",
  },
  {
    src: "/products/coca-cola.jpg",
    className: "left-[38%] top-[4%] hidden md:block",
    size: "h-16 w-16 lg:h-20 lg:w-20",
    depth: -130,
    ring: "ring-red-300/70",
    halo: "bg-red-300/40",
    dur: 5.5,
    delay: 0.4,
    rot: "-4deg",
    shadow: "shadow-[0_14px_36px_rgba(180,40,40,0.3)]",
  },
  {
    src: "/products/honey.jpg",
    className: "right-[34%] top-[16%] hidden xl:block",
    size: "h-16 w-16",
    depth: -85,
    ring: "ring-orange-300/70",
    halo: "bg-orange-300/45",
    dur: 6.5,
    delay: 2,
    rot: "7deg",
    shadow: "shadow-[0_14px_36px_rgba(200,120,20,0.3)]",
  },
  {
    src: "/products/atta.jpg",
    className: "left-[10%] bottom-[8%] hidden sm:block",
    size: "h-16 w-16 md:h-20 md:w-20",
    depth: -95,
    ring: "ring-emerald-300/70",
    halo: "bg-emerald-300/45",
    dur: 8,
    delay: 1.2,
    rot: "-5deg",
    shadow: "shadow-[0_16px_40px_rgba(20,120,80,0.3)]",
  },
];

/** One floater — its own component so the hook stays top-level. */
function ProduceItem({ spec, scrollYProgress }: { spec: ProduceSpec; scrollYProgress: any }) {
  const reduce = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], [0, spec.depth]);

  return (
    <motion.div
      className={`absolute ${spec.className}`}
      style={reduce ? undefined : { y }}
    >
      <div
        className="float-idle"
        style={
          {
            "--float-duration": `${spec.dur}s`,
            "--float-delay": `${spec.delay}s`,
            "--float-rot": spec.rot,
          } as React.CSSProperties
        }
      >
        {/* Colored halo + circular photo with a glass ring */}
        <div className={`relative rounded-full ${spec.size} ${spec.shadow}`}>
          <div
            className={`absolute -inset-2.5 rounded-full ${spec.halo} blur-md`}
          />
          <img
            src={spec.src}
            alt=""
            loading="lazy"
            decoding="async"
            className={`relative h-full w-full rounded-full object-cover ring-4 ${spec.ring} ring-offset-2 ring-offset-transparent`}
          />
          {/* Glass specular dot */}
          <span className="absolute left-[18%] top-[14%] h-[18%] w-[18%] rounded-full bg-white/70 blur-[2px]" />
        </div>
      </div>
    </motion.div>
  );
}

export function FloatingProduce() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {PRODUCE.map((spec) => (
        <ProduceItem key={spec.src + spec.className} spec={spec} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}
