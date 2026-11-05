"use client";

import { Engine } from "@/engine/next";
import { setupMotion } from "@/motion/setup";

/** The motion engine mount: renders once in the root layout. */
export function Motion() {
  return <Engine setup={setupMotion} />;
}
