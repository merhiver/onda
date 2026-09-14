"use strict";

/* ---------- identity ---------- */
/* Real Supabase Auth now — no more self-declared ?u=a/?u=b. ME/PARTNER
   are only ever set after a signed-in session resolves to a row in the
   "members" table (see afterAuth() near the bottom). */
var ME = null, PARTNER = null;
var sb = null; // raw supabase client — needed for auth.* calls before dbApi exists

/* ---------- layout preview (temporary, ?preview=sidebar|stats|grid|photo) ---------- */
/* Lets the wide-screen "what should fill the empty space" options be
   compared live via URL, without touching the shipped default layout. */
var PREVIEW_MODE = new URLSearchParams(location.search).get('preview') || null;

/* ---------- layout variant (?layout=c01|c02|c06|c07|c19) ---------- */
/* Same app, same data, same functions — only nav/hero/card chrome is
   restyled per variant (desktop widths only; mobile is unaffected). */
var LAYOUT_MODE = new URLSearchParams(location.search).get('layout') || null;
if(LAYOUT_MODE) document.documentElement.setAttribute('data-layout', LAYOUT_MODE);

/* ---------- app theme (per-browser, picked from Settings > 테마) ---------- */
function getAppTheme(){
  try{ return localStorage.getItem('onda_theme') || 'wave'; }catch(e){ return 'wave'; }
}
function applyAppTheme(id){
  document.documentElement.setAttribute('data-app-theme', id);
}
applyAppTheme(getAppTheme());

/* ---------- state ---------- */
var state = {
  profile: null,           // {nameA, nameB, anniversary}
  events: [],
  entries: [],
  bucket: [],
  messages: [],
  answers: [],              // today's answers (<=2 docs)
  lastSeenTs: 0,
  bucketFilter: 'bucket',   // 'bucket' | 'date'
  calMonth: (function(){ var d=new Date(); d.setDate(1); return d; })(),
  selectedDay: null
};
var tab = 'home';
var dbApi = null;

