#!/usr/bin/env node
/*
 * style-doctor: diagnose prose health, the way react-doctor diagnoses a React
 * codebase. Scans a folder of Markdown/text, groups findings by rule, prints a
 * 0-100 score, and exits non-zero when blocking issues are present so it drops
 * straight into CI. Built to be driven by an AI (`--json`, stable finding ids).
 *
 *   npx style-doctor                 # scan ./
 *   npx style-doctor docs/           # scan a folder
 *   extract-prose web/ | npx style-doctor -   # score prose piped on stdin
 *   npx style-doctor --json          # structured report (suppresses other output)
 *   npx style-doctor --score         # print only the score
 *   npx style-doctor --scope changed # only files changed vs git HEAD
 *   npx style-doctor --blocking warning   # warnings fail CI too
 *   npx style-doctor --exclude "vendor/**,*.gen.md"  # skip paths (globs)
 *
 * Persistent config: a ".style-doctor.json" file, or a "style-doctor" key in
 * package.json, with { "exclude": [globs], "ignore": [rule ids] }. CLI
 * --exclude / --ignore add to whatever the config lists.
 */
import { readFileSync, globSync, statSync, realpathSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  VERSION, PLUGIN, K, WEIGHT, CATEGORY_ORDER, RULES, COMPILED,
  wordCount, stripNonProse, findInText, scoreLabel,
} from "./rules.js";

