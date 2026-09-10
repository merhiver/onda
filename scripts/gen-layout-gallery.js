// Design-exploration gallery generator.
// node scripts/gen-layout-gallery.js > design-exploration.html
//
// 32 structurally distinct HOME-screen layout concepts, one shared
// color theme (wave) + realistic sample content, so composition,
// spacing and nav pattern can be judged on their own. Not wired to
// the live app — a comparison sheet only.
"use strict";

var NAMES = "바니 · 키쿠";
var DDAY = "D+2108";
var ANNI = "2020-12-03 부터";
var EVENTS = [
  { t: "영화 보기", who: "바니", d: "9월 15일(화)" },
  { t: "키쿠 생일", who: "키쿠", d: "9월 20일(일)" },
  { t: "한강 피크닉", who: "바니", d: "9월 27일(일)" }
];
var RECORDS = [
  { who: "바니", d: "9월 10일", t: "오늘 스벅에서 케이크 먹음 완전 맛있었음" },
  { who: "키쿠", d: "9월 9일", t: "야근 끝... 근데 보고싶다 얼른 자자" },
  { who: "바니", d: "9월 8일", t: "주말에 등산 가기로 함 기대된다" }
];
var STATS = { streak: 12, msgs: 148, records: 63, bucket: "34%" };
var QUESTION = "같이 살면 꼭 가지고 싶은 가구/물건은?";
var NAV = ["홈", "캘린더", "기록", "버킷", "질문"];
var ICONS = {
  홈: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/>',
  캘린더: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  기록: '<path d="M5 4.5h11l3 3V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z"/><path d="M8 10h8M8 13.5h8M8 17h5"/>',
  버킷: '<path d="M4 8.5h16l-1.6 10.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8L4 8.5z"/><path d="M8 8.5V7a4 4 0 0 1 8 0v1.5"/>',
  질문: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9.3a2.7 2.7 0 1 1 3.9 2.4c-1 .5-1.6 1.2-1.6 2.3"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>'
};
function icon(name, size) {
  size = size || 20;
  return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>';
}

var concepts = [];
function add(title, tagline, width, height, css, html) {
  var n = concepts.length + 1;
  concepts.push({ id: "c" + (n < 10 ? "0" + n : n), num: n, title: title, tagline: tagline, width: width || 980, height: height || 760, css: css, html: html });
}

/* ============================================================
   CONCEPTS — appended below by subsequent edits to this file
   ============================================================ */
// ---- 01: Sidebar Dashboard Classic (stat-tile hero) ----
add("사이드바 대시보드", "좌측 고정 내비 + 통계 타일형 히어로", 1000, 640,
  'body{background:#eef7f7;color:#0b2f3a;}' +
  '.shell{display:flex;min-height:640px;}' +
  '.nav{width:220px;flex:none;background:#fff;padding:20px 14px;border-right:1px solid #d3e7e8;}' +
  '.brand{font-weight:700;font-size:16px;margin-bottom:22px;display:flex;align-items:center;gap:8px;}' +
  '.nav a{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;color:#5c7d85;font-size:14px;font-weight:600;margin-bottom:2px;}' +
  '.nav a.on{background:#e3f1f1;color:#0a8494;}' +
  '.main{flex:1;padding:28px 32px;}' +
  '.stat-row{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:14px;margin-bottom:24px;}' +
  '.tile{background:#fff;border:1px solid #d3e7e8;border-radius:16px;padding:18px;}' +
  '.tile.hero{background:linear-gradient(160deg,#17c2d1,#0a5a68 60%,#063542);color:#fff;}' +
  '.tile .lbl{font-size:12px;color:#5c7d85;font-weight:600;}' +
  '.tile.hero .lbl{color:rgba(255,255,255,.7);}' +
  '.tile .num{font-size:30px;font-weight:700;margin-top:4px;}' +
  '.tile.hero .num{font-size:38px;color:#ff9d7f;}' +
  '.cols{display:grid;grid-template-columns:1fr 1fr;gap:20px;}' +
  '.card{background:#fff;border:1px solid #d3e7e8;border-radius:16px;padding:16px;}' +
  '.card h3{font-size:13px;margin:0 0 10px;color:#5c7d85;}' +
  '.row{display:flex;justify-content:space-between;font-size:13px;padding:8px 0;border-bottom:1px solid #eef2f2;}' +
  '.row:last-child{border:none;}',
  '<div class="shell"><nav class="nav"><div class="brand">🌊 onda</div>' +
    NAV.map(function(n){return '<a class="'+(n==="홈"?"on":"")+'">'+icon(n,18)+n+'</a>';}).join('') +
  '</nav><main class="main">' +
    '<div class="stat-row"><div class="tile hero"><div class="lbl">디데이</div><div class="num">'+DDAY+'</div></div>' +
    '<div class="tile"><div class="lbl">연속 기록</div><div class="num">'+STATS.streak+'일</div></div>' +
    '<div class="tile"><div class="lbl">버킷 완료</div><div class="num">'+STATS.bucket+'</div></div></div>' +
    '<div class="cols"><div class="card"><h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
    '<div class="card"><h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,16)+'…</span></div>';}).join('') + '</div></div>' +
  '</main></div>'
);

// ---- 02: Editorial Top Tabs ----
add("에디토리얼 탑탭", "상단 얇은 탭 + 초대형 타이포, 카드 없이 여백/구분선으로만", 980, 1000,
  'body{background:#fbfdfd;color:#0b2f3a;}' +
  '.tabbar{display:flex;justify-content:center;gap:28px;padding:22px 0;border-bottom:1px solid #e3f1f1;font-size:13px;font-weight:700;color:#9dbcc2;}' +
  '.tabbar .on{color:#0a8494;}' +
  '.wrap{max-width:600px;margin:0 auto;padding:56px 24px;}' +
  '.names{text-align:center;font-size:14px;color:#5c7d85;font-weight:600;letter-spacing:.02em;}' +
  '.dday{text-align:center;font-size:72px;font-weight:800;letter-spacing:-.03em;color:#0ea5b7;margin:10px 0 4px;}' +
  '.anni{text-align:center;font-size:13px;color:#9dbcc2;margin-bottom:56px;}' +
  '.sec{font-size:12px;font-weight:800;letter-spacing:.08em;color:#9dbcc2;text-transform:uppercase;margin:0 0 14px;}' +
  '.line{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #eef2f2;font-size:15px;}' +
  '.line b{font-weight:600;}',
  '<div class="tabbar">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="wrap"><div class="names">'+NAMES+'</div><div class="dday">'+DDAY+'</div><div class="anni">'+ANNI+'</div>' +
    '<div class="sec">다가오는 일정</div>' + EVENTS.map(function(e){return '<div class="line"><span>'+e.t+' <i style="color:#9dbcc2;font-style:normal;">· '+e.who+'</i></span><b>'+e.d+'</b></div>';}).join('') +
    '<div class="sec" style="margin-top:36px;">최근 기록</div>' + RECORDS.map(function(r){return '<div class="line"><span><b>'+r.who+'</b> · '+r.t+'</span></div>';}).join('') +
  '</div>'
);

// ---- 03: Right Rail Utility ----
add("우측 유틸리티 레일", "본문은 좌측에서 자연스럽게, 내비는 얇은 우측 도구모음", 1000, 620,
  'body{background:#fff;color:#0b2f3a;}' +
  '.shell{display:flex;}' +
  '.main{flex:1;padding:32px 40px;max-width:660px;}' +
  '.rail{width:180px;flex:none;padding:32px 16px;border-left:1px solid #d3e7e8;background:#f7fbfb;}' +
  '.rail a{display:flex;align-items:center;gap:8px;font-size:13px;color:#5c7d85;padding:9px 10px;border-radius:8px;margin-bottom:2px;}' +
  '.rail a.on{background:#e3f1f1;color:#0a8494;font-weight:700;}' +
  '.hero{background:#fff;border:1.5px solid #0ea5b7;border-radius:18px;padding:22px;margin-bottom:26px;}' +
  '.hero .names{font-size:14px;color:#5c7d85;font-weight:600;}' +
  '.hero .dday{font-size:40px;font-weight:800;color:#0ea5b7;margin:4px 0;}' +
  'h3{font-size:13px;color:#5c7d85;margin:22px 0 10px;}' +
  '.row{display:flex;justify-content:space-between;font-size:14px;padding:9px 12px;background:#f7fbfb;border-radius:10px;margin-bottom:6px;}',
  '<div class="shell"><main class="main">' +
    '<div class="hero"><div class="names">'+NAMES+'</div><div class="dday">'+DDAY+'</div><div style="font-size:12px;color:#9dbcc2;">'+ANNI+'</div></div>' +
    '<h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') +
    '<h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,20)+'…</span></div>';}).join('') +
  '</main><nav class="rail">' + NAV.map(function(n){return '<a class="'+(n==="홈"?"on":"")+'">'+icon(n,17)+n+'</a>';}).join('') + '</nav></div>'
);

