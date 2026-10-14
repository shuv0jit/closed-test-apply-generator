import { useMemo, useState } from "react";

const PROBLEMS = [
  { id: "icon", label: "Icon changed", fb: "the app icon, which they felt could look clearer", fix: "updated the app icon to a cleaner, clearer design" },
  { id: "bug", label: "Bug fix", fb: "a few bugs and small glitches", fix: "fixed the bugs that testers reported" },
  { id: "server", label: "Server problem", fb: "occasional server problems and slow responses", fix: "fixed the server issues and made connections more stable" },
  { id: "crash", label: "Crash fix", fb: "a few crashes on some devices", fix: "fixed the crashes found on different devices" },
  { id: "ui", label: "UI improvement", fb: "parts of the layout that were confusing", fix: "improved the layout so the screens are easier to follow" },
  { id: "screen", label: "Small screen layout", fb: "layout problems on some screen sizes", fix: "fixed the layout on smaller screens" },
  { id: "speed", label: "Slow loading", fb: "slow loading in some places", fix: "improved loading speed across the app" },
  { id: "login", label: "Login issue", fb: "trouble signing in", fix: "fixed the sign-in problems" },
  { id: "text", label: "Text / typo fix", fb: "typos and unclear wording", fix: "corrected the text and wording throughout the app" },
  { id: "nav", label: "Easier navigation", fb: "some options that were hard to find", fix: "made navigation simpler so options are easier to find" },
  { id: "dark", label: "Dark mode", fb: "requests for a dark theme", fix: "added dark mode support" },
  { id: "perm", label: "Permission prompts", fb: "confusion about permission requests", fix: "made permission prompts clearer" },
  { id: "feature", label: "Small feature added", fb: "requests for a few small extra features", fix: "added a few of the most requested small features" },
  { id: "notif", label: "Notification fix", fb: "problems with notifications", fix: "fixed the notification issues" },
];

const AGES = ["13-18", "15-45", "18-45", "13-70"];
const INSTALLS = ["1000-5000", "1000-10000"];

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

