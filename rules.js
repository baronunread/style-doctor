/*
 * style-doctor's rule engine: pure regex matching over prose text, no I/O.
 * Zero dependencies, no Node builtins, so this file also runs unmodified in a
 * browser (see web/index.html).
 */

const VERSION = "0.4.1";
const PLUGIN = "style-doctor";
const K = 4.0; // score = 100 - K * (weighted findings per 100 words)
const WEIGHT = { error: 3, warning: 1 };
const CATEGORY_ORDER = ["LLM Tells", "AI Artifacts", "Filler", "Formatting", "Grammar"];

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
  ["superficial-ing", "warning", "LLM Tells", "Superficial-analysis \"-ing\" filler",
    String.raw`\b(?:underscor(?:e|es|ing)|highlight(?:s|ing)?|showcas(?:e|es|ing)|foster(?:s|ing)?|emphasiz(?:e|es|ing))\b`,
    "These \"-ing\" connectives gesture at analysis without adding any.",
    "State the actual point instead."],
  ["ai-vocab", "warning", "LLM Tells", "AI-vocabulary word",
    String.raw`\b(?:garner(?:s|ed|ing)?|meticulous(?:ly)?|intricac(?:y|ies)|intricate|interplay|enduring|vibrant)\b`,
    "This word shows up disproportionately in LLM output.",
    "Use a plainer, more specific word."],
  ["copula-avoidance", "warning", "LLM Tells", "\"Serves/stands as\" instead of \"is\"",
    String.raw`\bserves? as\b|\bstands? as\b|\bfunctions? as\b|\bplays? an? (?:crucial|key|vital|pivotal) role\b`,
    "Dressing up \"is\" as \"serves as\"/\"stands as\" is a common LLM avoidance tic.",
    "Just use \"is\" or the plain verb."],
  ["legacy-praise", "warning", "LLM Tells", "Vague legacy/location praise",
    String.raw`\bin the heart of\b|\brich history\b|\bindelible mark\b`,
    "This phrase is empty legacy/location praise.",
    "Say the specific fact instead."],
  ["vague-attribution", "warning", "LLM Tells", "Unsourced authority",
    String.raw`\bindustry reports\b|\bexperts (?:argue|believe|agree)\b|\bstudies show\b|\bobservers have (?:cited|noted)\b`,
    "This attributes a claim to an unnamed authority.",
    "Cite the actual source or cut the claim."],
  ["ai-artifact", "error", "AI Artifacts", "Leftover AI-generation artifact",
    String.raw`\bas an ai language model\b|\bi hope this helps\b|\blet me know if you have (?:any )?questions\b|\b(?:certainly|of course)!|\boaicite\w*\b|\bcontentreference\b|\butm_source=chatgpt\.com\b|\bciteturn\d+\w*\b`,
    "This is a chatbot sign-off or citation scrap left in from an unedited paste.",
    "Remove it; it means the output was never read before publishing."],
  ["title-case-heading", "warning", "Formatting", "Title Case Every Word heading",
    String.raw`^#{1,6}\s+(?:[A-Z][A-Za-z'-]*\s+){2,}[A-Z][A-Za-z'-]*\s*$`,
    "Capitalizing every word in a heading is an LLM formatting default.",
    "Use sentence case."],
  ["inline-bold-bullet", "warning", "Formatting", "\"**Label:** text\" bullet",
    String.raw`^\s*[-*]\s*\*\*[^*\n]+:\*\*`,
    "Bolded label-then-colon bullets are an LLM list default.",
    "Write the point as a plain sentence, or drop the bold."],
  ["bold-density", "warning", "Formatting", "Bold-text overuse",
    null, // doc-level, computed separately
    "Frequent bolding is a common LLM formatting tell.",
    "Reserve bold for genuine emphasis; use fewer spans."],
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
  ["hedge-stack", "warning", "Filler", "Stacked hedge / confidence-calibration opener",
    String.raw`\bcould potentially\b|\bmay (?:well|eventually)\b|\bit'?s worth noting\b|\b(?:interestingly|notably),`,
    "Stacked hedges, or flagging your own \"noteworthy\" aside, is LLM throat-clearing.",
    "Pick one hedge, or state the fact plainly."],
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