// ---- 04: Collapsed Icon Rail ----
add("아이콘 전용 레일", "64px 초슬림 아이콘 레일 + 가로형 슬림 히어로 배너", 1000, 560,
  'body{background:#eef7f7;color:#0b2f3a;}' +
  '.shell{display:flex;}' +
  '.rail{width:64px;flex:none;background:#0b2f3a;display:flex;flex-direction:column;align-items:center;padding:18px 0;gap:6px;}' +
  '.rail .ico{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:12px;color:#7fa3aa;}' +
  '.rail .ico.on{background:#0ea5b7;color:#fff;}' +
  '.main{flex:1;padding:24px 30px;}' +
  '.banner{display:flex;align-items:center;justify-content:space-between;background:linear-gradient(100deg,#17c2d1,#0a5a68);color:#fff;border-radius:16px;padding:18px 26px;margin-bottom:22px;}' +
  '.banner .names{font-size:13px;color:rgba(255,255,255,.8);}' +
  '.banner .dday{font-size:30px;font-weight:800;color:#ff9d7f;}' +
  '.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;}' +
  '.card{background:#fff;border-radius:14px;padding:16px;}' +
  '.card h3{font-size:12px;color:#5c7d85;margin:0 0 8px;}' +
  '.row{font-size:13px;padding:7px 0;border-bottom:1px solid #eef2f2;display:flex;justify-content:space-between;}',
  '<div class="shell"><nav class="rail">' + NAV.map(function(n){return '<div class="ico '+(n==="홈"?"on":"")+'">'+icon(n,18)+'</div>';}).join('') + '</nav>' +
  '<main class="main"><div class="banner"><div><div class="names">'+NAMES+'</div><div style="font-size:11px;color:rgba(255,255,255,.6);">'+ANNI+'</div></div><div class="dday">'+DDAY+'</div></div>' +
  '<div class="cols"><div class="card"><h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
  '<div class="card"><h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,14)+'…</span></div>';}).join('') + '</div></div>' +
  '</main></div>'
);

// ---- 05: Bento Dashboard ----
add("벤토 대시보드", "비균등 그리드 타일, D-day가 2x2로 지배", 1000, 660,
  'body{background:#eef7f7;color:#0b2f3a;}' +
  '.shell{display:flex;}' +
  '.nav{width:200px;flex:none;background:#fff;padding:20px 12px;border-right:1px solid #d3e7e8;}' +
  '.brand{font-weight:700;margin-bottom:20px;}' +
  '.nav a{display:flex;gap:9px;align-items:center;padding:9px 10px;border-radius:9px;color:#5c7d85;font-size:13px;font-weight:600;}' +
  '.nav a.on{background:#e3f1f1;color:#0a8494;}' +
  '.main{flex:1;padding:24px;}' +
  '.bento{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,110px);gap:14px;}' +
  '.b{border-radius:16px;padding:16px;}' +
  '.b1{grid-column:1/3;grid-row:1/3;background:linear-gradient(160deg,#17c2d1,#0a5a68 60%,#063542);color:#fff;display:flex;flex-direction:column;justify-content:center;}' +
  '.b1 .dday{font-size:36px;font-weight:800;color:#ff9d7f;}' +
  '.b2{grid-column:3/5;background:#fff;}' +
  '.b3{grid-column:3/4;background:#fff;}' +
  '.b4{grid-column:4/5;background:#0ea5b7;color:#fff;}' +
  '.b .lbl{font-size:11px;color:#5c7d85;font-weight:700;}' +
  '.b1 .lbl{color:rgba(255,255,255,.7);}' +
  '.b4 .lbl{color:rgba(255,255,255,.85);}' +
  '.b .num{font-size:22px;font-weight:800;margin-top:4px;}' +
  '.evlist{margin-top:16px;background:#fff;border-radius:16px;padding:14px 16px;}' +
  '.row{display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid #eef2f2;}',
  '<div class="shell"><nav class="nav"><div class="brand">🌊 onda</div>' + NAV.map(function(n){return '<a class="'+(n==="홈"?"on":"")+'">'+icon(n,16)+n+'</a>';}).join('') + '</nav>' +
  '<main class="main"><div class="bento">' +
    '<div class="b b1"><div class="lbl">디데이 · '+NAMES+'</div><div class="dday">'+DDAY+'</div></div>' +
    '<div class="b b2"><div class="lbl">최근 기록</div><div class="num" style="font-size:14px;font-weight:600;">'+RECORDS[0].t.slice(0,18)+'…</div></div>' +
    '<div class="b b3"><div class="lbl">연속 기록</div><div class="num">'+STATS.streak+'일</div></div>' +
    '<div class="b b4"><div class="lbl">버킷 완료</div><div class="num">'+STATS.bucket+'</div></div>' +
  '</div><div class="evlist">' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+' · '+e.who+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
  '</main></div>'
);

// ---- 06: Chat-App Shell ----
add("채팅앱 셸", "대화목록처럼 생긴 내비 + 말풍선 배경의 메인 패널", 1000, 640,
  'body{background:#e3f1f1;color:#0b2f3a;}' +
  '.shell{display:flex;height:640px;}' +
  '.list{width:240px;flex:none;background:#fff;border-right:1px solid #d3e7e8;}' +
  '.list .head{padding:16px;font-weight:700;border-bottom:1px solid #eef2f2;}' +
  '.list a{display:flex;gap:10px;align-items:center;padding:12px 16px;border-bottom:1px solid #f4f8f8;}' +
  '.list a.on{background:#e3f1f1;}' +
  '.avatar{width:34px;height:34px;border-radius:50%;background:#0ea5b7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;flex:none;}' +
  '.list .t{font-size:13px;font-weight:700;}' +
  '.list .s{font-size:11px;color:#9dbcc2;}' +
  '.panel{flex:1;padding:20px 26px;background:radial-gradient(#d3e7e8 1px,transparent 1px) 0 0/16px 16px, #f7fbfb;}' +
  '.bubble{background:#fff;border-radius:18px;padding:16px 20px;max-width:70%;margin-bottom:14px;box-shadow:0 2px 10px rgba(11,63,74,.06);}' +
  '.bubble.me{margin-left:auto;background:#0ea5b7;color:#fff;}' +
  '.bubble .dday{font-size:26px;font-weight:800;}',
  '<div class="shell"><nav class="list"><div class="head">🌊 onda</div>' +
    NAV.map(function(n,i){return '<a class="'+(i===0?"on":"")+'"><div class="avatar">'+n[0]+'</div><div><div class="t">'+n+'</div><div class="s">'+(i===0?"디데이 "+DDAY:"최근 소식 있음")+'</div></div></a>';}).join('') +
  '</nav><main class="panel">' +
    '<div class="bubble"><div style="font-size:12px;color:#9dbcc2;">'+NAMES+' · '+ANNI+'</div><div class="dday">'+DDAY+'</div></div>' +
    '<div class="bubble me">다가오는 일정: ' + EVENTS[0].t + ' · ' + EVENTS[0].d + '</div>' +
    '<div class="bubble">'+RECORDS[0].who+': '+RECORDS[0].t+'</div>' +
    '<div class="bubble me">'+RECORDS[1].who+': '+RECORDS[1].t+'</div>' +
  '</main></div>'
);

// ---- 07: Journal Paper ----
add("저널/일기장", "카드 없이 타이포와 구분선만, 좁은 단폭 종이 느낌", 720, 920,
  'body{background:#fdfbf6;color:#20221f;}' +
  '.wrap{max-width:520px;margin:0 auto;padding:44px 24px;}' +
  '.top{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#8a8676;margin-bottom:40px;}' +
  '.top .links span{margin-left:14px;}' +
  '.date{font-size:15px;color:#8a8676;}' +
  '.dday{font-size:52px;font-weight:800;letter-spacing:-.02em;margin:6px 0 2px;color:#20221f;}' +
  '.anni{font-size:13px;color:#a6a294;margin-bottom:46px;}' +
  'h3{font-size:12px;letter-spacing:.1em;color:#a6a294;text-transform:uppercase;border-bottom:1px solid #ece7d8;padding-bottom:8px;margin:0 0 4px;}' +
  '.entry{padding:14px 0;border-bottom:1px solid #f1ede0;font-size:14.5px;line-height:1.6;}' +
  '.entry b{font-weight:700;}',
  '<div class="wrap"><div class="top">🌊 onda<span class="links">'+NAV.join('<span> </span>')+'</span></div>' +
    '<div class="date">'+NAMES+'</div><div class="dday">'+DDAY+'</div><div class="anni">'+ANNI+'</div>' +
    '<h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="entry">'+e.d+' — '+e.t+' <span style="color:#a6a294;">('+e.who+')</span></div>';}).join('') +
    '<h3 style="margin-top:34px;">최근 기록</h3>' + RECORDS.map(function(r){return '<div class="entry"><b>'+r.who+'</b> · '+r.t+' <span style="color:#a6a294;">— '+r.d+'</span></div>';}).join('') +
  '</div>'
);