function buildAnswers({ app, paid, about, problems, age, customAge, installs, customInstalls }) {
  const name = app.trim() || "Your App";
  const desc = endDot(about);
  const picked = PROBLEMS.filter((p) => problems.includes(p.id));
  const ageText = age === "custom" ? customAge.trim() || "13 to 70" : fmtRange(age);
  const instText =
    installs === "custom" ? fmtRange(customInstalls || "1000-5000") : fmtRange(installs);

  const q1 = paid
    ? `I recruited my testers through a paid tester group. The group provided real people with Android devices who agreed to install ${name}, stay opted in for the full 14-day testing period, and actually use the app. This helped me reach the minimum tester requirement and get feedback from people I did not personally know.`
    : `I recruited my testers from free tester groups on Facebook and WhatsApp. I posted about ${name} and asked people with Android devices to join the closed test, install the app, and stay opted in for the full 14-day testing period. This helped me reach the minimum tester requirement and get feedback from people I did not personally know.`;

  const q2 = paid
    ? `It was fairly easy. Using a paid tester group meant I did not have to find people one by one. Testers were available quickly, and I could add more when someone dropped out.`
    : `It was fairly hard. Finding people in free groups took a lot of time, many people agreed but did not follow through, and I had to keep reminding testers to stay opted in. It took persistence, but I got the number of testers I needed.`;

  const q3 = `Testers installed ${name} and went through every page of the app, opening each screen and testing every feature one by one. Many of them repeated the steps several times to check that everything worked properly. They also tried the app on different devices and screen sizes to make sure it ran smoothly everywhere.`;

  const fbChannel = paid
    ? `Testers shared their feedback through WhatsApp and Messenger, mostly by messaging me directly.`
    : `Testers shared their feedback through Messenger and WhatsApp groups, where I asked for opinions and they replied with their thoughts.`;
  const q4 = `${fbChannel} Their comments covered how easy ${name} was to use and how it looked${
    picked.length ? `, along with ${list(picked.map((p) => p.fb))}` : ", along with a few small problems they ran into"
  }. I also checked the crash and error reports in Play Console.`;

  const fixes = picked.length
    ? list(picked.map((p) => p.fix))
    : "fixed bugs, improved the flow of the app, and polished the overall experience";
  const q5 = `I went through every piece of feedback and focused on the issues that affected the most people. Changes made: I ${fixes}. Suggestions that did not fit the core purpose of the app are saved for future updates.`;

  const q6 = `${name} is an Android app that helps users get things done simply and in one place.${
    desc ? ` Here is what it offers: ${desc}` : ""
  } It is aimed at people aged ${ageText}. The app is designed to be easy to use, so anyone in this age group can pick it up quickly without any special skills or training.`;

  const q7 = `${name} is very useful and helps users a lot in their daily life. It makes things easier and faster, and everything is simple to use, so people can get what they need in just a few taps without any confusion. I believe it will be a real help to everyone who uses it.`;

  const q8 = `I expect around ${instText} installs in the first year, mainly through social media promotion, word of mouth, and sharing with people who match the target audience.`;

  const q9 = `Based on tester feedback and crash reports, I ${fixes}. These updates make ${name} more stable, easier to use, and better prepared for real users.`;

  const q10 = `I decided ${name} was ready because testers could complete the main tasks in the app without major problems. The serious bugs found during testing were fixed, the app ran stably on the devices that were used, and later feedback was mostly small improvement suggestions rather than critical issues. I plan to keep improving the app after launch based on user reviews.`;

  // gap between a question and its answer: 1 blank line
  // gap between questions / sections: 3 blank lines
  const qa = (q, a) => `${q}\n\n${a}`;

  return (
    [
      `${name} – Production Access Answers`,
      `Part 1: About your closed test`,
      qa("Q1. How did you recruit your testers?", q1),
      qa("Q2. How easy was it to recruit testers for your closed test?", q2),
      qa("Q3. Describe how testers engaged with your app during the closed test.", q3),
      qa("Q4. Summarize the feedback you received and how you collected it.", q4),
      qa("Q5. Which feedback did you act on, and what changes did you make?", q5),
      `Part 2: About your app`,
      qa("Q6. What is the app for, and who is the intended audience?", q6),
      qa("Q7. How does your app provide value to users?", q7),
      qa("Q8. How many installs do you expect in your first year?", q8),
      `Part 3: Production readiness`,
      qa("Q9. What changes did you make to your app based on the closed test?", q9),
      qa("Q10. How did you decide your app is ready for production?", q10),
    ].join("\n\n\n\n") + "\n"
  );
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
  const [installs, setInstalls] = useState("1000-5000");
  const [customInstalls, setCustomInstalls] = useState("");
  const [copied, setCopied] = useState(false);

  const text = useMemo(
    () => buildAnswers({ app, paid, about, problems, age, customAge, installs, customInstalls }),
    [app, paid, about, problems, age, customAge, installs, customInstalls]
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
                <Pill active={installs === "custom"} onClick={() => setInstalls("custom")}>Custom</Pill>
              </div>
              {installs === "custom" && (
                <input className={input + " mt-2"} placeholder="e.g. 2000-8000" value={customInstalls} onChange={(e) => setCustomInstalls(e.target.value)} />
              )}
            </div>
          </div>
        </div>

        {/* OUTPUT */}
        <div className={box + " flex min-h-[420px] flex-col lg:min-h-0"}>
          <div className="mb-2 flex items-center justify-between">
            <span className={label + " mb-0"}>Your answers</span>
            <div className="flex gap-2">
              <button onClick={copy} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400">
                {copied ? "Copied ✓" : "Copy"}
              </button>
              <button onClick={download} className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800">
                Download .txt
              </button>
            </div>
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