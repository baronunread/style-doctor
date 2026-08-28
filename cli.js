#!/usr/bin/env node
/*
 * style-doctor: diagnose prose health, the way react-doctor diagnoses a React
 * codebase. Scans a folder of Markdown/text, groups findings by rule, prints a
 * 0-100 score, and exits non-zero when blocking issues are present so it drops
 * straight into CI. Built to be driven by an AI (`--json`, stable finding ids).
 *
 *   npx style-doctor                 # scan ./
 *   npx style-doctor docs/           # scan a folder
 *   npx style-doctor --json          # structured report (suppresses other output)
 *   npx style-doctor --score         # print only the score
 *   npx style-doctor --scope changed # only files changed vs git HEAD
 *   npx style-doctor --blocking warning   # warnings fail CI too
 */
import { readFileSync, globSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, resolve, relative } from "node:path";

const VERSION = "0.1.0";
const PLUGIN = "style-doctor";
const K = 4.0; // score = 100 - K * (weighted findings per 100 words)
const WEIGHT = { error: 3, warning: 1 };
const CATEGORY_ORDER = ["LLM Tells", "Filler", "Grammar"];

// [id, severity, category, title, regexSource, message, help]
const RULES = [
  // --- LLM Tells --------------------------------------------------------------
  ["not-just-but", "error", "LLM Tells", "\"Not just X, but Y\" construction",
    String.raw`\bnot (?:just|only|merely)\b[^.\n]{1,60}?,?\s+but\b`,
    "The \"not just X, but Y\" escalation is one of the strongest LLM tells.",
    "Cut it and state the point directly."],
  ["its-not-x-its-y", "error", "LLM Tells", "\"It's not X, it's Y\" reversal",
    String.raw`\bit'?s not (?:just |about |merely )?[^.\n,—-]{1,50}[,—-]\s*it'?s\b`,
    "The \"It's not X, it's Y\" reversal reads as generated.",
    "Make the claim once, plainly."],
  ["delve", "error", "LLM Tells", "Filler word \"delve\"",
    String.raw`\bdelv(?:e|es|ed|ing)\b`,
    "\"delve\" is a hallmark LLM word rarely used in natural writing.",
    "Use \"look at\", \"go into\", or cut."],
  ["tapestry", "error", "LLM Tells", "\"Tapestry\" metaphor",
    String.raw`\b(?:rich |intricate |complex )?tapestry\b`,
    "\"tapestry\" as a metaphor is LLM boilerplate.",
    "Name the actual thing."],
  ["testament", "error", "LLM Tells", "\"A testament to\" filler praise",
    String.raw`\b(?:a|is a|stands as a) testament to\b`,
    "\"a testament to\" is empty praise.",
    "Say what it shows and why."],
  ["landscape", "warning", "LLM Tells", "\"Landscape\" metaphor",
    String.raw`\b(?:ever-)?(?:changing|evolving|shifting|dynamic) landscape\b|\bthe landscape of\b`,
    "The \"landscape\" metaphor is overused by LLMs.",
    "Be concrete about what changed."],
  ["realm", "warning", "LLM Tells", "\"In the realm of\" padding",
    String.raw`\bin the realm of\b`,
    "\"in the realm of\" is padding.",
    "Use \"in\" or name the field."],
  ["navigate", "warning", "LLM Tells", "\"Navigate the complexities\" filler",
    String.raw`\bnavigat(?:e|es|ing) (?:the )?(?:complex|complexit\w+|challeng\w+|world|landscape|waters)\b`,
    "\"navigate the complexities\" is LLM connective tissue.",
    "Say what is hard and how you handle it."],
  ["game-changer", "warning", "LLM Tells", "\"Game-changer\" cliche",
    String.raw`\bgame[- ]chang(?:er|ing)\b`,
    "\"game-changer\" is marketing cliche.",
    "State the concrete effect."],
  ["deep-dive", "warning", "LLM Tells", "\"Deep dive\" filler opener",
    String.raw`\b(?:deep dive|dive deep|let'?s dive in|dive into)\b`,
    "\"deep dive\" / \"let's dive in\" is a filler opener.",
    "Just start."],
  ["unlock", "warning", "LLM Tells", "\"Unlock the potential\" hype",
    String.raw`\bunlock(?:s|ing)? (?:the |your |its )?(?:potential|power|secrets|value)\b`,
    "\"unlock the potential\" is empty hype.",
    "Say what becomes possible."],
  ["elevate", "warning", "LLM Tells", "\"Elevate your X\" ad copy",
    String.raw`\belevate your\b`,
    "\"elevate your X\" is ad copy.",
    "Say what improves."],
  ["todays-world", "warning", "LLM Tells", "\"In today's world\" opener",
    String.raw`\bin today'?s (?:world|fast-paced world|digital age|society)\b`,
    "\"in today's world\" is throat-clearing.",
    "Cut it."],
  ["cutting-edge", "warning", "LLM Tells", "Empty superlative \"cutting-edge\"",
    String.raw`\b(?:cutting[- ]edge|state[- ]of[- ]the[- ]art|bleeding[- ]edge)\b`,
    "\"cutting-edge\" carries no information.",
    "Name the specific capability."],
  ["boasts", "warning", "LLM Tells", "Ad-copy verb \"boasts\"",
    String.raw`\bboasts?\b`,
    "\"X boasts Y\" is product-page voice.",
    "Use \"has\" or \"includes\"."],
  ["nestled", "warning", "LLM Tells", "Travel-brochure word \"nestled\"",
    String.raw`\bnestled\b`,
    "\"nestled\" is travel-brochure prose.",
    "Use \"in\" or \"near\"."],
  ["em-dash-density", "warning", "LLM Tells", "Em-dash overuse",
    null, // doc-level, computed separately
    "A high em-dash rate is a common LLM tell.",
    "Replace some with periods or commas."],
  // --- Filler --------------------------------------------------------------
  ["important-to-note", "error", "Filler", "\"It's important to note\" filler",
    String.raw`\bit'?s (?:important|worth|essential|crucial) (?:to note|noting|to mention|mentioning)\b|\bit is important to note\b`,
    "\"it's important to note\" adds nothing.",
    "Just state the note."],
  ["when-it-comes-to", "warning", "Filler", "\"When it comes to\" filler",
    String.raw`\bwhen it comes to\b`,
    "\"when it comes to\" is filler.",
    "Use \"for\" or \"with\"."],
  ["at-end-of-day", "warning", "Filler", "\"At the end of the day\" cliche",
    String.raw`\bat the end of the day\b`,
    "\"at the end of the day\" is a dead cliche.",
    "Cut it or say \"ultimately\"."],
  ["in-conclusion", "warning", "Filler", "Redundant \"In conclusion\" signpost",
    String.raw`\bin conclusion\b|\bin summary\b`,
    "\"In conclusion\" signposting is unnecessary in short prose.",
    "End on the point itself."],
  ["world-of", "warning", "Filler", "\"The world of X\" padding",
    String.raw`\bthe world of\b`,
    "\"the world of X\" is padding.",
    "Drop it: \"in X\"."],
  ["connective-overload", "warning", "Filler", "Formal connective overload",
    String.raw`\b(?:moreover|furthermore|additionally)\b`,
    "Formal connectives pile up in LLM prose.",
    "Use \"also\" or start a new sentence."],
  ["intensifier-cluster", "warning", "Filler", "Overused intensifier",
    String.raw`\b(?:crucial|vital|pivotal|paramount|essential)\b`,
    "Everything is \"crucial\" in LLM prose.",
    "Reserve it for what truly is; else cut."],
  ["robust", "warning", "Filler", "Vague praise \"robust\"",
    String.raw`\brobust\b`, "\"robust\" is vague praise.", "Say how it holds up."],
  ["seamless", "warning", "Filler", "Marketing filler \"seamless\"",
    String.raw`\bseamless(?:ly)?\b`,
    "\"seamless\" is marketing filler.", "Describe the actual flow."],
  ["leverage", "warning", "Filler", "Corporate verb \"leverage\"",
    String.raw`\bleverag(?:e|es|ed|ing)\b`,
    "\"leverage\" as a verb is corporate-speak.", "Use \"use\"."],
  ["plethora", "warning", "Filler", "Showy word \"plethora\"",
    String.raw`\bplethora\b`, "\"plethora\" is showy.", "Use \"many\" or a number."],
  ["myriad", "warning", "Filler", "Showy word \"myriad\"",
    String.raw`\bmyriad\b`, "\"myriad\" is showy.", "Use \"many\" or a number."],
  ["wordy-phrase", "warning", "Filler", "Wordy phrase",
    String.raw`\b(?:in order to|due to the fact that|a large number of|at this point in time|in the event that|has the ability to|is able to|for the purpose of|in spite of the fact that|with regard to|with the exception of)\b`,
    "This phrase has a shorter equivalent.",
    "e.g. \"in order to\" -> \"to\", \"due to the fact that\" -> \"because\"."],
  ["weasel-word", "warning", "Filler", "Weasel / hedge word",
    String.raw`\b(?:very|really|quite|extremely|highly|somewhat|fairly|rather|actually|basically|essentially|arguably|clearly|obviously|simply|literally)\b`,
    "Hedge and intensifier words weaken the sentence.",
    "Cut it or be specific."],
  // --- Grammar ----------------------------------------------------------------
  ["passive-voice", "warning", "Grammar", "Possible passive voice",
    String.raw`\b(?:is|are|was|were|be|been|being)\s+(?:\w+ly\s+)?` +
    String.raw`(?!malformed|deprecated|advanced|limited|dedicated|complicated|sophisticated|` +
    String.raw`detailed|related|isolated|outdated|undefined|embedded|scattered|tired|` +
    String.raw`interested|excited|surprised|pleased|based|involved|located|aged|red|fixed|` +
    String.raw`required|needed|intended|signed)\w+ed\b(?!\s+(?:by\s+)?\w+ing)`,
    "Naive check for passive voice (no POS tagger).",
    "Prefer active voice: name the actor. --ignore passive-voice if noisy."],
  ["there-is", "warning", "Grammar", "Sentence buried behind \"there is\"",
    String.raw`\bthere (?:is|are|was|were)\b`,
    "\"There is / are\" pushes the real subject back.",
    "Start with the real subject."],
];