// ---- 08: Split-Screen Duo ----
add("스플릿 듀오", "두 사람 컬러를 반으로 나눈 좌우 대칭 구조", 1000, 640,
  'body{background:#fff;color:#0b2f3a;}' +
  '.split{display:flex;height:220px;}' +
  '.half{flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 40px;}' +
  '.half.l{background:#0a5a68;color:#fff;align-items:flex-end;text-align:right;}' +
  '.half.r{background:#fff;color:#0b2f3a;align-items:flex-start;}' +
  '.who{font-size:14px;opacity:.75;}' +
  '.dday{font-size:44px;font-weight:800;color:#ff9d7f;}' +
  '.mid{text-align:center;font-size:12px;color:#9dbcc2;padding:8px 0;border-bottom:1px solid #eef2f2;}' +
  '.nav{display:flex;justify-content:center;gap:22px;padding:14px;border-bottom:1px solid #eef2f2;font-size:13px;font-weight:700;color:#5c7d85;}' +
  '.nav .on{color:#0a8494;}' +
  '.body{max-width:640px;margin:0 auto;padding:26px 20px;}' +
  '.cols{display:grid;grid-template-columns:1fr 1fr;gap:20px;}' +
  'h3{font-size:12px;color:#9dbcc2;text-transform:uppercase;letter-spacing:.06em;margin:0 0 10px;}' +
  '.row{font-size:13px;padding:8px 0;border-bottom:1px solid #eef2f2;display:flex;justify-content:space-between;}',
  '<div class="nav">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="split"><div class="half l"><div class="who">바니</div><div class="dday">'+DDAY+'</div></div>' +
    '<div class="half r"><div class="who">키쿠</div><div style="font-size:12px;color:#9dbcc2;">'+ANNI+'</div></div></div>' +
  '<div class="body"><div class="cols"><div><h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
  '<div><h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,14)+'…</span></div>';}).join('') + '</div></div></div>'
);

// ---- 09: Timeline-Centric Feed ----
add("타임라인 피드", "일정·기록을 한 줄기 타임라인으로 통합", 760, 900,
  'body{background:#fff;color:#0b2f3a;}' +
  '.nav{display:flex;gap:20px;padding:16px 24px;border-bottom:1px solid #eef2f2;font-size:13px;font-weight:700;color:#5c7d85;}' +
  '.nav .on{color:#0a8494;}' +
  '.wrap{max-width:560px;margin:0 auto;padding:28px 24px;}' +
  '.hero{background:linear-gradient(160deg,#17c2d1,#0a5a68);color:#fff;border-radius:18px;padding:20px 24px;margin-bottom:30px;}' +
  '.hero .dday{font-size:34px;font-weight:800;color:#ff9d7f;}' +
  '.tl{position:relative;padding-left:22px;}' +
  '.tl::before{content:"";position:absolute;left:5px;top:6px;bottom:6px;width:2px;background:#d3e7e8;}' +
  '.tl-item{position:relative;padding-bottom:22px;}' +
  '.tl-item::before{content:"";position:absolute;left:-22px;top:3px;width:10px;height:10px;border-radius:50%;background:#0ea5b7;border:2px solid #fff;box-shadow:0 0 0 2px #d3e7e8;}' +
  '.tl-item .d{font-size:11px;color:#9dbcc2;}' +
  '.tl-item .t{font-size:14px;margin-top:2px;}',
  '<div class="nav">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="wrap"><div class="hero">'+NAMES+' · <span class="dday">'+DDAY+'</span></div><div class="tl">' +
    EVENTS.map(function(e){return '<div class="tl-item"><div class="d">'+e.d+' · 예정</div><div class="t">'+e.t+' <i style="color:#9dbcc2;">('+e.who+')</i></div></div>';}).join('') +
    RECORDS.map(function(r){return '<div class="tl-item"><div class="d">'+r.d+' · 기록</div><div class="t"><b>'+r.who+'</b> '+r.t+'</div></div>';}).join('') +
  '</div></div>'
);

// ---- 10: Card Carousel (widget row) ----
add("가로 스크롤 위젯", "월렛 스타일 위젯 행 + 하단 리스트", 980, 640,
  'body{background:#eef7f7;color:#0b2f3a;}' +
  '.nav{display:flex;justify-content:space-between;align-items:center;padding:16px 28px;}' +
  '.nav .links{display:flex;gap:18px;font-size:13px;font-weight:700;color:#5c7d85;}' +
  '.nav .on{color:#0a8494;}' +
  '.carousel{display:flex;gap:14px;padding:4px 28px 22px;overflow:hidden;}' +
  '.wcard{flex:none;width:180px;height:120px;border-radius:16px;padding:14px;color:#fff;display:flex;flex-direction:column;justify-content:space-between;}' +
  '.w1{background:linear-gradient(160deg,#17c2d1,#0a5a68);width:220px;}' +
  '.w1 .num{font-size:28px;font-weight:800;color:#ff9d7f;}' +
  '.w2{background:#0ea5b7;} .w3{background:#0a2f3a;} .w4{background:#fff;color:#0b2f3a;border:1px solid #d3e7e8;}' +
  '.wcard .lbl{font-size:11px;opacity:.8;}' +
  '.wcard .num{font-size:20px;font-weight:800;}' +
  '.list{padding:0 28px;}' +
  '.row{display:flex;justify-content:space-between;background:#fff;border-radius:12px;padding:12px 16px;margin-bottom:8px;font-size:13px;}',
  '<div class="nav"><b>🌊 onda</b><div class="links">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div></div>' +
  '<div class="carousel">' +
    '<div class="wcard w1"><div class="lbl">'+NAMES+'</div><div class="num">'+DDAY+'</div></div>' +
    '<div class="wcard w2"><div class="lbl">연속 기록</div><div class="num">'+STATS.streak+'일</div></div>' +
    '<div class="wcard w3"><div class="lbl">버킷 완료</div><div class="num">'+STATS.bucket+'</div></div>' +
    '<div class="wcard w4"><div class="lbl">다음 일정</div><div class="num" style="font-size:14px;">'+EVENTS[0].t+'</div></div>' +
  '</div><div class="list">' + RECORDS.map(function(r){return '<div class="row"><span><b>'+r.who+'</b> · '+r.t.slice(0,26)+'…</span><span style="color:#9dbcc2;">'+r.d+'</span></div>';}).join('') + '</div>'
);

// ---- 11: Full-Bleed Hero ----
add("풀블리드 히어로", "히어로가 프레임 끝까지 번짐, 그 위에 내비 오버레이", 980, 680,
  'body{background:#fff;color:#0b2f3a;}' +
  '.hero{position:relative;background:linear-gradient(160deg,#17c2d1,#0a5a68 55%,#063542);color:#fff;padding:20px 32px 46px;}' +
  '.nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:60px;}' +
  '.nav .links{display:flex;gap:20px;font-size:13px;font-weight:700;color:rgba(255,255,255,.75);}' +
  '.nav .on{color:#fff;}' +
  '.names{font-size:14px;color:rgba(255,255,255,.8);}' +
  '.dday{font-size:58px;font-weight:800;color:#ff9d7f;margin:6px 0;}' +
  '.body{max-width:680px;margin:-24px auto 0;padding:0 28px 28px;position:relative;}' +
  '.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;}' +
  '.card{background:#fff;border-radius:16px;padding:16px;box-shadow:0 10px 30px rgba(11,63,74,.1);}' +
  '.card h3{font-size:12px;color:#5c7d85;margin:0 0 10px;}' +
  '.row{font-size:13px;padding:7px 0;border-bottom:1px solid #eef2f2;display:flex;justify-content:space-between;}',
  '<div class="hero"><div class="nav"><b>🌊 onda</b><div class="links">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div></div>' +
    '<div class="names">'+NAMES+'</div><div class="dday">'+DDAY+'</div><div style="font-size:12px;color:rgba(255,255,255,.6);">'+ANNI+'</div></div>' +
  '<div class="body"><div class="cols"><div class="card"><h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
  '<div class="card"><h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,12)+'…</span></div>';}).join('') + '</div></div></div>'
);

