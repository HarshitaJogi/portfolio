#!/usr/bin/env node
/**
 * Truth lint. Enforces the brief's non-negotiable rules on site copy.
 *
 *   node scripts/truth-lint.mjs          checks src/content/profile.ts
 *   node scripts/truth-lint.mjs --html   also checks prerendered HTML in .next
 *
 * Exits 1 on any hit.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

// Skills the brief forbids claiming, plus internal jargon (Truth Rules 2 and 5).
const banned = [
  /\bFastAPI\b/i,
  /\basyncio\b/i,
  /\bRAG\b/,
  /retrieval[- ]augmented/i,
  /vector (db|database)/i,
  /\bTTS\b/,
  /speech API/i,
  /\bAnsible\b/i,
  /\bTableau\b/i,
  /Power ?BI/i,
  /\bRust\b/,
  /\bNode\.?js\b/i,
  /\bTerraform\b/i,
  /\bYANG\b/,
  /\bEVPN\b/,
  /\bNETCONF\b/,
  /SR ?Linux/i,
  /SR-OS/i,
  /used AI tools/i,
  /passionate/i,
  /rockstar/i,
  /innovative solutions/i,
  /synerg/i,
];

// Voice rules for prose: no em dashes, no semicolons, no exclamation marks.
const prose = [
  { re: /—/, why: "em dash" },
  { re: /;/, why: "semicolon" },
  { re: /!/, why: "exclamation mark" },
];

const problems = [];

function checkText(text, where) {
  for (const re of banned) if (re.test(text)) problems.push(`${where}: banned term ${re} in "${text.slice(0, 90)}"`);
  // Truth Rule 3: the Nokia agent is never "autonomous". Checked by proximity, because the
  // drone project's official title legitimately contains the word.
  const near = /(nokia|llm agent|the agent)[^]{0,160}?autonomous|autonomous[^]{0,160}?(nokia|llm agent|the agent)/i.exec(text);
  if (near) problems.push(`${where}: "autonomous" near the Nokia agent in "${near[0].slice(0, 120)}"`);
}

function checkProse(text, where) {
  if (/^https?:|^#|^\/|^mailto:/.test(text)) return;
  for (const { re, why } of prose) if (re.test(text)) problems.push(`${where}: ${why} in "${text.slice(0, 90)}"`);
}

// 1. Every string literal in profile.ts.
const profilePath = join(root, "src/content/profile.ts");
const src = readFileSync(profilePath, "utf8")
  // drop comments so TODO notes are not linted as copy
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");
const literal = /"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
let m;
while ((m = literal.exec(src))) {
  const text = m[1] ?? m[2] ?? "";
  if (!text.trim()) continue;
  const line = src.slice(0, m.index).split("\n").length;
  checkText(text, `profile.ts:${line}`);
  checkProse(text, `profile.ts:${line}`);
}

// 2. Optional: visible text of prerendered HTML.
if (process.argv.includes("--html")) {
  const appDir = join(root, ".next/server/app");
  if (!existsSync(appDir)) {
    console.error("No build found. Run `pnpm build` first.");
    process.exit(1);
  }
  const walk = (dir) =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
    });
  for (const file of walk(appDir)) {
    const visible = readFileSync(file, "utf8")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ");
    const rel = file.replace(root, "");
    checkText(visible, rel);
    if (/—/.test(visible)) problems.push(`${rel}: em dash in rendered text`);
  }
}

if (problems.length) {
  console.error(`Truth lint failed with ${problems.length} problem(s):\n` + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}
console.log("Truth lint passed.");