/* ---------- helpers ---------- */
function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function pad2(n){ return n < 10 ? '0'+n : ''+n; }
function toDateStr(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
function todayStr(){ return toDateStr(new Date()); }
function parseDate(s){ var p = s.split('-').map(Number); return new Date(p[0], p[1]-1, p[2]); }
function startOfDay(d){ var x = new Date(d); x.setHours(0,0,0,0); return x; }
function dayOfYear(d){ var start = new Date(d.getFullYear(),0,0); return Math.floor((d - start) / 86400000); }
function fmtDate(s){ var d = parseDate(s); return (d.getMonth()+1)+'월 '+d.getDate()+'일'; }
function fmtDateTime(ms){
  var d = new Date(ms);
  return d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 '+pad2(d.getHours())+':'+pad2(d.getMinutes());
}
function fmtDow(s){ return ['일','월','화','수','목','금','토'][parseDate(s).getDay()]; }
var ROLE_EMOJI = { a: '🐰', b: '🐈‍⬛' }; // 토끼 / 검은 고양이 — used wherever a name isn't set yet
function roleEmoji(who){ return ROLE_EMOJI[who] || '?'; }
function nameOf(who){
  if(!state.profile) return roleEmoji(who);
  return who === 'a' ? (state.profile.nameA || roleEmoji('a')) : (state.profile.nameB || roleEmoji('b'));
}
function myName(){ return nameOf(ME); }
function partnerName(){ return nameOf(PARTNER); }

var QUESTIONS = [
  "요즘 나한테 제일 고마웠던 순간은?","우리가 처음 만난 날, 기억나는 장면 하나는?",
  "다음 여행 가고 싶은 곳은 어디야?","최근에 나 때문에 웃었던 일 있어?",
  "우리 둘이 같이 배워보고 싶은 게 있다면?","오늘 하루 중 제일 좋았던 순간은?",
  "지금 제일 먹고 싶은 음식은?","내가 요즘 잘하고 있다고 느끼는 거 하나만 말해줘",
  "같이 보고 싶은 영화나 드라마 있어?","우리만의 이상한 습관이나 밈이 있다면?",
  "10년 뒤 우리는 어떤 모습일까?","오늘 나한테 하고 싶었는데 못 한 말 있어?",
  "최근에 감동받았던 작은 일은?","같이 살면 꼭 가지고 싶은 가구/물건은?",
  "스트레스 받을 때 내가 어떻게 해주면 좋겠어?","우리 사이에서 제일 웃긴 추억은?",
  "요즘 나의 매력 포인트는 뭐라고 생각해?","같이 가보고 싶은 맛집 있어?",
  "이번 주말에 뭐 하고 싶어?","우리가 처음 사귀기로 한 날 기분 기억나?",
  "지금 나한테 궁금한 거 아무거나 물어봐줘","최근에 배운 것 중 재밌었던 거 있어?",
  "다음 기념일엔 뭐 하고 싶어?","같이 키우고 싶은 취미 있어?",
  "요즘 제일 듣기 좋았던 말은?","우리 둘의 좋은 점을 하나씩 말해보자",
  "최근에 힘들었던 일, 나한테 말해줄래?","이 계절에 제일 하고 싶은 데이트는?",
  "우리가 싸웠을 때 화해하는 우리만의 방법은?","지금 갖고 싶은 선물 있어?",
  "오늘 나를 웃게 한 게 있다면?","같이 도전해보고 싶은 목표가 있다면?",
  "요즘 제일 좋아하는 노래는?","나랑 있을 때 제일 편한 순간은 언제야?",
  "다음에 같이 찍고 싶은 사진 컨셉 있어?","우리 둘만 아는 비밀 하나 더 만들어볼까?",
  "오늘 저녁 메뉴 뭐 먹을까?","최근에 나한테 제일 놀랐던 순간은?",
  "우리 관계에서 제일 소중한 게 뭐라고 생각해?","작은 행복이라고 느꼈던 최근 순간은?"
];
function todayQuestion(){ return questionForDate(todayStr()); }
function questionForDate(dateStr){ return QUESTIONS[dayOfYear(parseDate(dateStr)) % QUESTIONS.length]; }

var WAVE_SVG = '<svg class="wave-deco" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">' +
  '<path d="M0 14 C 50 24 100 4 150 14 C 200 24 250 4 300 14 C 350 24 400 14 400 14 V24 H0 Z" fill="currentColor"/></svg>';

/* ---------- identity chooser (fallback) ---------- */
/* ---------- login / signup screen (full-screen, shown until authenticated) ---------- */
var authMode = 'signin'; // 'signin' | 'signup'
var authRole = null;     // 'a' | 'b', chosen during signup
var authError = '';
var authBusy = false;

/* Supabase Auth only speaks email, so a plain "아이디" is turned into a
   fake-but-valid-format email behind the scenes (never shown, never sent
   anything — Confirm email is off). Lowercased so IDs aren't case-sensitive. */
var AUTH_EMAIL_DOMAIN = '@onda.app';
var USERNAME_RE = /^[a-z0-9_]{3,20}$/i;
function usernameToEmail(u){ return u.trim().toLowerCase() + AUTH_EMAIL_DOMAIN; }

function renderAuthScreen(){
  var el = document.getElementById('authScreen');
  if(!el) return;
  // preserve whatever's already typed — pickAuthRole()/a failed validation
  // both re-render this screen, and silently wiping the fields the user
  // just typed into would be a real papercut, not just a test artifact
  var prevUser = (document.getElementById('authUser') || {}).value || '';
  var prevPw = (document.getElementById('authPw') || {}).value || '';
  el.hidden = false;
  var isSignup = authMode === 'signup';
  el.innerHTML =
    '<div class="auth-card">' +
      '<div class="auth-logo">🌊 onda</div>' +
      '<h2>' + (isSignup ? '처음 오셨네요' : '로그인') + '</h2>' +
      '<p class="sub">' + (isSignup ? '아이디와 비밀번호를 만들고, 둘 중 누구신지 골라주세요.' : '가입할 때 만든 아이디와 비밀번호로 로그인하세요.') + '</p>' +
      (authError ? '<div class="auth-err">' + esc(authError) + '</div>' : '') +
      '<div class="field"><label>아이디</label><input class="input" id="authUser" type="text" autocomplete="username" placeholder="영문/숫자/밑줄 3~20자"></div>' +
      '<div class="field"><label>비밀번호</label><input class="input" id="authPw" type="password" autocomplete="' + (isSignup ? 'new-password' : 'current-password') + '"></div>' +
      (isSignup ?
        '<div class="field"><label>둘 중 누구신가요?</label><div class="choose-btns">' +
          '<button type="button" class="' + (authRole==='a'?'active':'') + '" onclick="pickAuthRole(\'a\')">' + ROLE_EMOJI.a + '</button>' +
          '<button type="button" class="' + (authRole==='b'?'active':'') + '" onclick="pickAuthRole(\'b\')">' + ROLE_EMOJI.b + '</button>' +
        '</div></div>' : '') +
      '<button class="btn block" onclick="submitAuth()"' + (authBusy?' disabled':'') + '>' + (authBusy ? '처리 중…' : (isSignup ? '가입하기' : '로그인')) + '</button>' +
      '<button class="auth-switch" onclick="toggleAuthMode()">' + (isSignup ? '이미 계정이 있어요 — 로그인' : '처음이에요 — 가입할게요') + '</button>' +
    '</div>';
  document.getElementById('authUser').value = prevUser;
  document.getElementById('authPw').value = prevPw;
}
window.pickAuthRole = function(r){ authRole = r; renderAuthScreen(); };
window.toggleAuthMode = function(){
  authMode = authMode === 'signin' ? 'signup' : 'signin';
  authRole = null; authError = '';
  renderAuthScreen();
};
/* Supabase's own auth error text is always English — translate every
   known case, and fall back to a generic Korean message for anything
   else so raw English never reaches the screen. */
function translateAuthError(msg){
  msg = msg || '';
  if(/already registered/i.test(msg)) return '이미 있는 아이디예요. 로그인으로 시도해보세요.';
  if(/invalid login credentials/i.test(msg)) return '아이디 또는 비밀번호가 올바르지 않아요';
  if(/rate limit/i.test(msg)) return '요청이 너무 잦아요. 잠시 후 다시 시도해주세요.';
  if(/password.*(least|short|weak|character)/i.test(msg)) return '비밀번호가 너무 짧아요. 6자 이상으로 만들어주세요.';
  if(/network|fetch|failed to fetch/i.test(msg)) return '네트워크 연결을 확인해주세요';
  return '문제가 발생했어요. 잠시 후 다시 시도해주세요.';
}
window.submitAuth = function(){
  var username = document.getElementById('authUser').value.trim();
  var pw = document.getElementById('authPw').value;
  if(!username || !pw){ authError = '아이디와 비밀번호를 입력해주세요'; renderAuthScreen(); return; }
  if(!USERNAME_RE.test(username)){ authError = '아이디는 영문/숫자/밑줄 3~20자로 만들어주세요'; renderAuthScreen(); return; }
  if(authMode === 'signup' && !authRole){ authError = '둘 중 누구신지 골라주세요'; renderAuthScreen(); return; }
  authBusy = true; authError = ''; renderAuthScreen();
  var email = usernameToEmail(username);

  var flow = authMode === 'signup'
    ? sb.auth.signUp({ email: email, password: pw }).then(function(res){
        if(res.error) throw new Error(translateAuthError(res.error.message));
        if(!res.data.session){
          throw new Error('이메일 확인이 켜져 있어요. Supabase의 Authentication > Providers > Email에서 "Confirm email"을 꺼주세요.');
        }
        return sb.from('members').insert({ uid: res.data.user.id, role: authRole }).then(function(ins){
          if(ins.error) throw new Error('이미 등록된 자리예요. 로그인으로 시도해보세요.');
        });
      })
    : sb.auth.signInWithPassword({ email: email, password: pw }).then(function(res){
        if(res.error) throw new Error(translateAuthError(res.error.message));
      });

  flow.then(afterAuth).catch(function(e){
    authBusy = false;
    authError = (e && e.message) || '문제가 발생했어요';
    renderAuthScreen();
  });
};
function afterAuth(){
  return sb.auth.getSession().then(function(res){
    var uid = res.data && res.data.session && res.data.session.user && res.data.session.user.id;
    if(!uid){ authBusy = false; authError = '로그인에 실패했어요'; renderAuthScreen(); return; }
    return sb.from('members').select('role').eq('uid', uid).maybeSingle().then(function(m){
      if(m.error || !m.data){
        authBusy = false; authError = '계정 정보를 찾을 수 없어요'; renderAuthScreen(); return;
      }
      ME = m.data.role; PARTNER = ME === 'a' ? 'b' : 'a';
      document.getElementById('authScreen').hidden = true;
      boot();
    });
  });
}
window.logout = function(){
  closeOverlay();
  sb.auth.signOut();
};

/* ---------- settings / onboarding ---------- */
var settingsTab = 'info';
function openSettings(){
  document.getElementById('overlayRoot').innerHTML = renderSettingsSheet();
}
function renderSettingsSheet(){
  var tabsHtml = '<div class="seg" style="margin-bottom:16px;">' +
      '<button class="' + (settingsTab==='info'?'active':'') + '" onclick="switchSettingsTab(\'info\')">두 사람 정보</button>' +
      '<button class="' + (settingsTab==='theme'?'active':'') + '" onclick="switchSettingsTab(\'theme\')">테마</button>' +
    '</div>';
  var bodyHtml = settingsTab === 'theme' ? renderThemeTab() : renderInfoTab();
  return '<div class="overlay"><div class="sheet"><h2>설정</h2>' + tabsHtml + bodyHtml + '</div></div>';
}
window.switchSettingsTab = function(t){
  settingsTab = t;
  document.getElementById('overlayRoot').innerHTML = renderSettingsSheet();
};
function renderInfoTab(){
  var p = state.profile || {};
  return '<p class="sub">이름과 사귄 날짜를 설정하면 홈에 디데이가 표시돼요. 둘 중 누가 저장해도 서로에게 바로 반영돼요.</p>' +
    '<div class="field"><label>' + ROLE_EMOJI.a + ' 이름</label><input class="input" id="setA" value="'+esc(p.nameA||'')+'"></div>' +
    '<div class="field"><label>' + ROLE_EMOJI.b + ' 이름</label><input class="input" id="setB" value="'+esc(p.nameB||'')+'"></div>' +
    '<div class="field"><label>사귄 날짜</label><input class="input" id="setAnni" type="date" value="'+esc(p.anniversary||'')+'"></div>' +
    '<div class="row" style="margin-top:14px;">' +
      '<button class="btn secondary block" onclick="closeOverlay()">닫기</button>' +
      '<button class="btn block" onclick="saveProfile()">저장</button>' +
    '</div>' +
    '<button class="auth-switch" style="margin-top:18px;" onclick="logout()">로그아웃</button>';
}
var THEMES = [
  { id:'wave', name:'웨이브', desc:'청록 + 코랄 바다 톤, 둥근 곡선', swatch:['#0ea5b7','#ff7a59','#eef7f7'] },
  { id:'supabase', name:'미니멀', desc:'그린 포인트의 깔끔한 모노톤', swatch:['#3ecf8e','#171717','#fafafa'] },
  { id:'summer', name:'한여름', desc:'쨍한 햇살 노랑 + 깊은 바다색', swatch:['#ffb703','#023e8a','#fff8e8'] },
  { id:'winter', name:'한겨울', desc:'얼어붙은 바다, 차가운 빙하 블루', swatch:['#4f7ca8','#16283a','#f2f7fa'] },
  { id:'midnight', name:'심야', desc:'밤바다의 청록빛 야광, 항상 다크', swatch:['#2de6a8','#0a0a1a','#8886a8'] },
  { id:'storm', name:'폭풍', desc:'전기빛 보라 + 번개 라임', swatch:['#6c63ff','#c6d94a','#1f2430'] },
  { id:'coral-reef', name:'산호초', desc:'청록 산호 + 핫핑크', swatch:['#0fb894','#ff3d81','#eafbf6'] },
  { id:'sea-salt', name:'소금', desc:'말린 소금처럼 차분한 무채색', swatch:['#6f8c99','#b99b8d','#f6f4f0'] },
  { id:'high-tide', name:'밀물', desc:'짙은 바다초록 + 유목 갈색', swatch:['#147a6a','#c98a53','#f6ead9'] },
  { id:'yunseul', name:'윤슬', desc:'물 위에 반짝이는 금빛 햇살', swatch:['#f2b544','#1c5d8c','#fdf6e6'] }
];
function renderThemeTab(){
  var current = getAppTheme();
  return '<p class="sub">마음에 드는 테마를 골라보세요. 이 브라우저에만 적용돼요.</p>' +
    '<div class="stack">' +
    THEMES.map(function(o){
      var active = current === o.id;
      return '<button type="button" class="theme-opt' + (active?' active':'') + '" onclick="chooseTheme(\''+o.id+'\')">' +
        '<span class="theme-swatch">' + o.swatch.map(function(c){ return '<span style="background:'+c+'"></span>'; }).join('') + '</span>' +
        '<span class="theme-info"><span class="theme-name">' + esc(o.name) + '</span><span class="faint">' + esc(o.desc) + '</span></span>' +
        (active ? '<span class="theme-check">✓</span>' : '') +
      '</button>';
    }).join('') +
    '</div>' +
    '<button class="btn secondary block" style="margin-top:14px;" onclick="closeOverlay()">닫기</button>';
}
window.chooseTheme = function(id){
  try{ localStorage.setItem('onda_theme', id); }catch(e){}
  applyAppTheme(id);
  document.getElementById('overlayRoot').innerHTML = renderSettingsSheet();
};
function closeOverlay(){ document.getElementById('overlayRoot').innerHTML = ''; settingsTab = 'info'; }
window.closeOverlay = closeOverlay;
window.openSettings = openSettings;
window.saveProfile = function(){
  var nameA = document.getElementById('setA').value.trim() || ROLE_EMOJI.a;
  var nameB = document.getElementById('setB').value.trim() || ROLE_EMOJI.b;
  var anniversary = document.getElementById('setAnni').value || null;
  if(!dbApi) return;
  dbApi.doc('profile/profile').set({nameA:nameA, nameB:nameB, anniversary:anniversary}).then(closeOverlay);
};

/* ---------- tabs ---------- */
window.switchTab = function(t){
  tab = t;
  document.querySelectorAll('.panel').forEach(function(el){ el.classList.remove('active'); });
  document.getElementById('panel-'+t).classList.add('active');
  document.querySelectorAll('.navbtn').forEach(function(el){ el.classList.toggle('active', el.dataset.tab === t); });
  document.getElementById('topbarWord').textContent = ({
    home:'onda', calendar:'캘린더', record:'기록', bucket:'버킷 & 데이트', question:'오늘의 질문'
  })[t];
  renderAll();
};

/* ---------- chat widget (floating, independent of tabs) ---------- */
var chatOpen = false;
window.toggleChat = function(){ chatOpen ? closeChat() : openChat(); };
function openChat(){
  chatOpen = true;
  document.getElementById('chatPanel').hidden = false;
  if(dbApi && ME){
    state.lastSeenTs = Date.now();
    dbApi.doc('lastSeen/'+ME).set({ts: state.lastSeenTs});
    updateBadge();
  }
  renderChat();
}
window.closeChat = function(){
  chatOpen = false;
  document.getElementById('chatPanel').hidden = true;
};

/* ---------- badge ---------- */
function updateBadge(){
  var unread = state.messages.filter(function(m){ return m.author !== ME && m.createdAt > state.lastSeenTs; }).length;
  var chatDot = document.getElementById('chatDot');
  if(chatDot) chatDot.hidden = !(unread > 0);

  var partnerAnsweredToday = state.answers.some(function(a){ return a.author === PARTNER && a.date === todayStr(); });
  var iAnsweredToday = state.answers.some(function(a){ return a.author === ME && a.date === todayStr(); });
  var qDot = document.getElementById('questionDot');
  if(qDot) qDot.hidden = !(partnerAnsweredToday && !iAnsweredToday);
}

/* ---------- c06 nav subtitle (conversation-list "last message" line) ---------- */
function renderNavSub(){
  if(LAYOUT_MODE !== 'c06') return;
  var p = state.profile;
  var homeSub = '최근 소식 있음';
  if(p && p.anniversary){
    var days = Math.floor((startOfDay(new Date()) - startOfDay(parseDate(p.anniversary))) / 86400000) + 1;
    homeSub = '디데이 D+' + days;
  }
  var subs = {home:homeSub, calendar:'최근 소식 있음', record:'최근 소식 있음', bucket:'최근 소식 있음', question:'최근 소식 있음'};
  document.querySelectorAll('.navbtn').forEach(function(btn){
    btn.setAttribute('data-sub', subs[btn.dataset.tab] || '');
  });
}

/* ---------- render dispatch ---------- */
function renderAll(){
  renderHome();
  renderCalendar();
  renderRecord();
  renderBucket();
  renderQuestion();
  renderChat();
  renderSideWidget();
  renderNavSub();
  updateBadge();
}

/* ---------- layout preview widgets (see PREVIEW_MODE above) ---------- */
function computeStreak(){
  var dates = {};
  state.entries.forEach(function(e){ dates[e.date] = true; });
  var streak = 0, d = new Date();
  while(dates[toDateStr(d)]){ streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
function bucketCompletion(){
  if(!state.bucket.length) return '0%';
  var done = state.bucket.filter(function(b){ return b.done; }).length;
  return Math.round(done / state.bucket.length * 100) + '%';
}
function renderSideWidget(){
  var el = document.getElementById('sideWidget');
  var shell = document.getElementById('shell');
  if(!el || !shell) return;
  if(PREVIEW_MODE !== 'sidebar' && PREVIEW_MODE !== 'stats'){
    el.hidden = true;
    shell.classList.remove('has-side-widget');
    return;
  }
  shell.classList.add('has-side-widget');
  el.hidden = false;

  if(PREVIEW_MODE === 'sidebar'){
    var p = state.profile;
    var ddayText = (p && p.anniversary)
      ? ('D+' + (Math.floor((startOfDay(new Date()) - startOfDay(parseDate(p.anniversary))) / 86400000) + 1))
      : '디데이 미설정';
    var myAns = state.answers.find(function(a){ return a.author === ME && a.date === todayStr(); });
    var upcoming = state.events.filter(function(e){ return e.date >= todayStr(); }).sort(function(a,b){ return a.date < b.date ? -1 : 1; })[0];
    el.innerHTML =
      '<div class="card"><div class="widget-title">디데이</div><div style="font-family:var(--font-display); font-size:22px; color:var(--primary);">' + esc(ddayText) + '</div></div>' +
      '<div class="card"><div class="widget-title">오늘의 질문</div><div style="font-size:13px; margin:4px 0 8px; line-height:1.4;">' + esc(todayQuestion()) + '</div>' +
        (myAns ? '<div class="faint">답변 완료</div>' : '<div class="faint">아직 답변 전</div>') +
      '</div>' +
      '<div class="card"><div class="widget-title">다가오는 일정</div>' +
        (upcoming ? '<div style="font-size:13px; margin-top:4px;">' + esc(upcoming.title) + ' · ' + fmtDate(upcoming.date) + '</div>' : '<div class="faint">없음</div>') +
      '</div>';
  } else {
    el.innerHTML =
      '<div class="card"><div class="widget-title">커플 통계</div>' +
        '<div class="stat-row"><span>연속 기록</span><span class="stat-num tabular">' + computeStreak() + '일</span></div>' +
        '<div class="stat-row"><span>총 메시지</span><span class="stat-num tabular">' + state.messages.length + '개</span></div>' +
        '<div class="stat-row"><span>총 기록</span><span class="stat-num tabular">' + state.entries.length + '개</span></div>' +
        '<div class="stat-row"><span>버킷 완료</span><span class="stat-num tabular">' + bucketCompletion() + '</span></div>' +
      '</div>';
  }
}

/* ---------- HOME ---------- */
function renderHome(){
  var el = document.getElementById('panel-home');
  var p = state.profile;
  var ddayHtml;
  if(p && p.anniversary){
    var days = Math.floor((startOfDay(new Date()) - startOfDay(parseDate(p.anniversary))) / 86400000) + 1;
    ddayHtml = '<div class="dday tabular">D+' + days + '</div><div class="annidate">' + esc(p.anniversary) + ' 부터</div>';
  } else {
    ddayHtml = '<div class="dday" style="font-size:16px; color:var(--ink-muted);">사귄 날짜를 설정해보세요</div>';
  }
  var names = p ? (esc(p.nameA||ROLE_EMOJI.a) + '  ·  ' + esc(p.nameB||ROLE_EMOJI.b)) : '설정 전';

  var upcoming = state.events.filter(function(e){ return e.date >= todayStr(); }).sort(function(a,b){ return a.date < b.date ? -1 : 1; }).slice(0,3);
  var upcomingHtml = upcoming.length ? upcoming.map(function(e){
    return '<div class="mini-row"><span>' + esc(e.title) + ' <span class="faint">· ' + esc(nameOf(e.author)) + '</span></span><span class="faint tabular">' + fmtDate(e.date) + '(' + fmtDow(e.date) + ')</span></div>';
  }).join('') : '<div class="empty">다가오는 일정이 없어요</div>';

  var recentEntries = state.entries.slice(0, 10);
  var recentHtml = recentEntries.length
    ? '<div class="card">' + recentEntries.map(function(e){
        var snippet = e.text.length > 28 ? e.text.slice(0, 28) + '…' : e.text;
        return '<div class="mini-row"><span>' + esc(nameOf(e.author)) + ' <span class="faint">· ' + esc(snippet) + '</span></span><span class="faint tabular">' + fmtDate(e.date) + '</span></div>';
      }).join('') + '</div>'
    : '<div class="empty">아직 기록이 없어요. 기록 탭에서 첫 글을 남겨보세요</div>';

  var listsHtml =
    '<div class="section-title">다가오는 일정</div>' +
    '<div class="card">' + upcomingHtml + '</div>' +
    '<div class="section-title">최근 기록</div>' +
    recentHtml;
  if(PREVIEW_MODE === 'grid' || LAYOUT_MODE === 'c01'){
    listsHtml = '<div class="home-2col">' +
      '<div><div class="section-title">다가오는 일정</div><div class="card">' + upcomingHtml + '</div></div>' +
      '<div><div class="section-title">최근 기록</div>' + recentHtml + '</div>' +
    '</div>';
  }

  var heroHtml = '<div class="hero ocean-card"><div class="names">' + names + '</div>' + ddayHtml + '</div>';
  if(LAYOUT_MODE === 'c01'){
    heroHtml = '<div class="stat-tiles">' +
      '<div class="hero ocean-card stat-tile-hero"><div class="names">' + names + '</div>' + ddayHtml + '</div>' +
      '<div class="card stat-tile"><div class="widget-title">연속 기록</div><div class="stat-num tabular">' + computeStreak() + '일</div></div>' +
      '<div class="card stat-tile"><div class="widget-title">버킷 완료</div><div class="stat-num tabular">' + bucketCompletion() + '</div></div>' +
    '</div>';
  }

  el.innerHTML = heroHtml + WAVE_SVG + listsHtml;
}

/* ---------- CALENDAR ---------- */
function renderCalendar(){
  var el = document.getElementById('panel-calendar');
  var m = state.calMonth;
  var year = m.getFullYear(), month = m.getMonth();
  var firstDow = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month+1, 0).getDate();
  var todayS = todayStr();

  var annM = null, annD = null;
  if(state.profile && state.profile.anniversary){
    var ad = parseDate(state.profile.anniversary);
    annM = ad.getMonth(); annD = ad.getDate();
  }

  var cells = '';
  ['일','월','화','수','목','금','토'].forEach(function(d){ cells += '<div class="cal-dow">' + d + '</div>'; });
  for(var i=0;i<firstDow;i++) cells += '<div class="cal-day pad">.</div>';
  for(var d=1; d<=daysInMonth; d++){
    var ds = year+'-'+pad2(month+1)+'-'+pad2(d);
    var dayEventsForDot = state.events.filter(function(e){ return e.date === ds; });
    var isAnni = annM === month && annD === d;
    var cls = 'cal-day' + (ds===todayS?' today':'') + (ds===state.selectedDay?' selected':'');
    var dotsHtml = dayEventsForDot.length
      ? '<span class="dots">' + dayEventsForDot.slice(0,4).map(function(e){
          return '<span class="dot ' + (e.author === 'a' ? 'a' : 'b') + '"></span>';
        }).join('') + '</span>'
      : '';
    cells += '<button class="'+cls+'" onclick="selectDay(\''+ds+'\')">' +
      (isAnni ? '<span class="anni">🎂</span>' : '') + d +
      dotsHtml +
      '</button>';
  }

  var dayPanel = '';
  if(state.selectedDay){
    var dayEvents = state.events.filter(function(e){ return e.date === state.selectedDay; });
    dayPanel =
      '<div class="day-panel"><div class="section-title" style="margin-top:0;">' + fmtDate(state.selectedDay) + ' (' + fmtDow(state.selectedDay) + ')' + '</div>' +
      '<div class="card">' +
      (dayEvents.length ? dayEvents.map(function(e){
        return '<div class="event-item"><span>' + esc(e.title) + ' <span class="faint">· ' + esc(nameOf(e.author)) + '</span></span><button class="del" onclick="deleteEvent(\''+e.id+'\')" aria-label="삭제">✕</button></div>';
      }).join('') : '<div class="empty">이 날 일정이 없어요</div>') +
      '</div>' +
      '<div class="composer" style="margin-top:10px;">' +
        '<input class="input" id="newEventTitle" placeholder="일정 추가하기" onkeydown="if(event.key===\'Enter\')addEvent()">' +
        '<button class="btn" onclick="addEvent()">추가</button>' +
      '</div></div>';
  }

  el.innerHTML =
    '<div class="cal-head"><button class="navstep" onclick="stepMonth(-1)">‹</button>' +
    '<span class="ym">' + year + '년 ' + (month+1) + '월</span>' +
    '<button class="navstep" onclick="stepMonth(1)">›</button></div>' +
    '<div class="cal-grid">' + cells + '</div>' + dayPanel;
}
window.stepMonth = function(delta){
  state.calMonth = new Date(state.calMonth.getFullYear(), state.calMonth.getMonth()+delta, 1);
  renderCalendar();
};
window.selectDay = function(ds){
  state.selectedDay = (state.selectedDay === ds) ? null : ds;
  renderCalendar();
};
window.addEvent = function(){
  var input = document.getElementById('newEventTitle');
  var title = input.value.trim();
  if(!title || !dbApi || !state.selectedDay) return;
  dbApi.collection('events').add({date: state.selectedDay, title: title, author: ME, createdAt: Date.now()});
  input.value = '';
};
window.deleteEvent = function(id){
  if(!dbApi) return;
  dbApi.collection('events').doc(id).delete();
};

/* ---------- RECORD (기록) ---------- */
function renderRecord(){
  var el = document.getElementById('panel-record');
  var list = state.entries.length ? state.entries.map(function(e){
    var canDelete = e.author === ME;
    return '<div class="entry"><div class="meta">' +
      '<span class="pill" style="background:var(--sky-bg); color:var(--sky);">' + esc(nameOf(e.author)) + '</span>' +
      '<span class="faint tabular">' + fmtDateTime(e.createdAt) + '</span>' +
      (canDelete ? '<button class="del" style="margin-left:auto;" onclick="deleteEntry(\''+e.id+'\')">✕</button>' : '') +
      '</div><div class="txt">' + esc(e.text) + '</div></div>';
  }).join('') : '<div class="empty">아직 기록이 없어요. 오늘 있었던 일을 남겨보세요</div>';

  var photoMockup = PREVIEW_MODE === 'photo'
    ? '<div class="row" style="gap:8px;">' +
        '<button type="button" class="btn secondary" disabled>📷 사진 추가</button>' +
        '<span class="faint">미리보기 — 실제 저장은 아직 연결 안 됐어요</span>' +
      '</div>'
    : '';

  el.innerHTML =
    '<div class="card stack">' +
      '<textarea class="input" id="newEntryText" rows="3" placeholder="오늘 하루, 짧게 남겨보세요"></textarea>' +
      photoMockup +
      '<button class="btn block" onclick="addEntry()">기록하기</button>' +
    '</div>' +
    '<div class="section-title">타임라인</div>' + list;
}
window.addEntry = function(){
  var ta = document.getElementById('newEntryText');
  var text = ta.value.trim();
  if(!text || !dbApi) return;
  dbApi.collection('entries').add({date: todayStr(), text: text, author: ME, createdAt: Date.now()});
  ta.value = '';
};
window.deleteEntry = function(id){
  if(!dbApi) return;
  dbApi.collection('entries').doc(id).delete();
};

/* ---------- BUCKET & DATE COURSE ---------- */
function renderBucket(){
  var el = document.getElementById('panel-bucket');
  var items = state.bucket.filter(function(b){ return b.kind === state.bucketFilter; });
  var listHtml = items.length ? items.map(function(b){
    return '<div class="bucket-item">' +
      '<button class="check' + (b.done?' done':'') + '" onclick="toggleBucket(\''+b.id+'\',' + b.done + ')" aria-label="완료 표시">' + (b.done?'✓':'') + '</button>' +
      '<span class="txt' + (b.done?' done':'') + '">' + esc(b.text) + (b.done && b.doneDate ? ' <span class="faint">(' + fmtDate(b.doneDate) + ' 완료)</span>' : '') +
      '</span>' +
      '<button class="del" onclick="deleteBucket(\''+b.id+'\')">✕</button>' +
    '</div>';
  }).join('') : '<div class="empty">' + (state.bucketFilter==='bucket' ? '아직 버킷리스트가 없어요' : '아직 저장한 데이트 코스가 없어요') + '</div>';

  var isDate = state.bucketFilter === 'date';
  var addBar = isDate
    ? '<div class="stack" style="margin-bottom:16px;">' +
        '<div class="composer">' +
          '<input class="input" id="newBucketText" placeholder="장소 이름으로 검색 (예: 한강공원)" onkeydown="if(event.key===\'Enter\'){event.preventDefault();searchPlace();}">' +
          '<button type="button" class="btn secondary" onclick="searchPlace()">검색</button>' +
        '</div>' +
        '<div id="placeResults"></div>' +
        '<button class="btn block" onclick="addBucket()">추가</button>' +
        '<div id="dateMap"></div>' +
      '</div>'
    : '<div class="composer" style="margin-bottom:16px;">' +
        '<input class="input" id="newBucketText" placeholder="같이 하고 싶은 일 추가" onkeydown="if(event.key===\'Enter\')addBucket()">' +
        '<button class="btn" onclick="addBucket()">추가</button>' +
      '</div>';

  el.innerHTML =
    '<div class="seg">' +
      '<button class="' + (state.bucketFilter==='bucket'?'active':'') + '" onclick="setBucketFilter(\'bucket\')">버킷리스트</button>' +
      '<button class="' + (state.bucketFilter==='date'?'active':'') + '" onclick="setBucketFilter(\'date\')">데이트 코스</button>' +
    '</div>' +
    addBar +
    '<div class="card">' + listHtml + '</div>';

  if(isDate) renderDateMap();
}
window.setBucketFilter = function(k){ selectedPlace = null; state.bucketFilter = k; renderBucket(); };

function renderDateMap(){
  var container = document.getElementById('dateMap');
  if(!container) return;
  var places = state.bucket
    .filter(function(b){ return b.kind === 'date' && b.mapUrl; })
    .map(function(b){
      var p = parseKakaoMapUrl(b.mapUrl);
      return p ? { lat: p.lat, lng: p.lng, text: b.text } : null;
    })
    .filter(Boolean);

  if(!kakaoReady || !window.kakao || !kakao.maps){
    container.innerHTML = '<div class="empty">지도를 불러오는 중이에요</div>';
    return;
  }
  if(!places.length){
    container.innerHTML = '<div class="empty">장소를 검색해서 추가하면 여기 지도에 핀으로 표시돼요</div>';
    return;
  }
  container.innerHTML = '';
  var center = new kakao.maps.LatLng(places[0].lat, places[0].lng);
  var map = new kakao.maps.Map(container, { center: center, level: 6 });
  var bounds = new kakao.maps.LatLngBounds();
  places.forEach(function(p){
    var pos = new kakao.maps.LatLng(p.lat, p.lng);
    var marker = new kakao.maps.Marker({ position: pos, map: map });
    bounds.extend(pos);
    var iw = new kakao.maps.InfoWindow({ content: '<div style="padding:5px 10px; font-size:12px; white-space:nowrap;">' + esc(p.text) + '</div>' });
    kakao.maps.event.addListener(marker, 'click', function(){ iw.open(map, marker); });
  });
  map.relayout();
  if(places.length > 1) map.setBounds(bounds);
  else map.setCenter(center);
}

/* Kakao Places keyword search (real autocomplete, replaces the old "open new tab" flow) */
var kakaoReady = false;
var selectedPlace = null;
var lastPlaceResults = [];
function initKakao(){
  if(window.kakao && window.kakao.maps && window.kakao.maps.load){
    kakao.maps.load(function(){ kakaoReady = true; });
  }
}
window.searchPlace = function(){
  var input = document.getElementById('newBucketText');
  var box = document.getElementById('placeResults');
  var q = input ? input.value.trim() : '';
  if(!box) return;
  selectedPlace = null;
  if(!q){ box.innerHTML = ''; return; }
  if(!kakaoReady){
    box.innerHTML = '<div class="faint">지도 검색을 불러오는 중이에요. 잠시 후 다시 시도해주세요.</div>';
    return;
  }
  var places = new kakao.maps.services.Places();
  places.keywordSearch(q, function(results, status){
    if(status !== kakao.maps.services.Status.OK || !results.length){
      box.innerHTML = '<div class="faint">검색 결과가 없어요.</div>';
      return;
    }
    lastPlaceResults = results.slice(0, 5);
    box.innerHTML = lastPlaceResults.map(function(r, i){
      return '<button type="button" class="place-result" onclick="selectPlace(' + i + ')">' +
        '<div class="pr-name">' + esc(r.place_name) + '</div>' +
        '<div class="pr-addr faint">' + esc(r.road_address_name || r.address_name) + '</div>' +
      '</button>';
    }).join('');
  });
};
window.selectPlace = function(i){
  var r = lastPlaceResults[i];
  if(!r) return;
  selectedPlace = { name: r.place_name, address: (r.road_address_name || r.address_name), lat: r.y, lng: r.x };
  var input = document.getElementById('newBucketText');
  if(input) input.value = r.place_name;
  var box = document.getElementById('placeResults');
  if(box) box.innerHTML = '<div class="faint">선택됨 · ' + esc(selectedPlace.address) + '</div>';
};
window.addBucket = function(){
  var input = document.getElementById('newBucketText');
  var text = input.value.trim();
  if(!text || !dbApi) return;
  var data = {kind: state.bucketFilter, text: text, done:false, doneDate:null, author: ME, createdAt: Date.now()};
  if(state.bucketFilter === 'date' && selectedPlace && selectedPlace.name === text){
    data.mapUrl = 'https://map.kakao.com/link/map/' + encodeURIComponent(selectedPlace.name) + ',' + selectedPlace.lat + ',' + selectedPlace.lng;
  }
  dbApi.collection('bucket').add(data);
  input.value = '';
  selectedPlace = null;
  var box = document.getElementById('placeResults');
  if(box) box.innerHTML = '';
};
function parseKakaoMapUrl(url){
  try{
    var m = /\/link\/map\/(.+)$/.exec(url);
    if(!m) return null;
    var parts = decodeURIComponent(m[1]).split(',');
    if(parts.length < 3) return null;
    var lng = parseFloat(parts[parts.length - 1]);
    var lat = parseFloat(parts[parts.length - 2]);
    var name = parts.slice(0, parts.length - 2).join(',');
    if(isNaN(lat) || isNaN(lng)) return null;
    return { name: name, lat: lat, lng: lng };
  }catch(e){ return null; }
}
window.toggleBucket = function(id, wasDone){
  if(!dbApi) return;
  dbApi.collection('bucket').doc(id).update({done: !wasDone, doneDate: !wasDone ? todayStr() : null});
};
window.deleteBucket = function(id){
  if(!dbApi) return;
  dbApi.collection('bucket').doc(id).delete();
};

/* ---------- QUESTION OF THE DAY (tab content, + past days' Q&A) ---------- */
var editingAnswerDate = null; // date currently showing my own answer as an editable textarea

function myAnswerBoxHtml(dateStr, myAns){
  if(editingAnswerDate === dateStr){
    return '<div class="composer"><textarea class="input" id="ans-input-' + dateStr + '" rows="2">' + (myAns ? esc(myAns.text) : '') + '</textarea>' +
      '<button class="btn" onclick="saveAnswer(\'' + dateStr + '\')">저장</button>' +
      '<button class="btn secondary" onclick="cancelEditAnswer()">취소</button></div>';
  }
  if(myAns){
    return '<div class="ans-box"><div class="who">' + esc(myName()) + '</div><div class="ans-txt">' + esc(myAns.text) + '</div>' +
      '<div class="row" style="gap:8px; margin-top:8px;">' +
        '<button class="btn secondary" onclick="startEditAnswer(\'' + dateStr + '\')">수정</button>' +
        '<button class="btn secondary" onclick="deleteAnswer(\'' + dateStr + '\')">삭제</button>' +
      '</div></div>';
  }
  return '<div class="composer"><textarea class="input" id="ans-input-' + dateStr + '" rows="2" placeholder="' + (dateStr === todayStr() ? '오늘 질문에 답해보세요' : '이 질문에 답해보세요') + '"></textarea>' +
    '<button class="btn" onclick="saveAnswer(\'' + dateStr + '\')">답변</button></div>';
}
function partnerAnswerBoxHtml(partnerAns){
  return partnerAns
    ? '<div class="ans-box"><div class="who">' + esc(partnerName()) + '</div><div class="ans-txt">' + esc(partnerAns.text) + '</div></div>'
    : '<div class="ans-box"><div class="who">' + esc(partnerName()) + '</div><div class="ans-txt faint">아직 답변 전이에요</div></div>';
}

function renderQuestion(){
  var el = document.getElementById('panel-question');
  if(!el) return;
  var today = todayStr();
  var myAns = state.answers.find(function(a){ return a.author === ME && a.date === today; });
  var partnerAns = state.answers.find(function(a){ return a.author === PARTNER && a.date === today; });

  var todayHtml =
    '<div class="q-card ocean-card">' +
      '<div class="q-label">오늘의 질문</div>' +
      '<div class="q-text">' + esc(todayQuestion()) + '</div>' +
      '<div class="ans-grid">' + myAnswerBoxHtml(today, myAns) + partnerAnswerBoxHtml(partnerAns) + '</div>' +
    '</div>' +
    WAVE_SVG;

  var pastDates = [];
  state.answers.forEach(function(a){
    if(a.date !== today && pastDates.indexOf(a.date) === -1) pastDates.push(a.date);
  });
  pastDates.sort(function(a,b){ return a < b ? 1 : -1; });

  var historyHtml = '';
  if(pastDates.length){
    historyHtml = '<div class="section-title">지난 질문</div>' + pastDates.map(function(d){
      var mine = state.answers.find(function(a){ return a.author === ME && a.date === d; });
      var theirs = state.answers.find(function(a){ return a.author === PARTNER && a.date === d; });
      return '<div class="q-card ocean-card" style="margin-bottom:14px;">' +
        '<div class="q-label">' + esc(fmtDate(d)) + '</div>' +
        '<div class="q-text" style="font-size:16px;">' + esc(questionForDate(d)) + '</div>' +
        '<div class="ans-grid">' + myAnswerBoxHtml(d, mine) + partnerAnswerBoxHtml(theirs) + '</div>' +
      '</div>';
    }).join('');
  }

  el.innerHTML = todayHtml + historyHtml;
}
window.startEditAnswer = function(dateStr){
  editingAnswerDate = dateStr;
  renderQuestion();
};
window.cancelEditAnswer = function(){
  editingAnswerDate = null;
  renderQuestion();
};
window.saveAnswer = function(dateStr){
  dateStr = dateStr || todayStr();
  var ta = document.getElementById('ans-input-' + dateStr);
  var text = ta.value.trim();
  if(!text || !dbApi) return;
  dbApi.doc('answers/' + dateStr + '_' + ME).set({date: dateStr, author: ME, text: text, createdAt: Date.now()});
  editingAnswerDate = null;
};
window.deleteAnswer = function(dateStr){
  if(!dbApi) return;
  dbApi.doc('answers/' + dateStr + '_' + ME).delete();
};

/* ---------- MESSAGES (floating chat widget, global) ---------- */
function renderChat(){
  var panel = document.getElementById('chatPanel');
  if(!panel || panel.hidden) return;
  var msgsHtml = state.messages.length ? state.messages.slice().reverse().map(function(m){
    var mine = m.author === ME;
    return '<div class="msg ' + (mine?'me':'partner') + '">' + esc(m.text) +
      (mine ? '<button class="del" onclick="deleteMessage(\''+m.id+'\')" aria-label="삭제">✕</button>' : '') +
      '</div>';
  }).join('') : '<div class="empty">아직 남긴 메시지가 없어요</div>';

  panel.innerHTML =
    '<div class="chat-head"><span>' + esc(partnerName()) + '에게 쪽지</span><button class="del" onclick="closeChat()" aria-label="닫기">✕</button></div>' +
    '<div class="chat-body">' + msgsHtml + '</div>' +
    '<div class="composer chat-composer">' +
      '<textarea class="input" id="newMessage" rows="1" placeholder="' + esc(partnerName()) + '에게 쪽지 남기기"></textarea>' +
      '<button class="btn" onclick="sendMessage()">전송</button>' +
    '</div>';
  var body = panel.querySelector('.chat-body');
  if(body) body.scrollTop = body.scrollHeight;
}
window.sendMessage = function(){
  var ta = document.getElementById('newMessage');
  var text = ta.value.trim();
  if(!text || !dbApi) return;
  dbApi.collection('messages').add({text: text, author: ME, createdAt: Date.now()});
  ta.value = '';
};
window.deleteMessage = function(id){
  if(!dbApi) return;
  dbApi.collection('messages').doc(id).delete();
};

/* ---------- boot ---------- */
function subscribe(){
  dbApi.doc('profile/profile').onSnapshot(function(snap){
    state.profile = snap.exists ? snap.data() : null;
    if(!state.profile) openOnboardingIfNeeded();
    renderAll();
  });
  dbApi.collection('events').orderBy('date','asc').limit(300).onSnapshot(function(qs){
    state.events = qs.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
    renderAll();
  });
  dbApi.collection('entries').orderBy('createdAt','desc').limit(300).onSnapshot(function(qs){
    state.entries = qs.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
    renderAll();
  });
  dbApi.collection('bucket').orderBy('createdAt','desc').limit(300).onSnapshot(function(qs){
    state.bucket = qs.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
    renderAll();
  });
  dbApi.collection('messages').orderBy('createdAt','desc').limit(300).onSnapshot(function(qs){
    state.messages = qs.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
    renderAll();
  });
  dbApi.collection('answers').orderBy('date','desc').limit(200).onSnapshot(function(qs){
    state.answers = qs.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
    renderAll();
  });
  dbApi.doc('lastSeen/' + ME).get().then(function(snap){
    state.lastSeenTs = snap.exists ? (snap.data().ts || 0) : 0;
    updateBadge();
  });
}
var onboardingShown = false;
function openOnboardingIfNeeded(){
  if(onboardingShown) return;
  onboardingShown = true;
  openSettings();
}

function boot(){
  document.getElementById('overlayRoot').innerHTML = '';
  if(PREVIEW_MODE === 'grid'){
    var mainEl = document.querySelector('main');
    if(mainEl) mainEl.classList.add('wide');
  }
  switchTab('home');
  initKakao();
  dbApi = window.createDocStore(sb);
  subscribe();
}

/* ---------- init: resolve or show the login screen ---------- */
(function initAuth(){
  var cfg = window.ONDA_CONFIG || {};
  if(!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf('YOUR-PROJECT') !== -1){
    document.getElementById('authScreen').innerHTML = '<div class="auth-card">config.js에 Supabase 프로젝트 URL/anon key를 아직 입력하지 않았어요.</div>';
    return;
  }
  sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  sb.auth.onAuthStateChange(function(event){
    if(event === 'SIGNED_OUT'){
      ME = null; PARTNER = null; dbApi = null;
      authMode = 'signin'; authRole = null; authError = ''; authBusy = false;
      document.getElementById('authScreen').hidden = false;
      renderAuthScreen();
    }
  });
  sb.auth.getSession().then(function(res){
    if(res.data && res.data.session){
      afterAuth();
    } else {
      renderAuthScreen();
    }
  });
})();