// ---- 12: Minimal Zen ----
add("미니멀 젠", "극단적 여백, 요약 한 줄씩만", 760, 640,
  'body{background:#fff;color:#0b2f3a;}' +
  '.nav{display:flex;justify-content:space-between;padding:22px 36px;font-size:11px;color:#9dbcc2;letter-spacing:.04em;}' +
  '.nav .links span{margin-left:16px;}' +
  '.nav .on{color:#0b2f3a;font-weight:700;}' +
  '.wrap{max-width:420px;margin:80px auto 0;text-align:center;}' +
  '.names{font-size:12px;color:#9dbcc2;letter-spacing:.06em;}' +
  '.dday{font-size:64px;font-weight:300;letter-spacing:-.02em;margin:8px 0;}' +
  '.anni{font-size:11px;color:#c4d6d9;margin-bottom:70px;}' +
  '.line{font-size:13px;color:#5c7d85;padding:14px 0;border-top:1px solid #f2f5f5;}' +
  '.line b{color:#0b2f3a;font-weight:500;}',
  '<div class="nav"><span>onda</span><div class="links">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div></div>' +
  '<div class="wrap"><div class="names">'+NAMES+'</div><div class="dday">'+DDAY+'</div><div class="anni">'+ANNI+'</div>' +
    '<div class="line">다음 일정 — <b>'+EVENTS[0].t+'</b> · '+EVENTS[0].d+'</div>' +
    '<div class="line">최근 기록 — <b>'+RECORDS[0].who+'</b>의 이야기</div>' +
  '</div>'
);

// ---- 13: Maximalist Stacked Cards (neo-brutalist) ----
add("맥시멀 스택 카드", "두꺼운 테두리·하드섀도우·미세 회전", 980, 700,
  'body{background:#e3f1f1;color:#0b2f3a;}' +
  '.nav{display:flex;gap:16px;padding:18px 26px;font-size:13px;font-weight:800;}' +
  '.nav span{padding:8px 14px;border:2.5px solid #0b2f3a;border-radius:10px;background:#fff;}' +
  '.nav .on{background:#0ea5b7;color:#fff;}' +
  '.wrap{padding:6px 26px 26px;position:relative;}' +
  '.card{border:2.5px solid #0b2f3a;border-radius:14px;background:#fff;padding:18px;box-shadow:6px 6px 0 #0b2f3a;margin-bottom:22px;}' +
  '.hero{background:#ff9d7f;transform:rotate(-.6deg);}' +
  '.hero .dday{font-size:42px;font-weight:800;}' +
  '.cols{display:grid;grid-template-columns:1fr 1fr;gap:22px;}' +
  '.c2{background:#0ea5b7;color:#fff;transform:rotate(.5deg);}' +
  '.c3{transform:rotate(-.4deg);}' +
  '.row{font-size:13px;padding:7px 0;border-bottom:2px dashed rgba(11,47,58,.2);display:flex;justify-content:space-between;}',
  '<div class="nav">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="wrap"><div class="card hero"><div style="font-size:13px;font-weight:700;">'+NAMES+'</div><div class="dday">'+DDAY+'</div></div>' +
  '<div class="cols"><div class="card c2"><h3 style="margin:0 0 10px;font-size:13px;">다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row" style="border-color:rgba(255,255,255,.3);"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
  '<div class="card c3"><h3 style="margin:0 0 10px;font-size:13px;">최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,14)+'…</span></div>';}).join('') + '</div></div></div>'
);

// ---- 14: Magazine Masonry ----
add("매거진 매소너리", "핀터레스트식 높이가 다른 카드 격자", 980, 700,
  'body{background:#fff;color:#0b2f3a;}' +
  '.nav{display:flex;gap:18px;padding:18px 26px;border-bottom:1px solid #eef2f2;font-size:13px;font-weight:700;color:#5c7d85;}' +
  '.nav .on{color:#0a8494;}' +
  '.masonry{columns:3;column-gap:16px;padding:20px 26px;}' +
  '.card{break-inside:avoid;background:#f7fbfb;border-radius:14px;padding:16px;margin-bottom:16px;}' +
  '.hero{background:linear-gradient(160deg,#17c2d1,#0a5a68);color:#fff;padding:26px 18px;}' +
  '.hero .dday{font-size:32px;font-weight:800;color:#ff9d7f;}' +
  '.card .d{font-size:11px;color:#9dbcc2;}' +
  '.card .t{font-size:13.5px;margin-top:4px;line-height:1.5;}',
  '<div class="nav">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="masonry">' +
    '<div class="card hero"><div style="font-size:12px;opacity:.8;">'+NAMES+'</div><div class="dday">'+DDAY+'</div><div style="font-size:11px;opacity:.6;">'+ANNI+'</div></div>' +
    EVENTS.map(function(e){return '<div class="card"><div class="d">예정 · '+e.d+'</div><div class="t">'+e.t+' ('+e.who+')</div></div>';}).join('') +
    RECORDS.map(function(r){return '<div class="card"><div class="d">기록 · '+r.d+'</div><div class="t"><b>'+r.who+'</b> '+r.t+'</div></div>';}).join('') +
  '</div>'
);

// ---- 15: Quick-Add Top Bar ----
add("퀵애드 탑바", "상시 노출 빠른 추가 입력창 + 탭은 알약형", 940, 800,
  'body{background:#eef7f7;color:#0b2f3a;}' +
  '.topbar{background:#fff;padding:16px 26px;border-bottom:1px solid #d3e7e8;}' +
  '.brand-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}' +
  '.quickadd{display:flex;gap:8px;background:#f2f7f7;border-radius:12px;padding:10px 14px;font-size:13px;color:#9dbcc2;}' +
  '.pills{display:flex;gap:8px;padding:14px 26px;}' +
  '.pills span{padding:8px 16px;border-radius:999px;background:#fff;font-size:13px;font-weight:700;color:#5c7d85;}' +
  '.pills .on{background:#0ea5b7;color:#fff;}' +
  '.wrap{padding:6px 26px 26px;}' +
  '.hero-mini{display:flex;justify-content:space-between;align-items:center;background:#fff;border-radius:14px;padding:16px 20px;margin-bottom:18px;}' +
  '.hero-mini .dday{font-size:26px;font-weight:800;color:#0ea5b7;}' +
  'h3{font-size:12px;color:#5c7d85;margin:18px 0 8px;}' +
  '.row{display:flex;justify-content:space-between;background:#fff;border-radius:10px;padding:11px 16px;margin-bottom:7px;font-size:13px;}',
  '<div class="topbar"><div class="brand-row"><b>🌊 onda</b><span style="font-size:12px;color:#9dbcc2;">'+NAMES+'</span></div>' +
    '<div class="quickadd">➕ 무엇을 추가할까요? (일정 · 기록 · 버킷)</div></div>' +
  '<div class="pills">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="wrap"><div class="hero-mini"><span>우리의 디데이</span><span class="dday">'+DDAY+'</span></div>' +
    '<h3>다가오는 일정</h3>' +
    EVENTS.map(function(e){return '<div class="row"><span>'+e.t+' · '+e.who+'</span><b>'+e.d+'</b></div>';}).join('') +
    '<h3>최근 기록</h3>' +
    RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,22)+'…</span></div>';}).join('') +
  '</div>'
);

// ---- 16: Notion Widget Dashboard ----
add("위젯 대시보드", "노션풍 조용한 크롬 + 제목 있는 모듈 타일", 1000, 660,
  'body{background:#fff;color:#0b2f3a;}' +
  '.shell{display:flex;}' +
  '.nav{width:200px;flex:none;padding:20px 10px;border-right:1px solid #eef2f2;}' +
  '.nav .brand{font-weight:700;padding:0 8px 16px;}' +
  '.nav a{display:flex;gap:8px;align-items:center;padding:7px 8px;border-radius:6px;color:#5c7d85;font-size:13px;}' +
  '.nav a.on{background:#f2f7f7;color:#0a8494;font-weight:700;}' +
  '.main{flex:1;padding:24px 30px;}' +
  '.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}' +
  '.w{border:1px solid #eef2f2;border-radius:10px;padding:14px 16px;}' +
  '.w .wt{display:flex;justify-content:space-between;font-size:12px;color:#9dbcc2;margin-bottom:10px;}' +
  '.w.hero{grid-column:1/3;background:#f7fbfb;}' +
  '.w.hero .dday{font-size:30px;font-weight:800;color:#0ea5b7;}' +
  '.row{font-size:13px;padding:7px 0;border-bottom:1px solid #f4f7f7;display:flex;justify-content:space-between;}',
  '<div class="shell"><nav class="nav"><div class="brand">🌊 onda</div>' + NAV.map(function(n){return '<a class="'+(n==="홈"?"on":"")+'">'+icon(n,15)+n+'</a>';}).join('') + '</nav>' +
  '<main class="main"><div class="grid">' +
    '<div class="w hero"><div class="wt">디데이 ⋮⋮</div>'+NAMES+' · <span class="dday">'+DDAY+'</span></div>' +
    '<div class="w"><div class="wt">다가오는 일정 ⋮⋮</div>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
    '<div class="w"><div class="wt">최근 기록 ⋮⋮</div>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,12)+'…</span></div>';}).join('') + '</div>' +
  '</div></main></div>'
);

