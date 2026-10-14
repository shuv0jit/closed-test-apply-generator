import { useMemo, useState } from "react";

const PROBLEMS = [
  { id: "icon", label: "Icon changed", fb: "the app icon", fix: "updated the app icon" },
  { id: "bug", label: "Bug fix", fb: "a few bugs", fix: "fixed the reported bugs" },
  { id: "server", label: "Server problem", fb: "server problems", fix: "fixed server issues" },
  { id: "crash", label: "Crash fix", fb: "some crashes", fix: "fixed crashes" },
  { id: "ui", label: "UI improvement", fb: "confusing layouts", fix: "improved the layout" },
  { id: "screen", label: "Small screen layout", fb: "small-screen layout issues", fix: "fixed small-screen layouts" },
  { id: "speed", label: "Slow loading", fb: "slow loading", fix: "sped up loading" },
  { id: "login", label: "Login issue", fb: "sign-in trouble", fix: "fixed sign-in problems" },
  { id: "text", label: "Text / typo fix", fb: "typos", fix: "corrected typos" },
  { id: "nav", label: "Easier navigation", fb: "hard-to-find options", fix: "simplified navigation" },
  { id: "dark", label: "Dark mode", fb: "dark mode requests", fix: "added dark mode" },
  { id: "perm", label: "Permission prompts", fb: "unclear permission prompts", fix: "clarified permission prompts" },
  { id: "feature", label: "Small feature added", fb: "requests for small features", fix: "added small requested features" },
  { id: "notif", label: "Notification fix", fb: "notification problems", fix: "fixed notifications" },
];

const AGES = ["13-18", "15-45", "18-45", "13-70"];
const INSTALLS = ["0 to 10K", "10K to 100K", "100K to 1M"];

const fmtRange = (s) =>
  s
    .trim()
    .replace(/\d+/g, (n) => Number(n).toLocaleString("en-US"))
    .replace(/\s*[-–]\s*/g, " to ");

const list = (arr) =>
  arr.length <= 1
    ? arr.join("")
    : arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1];

const endDot = (s) => {
  const t = s.trim();
  return !t ? "" : /[.!?]$/.test(t) ? t : t + ".";
};

// Cuts text to the last full sentence that fits inside the limit.
const clamp = (t, l) => {
  if (t.length <= l) return t;
  const parts = t.match(/[^.!?]+[.!?]+\s*/g) || [];
  let out = "";
  for (const p of parts) {
    if ((out + p).trimEnd().length > l) break;
    out += p;
  }
  if (out.trim()) return out.trim();
  const cut = t.slice(0, l - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s]+$/, "") + ".";
};

// Tries all items first, then drops items from the end until the answer fits.
const fitItems = (items, make, l) => {
  for (let n = items.length; n >= 0; n--) {
    const t = make(items.slice(0, n));
    if (t.length <= l) return { t, trimmed: n < items.length };
  }
  return { t: clamp(make([]), l), trimmed: items.length > 0 };
};

