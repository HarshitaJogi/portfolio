"use client";

import { motion, useReducedMotion } from "motion/react";
import { dur, ease, travel } from "@/lib/motion";

/**
 * The quiet default entrance. Never starts invisible: content is readable at
 * opacity 0.6 even if the animation never runs.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "p";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  if (reduced) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0.6, y: travel }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: dur.enter, ease: ease.settle, delay }}
    >
      {children}
    </Tag>
  );
}