// ---- 17: Scrapbook ----
add("스크랩북", "폴라로이드 프레임 + 점선/회전으로 손맛, 폰트는 그대로", 940, 700,
  'body{background:#f3efe4;color:#3a3529;}' +
  '.nav{display:flex;gap:18px;padding:18px 28px;font-size:13px;font-weight:700;color:#8a826a;}' +
  '.nav .on{color:#0a5a68;text-decoration:underline;text-underline-offset:4px;}' +
  '.wrap{padding:10px 28px 28px;display:flex;gap:22px;flex-wrap:wrap;}' +
  '.polaroid{background:#fff;padding:12px 12px 20px;box-shadow:0 6px 16px rgba(58,53,41,.15);}' +
  '.p1{width:220px;transform:rotate(-2deg);}' +
  '.p2{width:200px;transform:rotate(1.5deg);margin-top:24px;}' +
  '.p3{width:200px;transform:rotate(-1deg);margin-top:6px;}' +
  '.frame1{height:130px;background:linear-gradient(160deg,#17c2d1,#0a5a68);border-radius:2px;display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;}' +
  '.frame1 .dday{font-size:30px;font-weight:800;color:#ffd7c4;}' +
  '.frame2{height:100px;background:#f3efe4;border:1px dashed #c9c1a8;border-radius:2px;padding:10px;font-size:12px;}' +
  '.cap{font-size:12px;color:#8a826a;margin-top:8px;text-align:center;}',
  '<div class="nav">🌊 onda' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="wrap">' +
    '<div class="polaroid p1"><div class="frame1">'+NAMES+'<div class="dday">'+DDAY+'</div></div><div class="cap">'+ANNI+'</div></div>' +
    '<div class="polaroid p2"><div class="frame2">📌 다가오는 일정<br>' + EVENTS.map(function(e){return e.d+' '+e.t;}).join('<br>') + '</div><div class="cap">다가오는 일정</div></div>' +
    '<div class="polaroid p3"><div class="frame2">📝 ' + RECORDS.map(function(r){return r.who+': '+r.t.slice(0,14)+'…';}).join('<br>') + '</div><div class="cap">최근 기록</div></div>' +
  '</div>'
);

// ---- 18: Compact Data-Dense ----
add("데이터 밀집 유틸리티", "은행 앱처럼 촘촘하고 표 형태", 940, 600,
  'body{background:#fff;color:#0b2f3a;font-size:13px;}' +
  '.nav{display:flex;justify-content:space-between;padding:10px 20px;border-bottom:1px solid #d3e7e8;background:#f7fbfb;}' +
  '.nav .links{display:flex;gap:16px;font-weight:700;color:#5c7d85;}' +
  '.nav .on{color:#0a8494;}' +
  '.strip{display:flex;justify-content:space-between;padding:10px 20px;border-bottom:1px solid #eef2f2;}' +
  '.strip b{color:#0ea5b7;font-size:16px;}' +
  'table{width:100%;border-collapse:collapse;}' +
  'th{text-align:left;font-size:11px;color:#9dbcc2;padding:8px 20px;border-bottom:1px solid #eef2f2;}' +
  'td{padding:7px 20px;border-bottom:1px solid #f4f7f7;font-size:13px;white-space:nowrap;}' +
  '.sec-t{padding:12px 20px 4px;font-size:11px;font-weight:800;color:#9dbcc2;text-transform:uppercase;}',
  '<div class="nav"><b>🌊 onda</b><div class="links">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div></div>' +
  '<div class="strip"><span>'+NAMES+' · '+ANNI+'</span><b>'+DDAY+'</b></div>' +
  '<div class="sec-t">다가오는 일정</div><table>' + EVENTS.map(function(e){return '<tr><td>'+e.d+'</td><td>'+e.t+'</td><td style="color:#9dbcc2;">'+e.who+'</td></tr>';}).join('') + '</table>' +
  '<div class="sec-t">최근 기록</div><table>' + RECORDS.map(function(r){return '<tr><td style="width:80px;color:#9dbcc2;">'+r.d+'</td><td>'+r.who+'</td><td>'+r.t+'</td></tr>';}).join('') + '</table>'
);

// ---- 19: Centered, No Sidebar ----
add("센터드 노 사이드바", "사이드바 없이 상단 알약 탭 + 좁은 리딩 컬럼", 700, 950,
  'body{background:#eef7f7;color:#0b2f3a;}' +
  '.top{text-align:center;padding:20px 0 0;font-weight:700;}' +
  '.pills{display:flex;justify-content:center;gap:6px;background:#e3f1f1;border-radius:999px;padding:4px;width:fit-content;margin:16px auto 30px;}' +
  '.pills span{padding:8px 16px;border-radius:999px;font-size:13px;font-weight:700;color:#5c7d85;}' +
  '.pills .on{background:#fff;color:#0a8494;box-shadow:0 1px 3px rgba(11,63,74,.1);}' +
  '.wrap{max-width:460px;margin:0 auto;padding:0 20px;}' +
  '.hero{background:#fff;border-radius:20px;padding:26px;text-align:center;box-shadow:0 4px 16px rgba(11,63,74,.06);}' +
  '.hero .dday{font-size:44px;font-weight:800;color:#0ea5b7;margin:6px 0;}' +
  'h3{font-size:13px;color:#5c7d85;margin:26px 0 10px;}' +
  '.row{display:flex;justify-content:space-between;background:#fff;border-radius:12px;padding:11px 14px;margin-bottom:7px;font-size:13px;}',
  '<div class="top">🌊 onda</div><div class="pills">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="wrap"><div class="hero">'+NAMES+'<div class="dday">'+DDAY+'</div><div style="font-size:12px;color:#9dbcc2;">'+ANNI+'</div></div>' +
    '<h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') +
    '<h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,18)+'…</span></div>';}).join('') +
  '</div>'
);

// ---- 20: Two-Column Equal Split ----
add("50/50 스플릿", "좌측 고정 히어로+내비, 우측 스크롤 리스트", 1000, 640,
  'body{background:#fff;color:#0b2f3a;}' +
  '.shell{display:flex;height:640px;}' +
  '.left{width:50%;background:linear-gradient(160deg,#17c2d1,#0a5a68 60%,#063542);color:#fff;padding:32px;display:flex;flex-direction:column;justify-content:space-between;}' +
  '.left .dday{font-size:56px;font-weight:800;color:#ff9d7f;}' +
  '.left nav{display:flex;gap:16px;font-size:13px;font-weight:700;color:rgba(255,255,255,.7);}' +
  '.left nav .on{color:#fff;}' +
  '.right{width:50%;padding:28px;overflow:auto;}' +
  'h3{font-size:12px;color:#9dbcc2;margin:0 0 10px;text-transform:uppercase;letter-spacing:.05em;}' +
  '.row{font-size:13px;padding:9px 0;border-bottom:1px solid #eef2f2;display:flex;justify-content:space-between;}',
  '<div class="shell"><div class="left"><nav>' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</nav>' +
  '<div><div style="font-size:14px;opacity:.8;">'+NAMES+'</div><div class="dday">'+DDAY+'</div><div style="font-size:12px;opacity:.6;">'+ANNI+'</div></div></div>' +
  '<div class="right"><h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') +
  '<h3 style="margin-top:22px;">최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,20)+'…</span></div>';}).join('') + '</div></div>'
);

// ---- 21: Floating Glass Panels ----
add("플로팅 글래스", "반투명 레이어 카드가 패턴 배경 위에 떠 있음", 980, 660,
  'body{background:#0a5a68 radial-gradient(circle at 20% 20%,rgba(255,255,255,.08),transparent 40%),radial-gradient(circle at 80% 70%,rgba(255,255,255,.06),transparent 40%);color:#fff;}' +
  '.nav{display:flex;gap:18px;padding:18px 28px;font-size:13px;font-weight:700;color:rgba(255,255,255,.6);}' +
  '.nav .on{color:#fff;}' +
  '.wrap{padding:8px 28px 28px;}' +
  '.glass{background:rgba(255,255,255,.12);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.2);border-radius:18px;padding:18px;margin-bottom:16px;}' +
  '.hero .dday{font-size:40px;font-weight:800;color:#ff9d7f;}' +
  '.cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;}' +
  'h3{font-size:12px;color:rgba(255,255,255,.6);margin:0 0 10px;}' +
  '.row{font-size:13px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.15);display:flex;justify-content:space-between;}',
  '<div class="nav">🌊 onda' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="wrap"><div class="glass hero">'+NAMES+'<div class="dday">'+DDAY+'</div></div>' +
  '<div class="cols"><div class="glass"><h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
  '<div class="glass"><h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,14)+'…</span></div>';}).join('') + '</div></div></div>'
);