function buildAnswers({ app, paid, about, problems, age, customAge, installs, limit }) {
  const name = app.trim() || "Your App";
  const sentences = about
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s + ".");
  const picked = PROBLEMS.filter((p) => problems.includes(p.id));
  const ageText = age === "custom" ? customAge.trim() || "13 to 70" : fmtRange(age);

  const a1 = paid
    ? `I recruited testers through a paid tester group. They provided real people with Android devices who installed ${name}, stayed opted in for the full 14 days and used the app, giving me feedback from people I did not know personally.`
    : `I recruited testers from free tester groups on Facebook and WhatsApp. I asked people with Android devices to join, install ${name} and stay opted in for the full 14 days, which gave me feedback from people I did not know personally.`;

  const a2 = paid ? "Easy" : "Difficult";

  const a3 = `Testers installed ${name} and went through every page, opening each screen and testing every feature one by one. Many repeated the steps several times to check that everything worked, and they tried the app on different devices and screen sizes.`;

  const channel = paid
    ? `Testers sent feedback through WhatsApp and Messenger, mostly by messaging me directly.`
    : `Testers sent feedback through Messenger and WhatsApp groups, where I asked for opinions and they replied.`;
  const r4 = fitItems(
    picked.map((p) => p.fb),
    (items) =>
      `${channel} Their comments covered ease of use and design, ${
        items.length ? `plus ${list(items)}` : "plus a few small problems"
      }. I also checked crash reports in Play Console.`,
    limit
  );

  const fixList = picked.map((p) => p.fix);
  const r5 = fitItems(
    fixList,
    (items) =>
      `I reviewed all feedback and focused on what affected the most users. Changes: I ${
        items.length ? list(items) : "fixed bugs and polished the overall experience"
      }. Ideas outside the app's core purpose are saved for later updates.`,
    limit
  );

  const r6 = fitItems(
    sentences,
    (items) =>
      [
        `${name} is an Android app made to help users get things done simply.`,
        items.join(" "),
        `It is meant for people aged ${ageText}, and it is easy to pick up without any special skills.`,
      ]
        .filter(Boolean)
        .join(" "),
    limit
  );

  const a7 = `${name} is very useful and helps users a lot in daily life. It makes things easier and faster, and everything is simple, so people get what they need in a few taps. I believe it will be a real help to everyone who uses it.`;

  const a8 = installs;

  const r9 = fitItems(
    fixList,
    (items) =>
      `Based on tester feedback and crash reports, I ${
        items.length ? list(items) : "fixed bugs and polished the overall experience"
      }. These updates made ${name} more stable and easier to use.`,
    limit
  );

  const a10 = `${name} was ready because testers could finish the main tasks without major problems. Serious bugs were fixed, the app ran stably on the devices used, and recent feedback was only small suggestions. I will keep improving it after launch based on reviews.`;

  const answers = [
    clamp(a1, limit),
    clamp(a2, limit),
    clamp(a3, limit),
    r4.t,
    r5.t,
    r6.t,
    clamp(a7, limit),
    clamp(a8, limit),
    r9.t,
    clamp(a10, limit),
  ];

  const qs = [
    "Q1. How did you recruit your testers?",
    "Q2. How easy was it to recruit testers for your closed test?",
    "Q3. Describe how testers engaged with your app during the closed test.",
    "Q4. Summarize the feedback you received and how you collected it.",
    "Q5. Which feedback did you act on, and what changes did you make?",
    "Q6. What is the app for, and who is the intended audience?",
    "Q7. How does your app provide value to users?",
    "Q8. How many installs do you expect in your first year?",
    "Q9. What changes did you make to your app based on the closed test?",
    "Q10. How did you decide your app is ready for production?",
  ];

  // gap between a question and its answer: 1 blank line
  // gap between questions / sections: 3 blank lines
  const qa = (i) => `${qs[i]}\n\n${answers[i]}`;

  const text =
    [
      `${name} – Production Access Answers`,
      `Part 1: About your closed test`,
      qa(0),
      qa(1),
      qa(2),
      qa(3),
      qa(4),
      `Part 2: About your app`,
      qa(5),
      qa(6),
      qa(7),
      `Part 3: Production readiness`,
      qa(8),
      qa(9),
    ].join("\n\n\n\n") + "\n";

  return {
    text,
    longest: Math.max(...answers.map((a) => a.length)),
    trimmed: r4.trimmed || r5.trimmed || r6.trimmed || r9.trimmed,
  };
}

const box = "rounded-xl border border-slate-700 bg-slate-900/70 p-3";
const label = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400";
const input =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500";

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-xs font-medium transition " +
        (active
          ? "border-indigo-500 bg-indigo-500 text-white"
          : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500")
      }
    >
      {children}
    </button>
  );
}

