// One-off generator for the 8 new [data-app-theme] CSS blocks.
// Not part of the shipped app; run with `node scripts/gen-themes.js >> style.css`.
"use strict";

var themes = [
  {
    id: "summer", label: "한여름",
    radii: null,
    fontDisplay: '"Jua", var(--font-body)',
    light: {
      canvas:"#fff8e8", surface:"#ffffff", surfaceAlt:"#fdeecb",
      ink:"#2b2013", ink2:"#4a3a20", inkMuted:"#8a7550", inkFaint:"#c9b98c",
      hairline:"#f0e2c0",
      primary:"#ffb703", primaryActive:"#e6a300", onPrimary:"#2b2013",
      coral:"#0096c7",
      sky:"#8a5a00", skyBg:"#fff1cf", pinkBg:"#e0f4fb",
    },
    dark: {
      canvas:"#1c1608", surface:"#2a2210", surfaceAlt:"#352b15",
      ink:"#fff3d6", ink2:"#f0dfb0", inkMuted:"#b9a06a", inkFaint:"#7a6640",
      hairline:"#453a1e",
      primary:"#ffc93c", primaryActive:"#ffd966", onPrimary:"#241a00",
      coral:"#48cae4",
      sky:"#ffd166", skyBg:"#4a3a10", pinkBg:"#123a4a",
    },
    card: { bg:"#023e8a", label:"#ffd166" },
  },
  {
    id: "winter", label: "한겨울",
    radii: null,
    fontDisplay: "var(--font-body)",
    light: {
      canvas:"#f2f7fa", surface:"#ffffff", surfaceAlt:"#e6eef3",
      ink:"#16232c", ink2:"#2c3e4a", inkMuted:"#66808f", inkFaint:"#a9bcc6",
      hairline:"#dbe6ec",
      primary:"#4f7ca8", primaryActive:"#3d6389", onPrimary:"#ffffff",
      coral:"#9fd8e8",
      sky:"#2c5878", skyBg:"#e2f1f7", pinkBg:"#eef0f5",
    },
    dark: {
      canvas:"#0c1620", surface:"#132030", surfaceAlt:"#1b2b3d",
      ink:"#eaf3f8", ink2:"#cddce6", inkMuted:"#7f9aab", inkFaint:"#4f6575",
      hairline:"#233648",
      primary:"#7db4d9", primaryActive:"#a3cde6", onPrimary:"#0a1520",
      coral:"#bfeaf5",
      sky:"#a3cde6", skyBg:"#1c3448", pinkBg:"#241e33",
    },
    card: { bg:"#132639", label:"#8fd6ea" },
  },
  {
    id: "storm", label: "폭풍",
    radii: null,
    fontDisplay: "var(--font-body)",
    light: {
      canvas:"#eef0f3", surface:"#ffffff", surfaceAlt:"#e3e7ec",
      ink:"#262b33", ink2:"#3c4451", inkMuted:"#6b7280", inkFaint:"#a8b0ba",
      hairline:"#d7dce2",
      primary:"#6c63ff", primaryActive:"#564bf0", onPrimary:"#ffffff",
      coral:"#c6d94a",
      sky:"#4b3fd1", skyBg:"#eae8ff", pinkBg:"#f2f5df",
    },
    dark: {
      canvas:"#14171d", surface:"#1c2029", surfaceAlt:"#242a35",
      ink:"#eef0f3", ink2:"#d3d8e0", inkMuted:"#7d8592", inkFaint:"#4d5563",
      hairline:"#2c333f",
      primary:"#8f88ff", primaryActive:"#a9a3ff", onPrimary:"#121225",
      coral:"#d7e86a",
      sky:"#a9a3ff", skyBg:"#2a2650", pinkBg:"#333a1a",
    },
    card: { bg:"#1f2430", label:"#8f88ff" },
  },
  {
    id: "coral-reef", label: "산호초",
    radii: null,
    fontDisplay: '"Jua", var(--font-body)',
    light: {
      canvas:"#eafbf6", surface:"#ffffff", surfaceAlt:"#d9f5ec",
      ink:"#0c2b24", ink2:"#1c4b3f", inkMuted:"#5a8079", inkFaint:"#9dc2b8",
      hairline:"#cdeee2",
      primary:"#0fb894", primaryActive:"#0c9678", onPrimary:"#ffffff",
      coral:"#ff3d81",
      sky:"#0c8a6f", skyBg:"#d3f5ea", pinkBg:"#ffe1ec",
    },
    dark: {
      canvas:"#06201a", surface:"#0c2c24", surfaceAlt:"#12392f",
      ink:"#e3fbf3", ink2:"#bdeee0", inkMuted:"#68a596", inkFaint:"#3d6b5f",
      hairline:"#164435",
      primary:"#2ee0b8", primaryActive:"#5fe9c9", onPrimary:"#052018",
      coral:"#ff6fa3",
      sky:"#5fe9c9", skyBg:"#0e3d33", pinkBg:"#3a1c2b",
    },
    card: { bg:"#0b4d43", label:"#ff6fa3" },
  },
  {
    id: "sea-salt", label: "소금",
    radii: { card:"14px", sm:"8px", md:"10px", xl:"18px" },
    fontDisplay: "var(--font-body)",
    light: {
      canvas:"#f6f4f0", surface:"#ffffff", surfaceAlt:"#ece8e0",
      ink:"#292c2e", ink2:"#40444a", inkMuted:"#7a7f82", inkFaint:"#b6b2aa",
      hairline:"#e2ded7",
      primary:"#6f8c99", primaryActive:"#597682", onPrimary:"#ffffff",
      coral:"#b99b8d",
      sky:"#4c6570", skyBg:"#e6edf0", pinkBg:"#efe6df",
    },
    dark: {
      canvas:"#1c1c1c", surface:"#252525", surfaceAlt:"#2e2e2e",
      ink:"#f2f0ec", ink2:"#d6d2c8", inkMuted:"#9a9690", inkFaint:"#63605a",
      hairline:"#3a3a38",
      primary:"#8fadb8", primaryActive:"#a8c3cc", onPrimary:"#12181a",
      coral:"#d4b6a6",
      sky:"#a8c3cc", skyBg:"#2c3a3e", pinkBg:"#352c26",
    },
    card: { bg:"#23282b", label:"#a8c3cc" },
  },
  {
    id: "high-tide", label: "밀물",
    radii: null,
    fontDisplay: '"Jua", var(--font-body)',
    light: {
      canvas:"#f6ead9", surface:"#fffaf2", surfaceAlt:"#efdcc0",
      ink:"#2b241c", ink2:"#453a2b", inkMuted:"#7d7365", inkFaint:"#bcae98",
      hairline:"#e6d7bf",
      primary:"#147a6a", primaryActive:"#106258", onPrimary:"#ffffff",
      coral:"#c98a53",
      sky:"#0e5c50", skyBg:"#d9ece7", pinkBg:"#f3e2cd",
    },
    dark: {
      canvas:"#191410", surface:"#231c15", surfaceAlt:"#2c2319",
      ink:"#f3e9d8", ink2:"#dfd0b4", inkMuted:"#a3917a", inkFaint:"#665a49",
      hairline:"#382c1e",
      primary:"#3ea592", primaryActive:"#5fc0ac", onPrimary:"#0a1a16",
      coral:"#e0ab73",
      sky:"#5fc0ac", skyBg:"#173a33", pinkBg:"#3a2a18",
    },
    card: { bg:"#0d4a40", label:"#e0ab73" },
  },
  {
    id: "yunseul", label: "윤슬",
    radii: null,
    fontDisplay: '"Jua", var(--font-body)',
    light: {
      canvas:"#fdf6e6", surface:"#ffffff", surfaceAlt:"#faecc6",
      ink:"#12283a", ink2:"#26435a", inkMuted:"#5c7488", inkFaint:"#a4b7c4",
      hairline:"#f0e2bd",
      primary:"#f2b544", primaryActive:"#dba02f", onPrimary:"#12283a",
      coral:"#1c5d8c",
      sky:"#8a6a10", skyBg:"#fbeec8", pinkBg:"#dceafa",
    },
    dark: {
      canvas:"#0e1a24", surface:"#152534", surfaceAlt:"#1c3040",
      ink:"#fdf3dc", ink2:"#eadcb8", inkMuted:"#a3946e", inkFaint:"#65593d",
      hairline:"#2a3f52",
      primary:"#f7cc6e", primaryActive:"#fadb92", onPrimary:"#1c1400",
      coral:"#5b9cd6",
      sky:"#fadb92", skyBg:"#3a2f10", pinkBg:"#16304a",
    },
    card: { bg:"#0d2b42", label:"#f2c869" },
  },
];