// ---- 22: Uniform Bento Launcher ----
add("균일 런처 그리드", "홈스크린 앱처럼 동일 크기 정사각 타일", 900, 640,
  'body{background:#eef7f7;color:#0b2f3a;}' +
  '.nav{text-align:center;padding:18px 0;font-weight:700;}' +
  '.grid{display:grid;grid-template-columns:repeat(3,190px);grid-auto-rows:190px;gap:16px;justify-content:center;padding:10px 30px 30px;}' +
  '.tile{width:100%;height:100%;min-width:0;box-sizing:border-box;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#fff;font-size:13px;font-weight:700;text-align:center;padding:8px;}' +
  '.t1{background:linear-gradient(160deg,#17c2d1,#0a5a68);grid-column:span 2;}' +
  '.t1 .dday{font-size:26px;}' +
  '.t2{background:#0ea5b7;} .t3{background:#ff9d7f;} .t4{background:#0b2f3a;} .t5{background:#fff;color:#0b2f3a;border:1px solid #d3e7e8;}',
  '<div class="nav">🌊 onda</div><div class="grid">' +
    '<div class="tile t1"><div>'+NAMES+'</div><div class="dday">'+DDAY+'</div></div>' +
    '<div class="tile t2">'+icon('캘린더',22)+EVENTS[0].d+'</div>' +
    '<div class="tile t3">'+icon('버킷',22)+'버킷 '+STATS.bucket+'</div>' +
    '<div class="tile t4">'+icon('기록',22)+'기록 '+STATS.records+'개</div>' +
    '<div class="tile t5">'+icon('질문',22)+'오늘의 질문</div>' +
    '<div class="tile t2">'+icon('홈',22)+'연속 '+STATS.streak+'일</div>' +
  '</div>'
);

// ---- 23: Hero-as-Sidebar ----
add("히어로형 사이드바", "세로로 긴 히어로 자체가 사이드바", 1000, 660,
  'body{background:#fff;color:#0b2f3a;}' +
  '.shell{display:flex;min-height:660px;}' +
  '.hero{width:260px;flex:none;background:linear-gradient(200deg,#17c2d1,#0a5a68 55%,#063542);color:#fff;padding:26px 22px;display:flex;flex-direction:column;justify-content:space-between;}' +
  '.hero nav{display:flex;flex-direction:column;gap:4px;}' +
  '.hero nav a{padding:9px 10px;border-radius:9px;font-size:13px;font-weight:700;color:rgba(255,255,255,.65);display:flex;gap:8px;align-items:center;}' +
  '.hero nav a.on{background:rgba(255,255,255,.15);color:#fff;}' +
  '.hero .dday{font-size:38px;font-weight:800;color:#ff9d7f;}' +
  '.main{flex:1;padding:28px 32px;}' +
  '.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;}' +
  '.card{background:#f7fbfb;border-radius:14px;padding:16px;}' +
  '.card h3{font-size:12px;color:#5c7d85;margin:0 0 10px;}' +
  '.row{font-size:13px;padding:7px 0;border-bottom:1px solid #eef2f2;display:flex;justify-content:space-between;}',
  '<div class="shell"><div class="hero"><nav>' + NAV.map(function(n){return '<a class="'+(n==="홈"?"on":"")+'">'+icon(n,16)+n+'</a>';}).join('') + '</nav>' +
  '<div><div style="font-size:12px;opacity:.75;">'+NAMES+'</div><div class="dday">'+DDAY+'</div><div style="font-size:11px;opacity:.6;">'+ANNI+'</div></div></div>' +
  '<main class="main"><div class="cols"><div class="card"><h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
  '<div class="card"><h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,14)+'…</span></div>';}).join('') + '</div></div></main></div>'
);

// ---- 24: Progress-Ring Driven ----
add("프로그레스 링", "원형 진행률이 지배적인 시각 언어", 940, 640,
  'body{background:#fff;color:#0b2f3a;}' +
  '.nav{display:flex;gap:18px;padding:18px 26px;border-bottom:1px solid #eef2f2;font-size:13px;font-weight:700;color:#5c7d85;}' +
  '.nav .on{color:#0a8494;}' +
  '.wrap{padding:24px 26px;}' +
  '.rings{display:flex;gap:22px;margin-bottom:26px;}' +
  '.ring{width:140px;text-align:center;}' +
  '.ring .lbl{font-size:12px;color:#5c7d85;margin-top:8px;}' +
  '.ring .num{font-size:12px;color:#9dbcc2;}' +
  '.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;}' +
  '.card{background:#f7fbfb;border-radius:14px;padding:16px;}' +
  '.card h3{font-size:12px;color:#5c7d85;margin:0 0 10px;}' +
  '.row{font-size:13px;padding:7px 0;border-bottom:1px solid #eef2f2;display:flex;justify-content:space-between;}',
  '<div class="nav">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="wrap"><div class="rings">' +
    '<div class="ring"><svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="#e3f1f1" stroke-width="12"/><circle cx="60" cy="60" r="52" fill="none" stroke="#0ea5b7" stroke-width="12" stroke-dasharray="327" stroke-dashoffset="60" stroke-linecap="round" transform="rotate(-90 60 60)"/><text x="60" y="66" text-anchor="middle" font-size="22" font-weight="800" fill="#0b2f3a">'+DDAY+'</text></svg><div class="lbl">'+NAMES+'</div></div>' +
    '<div class="ring"><svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="#e3f1f1" stroke-width="12"/><circle cx="60" cy="60" r="52" fill="none" stroke="#ff9d7f" stroke-width="12" stroke-dasharray="327" stroke-dashoffset="110" stroke-linecap="round" transform="rotate(-90 60 60)"/><text x="60" y="66" text-anchor="middle" font-size="20" font-weight="800" fill="#0b2f3a">'+STATS.bucket+'</text></svg><div class="lbl">버킷 완료율</div></div>' +
    '<div class="ring"><svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="#e3f1f1" stroke-width="12"/><circle cx="60" cy="60" r="52" fill="none" stroke="#0a5a68" stroke-width="12" stroke-dasharray="327" stroke-dashoffset="200" stroke-linecap="round" transform="rotate(-90 60 60)"/><text x="60" y="66" text-anchor="middle" font-size="20" font-weight="800" fill="#0b2f3a">'+STATS.streak+'일</text></svg><div class="lbl">연속 기록</div></div>' +
  '</div><div class="cols"><div class="card"><h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
  '<div class="card"><h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,14)+'…</span></div>';}).join('') + '</div></div></div>'
);

// ---- 25: Newspaper Columns ----
add("신문 컬럼", "세로 구분선의 다단 신문 레이아웃", 980, 640,
  'body{background:#fdfdfb;color:#0b2f3a;}' +
  '.masthead{text-align:center;padding:20px 0 14px;border-bottom:3px double #0b2f3a;}' +
  '.masthead .brand{font-size:22px;font-weight:800;letter-spacing:.02em;}' +
  '.nav{display:flex;justify-content:center;gap:22px;padding:10px 0;border-bottom:1px solid #d3e7e8;font-size:12px;font-weight:700;color:#5c7d85;}' +
  '.nav .on{color:#0a8494;text-decoration:underline;}' +
  '.cols{columns:2;column-gap:0;padding:20px 30px;}' +
  '.col-inner{break-inside:avoid;padding-right:24px;border-right:1px solid #d3e7e8;margin-bottom:20px;}' +
  '.dday{font-size:40px;font-weight:800;color:#0ea5b7;}' +
  'h3{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9dbcc2;border-top:2px solid #0b2f3a;padding-top:6px;margin:0 0 8px;}' +
  '.row{font-size:13px;padding:6px 0;border-bottom:1px solid #eee;}',
  '<div class="masthead"><div class="brand">🌊 O N D A</div><div style="font-size:11px;color:#9dbcc2;">'+NAMES+' · '+ANNI+'</div></div>' +
  '<div class="nav">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="cols"><div class="col-inner"><h3>디데이</h3><div class="dday">'+DDAY+'</div>' +
    '<h3 style="margin-top:16px;">다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row">'+e.d+' — '+e.t+'</div>';}).join('') + '</div>' +
  '<div class="col-inner" style="border:none;"><h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><b>'+r.who+'</b> · '+r.t+'</div>';}).join('') + '</div></div>'
);

