import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

// fb = what testers reported (noun phrase), fx = what you did (past tense),
// nn = the change as a noun phrase
const PROBLEMS = [
  { id: "icon", label: "Icon changed", fb: "the app icon", fx: "updated the app icon", nn: "a refreshed app icon" },
  { id: "bug", label: "Bug fix", fb: "a few bugs", fx: "fixed the reported bugs", nn: "bug fixes" },
  { id: "server", label: "Server problem", fb: "server hiccups", fx: "fixed server issues", nn: "more stable server connections" },
  { id: "crash", label: "Crash fix", fb: "some crashes", fx: "fixed crashes", nn: "crash fixes" },
  { id: "ui", label: "UI improvement", fb: "confusing layouts", fx: "cleaned up the layout", nn: "a cleaner layout" },
  { id: "screen", label: "Small screen layout", fb: "small-screen layout issues", fx: "fixed small-screen layouts", nn: "better small-screen layouts" },
  { id: "speed", label: "Slow loading", fb: "slow loading", fx: "sped up loading", nn: "faster loading" },
  { id: "login", label: "Login issue", fb: "sign-in trouble", fx: "fixed sign-in problems", nn: "smoother sign-in" },
  { id: "text", label: "Typo fix", fb: "typos", fx: "corrected typos", nn: "corrected text" },
  { id: "nav", label: "Easier navigation", fb: "hard-to-find options", fx: "simplified navigation", nn: "simpler navigation" },
  { id: "dark", label: "Dark mode", fb: "requests for dark mode", fx: "added dark mode", nn: "dark mode" },
  { id: "perm", label: "Permission prompts", fb: "unclear permission prompts", fx: "clarified permission prompts", nn: "clearer permission prompts" },
  { id: "feature", label: "Small feature added", fb: "requests for small features", fx: "added a few small features", nn: "a few small features" },
  { id: "notif", label: "Notification fix", fb: "notification problems", fx: "fixed notifications", nn: "working notifications" },
  { id: "align", label: "Button alignment", fb: "misaligned buttons", fx: "realigned the buttons", nn: "properly aligned buttons" },
  { id: "font", label: "Font size", fb: "small, hard-to-read text", fx: "enlarged the text", nn: "more readable text" },
  { id: "contrast", label: "Color contrast", fb: "low color contrast", fx: "improved color contrast", nn: "better color contrast" },
  { id: "anim", label: "Animation lag", fb: "laggy animations", fx: "smoothed out animations", nn: "smoother animations" },
  { id: "keyboard", label: "Keyboard overlap", fb: "the keyboard covering input fields", fx: "stopped the keyboard covering fields", nn: "input fields that stay visible" },
  { id: "back", label: "Back button", fb: "odd back button behavior", fx: "fixed the back button", nn: "a properly working back button" },
  { id: "splash", label: "Splash screen", fb: "a slow splash screen", fx: "shortened the splash screen", nn: "a quicker splash screen" },
  { id: "onboard", label: "Onboarding", fb: "confusion on first launch", fx: "simplified the first-launch screens", nn: "simpler first-launch screens" },
  { id: "tablet", label: "Tablet layout", fb: "stretched layouts on tablets", fx: "fixed tablet layouts", nn: "better tablet layouts" },
  { id: "land", label: "Landscape mode", fb: "broken landscape layouts", fx: "fixed landscape mode", nn: "working landscape mode" },
  { id: "img", label: "Image loading", fb: "slow image loading", fx: "sped up image loading", nn: "faster image loading" },
  { id: "scroll", label: "Scroll lag", fb: "choppy scrolling", fx: "smoothed out scrolling", nn: "smoother scrolling" },
  { id: "form", label: "Form errors", fb: "unclear form errors", fx: "clarified form error messages", nn: "clearer error messages" },
  { id: "loader", label: "Loading indicators", fb: "no sign that something was loading", fx: "added loading indicators", nn: "loading indicators" },
  { id: "empty", label: "Empty screens", fb: "blank screens with no guidance", fx: "added helpful empty screens", nn: "helpful empty screens" },
  { id: "search", label: "Search fix", fb: "search missing results", fx: "fixed search", nn: "better search" },
  { id: "offline", label: "Offline handling", fb: "trouble without internet", fx: "improved offline handling", nn: "better offline handling" },
  { id: "touch", label: "Tap targets", fb: "buttons that were hard to tap", fx: "enlarged tap targets", nn: "bigger tap targets" },
  { id: "settings", label: "Settings screen", fb: "a confusing settings screen", fx: "tidied the settings screen", nn: "a tidier settings screen" },
];

const CHANNELS = [
  { id: "wa", label: "WhatsApp", ph: "WhatsApp messages" },
  { id: "ms", label: "Messenger", ph: "Messenger chats" },
  { id: "tg", label: "Telegram", ph: "Telegram messages" },
  { id: "fbc", label: "Facebook comments", ph: "Facebook post comments" },
  { id: "fbg", label: "Facebook groups", ph: "Facebook groups" },
  { id: "wag", label: "WhatsApp groups", ph: "WhatsApp groups" },
  { id: "tgg", label: "Telegram groups", ph: "Telegram groups" },
  { id: "ig", label: "Instagram DMs", ph: "Instagram DMs" },
  { id: "dc", label: "Discord", ph: "Discord" },
  { id: "dm", label: "Direct messages", ph: "direct messages" },
  { id: "em", label: "Email", ph: "email" },
];
const DEFAULT_CH = { paid: ["wa", "ms"], free: ["ms", "wag"], family: ["wa", "ms", "dm"] };