// Font is unified across every theme (Pretendard only — no per-theme
// display faces), so themes no longer set --font-display at all.
function neutralVars(t, prefix) {
  var i = "  ";
  return i + "--canvas:" + t.canvas + "; --surface:" + t.surface + "; --surface-alt:" + t.surfaceAlt + ";\n" +
    i + "--ink:" + t.ink + "; --ink-2:" + t.ink2 + "; --ink-muted:" + t.inkMuted + "; --ink-faint:" + t.inkFaint + ";\n" +
    i + "--hairline:" + t.hairline + ";\n" +
    i + "--primary:" + t.primary + "; --primary-active:" + t.primaryActive + "; --on-primary:" + t.onPrimary + ";\n" +
    i + "--coral:" + t.coral + ";\n" +
    i + "--sky:" + t.sky + "; --sky-bg:" + t.skyBg + "; --pink-bg:" + t.pinkBg + ";\n";
}

var out = [];
out.push("\n/* ====================================================================");
out.push("   8 additional selectable app themes (see Settings > 테마).");
out.push("   Each layers color/shape/font overrides on the wave base above —");
out.push("   flat colors only (no gradients), meaningful onda/water palettes.");
out.push("   ==================================================================== */\n");

themes.forEach(function (t) {
  var sel = '[data-app-theme="' + t.id + '"]';
  out.push("/* " + t.label + " */");
  if (t.radii) {
    out.push(sel + "{\n  --radius-card:" + t.radii.card + "; --radius-sm:" + t.radii.sm + "; --radius-md:" + t.radii.md + "; --radius-xl:" + t.radii.xl + ";\n}");
  }
  out.push(sel + "{\n" + neutralVars(t.light) + "}");
  out.push("@media (prefers-color-scheme: dark){\n  " + sel + ':not([data-theme="light"]){\n' + neutralVars(t.dark).replace(/^/gm, "  ") + "  }\n}");
  out.push(sel + '[data-theme="dark"]{\n' + neutralVars(t.dark) + "}");
  out.push(sel + " .hero{background:" + t.card.bg + "; color:#ffffff;}");
  out.push(sel + " .hero .names{color:rgba(255,255,255,.85);}");
  out.push(sel + " .hero .dday{color:" + t.card.label + ";}");
  out.push(sel + " .hero .annidate{color:rgba(255,255,255,.65);}");
  out.push(sel + " .q-card{background:" + t.card.bg + ";}");
  out.push(sel + " .q-card .q-label{color:" + t.card.label + ";}");
  out.push("");
});