export default function App() {
  const [app, setApp] = useState("");
  const [paid, setPaid] = useState(true);
  const [about, setAbout] = useState("");
  const [problems, setProblems] = useState([]);
  const [age, setAge] = useState("13-18");
  const [customAge, setCustomAge] = useState("");
  const [installs, setInstalls] = useState("0 to 10K");
  const [copied, setCopied] = useState(false);
  const [limit, setLimit] = useState(300);

  const { text, longest, trimmed } = useMemo(
    () =>
      buildAnswers({ app, paid, about, problems, age, customAge, installs, limit: Math.max(100, Number(limit) || 300) }),
    [app, paid, about, problems, age, customAge, installs, limit]
  );

  const toggle = (id) =>
    setProblems((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const file = (app.trim() || "closed-testing").replace(/[^\w-]+/g, "-").toLowerCase();
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file}-answers.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-3 text-slate-100 lg:h-screen lg:overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-3 lg:h-full lg:grid-cols-2">
        {/* INPUTS */}
        <div className="flex flex-col gap-3 lg:min-h-0">
          <div className="flex items-baseline justify-between px-1">
            <h1 className="text-lg font-bold">Closed Test Answer Generator</h1>
            <span className="text-xs text-slate-500">Google Play production access</span>
          </div>

          <div className={box}>
            <label className={label}>App name</label>
            <input className={input} placeholder="e.g. BrandSlip" value={app} onChange={(e) => setApp(e.target.value)} />
          </div>

          <div className={box}>
            <label className={label}>Q1 &amp; Q2 · How did you recruit testers?</label>
            <div className="flex gap-2">
              <Pill active={paid} onClick={() => setPaid(true)}>Paid</Pill>
              <Pill active={!paid} onClick={() => setPaid(false)}>Free (from groups)</Pill>
            </div>
          </div>

          <div className={box}>
            <label className={label}>Q6 · What does the app do? (each full stop = one feature)</label>
            <textarea
              rows={4}
              className={input + " resize-none"}
              placeholder="Create branded PDF receipts. Add a logo and business name. Save and share the PDF."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>

          <div className={box}>
            <label className={label}>Q4, Q5 &amp; Q9 · Feedback / fixes (select multiple)</label>
            <div className="flex flex-wrap gap-1.5">
              {PROBLEMS.map((p) => (
                <Pill key={p.id} active={problems.includes(p.id)} onClick={() => toggle(p.id)}>
                  {p.label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={box}>
              <label className={label}>Q6 · Age group</label>
              <div className="flex flex-wrap gap-1.5">
                {AGES.map((a) => (
                  <Pill key={a} active={age === a} onClick={() => setAge(a)}>{a}</Pill>
                ))}
                <Pill active={age === "custom"} onClick={() => setAge("custom")}>Custom</Pill>
              </div>
              {age === "custom" && (
                <input className={input + " mt-2"} placeholder="e.g. 20 to 60" value={customAge} onChange={(e) => setCustomAge(e.target.value)} />
              )}
            </div>

            <div className={box}>
              <label className={label}>Q8 · First-year installs</label>
              <div className="flex flex-wrap gap-1.5">
                {INSTALLS.map((a) => (
                  <Pill key={a} active={installs === a} onClick={() => setInstalls(a)}>{a}</Pill>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* OUTPUT */}
        <div className={box + " flex min-h-[420px] flex-col lg:min-h-0"}>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={label + " mb-0"}>Your answers</span>
              <span className="text-[11px] text-slate-500">limit</span>
              <input
                type="number"
                min="100"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-16 rounded-md border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={copy} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400">
                {copied ? "Copied ✓" : "Copy"}
              </button>
              <button onClick={download} className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800">
                Download .txt
              </button>
            </div>
          </div>
          <div className="mb-2 text-[11px] text-slate-500">
            Longest answer: {longest} / {Math.max(100, Number(limit) || 300)} characters
            {trimmed && <span className="text-amber-400"> · some selections were left out to fit the limit</span>}
          </div>
          <textarea
            readOnly
            value={text}
            className="min-h-0 flex-1 resize-none rounded-lg border border-slate-800 bg-slate-950 p-3 text-[13px] leading-relaxed text-slate-200 outline-none"
          />
        </div>
      </div>
    </div>
  );
}