// ---- 26: Bottom Toolbar + Drawer ----
add("하단 툴바 + 드로어", "내비는 접힌 드로어, 하단에 빠른 액션바", 700, 950,
  'body{background:#eef7f7;color:#0b2f3a;}' +
  '.top{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;}' +
  '.burger{width:34px;height:34px;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;}' +
  '.wrap{padding:0 20px;}' +
  '.hero{background:linear-gradient(160deg,#17c2d1,#0a5a68);color:#fff;border-radius:18px;padding:22px;text-align:center;margin-bottom:20px;}' +
  '.hero .dday{font-size:38px;font-weight:800;color:#ff9d7f;}' +
  'h3{font-size:12px;color:#5c7d85;margin:18px 0 8px;}' +
  '.row{display:flex;justify-content:space-between;background:#fff;border-radius:10px;padding:10px 14px;margin-bottom:6px;font-size:13px;}' +
  '.toolbar{position:sticky;bottom:0;display:flex;justify-content:space-around;background:#fff;border-top:1px solid #d3e7e8;padding:12px 0 18px;margin-top:24px;}' +
  '.toolbar .ico{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;color:#9dbcc2;}' +
  '.toolbar .on{color:#0a8494;}',
  '<div class="top"><div class="burger">☰</div><b>🌊 onda</b><div style="width:34px;"></div></div>' +
  '<div class="wrap"><div class="hero">'+NAMES+'<div class="dday">'+DDAY+'</div>'+ANNI+'</div>' +
    '<h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') +
    '<h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,18)+'…</span></div>';}).join('') +
  '</div><div class="toolbar">' + NAV.map(function(n){return '<div class="ico '+(n==="홈"?"on":"")+'">'+icon(n,18)+n+'</div>';}).join('') + '</div>'
);

// ---- 27: Split Header Two-Tone ----
add("투톤 스플릿 헤더", "상단 헤더를 두 색으로 대각 분할", 980, 640,
  'body{background:#fff;color:#0b2f3a;}' +
  '.header{position:relative;height:180px;overflow:hidden;}' +
  '.header::before{content:"";position:absolute;inset:0;background:#0a5a68;clip-path:polygon(0 0,62% 0,38% 100%,0 100%);}' +
  '.header::after{content:"";position:absolute;inset:0;background:#0ea5b7;clip-path:polygon(62% 0,100% 0,100% 100%,38% 100%);}' +
  '.header .content{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;height:100%;padding:0 30px;color:#fff;}' +
  '.header .dday{font-size:40px;font-weight:800;color:#ffe2d4;}' +
  '.nav{display:flex;gap:18px;padding:14px 28px;font-size:13px;font-weight:700;color:#5c7d85;border-bottom:1px solid #eef2f2;}' +
  '.nav .on{color:#0a8494;}' +
  '.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:20px 28px;}' +
  '.card{background:#f7fbfb;border-radius:14px;padding:16px;}' +
  '.card h3{font-size:12px;color:#5c7d85;margin:0 0 10px;}' +
  '.row{font-size:13px;padding:7px 0;border-bottom:1px solid #eef2f2;display:flex;justify-content:space-between;}',
  '<div class="header"><div class="content"><div>'+NAMES+'<div style="font-size:11px;opacity:.7;">'+ANNI+'</div></div><div class="dday">'+DDAY+'</div></div></div>' +
  '<div class="nav">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="cols"><div class="card"><h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
  '<div class="card"><h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,14)+'…</span></div>';}).join('') + '</div></div>'
);

// ---- 28: Infinite Canvas / Mind-map ----
add("인피니트 캔버스", "카드들을 자유 배치하고 선으로 연결하는 맵 형태", 1000, 680,
  'body{background:#eef7f7;color:#0b2f3a;background-image:radial-gradient(#d3e7e8 1.5px,transparent 1.5px);background-size:22px 22px;}' +
  '.nav{display:flex;gap:18px;padding:16px 26px;font-size:13px;font-weight:700;color:#5c7d85;}' +
  '.nav .on{color:#0a8494;}' +
  '.canvas{position:relative;height:560px;}' +
  '.node{position:absolute;background:#fff;border-radius:16px;padding:14px 16px;box-shadow:0 8px 20px rgba(11,63,74,.1);width:180px;}' +
  '.node.hero{background:linear-gradient(160deg,#17c2d1,#0a5a68);color:#fff;top:210px;left:400px;width:200px;}' +
  '.node.hero .dday{font-size:26px;font-weight:800;color:#ff9d7f;}' +
  '.n1{top:60px;left:120px;} .n2{top:80px;left:660px;} .n3{top:380px;left:150px;} .n4{top:400px;left:640px;}' +
  '.node h4{font-size:11px;color:#9dbcc2;margin:0 0 4px;}' +
  '.node .t{font-size:13px;}' +
  'svg.link{position:absolute;inset:0;}',
  '<div class="nav">🌊 onda' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="canvas"><svg class="link" width="1000" height="560"><line x1="480" y1="260" x2="200" y2="100" stroke="#d3e7e8" stroke-width="2"/><line x1="560" y1="260" x2="740" y2="120" stroke="#d3e7e8" stroke-width="2"/><line x1="480" y1="300" x2="220" y2="400" stroke="#d3e7e8" stroke-width="2"/><line x1="580" y1="300" x2="720" y2="420" stroke="#d3e7e8" stroke-width="2"/></svg>' +
    '<div class="node hero">'+NAMES+'<div class="dday">'+DDAY+'</div></div>' +
    '<div class="node n1"><h4>일정</h4><div class="t">'+EVENTS[0].t+'<br>'+EVENTS[0].d+'</div></div>' +
    '<div class="node n2"><h4>일정</h4><div class="t">'+EVENTS[1].t+'<br>'+EVENTS[1].d+'</div></div>' +
    '<div class="node n3"><h4>기록</h4><div class="t">'+RECORDS[0].who+': '+RECORDS[0].t.slice(0,16)+'…</div></div>' +
    '<div class="node n4"><h4>기록</h4><div class="t">'+RECORDS[1].who+': '+RECORDS[1].t.slice(0,16)+'…</div></div>' +
  '</div>'
);

// ---- 29: Accordion Stack (all sections on one scroll) ----
add("아코디언 스택", "5개 섹션을 한 페이지에 펼침 카드로 누적", 760, 1150,
  'body{background:#fff;color:#0b2f3a;}' +
  '.wrap{max-width:600px;margin:0 auto;padding:24px 20px;}' +
  '.brand{font-weight:700;margin-bottom:16px;}' +
  '.sec{border:1px solid #d3e7e8;border-radius:14px;margin-bottom:10px;overflow:hidden;}' +
  '.sec .head{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;font-weight:700;font-size:14px;background:#f7fbfb;}' +
  '.sec.open .head{background:#0ea5b7;color:#fff;}' +
  '.sec .body{padding:16px 18px;}' +
  '.dday{font-size:34px;font-weight:800;color:#0ea5b7;}' +
  '.row{font-size:13px;padding:7px 0;border-bottom:1px solid #eef2f2;display:flex;justify-content:space-between;}',
  '<div class="wrap"><div class="brand">🌊 onda</div>' +
    '<div class="sec open"><div class="head">'+icon('홈',16)+' 홈 ⌄</div><div class="body">'+NAMES+'<div class="dday">'+DDAY+'</div>'+ANNI+'</div></div>' +
    '<div class="sec open"><div class="head">'+icon('캘린더',16)+' 다가오는 일정 ⌄</div><div class="body">' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div></div>' +
    '<div class="sec open"><div class="head">'+icon('기록',16)+' 최근 기록 ⌄</div><div class="body">' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,20)+'…</span></div>';}).join('') + '</div></div>' +
    '<div class="sec"><div class="head">'+icon('버킷',16)+' 버킷 & 데이트 ›</div></div>' +
    '<div class="sec"><div class="head">'+icon('질문',16)+' 오늘의 질문 ›</div></div>' +
  '</div>'
);