// minimal glob -> RegExp for path exclusion: ** spans directories, * stays
// within a segment, ? is one non-slash char. Matches at any depth.
function globToRe(glob) {
  let re = "";
  const g = glob.replace(/^\.\//, "");
  for (let i = 0; i < g.length; i++) {
    const ch = g[i];
    if (ch === "*") {
      if (g[i + 1] === "*") { re += ".*"; i++; if (g[i + 1] === "/") i++; }
      else re += "[^/]*";
    } else if (ch === "?") re += "[^/]";
    else re += ch.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^(?:.*/)?(?:${re})(?:/.*)?$`, "i");
}

// (path) => bool: true if any user glob matches. Empty list matches nothing.
function excludeMatcher(globs = []) {
  const res = globs.map(globToRe);
  return (p) => res.some((re) => re.test(p));
}

// .style-doctor.json, else the "style-doctor" key in package.json, else {}.
function loadConfig(dir) {
  const read = (p) => {
    try { return JSON.parse(readFileSync(resolve(dir, p), "utf8")); }
    catch { return null; }
  };
  const file = read(".style-doctor.json");
  if (file) return file;
  const pkg = read("package.json");
  return (pkg && pkg["style-doctor"]) || {};
}

const MD_GLOB = "md,markdown,mdx,txt";
const TEMPLATE_GLOB = "astro,jsx,tsx,html,htm,vue,svelte";

function discover(dir, exclude = [], noTemplates = false) {
  // globSync's exclude callback sees path segments, not full paths, so it can
  // only prune whole directories by name. User globs may have slashes, so match
  // those against the full relative path after the walk.
  const BUILTIN = /(^|\/)(node_modules|\.git|dist|build|out|vendor|coverage|\.next|\.cache)(\/|$)/;
  const skip = excludeMatcher(exclude);
  const glob = `**/*.{${noTemplates ? MD_GLOB : `${MD_GLOB},${TEMPLATE_GLOB}`}}`;
  return globSync(glob, { cwd: dir, exclude: (p) => BUILTIN.test(p) })
    .filter((p) => !skip(p))
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

function buildReport(dir, opts) {
  const started = Date.now();
  let files = opts.files.length ? opts.files
    : opts.stdin ? [] : discover(dir, opts.exclude, opts.noTemplates);
  if (opts.files.length && opts.exclude?.length) {
    const skip = excludeMatcher(opts.exclude);
    files = files.filter((f) => !skip(relative(dir, resolve(dir, f))));
  }
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
  if (opts.stdin && opts.stdinText != null) {
    const res = findInText(opts.stdinText, opts.stdinName || "<stdin>", { ...opts, plain: true });
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
    scannedFileCount: files.length + (opts.stdin ? 1 : 0),
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

Usage: style-doctor [options] [directory|files... | -]

  -                     read prose to scan from stdin (pipe in extracted
                        component/template text, a commit message, etc.)
  --stdin-name <label>  filePath to report for stdin findings (default: <stdin>)
  --no-templates        scan only .md/.markdown/.mdx/.txt; skip .astro/.jsx/.tsx/
                        .html/.vue/.svelte (which are scanned by default)
  --json                structured JSON report (suppresses other output)
  --json-compact        with --json, no indentation
  --score               print only the score number
  --quiet               drop the agent-guidance header and footer
  --scope <full|changed>   changed = only files changed vs git base (default: full)
  --base <ref>          git base ref for --scope changed (default: HEAD)
  --category <name>     only this category (repeatable): LLM Tells | AI Artifacts | Filler | Formatting | Grammar
  --no-warnings         show error-severity findings only
  --blocking <level>    severity that fails CI: error (default) | warning | none
  --min <n>             also fail if score < n
  --no-color            disable ANSI color (also honors NO_COLOR)
  --ignore a,b          skip these rule ids (adds to config "ignore")
  --exclude a,b         skip these paths (globs; adds to config "exclude")
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
    blocking: "error", min: null, only: null, ignore: null, exclude: [],
    stdin: false, stdinName: null, noTemplates: false,
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
    else if (t === "--exclude") a.exclude.push(...argv[++i].split(","));
    else if (t === "--stdin-name") a.stdinName = argv[++i];
    else if (t === "--no-templates") a.noTemplates = true;
    else if (t === "-") a.stdin = true;
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
  "this leverages a myriad of paradigms—moreover it is essential. " +
  "Industry reports show experts believe this serves as a meticulous, intricate " +
  "interplay that is underscoring enduring value, nestled in the heart of a vibrant " +
  "landscape. It could potentially garner attention—interestingly, studies show " +
  "observers have cited a rich history. I hope this helps! Let me know if you " +
  "have questions.";
const CLEAN =
  "The parser reads one line at a time and stops at the first error. " +
  "It handles files up to about ten megabytes without slowing down. " +
  "If a token is broken, it prints the line number and the bad text, " +
  "then exits with code two so a script can catch the failure.";

function selftest() {
  const assert = (cond, msg) => { if (!cond) { console.error("FAIL:", msg); process.exit(1); } };

  const slop = findInText(SLOP, "slop.md", {});
  const slopIds = new Set(slop.diagnostics.map((d) => d.rule));
  for (const id of ["delve", "tapestry", "not-just-but", "testament",
    "superficial-ing", "ai-vocab", "copula-avoidance", "legacy-praise",
    "vague-attribution", "hedge-stack", "ai-artifact"])
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

  // template extraction: prose from text nodes + alt/meta, code left alone
  const astro = findInText(
    "---\nconst blurb = 'we must delve into it';\n---\n" +          // frontmatter: skipped
    "<h1>This stands as a testament to seamless, robust design.</h1>\n" +  // line 4
    "<img alt=\"It's important to note the boat sails well\" src=\"/b.png\" />\n" + // line 5
    "<a href=\"/docs\" class=\"btn-primary lg\">{label}</a>\n" +     // line 6: no prose
    "<meta name=\"description\" content=\"We delve into a rich tapestry of things\" />\n", // line 7
    "Hero.astro", {});
  const aIds = new Set(astro.diagnostics.map((d) => d.rule));
  for (const id of ["testament", "seamless", "important-to-note", "delve", "tapestry"])
    assert(aIds.has(id), `astro extract missing ${id}: ${[...aIds]}`);
  assert(!astro.diagnostics.some((d) => d.line <= 3), "frontmatter/code scanned");
  assert(!astro.diagnostics.some((d) => d.line === 6), "code-only line scanned");
  assert(findInText("const delveInto = useDelve();\n", "x.tsx", {}).diagnostics.length === 0,
    "tsx identifier linted");

  const headings = findInText(
    "## This Is A Title Case Heading\n" +
    "- **Speed:** improved significantly\n" +
    "**bold one** and **bold two** and **bold three** and **bold four**\n",
    "heading.md", {});
  const hIds = new Set(headings.diagnostics.map((d) => d.rule));
  for (const id of ["title-case-heading", "inline-bold-bullet", "bold-density"])
    assert(hIds.has(id), `heading test missing ${id}: ${[...hIds]}`);

  const exDir = excludeMatcher(["video-hf", "*.txt", "docs/**"]);
  assert(exDir("video-hf/AGENTS.md") && exDir("a/b/notes.txt") &&
    exDir("docs/deep/x.md"), "exclude matches");
  assert(!exDir("README.md") && !exDir("videos/x.md") &&
    !excludeMatcher([])("anything.md"), "exclude non-matches");

  const piped = buildReport(process.cwd(), {
    files: [], dir: ".", scope: "full", blocking: "error",
    stdin: true, stdinText: "We must delve into the tapestry.", stdinName: "hero.astro",
  });
  assert(piped.scannedFileCount === 1 &&
    piped.diagnostics.some((d) => d.rule === "delve" && d.filePath === "hero.astro"),
    "stdin scan");

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

  const cfg = loadConfig(a.dir);
  const exclude = [...(cfg.exclude || []), ...a.exclude];
  const ignore = new Set([...(cfg.ignore || []), ...(a.ignore || [])]);

  let stdinText = null;
  if (a.stdin) {
    try { stdinText = readFileSync(0, "utf8"); }
    catch { console.error("style-doctor: could not read stdin"); return 2; }
  }

  const rep = buildReport(a.dir, {
    files: a.files, scope: a.scope, base: a.base, category: a.category,
    noWarnings: a.noWarnings, blocking: a.blocking, only: a.only,
    ignore: ignore.size ? ignore : null, exclude,
    stdin: a.stdin, stdinText, stdinName: a.stdinName, noTemplates: a.noTemplates,
  });

  if (a.scoreOnly) { console.log(rep.score); return 0; }
  if (a.json) { console.log(JSON.stringify(rep, null, a.jsonCompact ? 0 : 2)); }
  else { console.log(formatHuman(rep, { quiet: a.quiet, colorOn: a.colorOn })); }

  const blocked = !rep.ok || (a.min != null && rep.score < a.min);
  return blocked ? 1 : 0;
}

export { buildReport, findInText, stripNonProse, scoreLabel, RULES };

// Run as a CLI when invoked directly. `import.meta.url === file://${argv[1]}`
// breaks under npx/bunx (the bin is a symlink shim), so resolve real paths.
function isEntrypoint() {
  if (typeof import.meta.main === "boolean") return import.meta.main; // Bun, Node >=24.2
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}
if (isEntrypoint()) process.exit(main());