const AGES = ["13-18", "15-45", "18-45", "13-70"];
const INSTALLS = ["0 to 10K", "10K to 100K", "100K to 1M"];

const FALLBACK = {
  fb: "a few small problems",
  fx: "fixed bugs and polished the overall experience",
  nn: "bug fixes and general polish",
};

/* ------------------------------------------------------------------ */
/*  ANSWER PATTERNS  (20 per question, each one built differently)     */
/*  placeholders: {n} app name, {ch} channels, {fb} reported issues,   */
/*  {a} age, {f} your feature sentences, {fx} fixes, {nn} fixes (noun) */
/* ------------------------------------------------------------------ */

const PATS = {
  // Q1 - recruiting (paid / free)
  q1: {
    paid: [
      "I recruited my testers through a paid tester group. They supplied real Android users who installed {n}, stayed opted in for the 14 days and used it, so I got feedback from people I had never met.",
      "To reach the tester requirement quickly, I hired a paid testing group. Real people with Android phones joined the closed test, installed {n} and kept it installed for the full 14 days.",
      "Testers came from a paid service I booked for this closed test. Each one was a real person on a real Android device who opted in, installed {n} and used it throughout the 14-day period.",
      "I did not know enough people with Android devices, so I paid a tester group to help. Their members opted in, installed {n} and tested it for the complete 14 days.",
      "A paid tester community handled recruitment for me. Real users with their own Android devices installed {n}, stayed opted in and kept testing across the full 14-day window.",
      "Paying for a tester group was how I got my testers. The people they sent were real Android users, and all of them installed {n} and stayed in the test until the 14 days were over.",
      "Recruitment was done through a paid testing service. They matched {n} with real Android users who accepted the invite, installed the app and remained opted in the whole time.",
      "I used a paid tester group because I wanted real people rather than friends and family. They installed {n} on their own Android devices and stayed opted in for all 14 days.",
      "My testers were provided by a paid group. After I shared the test link, each member joined, installed {n} and stayed opted in until the 14-day period ended.",
      "Through a paid tester group I found real Android users willing to try {n}. They joined the closed test, installed it and stayed enrolled for the full 14 days, giving me honest outside feedback.",
      "I went with a paid testing service for recruitment. It sent real people with Android devices to my closed test, and they installed {n} and kept it for the whole 14 days.",
      "The testers were recruited by a paid group I hired. They were real users on different Android phones who opted in, downloaded {n} and tested it for 14 days straight.",
      "Hiring a paid tester group saved me from searching one person at a time. Their real Android users joined my test, installed {n} and stayed opted in throughout.",
      "For this closed test I relied on a paid tester group. Their members, all real Android users, installed {n} from the test link and stayed opted in for the full period.",
      "A paid group supplied the testers. These were real people, each using their own Android device, who installed {n} and stayed in the closed test for the entire 14 days.",
      "Instead of asking friends, I paid a tester group to find people. Real Android users joined, installed {n} and stayed opted in for 14 days, which gave me neutral feedback.",
      "I booked a paid tester group for the closed test. Their testers accepted my invite, installed {n} on real devices and kept it installed until the 14 days had passed.",
      "The closed test ran with testers from a paid group. Everyone was a real person with an Android device, and each one installed {n} and remained opted in for 14 days.",
      "I recruited testers by paying a tester group. It gave me real Android users who tested {n} for the full 14 days, and I could ask for replacements if anyone left.",
      "Recruiting went through a paid tester group. Real users with Android devices joined with the link I shared, installed {n} and stayed opted in for the whole testing window.",
    ],
    free: [
      "I recruited testers from free tester groups on Facebook and WhatsApp. I shared the test link, and people with Android devices joined, installed {n} and stayed opted in for the full 14 days.",
      "My testers came from free community groups. I posted about {n} and asked Android users to join the closed test, then reminded them to stay opted in for 14 days.",
      "I found testers by posting in free app-testing groups on Facebook and Telegram. Real Android users joined and installed {n}, so the feedback came from people I did not know.",
      "Free tester groups were my main source. I invited members with Android phones, they installed {n}, and I kept in touch so they stayed opted in through the 14 days.",
      "Without a budget for paid testers, I turned to free groups on WhatsApp and Facebook. Members who wanted to help joined the test and installed {n} on their own devices.",
      "I asked for testers in several free app-testing groups. People with Android devices replied, joined the closed test, installed {n} and used it across the 14-day period.",
      "Recruitment happened in free online groups. I shared an invite for {n}, and interested Android users signed up, installed it and stayed in the test.",
      "I built the tester list myself from free groups on Telegram and Facebook. Each tester installed {n}, opted in and was reminded to stay enrolled for 14 days.",
      "Free tester communities helped me. I posted the link for {n}, welcomed everyone with an Android device, and followed up so they would stay opted in until the end.",
      "Testers were gathered from free Facebook and WhatsApp groups where developers help each other. They installed {n} and stayed in the closed test for 14 days.",
      "I recruited people by posting in free groups and asking for honest testers. Those with Android devices joined, installed {n} and kept it for the whole test.",
      "The testers were volunteers from free tester groups. I sent them the link for {n}, and they opted in, installed it and used it during the full 14 days.",
      "Instead of paying, I used free testing groups. I explained what {n} does, invited Android users to join, and checked in regularly so they stayed opted in.",
      "I reached testers through free groups on Facebook, WhatsApp and Telegram. Volunteers installed {n} on their own phones and remained part of the closed test for 14 days.",
      "Free groups were where I found my testers. After I posted the invite, Android users joined one by one and installed {n}, and I messaged them to stay opted in.",
      "I searched free tester groups and invited people with Android devices. They joined the closed test for {n}, installed it and stayed opted in for the whole 14 days.",
      "My recruitment was done through free groups. I shared the test link, answered questions, and Android users signed up, installed {n} and stayed through all 14 days.",
      "I used free community groups to find testers. People with Android phones joined my test and installed {n}, and I followed up regularly so nobody dropped out early.",
      "Volunteers from free tester groups made up my testing team. They joined from the invite link, installed {n} and kept it for 14 days while I coordinated in the groups.",
      "I recruited from free groups of Android users. Each tester accepted my invite, installed {n} and stayed opted in, and I reminded them in the group when needed.",
    ],
    family: [
      "I recruited my testers from my own circle of friends and family. I sent each of them the test link, and they installed {n} on their Android phones and stayed opted in for the full 14 days.",
      "My testers were friends and family members with Android devices. I asked them personally to join the closed test, install {n} and stay opted in until the 14 days were over.",
      "I started with the people I know. Friends and relatives joined the closed test from my invite, installed {n} and used it on their own phones for the full 14 days.",
      "Recruitment was simple: I invited friends and family who use Android. They opted in, installed {n} and kept testing during the whole 14-day period.",
      "Friends and family were my testers. I shared the test link with them one by one, reminded them to stay opted in, and they used {n} on their own devices for 14 days.",
      "I asked people close to me to help. Friends and family members with Android phones joined the test, installed {n} and remained opted in for the 14 days.",
      "My closed test was run with friends and relatives. Each one has an Android device, accepted my invite, installed {n} and stayed in the test for the entire period.",
      "I reached out to friends and family on WhatsApp and Messenger and asked them to test {n}. Those with Android phones joined, installed it and stayed opted in for 14 days.",
      "The testers came from my personal network of friends and family. They opted in through my link, installed {n} and used it on different phones throughout the 14 days.",
      "I recruited people I trust: friends and family. They installed {n} from the test link and stayed opted in, and I checked in with them regularly during the 14 days.",
      "Friends and family helped me with the closed test. I invited everyone who has an Android phone, and they installed {n} and stayed enrolled for the whole 14 days.",
      "I invited my friends and family to be testers. After joining through my link, each of them installed {n} and kept it for the full 14-day period.",
      "I used my own network for testers. Friends and relatives with Android devices joined, installed {n} and tested it across the 14 days while I stayed in touch with them.",
      "To find testers I asked friends and family directly. They agreed, opted in, installed {n} and used it on their phones for the complete 14 days.",
      "My family and friends made up the tester group. I sent the invite, helped a few of them install {n}, and reminded them to stay opted in until the end.",
      "I recruited through personal contacts, mostly friends and family on Android. They joined the closed test, installed {n} and stayed opted in for 14 days.",
      "People close to me became my testers. Friends and family joined from the invite link, installed {n} and tested it on their own Android devices for 14 days.",
      "I asked relatives and friends to join my closed test. Everyone with an Android phone accepted, installed {n} and stayed opted in the entire time.",
      "The closed test was done with friends and family. I messaged them the link, they installed {n}, and I kept reminding them to stay opted in through the 14 days.",
      "I built my tester list from friends and family. Each one joined the test, installed {n} on their own Android phone and kept it for the full 14 days.",
    ],
  },

  // Q3 - engagement
  q3: [
    "Testers installed {n} and went through every page, opening each screen and testing every feature one by one. Many repeated the steps several times, and they tried it on different devices and screen sizes.",
    "Each tester opened every screen in {n} and tried all the features. Some went through the same flows again and again to check they worked, and they used different phones.",
    "Testers explored {n} from the first screen to the last. They tapped every button, tested each feature and came back to the app on several days during the 14-day period.",
    "I asked testers to try everything in {n}, and they did: every page, every button and every feature. A few of them repeated the steps to make sure nothing broke.",
    "Engagement was good. Testers went through all the pages of {n}, used each feature, and checked how it behaved on different screen sizes and Android versions.",
    "During the test, people opened {n} regularly and worked through each section. They tested every feature, tried unusual inputs and rechecked the screens after updates.",
    "Every tester walked through the whole of {n}. They visited each page, used all the features at least once, and a number of them went back to retest things on later days.",
    "Testers did not just open {n}; they went through it page by page. All the features were tested, and several people repeated the flows to see if the results stayed the same.",
    "The testers used {n} across the full 14 days. They covered every page and feature, tested on phones of different sizes, and kept using the app between feedback rounds.",
    "Testers went page by page through {n}, trying each feature and each button. They also checked how the app looked on their own devices and reopened it over several days.",
    "People tested {n} thoroughly. Every screen got opened, every feature got used, and many testers went back through the same steps again to confirm everything was working.",
    "Testers stayed active during the closed test. They installed {n}, visited all its pages, tried every feature and compared how it ran on their different Android devices.",
    "All testers went through the complete app. In {n} they opened every page, pressed every button, used each feature and repeated some steps to look for problems.",
    "The way testers used {n} was fairly thorough: all pages visited, all features tried, and the main steps repeated several times on different devices.",
    "Over the 14 days, testers kept coming back to {n}. They went through each page, tested every feature and checked the app again after each fix.",
    "Testers tried every part of {n}. They moved through each page, used all of the features, and tested the app on small and large screens as well as different Android versions.",
    "I saw steady engagement. Testers opened {n} on multiple days, worked through every page and feature, and repeated key steps to see whether anything behaved differently.",
    "Testers installed {n} and checked it end to end. Each page was opened, each feature was used, and many people retested after updates on their own devices.",
    "Everyone who tested {n} went through all of its pages and features. Some used it daily, and several repeated the same actions to see if results were consistent.",
    "Testers treated {n} like a real user would, but more carefully: every page, every feature, repeated steps and different phones, all across the 14-day closed test.",
  ],

  // Q4 - feedback summary + how collected
  q4: [
    "Testers sent feedback through {ch}. They commented on ease of use and design, and also mentioned {fb}. I also checked crash reports in Play Console.",
    "I collected feedback on {ch}, where testers told me what they liked and what felt wrong. The main points were {fb}. Play Console crash reports backed that up.",
    "Most feedback arrived through {ch}. Testers talked about how {n} looked and felt, and raised {fb}. I also read the Play Console reports.",
    "Feedback came in via {ch}. Testers liked how simple {n} is, but pointed out {fb}. I noted every message and compared it with Play Console crash data.",
    "Testers used {ch} to share their thoughts. The common themes were {fb}, along with general comments on usability. Crash reports in Play Console helped me confirm the issues.",
    "I asked for feedback on {ch} and kept track of every reply. Testers reported {fb}, and said the rest of the app was easy to use.",
    "Through {ch}, testers described their experience in their own words. They mentioned {fb}. I also watched Play Console for crashes and errors.",
    "Feedback was gathered mainly on {ch}. Testers gave opinions on the design and flow, and the issues they flagged were {fb}.",
    "The testers talked to me on {ch}. Their feedback covered usability and look, with {fb} coming up most. I cross-checked with Play Console reports.",
    "I stayed in touch with testers on {ch} and asked them to report anything odd. They came back with {fb}, plus a few kind words about the overall design.",
    "Testers wrote to me on {ch}. Their comments were mostly about {fb}, and I used Play Console crash and error reports to double-check what they said.",
    "Feedback was shared through {ch}. Some testers gave short comments, others sent detailed notes about {fb}. I also reviewed Play Console reports.",
    "All feedback reached me on {ch}. Testers pointed to {fb} as the things to improve, while saying the app was easy to understand.",
    "I collected opinions on {ch}. In summary, testers found {n} easy to use, but they reported {fb}. I verified the technical side in Play Console.",
    "Testers reported what they noticed on {ch}. The summary of their feedback is {fb}, with a few general design comments mixed in.",
    "I used {ch} to gather feedback, and testers were happy to reply. Their notes were mainly about {fb}, along with general thoughts on design.",
    "Testers shared feedback through {ch}. They liked the basic idea, and the problems they described were {fb}. Crash reports in Play Console gave me extra detail.",
    "People sent their comments on {ch}. After reading everything, the pattern was clear: {fb}. I also looked at crash reports in Play Console.",
    "I gathered feedback from testers on {ch}. They covered ease of use and appearance, and flagged {fb}. Play Console gave me the technical side.",
    "Feedback collection happened on {ch}. Testers listed {fb} as their main issues, and I compared that with the crash reports in Play Console.",
  ],

  // Q5 - what the app is for + audience
  q5: [
    "{n} is an Android app for people aged {a}. {f} It is easy enough that anyone in that age group can start using it straight away.",
    "Aimed at ages {a}, {n} is built to be quick and simple. {f} No special skills are needed, so it suits everyday users.",
    "{n} is for users in the {a} age range. {f} It keeps things simple so that nobody needs a guide to get started.",
    "{n} is designed for people aged {a}. {f} The idea is to keep it simple, so people can use it without any learning curve.",
    "{n} targets users aged {a}. {f} Everything is kept easy to follow for that audience.",
    "Built for the {a} age group, {n} is a simple Android app. {f} The screens are kept clear so users can find things quickly.",
    "{n} serves people aged {a}. {f} It was made to be friendly for first-time users in this group.",
    "My target users are aged {a}. {n} is an Android app that keeps things clear and easy. {f}",
    "The intended audience of {n} is the {a} age group. {f} It is designed to be simple, quick and clear for them.",
    "{n} is made for Android users aged {a}. {f} The layout is plain and friendly, so new users feel comfortable quickly.",
    "People aged {a} are who I built {n} for. {f} I kept the design easy so that it works for first-time users as well.",
    "{n} is a mobile app for the {a} age range. {f} It is meant to be easy to understand without instructions.",
    "I designed {n} with ages {a} in mind. {f} It is a straightforward Android app that does not ask users to learn much.",
    "{n} is for everyday Android users aged {a}. {f} It is clear and quick, so it fits into daily life without effort.",
    "The users I expect are aged {a}. {f} {n} keeps the experience light and simple for them.",
    "For {n}, the audience is people aged {a}. {f} The goal is an app that is easy to start and pleasant to use.",
    "{n} is intended for users aged {a}. {f} It stays simple on purpose, so every person in that range can use it comfortably.",
    "Think of people aged {a}: that is the audience for {n}. {f} It is quick to learn and easy to use.",
    "{n} suits users {a} years of age. {f} It is easy to pick up, with nothing complicated to figure out.",
    "Android users aged {a} are the target audience of {n}. {f} The app is easy to use and does not need any special knowledge.",
  ],

  // Q6 - value to users (name only)
  q6: [
    "{n} is very useful and helps users a lot in daily life. It makes things easier and faster, and everything is simple, so people get what they need in a few taps.",
    "The value of {n} is simple: it saves time. Users can get things done quickly without any confusion, which makes the app genuinely helpful in daily routines.",
    "{n} makes everyday tasks easier. Instead of hunting through complicated tools, users get what they need quickly, and that convenience is the main benefit.",
    "Users get a simple, quick way to do their tasks with {n}. It cuts out unnecessary steps and works smoothly, which helps people save both time and effort.",
    "{n} helps people by keeping things easy. Everything is a few taps away, nothing is cluttered, and users can rely on it whenever they need it.",
    "With {n}, users spend less time and effort on their tasks. The app is clear, fast and reliable, so it becomes a helpful part of their day.",
    "I built {n} to be genuinely useful. It gives people a fast and clean way to get things done, and it keeps the whole experience light and easy.",
    "{n} adds value by being practical. It does its job well, loads quickly and stays easy to use, so users do not waste time figuring things out.",
    "Users benefit from {n} because it is simple and dependable. They can finish what they came to do in just a few taps, which makes daily use smooth and stress-free.",
    "The main benefit of {n} is convenience. Everything is in one place, the screens are clear, and users can get results quickly without any complicated setup.",
    "{n} helps users save time. It is quick to open, easy to understand and straightforward to use, so people can get on with their day.",
    "{n} is a handy app that people can use every day. It keeps tasks simple, responds quickly, and removes the confusion that other tools often bring.",
    "People get real convenience from {n}. It turns a task that could be confusing into a few simple taps, which saves time and makes daily life easier.",
    "What {n} gives users is ease. The app is clean, fast and clear, so people can finish their tasks without stress and come back whenever they need it.",
    "{n} provides value through simplicity. Users do not need to learn anything new; they open the app, tap a few times and get what they came for.",
    "Because {n} is quick and uncluttered, it fits easily into a busy day. Users get what they need in less time, which is the biggest help it offers.",
    "{n} is useful because it keeps things straightforward. It saves users time, avoids confusing steps, and gives them a dependable tool on their phone.",
    "For users, {n} means less hassle. It is simple to use, runs smoothly and puts the things they need within easy reach.",
    "{n} makes a difference in everyday use. It is fast, easy and clear, so people can finish tasks in a few taps instead of struggling with complicated alternatives.",
    "Users get a practical tool in {n}. It is easy to learn, quick to use and reliable, which helps them save time and effort every day.",
  ],

  // Q8 - changes made after the closed test
  q8: [
    "Based on tester feedback and crash reports, I {fx}. These updates made {n} more stable and easier to use.",
    "After the closed test I made several changes: {nn}. Together they made {n} smoother and more reliable.",
    "Tester feedback led to real updates. I {fx}, and then rechecked the app to make sure everything worked.",
    "The main updates were {nn}. I made them after reading tester feedback and crash reports, and {n} feels much more polished now.",
    "I went through the feedback and {fx}. After that, {n} was more stable and clearer to use.",
    "Here is what changed in {n}: {nn}. Each update came directly from what testers reported.",
    "Thanks to the closed test, I {fx}. The new version of {n} is noticeably better for users.",
    "Updates after testing included {nn}. I picked these because they were raised by testers or showed up in crash reports.",
    "Following the feedback, I {fx}. I then tested {n} again before moving to production.",
    "Based on what testers found, {n} now has {nn}. I released the updates during the test and checked them again.",
    "Testing showed me what to improve, so I {fx}. {n} is more stable as a result.",
    "I acted on the feedback by making these changes: {nn}. Smaller ideas were kept for later updates.",
    "Several things changed in {n} because of the closed test. I {fx}, which made the app easier to use and more dependable.",
    "The closed test shaped the final version of {n}. Updates included {nn}, all based on feedback and crash reports.",
    "Using tester feedback and Play Console reports, I {fx}. The result is a steadier {n}.",
    "What I changed after testing: {nn}. These were the issues that mattered most to testers, so I handled them first.",
    "I took the feedback seriously and {fx}. Then I released updated builds of {n} to the test.",
    "{n} improved a lot during the test. I made {nn}, based on what testers and crash reports showed me.",
    "After collecting feedback, I {fx}. Anything bigger than that is planned for future updates of {n}.",
    "Tester input turned into updates: {nn}. I checked each one again before moving {n} toward production.",
  ],

  // Q9 - why it is ready for production (name only)
  q9: [
    "{n} was ready because testers could finish the main tasks without major problems. Serious bugs were fixed, the app ran stably on the devices used, and recent feedback was only small suggestions.",
    "I felt {n} was ready when the feedback slowed down to minor suggestions. The big bugs were gone, the app was stable, and testers could use it without trouble.",
    "The closed test showed that {n} works reliably. Crashes were fixed, testers completed everything they tried, and no serious issues came up in the final days.",
    "My decision came from the results: stable behavior on different devices, no major bugs left, and testers saying the app was easy to use. That told me {n} was ready.",
    "By the end of the test, {n} had no serious open problems. Testers used every feature smoothly, so I decided it was ready for real users.",
    "{n} reached production readiness once the crash reports stayed clean and the feedback turned into small suggestions. Everything important had been tested and fixed.",
    "I looked at three things: stability, fixed bugs and recent feedback. All three were good, so I decided {n} was ready to go live.",
    "When testers stopped finding serious problems in {n}, I knew it was ready. The final builds ran well on the devices that were used.",
    "{n} had passed the full 14 days with stable performance and no major complaints, which gave me enough confidence to apply for production.",
    "The turning point was the last week. Testers had nothing serious to report, crashes had stopped, and {n} worked as expected on different phones.",
    "I decided {n} was ready after all major issues were fixed and retested. The remaining feedback was about small polish, not about anything that blocks users.",
    "Readiness was clear from the results: smooth testing across devices, fixed bugs and positive comments. {n} was doing what it should, so I applied for production.",
    "After two weeks of testing and fixes, {n} ran steadily and testers could complete their tasks. That convinced me it was ready for the public.",
    "{n} was ready because the important problems were solved. Testers had a smooth experience, and later feedback was minor, so I moved forward.",
    "I judged readiness by how testers used {n} in the last days: no crashes, no blockers, only small suggestions. I will keep improving it after launch.",
    "The app was stable, the bugs found during the test were fixed, and testers were comfortable with every feature. That is why I considered {n} ready.",
    "Once the crash reports were clean and the feedback was mostly about small details, I saw that {n} was ready for production.",
    "{n} was ready when it ran well across the test devices and testers were satisfied. I fixed everything serious, and I plan to keep improving it based on user reviews.",
    "My checklist was simple: no serious bugs, stable performance and calm feedback. {n} met all three by the end of the 14 days.",
    "I decided on production after seeing consistent results. The test devices ran {n} smoothly, major fixes were done and testers had no blocking complaints.",
  ],
};