const sp = (s) => s.replace(/[^\n]/g, " ");
const TEMPLATE_EXT = /\.(?:astro|jsx|tsx|html?|vue|svelte)$/i;

// Naive prose extractor for template/component files: no AST. It ALLOWLISTS
// what to lint (JSX/HTML text nodes + prose attribute values) and blanks the
// rest length-preservingly, so findInText's line/column offsets stay valid.
// An allowlist beats blanking-out-code here: JSX text sits between `) {` and
// its closing `}`, so any brace-based stripping eats the prose with it.
// ponytail: regex, not a parser. Swap in acorn-jsx / the astro compiler only
// if the false-positive rate proves too high in practice.
const PROSE_ATTR = /\b(alt|aria-label|title|placeholder|content)\s*=\s*(["'])([\s\S]*?)\2/gi;

function stripTemplate(text) {
  // Blank <script>/<style> bodies first: their JS holds < and > that would
  // read as tags. Keep the line count.
  let block = false;
  let s = text.split(/\r?\n/).map((line) => {
    if (block) { if (/<\/(?:script|style)>/i.test(line)) block = false; return sp(line); }
    if (/<(?:script|style)[\s>]/i.test(line)) {
      if (!/<\/(?:script|style)>/i.test(line)) block = true;
      return sp(line);
    }
    return line;
  }).join("\n");
  s = s.replace(/&[a-z#0-9]+;/gi, sp); // html entities -> spaces

  const keep = new Uint8Array(s.length);
  const mark = (start, len) => { for (let i = start; i < start + len; i++) keep[i] = 1; };
  for (const m of s.matchAll(/>([^<>{}]+)</g)) mark(m.index + 1, m[1].length); // text nodes
  for (const m of s.matchAll(PROSE_ATTR)) {
    if (m[1].toLowerCase() === "content" &&
        !/\b(?:name|property)\s*=\s*["'][a-z:]*description["']/i
          .test(s.slice(Math.max(0, m.index - 120), m.index)))
      continue;
    mark(m.index + m[0].length - m[3].length - 1, m[3].length);
  }
  let out = "";
  for (let i = 0; i < s.length; i++)
    out += keep[i] ? s[i] : (s[i] === "\n" ? "\n" : " ");

  return out.split("\n").map((line) => (proseLine(line) ? line : sp(line)));
}

// Does this line read like a sentence, not code? Filters identifiers, paths,
// class lists, and lone labels that survive tag blanking.
function proseLine(line) {
  const t = line.trim();
  if (t.length < 12 || !/\s/.test(t)) return false;
  const words = t.split(/\s+/).filter((w) => /^[A-Za-z][A-Za-z'’-]*$/.test(w));
  if (words.length < 3) return false;
  if (/[/\\{}<>|=]|::|\$\(|=>/.test(t) && words.length < 8) return false;
  return true;
}

const toProse = (text, filePath) =>
  (TEMPLATE_EXT.test(filePath) ? stripTemplate : stripNonProse)(text);

function findInText(text, filePath, { only, ignore, plain }) {
  const out = [];
  // `plain` (stdin): caller already extracted the prose; don't re-run a
  // template extractor over it just because the label ends in .astro.
  const prose = plain ? stripNonProse(text) : toProse(text, filePath);
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
  const bolds = (proseText.match(/\*\*[^*\n]+\*\*/g) || []).length;
  const rb = BY_ID["bold-density"];
  if ((!only || only.has(rb.id)) && !(ignore && ignore.has(rb.id)) &&
      (bolds / words) * 100 > 2.0 && bolds >= 4) {
    out.push(diag(rb, filePath, 1, 1, `${bolds} bolded spans in ${words} words`));
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

function scoreLabel(s) {
  return s >= 90 ? "Excellent" : s >= 80 ? "Healthy" : s >= 50 ? "Needs work" : "Critical";
}

export {
  VERSION, PLUGIN, K, WEIGHT, CATEGORY_ORDER, RULES, COMPILED, BY_ID,
  wordCount, stripNonProse, toProse, findInText, scoreLabel,
};