// 심야 (midnight) — deliberately dark-only, no light/dark switching
out.push("/* 심야 — deliberately always dark (night sea), no light-mode variant */");
out.push('[data-app-theme="midnight"]{');
out.push(neutralVars({
  canvas:"#0a0a1a", surface:"#14142b", surfaceAlt:"#1c1c3a",
  ink:"#e8e6f5", ink2:"#c7c3e8", inkMuted:"#8886a8", inkFaint:"#56547a",
  hairline:"#2a2a4a",
  primary:"#2de6a8", primaryActive:"#1fc48e", onPrimary:"#07120e",
  coral:"#a8b8e0",
  sky:"#8bf0c8", skyBg:"#123830", pinkBg:"#241c3a",
}).replace(/\n$/, ""));
out.push("}");
out.push('[data-app-theme="midnight"] .hero{background:#050510; color:#ffffff;}');
out.push('[data-app-theme="midnight"] .hero .names{color:rgba(255,255,255,.85);}');
out.push('[data-app-theme="midnight"] .hero .dday{color:#2de6a8;}');
out.push('[data-app-theme="midnight"] .hero .annidate{color:rgba(255,255,255,.65);}');
out.push('[data-app-theme="midnight"] .q-card{background:#050510;}');
out.push('[data-app-theme="midnight"] .q-card .q-label{color:#2de6a8;}');
out.push("");

console.log(out.join("\n"));