const QUESTIONS = [
  { id: "q1", q: "Q1. How did you recruit your testers?", part: "Part 1: About your closed test" },
  { id: "q2", q: "Q2. How easy was it to recruit testers for your closed test?", dropdown: true },
  { id: "q3", q: "Q3. Describe how testers engaged with your app during the closed test." },
  { id: "q4", q: "Q4. Summarize the feedback you received and how you collected it." },
  { id: "q5", q: "Q5. What is the app for, and who is the intended audience?", part: "Part 2: About your app" },
  { id: "q6", q: "Q6. How does your app provide value to users?" },
  { id: "q7", q: "Q7. How many installs do you expect in your first year?", dropdown: true },
  { id: "q8", q: "Q8. What changes did you make to your app based on the closed test?", part: "Part 3: Production readiness" },
  { id: "q9", q: "Q9. How did you decide your app is ready for production?" },
];

const PATTERN_IDS = ["q1", "q3", "q4", "q5", "q6", "q8", "q9"];
const countOf = (id) => (id === "q1" ? PATS.q1.paid.length : PATS[id].length);

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

const rand = (n) => Math.floor(Math.random() * n);
const pickOther = (cur, n) => {
  if (n <= 1) return 0;
  let x = rand(n - 1);
  if (x >= cur) x += 1;
  return x;
};
const randomAll = () => Object.fromEntries(PATTERN_IDS.map((id) => [id, rand(countOf(id))]));