const COMPILED = RULES.map(([id, sev, cat, title, src, message, help]) => ({
  id, sev, cat, title, message, help,
  re: src ? new RegExp(src, "gi") : null,
}));
const BY_ID = Object.fromEntries(COMPILED.map((r) => [r.id, r]));

// --- scanning ----------------------------------------------------------------

const wordCount = (t) => (t.match(/\b[\w']+\b/g) || []).length;

// blank out code fences, inline code, and blockquotes so we lint prose only,
// keeping line count and column offsets intact
function stripNonProse(text) {
  let inFence = false;
  return text.split(/\r?\n/).map((line) => {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; return ""; }
    if (inFence) return "";
    if (/^\s*>/.test(line)) return " ".repeat(line.length);
    return line.replace(/`[^`]*`/g, (m) => " ".repeat(m.length));
  });
}

function findInText(text, filePath, { only, ignore }) {
  const out = [];
  const prose = stripNonProse(text);
  prose.forEach((line, i) => {
    for (const r of COMPILED) {
      if (!r.re) continue;
      if (only && !only.has(r.id)) continue;
      if (ignore && ignore.has(r.id)) continue;
      r.re.lastIndex = 0;
      for (const m of line.matchAll(r.re)) {
        out.push(diag(r, filePath, i + 1, m.index + 1, m[0].trim()));
      }
    }
  });
  const proseText = prose.join("\n");
  const words = Math.max(wordCount(proseText), 1);
  const dashes = proseText.split("—").length - 1;
  const r = BY_ID["em-dash-density"];
  if ((!only || only.has(r.id)) && !(ignore && ignore.has(r.id)) &&
      (dashes / words) * 100 > 1.0 && dashes >= 3) {
    out.push(diag(r, filePath, 1, 1, `${dashes} em-dashes in ${words} words`));
  }
  return { diagnostics: out, words };
}

function diag(r, filePath, line, column, match) {
  return {
    filePath, plugin: PLUGIN, rule: r.id, severity: r.sev, category: r.cat,
    title: r.title, message: r.message, help: r.help, line, column, match,
    id: `${filePath}::${line}:${column}::${PLUGIN}/${r.id}`,
  };
}

function discover(dir) {
  const EXCLUDE = /(^|\/)(node_modules|\.git|dist|build|out|vendor|coverage|\.next|\.cache)(\/|$)/;
  return globSync("**/*.{md,markdown,mdx,txt}", { cwd: dir, exclude: (p) => EXCLUDE.test(p) })
    .sort();
}

function changedFiles(dir, base) {
  try {
    const run = (args) => execFileSync("git", ["-C", dir, ...args], { encoding: "utf8" });
    const tracked = run(["diff", "--name-only", base || "HEAD", "--"]).split("\n");
    const staged = run(["diff", "--name-only", "--cached", "--"]).split("\n");
    const untracked = run(["ls-files", "--others", "--exclude-standard"]).split("\n");
    return new Set([...tracked, ...staged, ...untracked].filter(Boolean));
  } catch {
    process.stderr.write("style-doctor: --scope changed needs a git repo; scanning everything\n");
    return null;
  }
}

// --- report ----------------------------------------------------------------

function scoreLabel(s) {
  return s >= 90 ? "Excellent" : s >= 80 ? "Healthy" : s >= 50 ? "Needs work" : "Critical";
}

function buildReport(dir, opts) {
  const started = Date.now();
  let files = opts.files.length ? opts.files : discover(dir);
  if (opts.scope === "changed") {
    const ch = changedFiles(dir, opts.base);
    if (ch) files = files.filter((f) => ch.has(f) || ch.has(relative(dir, resolve(dir, f))));
  }

  const diagnostics = [];
  let totalWords = 0;
  for (const f of files) {
    let text;
    try { text = readFileSync(resolve(dir, f), "utf8"); }
    catch { continue; }
    const res = findInText(text, f, opts);
    diagnostics.push(...res.diagnostics);
    totalWords += res.words;
  }
  // score is always global; --category / --no-warnings only filter what's shown
  const words = Math.max(totalWords, 1);
  const weight = diagnostics.reduce((s, d) => s + WEIGHT[d.severity], 0);
  const score = Math.max(0, Math.min(100, Math.round(100 - (K * weight * 100) / words)));

  let shown = diagnostics;
  if (opts.category) shown = shown.filter((d) => opts.category.has(d.category));
  if (opts.noWarnings) shown = shown.filter((d) => d.severity === "error");

  const errors = shown.filter((d) => d.severity === "error").length;
  const warnings = shown.length - errors;
  const filesWithIssues = new Set(shown.map((d) => d.filePath)).size;

  const byCategory = {};
  for (const d of shown) {
    const c = (byCategory[d.category] ||= { errors: 0, warnings: 0 });
    c[d.severity === "error" ? "errors" : "warnings"]++;
  }

  return {
    schemaVersion: 1, tool: PLUGIN, version: VERSION, mode: opts.scope,
    directory: resolve(dir), project: projectName(dir),
    ok: opts.blocking === "none" ? true
      : opts.blocking === "warning" ? shown.length === 0 : errors === 0,
    score, label: scoreLabel(score), words,
    summary: { issues: shown.length, errors, warnings, filesWithIssues, byCategory },
    scannedFileCount: files.length,
    elapsedMilliseconds: Date.now() - started,
    diagnostics: shown,
  };
}

function projectName(dir) {
  try {
    const pkg = JSON.parse(readFileSync(resolve(dir, "package.json"), "utf8"));
    if (pkg.name) return pkg.name;
  } catch { /* fall through */ }
  return basename(resolve(dir));
}

// --- formatting ----------------------------------------------------------------

const AGENT_GUIDANCE = [
  "Agent guidance",
  "  - Treat Style Doctor findings as starting hypotheses. Read the surrounding paragraph before confirming or dismissing each one.",
  "  - For each finding, decide true positive, false positive, or needs-human-review, then assign high/medium/low confidence.",
  "  - Do not dismiss a finding without reading the sentence it points at. Confidence requires context.",
  "  - Fix the writing, not the linter. Rewrite the sentence rather than adding an ignore, unless explicitly asked.",
  "  - Preserve the author's meaning and voice. Prefer the shortest edit that removes the tell.",
  "  - Ignore findings inside quoted text, code blocks, changelog entries, and proper nouns.",
  "  - Start with error-severity findings (LLM tells, filler openers). Leave stylistic calls (passive voice in reference docs) as notes.",
  "  - Re-run `style-doctor --scope changed` before and after edits, and in CI on the PR diff.",
  "  - Group edits by file. Keep unrelated rewrites in separate commits.",
  "  - For findings you cannot fix now, note the rule, file:line, and a proposed rewrite.",
].join("\n");

function color(on) {
  const w = (c) => (s) => (on ? `\x1b[${c}m${s}\x1b[0m` : String(s));
  return { red: w(31), green: w(32), yellow: w(33), dim: w(2), bold: w(1) };
}
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

function formatHuman(rep, { quiet, colorOn }) {
  const c = color(colorOn);
  const icon = (sev) => (sev === "error" ? c.red("✖") : c.yellow("⚠"));
  const L = [];
  if (!quiet) L.push("  ", AGENT_GUIDANCE, "");

  L.push(c.green("✔") +
    ` Scanned ${plural(rep.scannedFileCount, "file")} in ${rep.elapsedMilliseconds}ms`, "");
  L.push(`Style Doctor — ${rep.project}`);
  L.push(`Score: ${rep.score} / 100 ${rep.label}`, "");

  L.push(plural(rep.summary.issues, "issue"));
  for (const cat of CATEGORY_ORDER) {
    const b = rep.summary.byCategory[cat];
    if (!b) continue;
    const parts = [];
    if (b.errors) parts.push(plural(b.errors, "error"));
    if (b.warnings) parts.push(plural(b.warnings, "warning"));
    L.push(`${cat}: ${parts.join(", ")}`);
  }

  // group by rule, ordered by category, then errors first, then count desc
  const groups = new Map();
  for (const d of rep.diagnostics) {
    (groups.get(d.rule) || groups.set(d.rule, []).get(d.rule)).push(d);
  }
  const ordered = [...groups.values()].sort((a, b) => {
    const A = a[0], B = b[0];
    return CATEGORY_ORDER.indexOf(A.category) - CATEGORY_ORDER.indexOf(B.category)
      || (A.severity === B.severity ? 0 : A.severity === "error" ? -1 : 1)
      || b.length - a.length
      || A.title.localeCompare(B.title);
  });
  if (ordered.length) L.push("");
  for (const g of ordered) {
    const d = g[0];
    L.push(`${icon(d.severity)} ${d.title}${g.length > 1 ? ` ×${g.length}` : ""}`);
    L.push(`  ${c.dim(`${d.plugin}/${d.rule}`)}`);
    for (const x of g) L.push(`  ${x.filePath}:${x.line}:${x.column}`);
  }

  if (!quiet) {
    L.push("", "  " + c.dim("─".repeat(60)), "");
    L.push("  Docs: https://github.com/baronunread/style-doctor#readme");
    L.push("  " + c.dim("style-doctor --json for machine output · --scope changed for CI"));
  }
  return L.join("\n");
}

// --- cli ----------------------------------------------------------------

const HELP = `style-doctor ${VERSION} - diagnose prose health (react-doctor for writing)

Usage: style-doctor [options] [directory|files...]

  --json                structured JSON report (suppresses other output)
  --json-compact        with --json, no indentation
  --score               print only the score number
  --quiet               drop the agent-guidance header and footer
  --scope <full|changed>   changed = only files changed vs git base (default: full)
  --base <ref>          git base ref for --scope changed (default: HEAD)
  --category <name>     only this category (repeatable): LLM Tells | Filler | Grammar
  --no-warnings         show error-severity findings only
  --blocking <level>    severity that fails CI: error (default) | warning | none
  --min <n>             also fail if score < n
  --no-color            disable ANSI color (also honors NO_COLOR)
  --ignore a,b          skip these rule ids
  --only a,b            run only these rule ids
  --rules               list rules and exit
  --selftest            run internal checks and exit
  -v, --version         print version
  -h, --help            this text

Exit code: 0 if not blocking, 1 if blocking issues (or score < --min).`;

function parseArgs(argv) {
  const a = {
    files: [], dir: ".", json: false, jsonCompact: false, scoreOnly: false,
    quiet: false, scope: "full", base: null, category: null, noWarnings: false,
    blocking: "error", min: null, only: null, ignore: null,
    colorOn: process.stdout.isTTY && !process.env.NO_COLOR,
  };
  const cats = [];
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--json") a.json = true;
    else if (t === "--json-compact") { a.json = true; a.jsonCompact = true; }
    else if (t === "--score") a.scoreOnly = true;
    else if (t === "--quiet") a.quiet = true;
    else if (t === "--no-warnings") a.noWarnings = true;
    else if (t === "--no-color") a.colorOn = false;
    else if (t === "--color") a.colorOn = true;
    else if (t === "--rules") a.rules = true;
    else if (t === "--selftest") a.selftest = true;
    else if (t === "-h" || t === "--help") { console.log(HELP); process.exit(0); }
    else if (t === "-v" || t === "--version") { console.log(VERSION); process.exit(0); }
    else if (t === "--scope") a.scope = argv[++i];
    else if (t === "--base") a.base = argv[++i];
    else if (t === "--blocking") a.blocking = argv[++i];
    else if (t === "--category") cats.push(argv[++i]);
    else if (t === "--min") a.min = parseInt(argv[++i], 10);
    else if (t === "--only") a.only = new Set(argv[++i].split(","));
    else if (t === "--ignore") a.ignore = new Set(argv[++i].split(","));
    else if (t.startsWith("-")) { console.error(`unknown option: ${t}`); process.exit(2); }
    else {
      try {
        if (statSync(t).isDirectory()) a.dir = t;
        else a.files.push(t);
      } catch { console.error(`no such path: ${t}`); process.exit(2); }
    }
  }
  if (cats.length) a.category = new Set(cats);
  return a;
}

// --- selftest ----------------------------------------------------------------

const SLOP =
  "In today's world, it's important to note that we must delve into the rich " +
  "tapestry of innovation. This is not just a tool, but a game-changer that " +
  "will unlock the potential of your workflow. It stands as a testament to " +
  "seamless, robust, cutting-edge design. When it comes to results, there is " +
  "a plethora of crucial benefits—truly—and at the end of the day, " +
  "this leverages a myriad of paradigms—moreover it is essential.";
const CLEAN =
  "The parser reads one line at a time and stops at the first error. " +
  "It handles files up to about ten megabytes without slowing down. " +
  "If a token is broken, it prints the line number and the bad text, " +
  "then exits with code two so a script can catch the failure.";

function selftest() {
  const assert = (cond, msg) => { if (!cond) { console.error("FAIL:", msg); process.exit(1); } };

  const slop = findInText(SLOP, "slop.md", {});
  const slopIds = new Set(slop.diagnostics.map((d) => d.rule));
  for (const id of ["delve", "tapestry", "not-just-but", "testament"])
    assert(slopIds.has(id), `slop missing ${id}`);
  const slopWeight = slop.diagnostics.reduce((s, d) => s + WEIGHT[d.severity], 0);
  const slopScore = Math.max(0, Math.round(100 - (K * slopWeight * 100) / slop.words));
  assert(slopScore < 55, `slop score ${slopScore}`);

  const clean = findInText(CLEAN, "clean.md", {});
  assert(clean.diagnostics.length === 0, `clean not clean: ${JSON.stringify(clean.diagnostics)}`);

  const one = findInText("We should delve here.", "x.md", {}).diagnostics[0];
  assert(one.rule === "delve" && one.line === 1 && one.column === 11 &&
    one.id === "x.md::1:11::style-doctor/delve", `id/col: ${JSON.stringify(one)}`);

  assert(scoreLabel(70) === "Needs work" && scoreLabel(48) === "Critical" &&
    scoreLabel(95) === "Excellent", "labels");

  const rep = buildReport(process.cwd(), {
    files: [], dir: ".", scope: "full", blocking: "error",
  });
  const txt = formatHuman(rep, { quiet: false, colorOn: false });
  assert(txt.includes("Style Doctor —") && txt.includes("Score:") &&
    txt.includes("Agent guidance"), "human format shape");

  console.log("selftest ok");
}

// --- main ----------------------------------------------------------------

function main() {
  const a = parseArgs(process.argv.slice(2));
  if (a.rules) {
    for (const r of COMPILED)
      console.log(`${r.id.padEnd(22)} ${r.sev.padEnd(7)} ${r.cat.padEnd(10)} ${r.title}`);
    return 0;
  }
  if (a.selftest) { selftest(); return 0; }
  if (!["full", "changed"].includes(a.scope)) { console.error("--scope must be full|changed"); return 2; }
  if (!["error", "warning", "none"].includes(a.blocking)) { console.error("--blocking must be error|warning|none"); return 2; }

  const rep = buildReport(a.dir, {
    files: a.files, scope: a.scope, base: a.base, category: a.category,
    noWarnings: a.noWarnings, blocking: a.blocking, only: a.only, ignore: a.ignore,
  });

  if (a.scoreOnly) { console.log(rep.score); return 0; }
  if (a.json) { console.log(JSON.stringify(rep, null, a.jsonCompact ? 0 : 2)); }
  else { console.log(formatHuman(rep, { quiet: a.quiet, colorOn: a.colorOn })); }

  const blocked = !rep.ok || (a.min != null && rep.score < a.min);
  return blocked ? 1 : 0;
}

export { buildReport, findInText, stripNonProse, scoreLabel, RULES };

if (import.meta.url === `file://${process.argv[1]}`) process.exit(main());
