"use client";

import { ReactNode } from "react";
import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react";

// Initialize Convex client
// The URL will come from environment variable NEXT_PUBLIC_CONVEX_URL
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

export function ConvexProvider({ children }: { children: ReactNode }) {
  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}