const fmtRange = (s) =>
  s
    .trim()
    .replace(/\d+/g, (n) => Number(n).toLocaleString("en-US"))
    .replace(/\s*[-–]\s*/g, " to ");

const list = (arr) =>
  arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1];

const fill = (tpl, c) => tpl.replace(/\{(\w+)\}/g, (_, k) => c[k] ?? "");
const clean = (s) => s.replace(/\s+/g, " ").trim();

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
const fit = (make, items, l) => {
  for (let n = items.length; n >= 0; n--) {
    const t = clean(make(items.slice(0, n)));
    if (t.length <= l) return { t, cut: n < items.length, ok: true };
  }
  return { t: clamp(clean(make([])), l), cut: items.length > 0, ok: false };
};

function buildAll({ app, mode, about, problems, chs, age, customAge, installs, pats, limit }) {
  const n = app.trim() || "My App";
  const a = age === "custom" ? customAge.trim() || "13 to 70" : fmtRange(age);
  const sentences = about
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s + ".");
  const picked = PROBLEMS.filter((p) => problems.includes(p.id));
  const chList = CHANNELS.filter((c) => chs.includes(c.id)).map((c) => c.ph);
  if (!chList.length) chList.push("direct messages");

  let cut = false;
  const out = {};

  out.q1 = clamp(clean(fill(PATS.q1[mode][pats.q1], { n })), limit);
  out.q2 = mode === "free" ? "Difficult" : "Easy";
  out.q3 = clamp(clean(fill(PATS.q3[pats.q3], { n })), limit);

  // Q4 - fewer channels / issues if the limit is too tight
  {
    let r;
    for (let k = Math.min(chList.length, 4); k >= 1; k--) {
      const ch = list(chList.slice(0, k));
      r = fit(
        (ps) => fill(PATS.q4[pats.q4], { n, ch, fb: ps.length ? list(ps.map((p) => p.fb)) : FALLBACK.fb }),
        picked,
        limit
      );
      if (r.cut || k < chList.length) cut = true;
      if (r.ok) break;
    }
    out.q4 = r.t;
  }

  {
    const r = fit((ss) => fill(PATS.q5[pats.q5], { n, a, f: ss.join(" ") }), sentences, limit);
    if (r.cut) cut = true;
    out.q5 = r.t;
  }

  out.q6 = clamp(clean(fill(PATS.q6[pats.q6], { n })), limit);
  out.q7 = installs;

  {
    const r = fit(
      (ps) =>
        fill(PATS.q8[pats.q8], {
          n,
          fx: ps.length ? list(ps.map((p) => p.fx)) : FALLBACK.fx,
          nn: ps.length ? list(ps.map((p) => p.nn)) : FALLBACK.nn,
        }),
      picked,
      limit
    );
    if (r.cut) cut = true;
    out.q8 = r.t;
  }

  out.q9 = clamp(clean(fill(PATS.q9[pats.q9], { n })), limit);

  // gap between a question and its answer: 1 blank line
  // gap between questions / sections: 3 blank lines
  const blocks = [`${n} – Production Access Answers`];
  QUESTIONS.forEach((q) => {
    if (q.part) blocks.push(q.part);
    blocks.push(`${q.q}\n\n${out[q.id]}`);
  });
  const text = blocks.join("\n\n\n\n") + "\n";

  const items = QUESTIONS.map((q) => ({
    ...q,
    a: out[q.id],
    pat: q.dropdown ? null : pats[q.id],
    total: q.dropdown ? null : countOf(q.id),
  }));
  const longest = Math.max(...QUESTIONS.filter((q) => !q.dropdown).map((q) => out[q.id].length));

  return { text, items, longest, cut };
}