// ---- 30: Poster / Print Editorial ----
add("포스터 에디토리얼", "비대칭 그리드 + 극단적 스케일 대비", 900, 700,
  'body{background:#0b2f3a;color:#fff;}' +
  '.nav{display:flex;justify-content:space-between;padding:20px 30px;font-size:11px;letter-spacing:.08em;color:#7fa3aa;text-transform:uppercase;}' +
  '.nav .on{color:#fff;}' +
  '.hero{padding:10px 30px 40px;}' +
  '.hero .dday{font-size:120px;font-weight:800;letter-spacing:-.04em;line-height:.9;color:#0ea5b7;}' +
  '.hero .names{font-size:16px;color:#7fa3aa;margin-top:10px;}' +
  '.grid{display:grid;grid-template-columns:2fr 1fr;gap:1px;background:#163947;margin:0 30px 30px;}' +
  '.cell{background:#0b2f3a;padding:18px;}' +
  'h3{font-size:10px;letter-spacing:.1em;color:#5c7d85;text-transform:uppercase;margin:0 0 10px;}' +
  '.row{font-size:14px;padding:8px 0;border-bottom:1px solid #163947;display:flex;justify-content:space-between;}',
  '<div class="nav"><span>ONDA</span><span>' + NAV.map(function(n){return '<span style="margin-left:16px;" class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</span></div>' +
  '<div class="hero"><div class="dday">'+DDAY+'</div><div class="names">'+NAMES+' · '+ANNI+'</div></div>' +
  '<div class="grid"><div class="cell"><h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
  '<div class="cell"><h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row" style="display:block;">'+r.who+'<br><span style="color:#7fa3aa;">'+r.t.slice(0,14)+'…</span></div>';}).join('') + '</div></div>'
);

// ---- 31: Retro Terminal ----
add("레트로 터미널", "모노스페이스 + 박스 드로잉, 장난스럽지 않게 절제", 880, 680,
  'body{background:#0c1410;color:#8fe8c8;font-family:ui-monospace,Menlo,Consolas,monospace;}' +
  '.win{margin:20px;border:1px solid #1f3b30;border-radius:8px;overflow:hidden;}' +
  '.bar{background:#132420;padding:8px 14px;font-size:12px;color:#5c9a82;display:flex;justify-content:space-between;}' +
  '.body{padding:20px;}' +
  '.dday{font-size:34px;color:#8fe8c8;}' +
  '.prompt{color:#5c9a82;}' +
  '.nav{margin-bottom:16px;}' +
  '.nav span{margin-right:16px;color:#3d6b58;}' +
  '.nav .on{color:#8fe8c8;}' +
  '.row{font-size:13px;padding:5px 0;color:#c9f3e2;}' +
  '.row .d{color:#5c9a82;}',
  '<div class="win"><div class="bar"><span>onda — home@dullog:~</span><span>● ● ●</span></div><div class="body">' +
    '<div class="nav">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">['+n+']</span>';}).join('') + '</div>' +
    '<div class="prompt">$ whoami</div><div>'+NAMES+'</div>' +
    '<div class="prompt" style="margin-top:8px;">$ dday --since '+ANNI.split(' ')[0]+'</div><div class="dday">'+DDAY+'</div>' +
    '<div class="prompt" style="margin-top:16px;">$ ls ./events</div>' + EVENTS.map(function(e){return '<div class="row"><span class="d">'+e.d+'</span>  '+e.t+'</div>';}).join('') +
    '<div class="prompt" style="margin-top:12px;">$ tail ./records.log</div>' + RECORDS.map(function(r){return '<div class="row"><span class="d">'+r.d+'</span>  '+r.who+': '+r.t+'</div>';}).join('') +
  '</div></div>'
);

// ---- 32: Soft Neumorphism ----
add("소프트 뉴모피즘", "엠보스/디보스 음영의 촉감 있는 표면", 900, 640,
  'body{background:#e6eef0;color:#3a4a4d;}' +
  '.nav{display:flex;gap:14px;padding:20px 26px;}' +
  '.nav span{padding:9px 16px;border-radius:12px;font-size:13px;font-weight:700;color:#6b7d80;box-shadow:4px 4px 8px #cbd6d8,-4px -4px 8px #ffffff;}' +
  '.nav .on{color:#0a8494;box-shadow:inset 3px 3px 6px #cbd6d8,inset -3px -3px 6px #ffffff;}' +
  '.wrap{padding:6px 26px 26px;}' +
  '.hero{border-radius:24px;padding:24px;margin-bottom:20px;box-shadow:8px 8px 16px #c7d2d4,-8px -8px 16px #ffffff;text-align:center;}' +
  '.hero .dday{font-size:42px;font-weight:800;color:#0ea5b7;margin:6px 0;}' +
  '.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;}' +
  '.card{border-radius:18px;padding:16px;box-shadow:6px 6px 12px #c7d2d4,-6px -6px 12px #ffffff;}' +
  '.card h3{font-size:12px;color:#6b7d80;margin:0 0 10px;}' +
  '.row{font-size:13px;padding:8px 10px;border-radius:10px;margin-bottom:6px;box-shadow:inset 2px 2px 4px #c7d2d4,inset -2px -2px 4px #ffffff;display:flex;justify-content:space-between;}',
  '<div class="nav">' + NAV.map(function(n){return '<span class="'+(n==="홈"?"on":"")+'">'+n+'</span>';}).join('') + '</div>' +
  '<div class="wrap"><div class="hero">'+NAMES+'<div class="dday">'+DDAY+'</div>'+ANNI+'</div>' +
  '<div class="cols"><div class="card"><h3>다가오는 일정</h3>' + EVENTS.map(function(e){return '<div class="row"><span>'+e.t+'</span><b>'+e.d+'</b></div>';}).join('') + '</div>' +
  '<div class="card"><h3>최근 기록</h3>' + RECORDS.map(function(r){return '<div class="row"><span>'+r.who+' · '+r.t.slice(0,12)+'…</span></div>';}).join('') + '</div></div></div>'
);

// @@INSERT@@

/* ---------------- render ---------------- */
var out = [];
out.push('<!doctype html><html lang="ko"><head><meta charset="utf-8">');
out.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
out.push('<title>onda layout exploration</title>');
out.push('<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">');
out.push('<style>');
out.push('*{box-sizing:border-box;} html,body{margin:0;padding:0;}');
out.push('body{background:#1a1d1f; color:#e7e9ea; font-family:"Pretendard Variable","Pretendard",sans-serif; padding:40px 0 120px;}');
out.push('.gallery-head{max-width:980px; margin:0 auto 56px; padding:0 24px;}');
out.push('.gallery-head h1{font-size:28px; margin:0 0 8px;}');
out.push('.gallery-head p{color:#9aa2a6; font-size:14px; line-height:1.6; max-width:640px;}');
out.push('.concept-wrap{margin:0 auto 88px; max-width:calc(100vw - 48px);}');
out.push('.concept-cap{max-width:980px; margin:0 auto 14px; padding:0 24px; display:flex; align-items:baseline; gap:10px;}');
out.push('.concept-cap .n{font-family:ui-monospace,Menlo,monospace; font-size:13px; color:#5fd0c9; flex:none;}');
out.push('.concept-cap h2{font-size:17px; margin:0; color:#f2f4f5;}');
out.push('.concept-cap .tag{font-size:13px; color:#9aa2a6;}');
out.push('.frame{margin:0 auto; box-shadow:0 20px 60px rgba(0,0,0,.5); border-radius:8px; overflow:hidden; border:none; display:block;}');
out.push('</style></head><body>');
out.push('<div class="gallery-head"><h1>onda — 홈 화면 레이아웃 탐색 (' + concepts.length + '개 안)</h1>');
out.push('<p>색상/테마는 지금 쓰는 웨이브 톤 하나로 고정하고, 배치·타이포·카드 구조·네비게이션 방식만 다르게 구성했어요. 각 안은 완전히 독립된 문서(iframe)라 스타일이 서로 안 섞여요.</p></div>');

function escAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

concepts.forEach(function (c) {
  var doc = '<!doctype html><html><head><meta charset="utf-8">' +
    '<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">' +
    '<style>*{box-sizing:border-box;}html,body{margin:0;padding:0;}body{font-family:"Pretendard Variable","Pretendard",sans-serif;}svg{display:block;}' +
    c.css + '</style></head><body>' + c.html + '</body></html>';
  out.push('<div class="concept-cap" id="' + c.id + '"><span class="n">' + c.id + '</span><h2>' + c.title + '</h2><span class="tag">' + c.tagline + '</span></div>');
  out.push('<div class="concept-wrap">');
  out.push('<iframe class="frame" style="width:' + c.width + 'px; max-width:100%; height:' + c.height + 'px;" srcdoc="' + escAttr(doc) + '"></iframe>');
  out.push('</div>');
});

out.push('</body></html>');
console.log(out.join("\n"));

module.exports = { add: add, icon: icon, NAV: NAV, NAMES: NAMES, DDAY: DDAY, ANNI: ANNI, EVENTS: EVENTS, RECORDS: RECORDS, STATS: STATS, QUESTION: QUESTION };
