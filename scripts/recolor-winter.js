// Derives design-exploration-winter.html from design-exploration.html
// by swapping the reused "wave" brand hex colors for their 한겨울
// (winter) theme counterparts. Concept-specific one-off palettes
// (scrapbook paper, terminal green, newspaper off-white, etc.) are
// deliberately left untouched — same precedent as the real app's
// theme-invariant concepts (e.g. 심야).
"use strict";
var fs = require("fs");

var MAP = [
  // [wave hex, winter hex, role]
  ["#0b2f3a", "#16232c"], // ink
  ["#5c7d85", "#66808f"], // ink-muted
  ["#9dbcc2", "#a9bcc6"], // ink-faint
  ["#0ea5b7", "#4f7ca8"], // primary
  ["#eef2f2", "#eef3f6"], // divider gray
  ["#d3e7e8", "#dbe6ec"], // hairline
  ["#0a5a68", "#1c3b52"], // hero gradient mid
  ["#0a8494", "#3d6389"], // primary-active
  ["#ff9d7f", "#8fd6ea"], // coral-on-dark accent -> ice accent
  ["#17c2d1", "#6fb8e0"], // hero gradient start
  ["#e3f1f1", "#e6eef3"], // surface-alt
  ["#f7fbfb", "#f0f5f8"], // light surface-alt
  ["#eef7f7", "#f2f7fa"], // canvas
  ["#063542", "#0a1a26"], // hero gradient end
  ["#ffe2d4", "#d9edf5"], // light peach dday text -> ice
  ["#ffd7c4", "#cdeaf5"]  // scrapbook hero dday text -> ice
];

var src = fs.readFileSync(__dirname + "/../design-exploration.html", "utf8");
MAP.forEach(function (pair) {
  src = src.split(pair[0]).join(pair[1]);
});
src = src
  .split("온다 레이아웃 갤러리").join("온다 레이아웃 갤러리 — 한겨울")
  .split("웨이브 톤 하나로 고정하고").join("한겨울 테마 톤 하나로 고정하고");

fs.writeFileSync(__dirname + "/../design-exploration-winter.html", src);
console.log("wrote design-exploration-winter.html");