/* ------------------------------------------------------------------ */
/*  UI  (soft / neumorphic - styles live in index.css)                 */
/* ------------------------------------------------------------------ */

const SITE = "https://jittesting.vercel.app";
const WA = "https://wa.me/8801784679499";

const MODES = [
  { id: "paid", label: "Paid" },
  { id: "free", label: "Free (groups)" },
  { id: "family", label: "Friends & family" },
];

function Pill({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} data-on={active ? "true" : "false"} className="chip">
      {children}
    </button>
  );
}

const Lbl = ({ children }) => <label className="lbl">{children}</label>;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 1 1 6.97 3.85Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export default function App() {
  const [app, setApp] = useState("");
  const [mode, setModeState] = useState("paid");
  const [about, setAbout] = useState("");
  const [problems, setProblems] = useState([]);
  const [chs, setChs] = useState(DEFAULT_CH.paid);
  const [age, setAge] = useState("13-18");
  const [customAge, setCustomAge] = useState("");
  const [installs, setInstalls] = useState("0 to 10K");
  const [limit, setLimit] = useState(299);
  const [pats, setPats] = useState(randomAll);
  const [copied, setCopied] = useState("");

  const L = Math.max(100, Number(limit) || 299);

  const { text, items, longest, cut } = useMemo(
    () => buildAll({ app, mode, about, problems, chs, age, customAge, installs, pats, limit: L }),
    [app, mode, about, problems, chs, age, customAge, installs, pats, L]
  );

  const setMode = (v) => {
    setModeState(v);
    setChs(DEFAULT_CH[v]);
  };
  const toggle = (setter) => (id) =>
    setter((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleProblem = toggle(setProblems);
  const toggleChannel = toggle(setChs);

  const shuffleOne = (id) => setPats((p) => ({ ...p, [id]: pickOther(p[id], countOf(id)) }));
  const shuffleAll = () =>
    setPats((p) => Object.fromEntries(PATTERN_IDS.map((id) => [id, pickOther(p[id], countOf(id))])));

  const copyText = async (value, id) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
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
    <div className="flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
      {/* NAVBAR */}
      <header className="neu mx-4 mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 px-5 py-2.5">
        <a href={SITE} target="_blank" rel="noreferrer" className="flex items-center gap-3">
          <span className="logo">JIT</span>
          <span className="leading-tight">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Powered by</span>
            <span className="block text-[15px] font-extrabold text-blue-700">JIT Testing</span>
            <span className="block text-[11px] font-medium text-blue-500 underline-offset-2 hover:underline">jittesting.vercel.app</span>
          </span>
        </a>

        <p className="min-w-[220px] flex-1 text-center text-[12.5px] font-medium leading-snug text-slate-600">
          Need paid closed testing for your apps? Contact us, we have over{" "}
          <b className="font-extrabold text-blue-700">380+ productions</b> now!
        </p>

        <a href={WA} target="_blank" rel="noreferrer" className="wa-btn">
          <WhatsAppIcon />
          Contact now
        </a>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-0 p-1 lg:min-h-0 lg:grid-cols-[5fr_6fr]">
        {/* INPUTS */}
        <div className="flex flex-col gap-2.5 p-3 lg:min-h-0 lg:overflow-y-auto">
          <div className="grid gap-3 sm:grid-cols-[2fr_3fr]">
            <div className="neu p-3">
              <Lbl>App name</Lbl>
              <input className="field" placeholder="e.g. BrandSlip" value={app} onChange={(e) => setApp(e.target.value)} />
            </div>
            <div className="neu p-3">
              <Lbl>Q1 &amp; Q2 · Tester source</Lbl>
              <div className="flex flex-wrap gap-1.5">
                {MODES.map((m) => (
                  <Pill key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</Pill>
                ))}
              </div>
            </div>
          </div>

          <div className="neu p-3">
            <Lbl>Q5 · What does the app do? (each full stop = one feature)</Lbl>
            <textarea
              rows={2}
              className="field resize-none"
              placeholder="Create branded PDF receipts. Add a logo and business name. Save and share the PDF."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>

          <div className="neu p-3">
            <Lbl>Q4 · Where did feedback come from? (select multiple)</Lbl>
            <div className="flex flex-wrap gap-1.5">
              {CHANNELS.map((c) => (
                <Pill key={c.id} active={chs.includes(c.id)} onClick={() => toggleChannel(c.id)}>
                  {c.label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="neu p-3">
            <Lbl>Q4 &amp; Q8 · Feedback / fixes (select multiple)</Lbl>
            <div className="flex flex-wrap gap-1.5">
              {PROBLEMS.map((p) => (
                <Pill key={p.id} active={problems.includes(p.id)} onClick={() => toggleProblem(p.id)}>
                  {p.label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="neu p-3">
              <Lbl>Q5 · Age group</Lbl>
              <div className="flex flex-wrap gap-1.5">
                {AGES.map((x) => (
                  <Pill key={x} active={age === x} onClick={() => setAge(x)}>{x}</Pill>
                ))}
                <Pill active={age === "custom"} onClick={() => setAge("custom")}>Custom</Pill>
              </div>
              {age === "custom" && (
                <input className="field mt-3" placeholder="e.g. 20 to 60" value={customAge} onChange={(e) => setCustomAge(e.target.value)} />
              )}
            </div>

            <div className="neu p-3">
              <Lbl>Q7 · First-year installs</Lbl>
              <div className="flex flex-wrap gap-1.5">
                {INSTALLS.map((x) => (
                  <Pill key={x} active={installs === x} onClick={() => setInstalls(x)}>{x}</Pill>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* OUTPUT */}
        <div className="flex min-h-[520px] flex-col p-3 lg:min-h-0">
          <div className="neu flex min-h-0 flex-1 flex-col p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[15px] font-extrabold text-slate-800">My answers</h2>
                <span className="text-[11px] font-medium text-slate-500">limit</span>
                <input
                  type="number"
                  min="100"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="field !w-[72px] !px-2 !py-1 text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button onClick={shuffleAll} className="btn">↻ Shuffle all</button>
                <button onClick={() => copyText(text, "all")} className="btn-primary">
                  {copied === "all" ? "Copied ✓" : "Copy all"}
                </button>
                <button onClick={download} className="btn">Download .txt</button>
              </div>
            </div>

            <div className="mb-3 text-[11px] font-medium text-slate-500">
              Longest answer: {longest} / {L} characters
              {cut && <span className="text-amber-600"> · some selections were left out to fit the limit</span>}
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1.5 pr-2">
              {items.map((it, i) => (
                <div key={it.id} className="well fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="text-[11px] font-bold text-blue-600">
                      {it.dropdown ? (
                        <>Dropdown answer</>
                      ) : (
                        <>
                          Pattern {it.pat + 1}/{it.total}
                          <span className="ml-2 font-medium text-slate-400">{it.a.length} chars</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!it.dropdown && (
                        <button onClick={() => shuffleOne(it.id)} title="Show a different pattern" className="btn btn-sm">
                          ↻ Shuffle
                        </button>
                      )}
                      <button onClick={() => copyText(it.a, it.id)} className="btn btn-sm">
                        {copied === it.id ? <span className="text-emerald-600">Copied ✓</span> : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-slate-400">{it.q}</div>
                  <p key={it.pat ?? "d"} className="fade-in mt-1.5 text-[13px] font-medium leading-relaxed text-slate-700">
                    {it.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}