"use strict";

/* ---------- identity ---------- */
var ME = null, PARTNER = null;
(function resolveIdentity(){
  var params = new URLSearchParams(location.search);
  var u = params.get('u');
  if(u === 'a' || u === 'b'){
    try{ localStorage.setItem('onda_me', u); }catch(e){}
    ME = u;
  } else {
    try{ ME = localStorage.getItem('onda_me'); }catch(e){ ME = null; }
  }
  if(ME !== 'a' && ME !== 'b') ME = null;
  PARTNER = ME === 'a' ? 'b' : (ME === 'b' ? 'a' : null);
})();

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
function nameOf(who){
  if(!state.profile) return who === 'a' ? '1번' : '2번';
  return who === 'a' ? (state.profile.nameA || '1번') : (state.profile.nameB || '2번');
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
function todayQuestion(){ return QUESTIONS[dayOfYear(new Date()) % QUESTIONS.length]; }

/* ---------- identity chooser (fallback) ---------- */
function renderChooser(){
  document.getElementById('overlayRoot').innerHTML =
    '<div class="overlay"><div class="sheet">' +
      '<h2>처음 오셨네요</h2>' +
      '<p class="sub">둘 중 누구신가요? 한 번 고르면 이 브라우저에서는 계속 기억해요. 다음부턴 서로 받은 개인 링크로 바로 들어오면 더 편해요.</p>' +
      '<div class="choose-btns">' +
        '<button onclick="chooseIdentity(\'a\')">1번 (나)</button>' +
        '<button onclick="chooseIdentity(\'b\')">2번 (나)</button>' +
      '</div>' +
    '</div></div>';
}
window.chooseIdentity = function(who){
  ME = who; PARTNER = who === 'a' ? 'b' : 'a';
  try{ localStorage.setItem('onda_me', who); }catch(e){}
  document.getElementById('overlayRoot').innerHTML = '';
  boot();
};

/* ---------- settings / onboarding ---------- */
function openSettings(){
  var p = state.profile || {};
  document.getElementById('overlayRoot').innerHTML =
    '<div class="overlay"><div class="sheet">' +
      '<h2>두 사람 정보</h2>' +
      '<p class="sub">이름과 사귄 날짜를 설정하면 홈에 디데이가 표시돼요. 둘 중 누가 저장해도 서로에게 바로 반영돼요.</p>' +
      '<div class="field"><label>1번 이름</label><input class="input" id="setA" value="'+esc(p.nameA||'')+'"></div>' +
      '<div class="field"><label>2번 이름</label><input class="input" id="setB" value="'+esc(p.nameB||'')+'"></div>' +
      '<div class="field"><label>사귄 날짜</label><input class="input" id="setAnni" type="date" value="'+esc(p.anniversary||'')+'"></div>' +
      '<div class="row" style="margin-top:14px;">' +
        '<button class="btn secondary block" onclick="closeOverlay()">닫기</button>' +
        '<button class="btn block" onclick="saveProfile()">저장</button>' +
      '</div>' +
    '</div></div>';
}
function closeOverlay(){ document.getElementById('overlayRoot').innerHTML = ''; }
window.closeOverlay = closeOverlay;
window.openSettings = openSettings;
window.saveProfile = function(){
  var nameA = document.getElementById('setA').value.trim() || '1번';
  var nameB = document.getElementById('setB').value.trim() || '2번';
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
    home:'onda', calendar:'캘린더', record:'기록', bucket:'버킷 & 데이트', messages:'메시지 & 질문'
  })[t];
  if(t === 'messages' && dbApi && ME){
    state.lastSeenTs = Date.now();
    dbApi.doc('lastSeen/'+ME).set({ts: state.lastSeenTs});
    updateBadge();
  }
  renderAll();
};

/* ---------- badge ---------- */
function updateBadge(){
  var unread = state.messages.filter(function(m){ return m.author !== ME && m.createdAt > state.lastSeenTs; }).length;
  var partnerAnsweredToday = state.answers.some(function(a){ return a.author === PARTNER && a.date === todayStr(); });
  var iAnsweredToday = state.answers.some(function(a){ return a.author === ME && a.date === todayStr(); });
  var show = unread > 0 || (partnerAnsweredToday && !iAnsweredToday);
  document.getElementById('msgDot').hidden = !show;
}

/* ---------- render dispatch ---------- */
function renderAll(){
  renderHome();
  renderCalendar();
  renderRecord();
  renderBucket();
  renderMessages();
  updateBadge();
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
  var names = p ? (esc(p.nameA||'1번') + '  ·  ' + esc(p.nameB||'2번')) : '설정 전';

  var upcoming = state.events.filter(function(e){ return e.date >= todayStr(); }).sort(function(a,b){ return a.date < b.date ? -1 : 1; }).slice(0,3);
  var upcomingHtml = upcoming.length ? upcoming.map(function(e){
    return '<div class="mini-row"><span>' + esc(e.title) + ' <span class="faint">· ' + esc(nameOf(e.author)) + '</span></span><span class="faint tabular">' + fmtDate(e.date) + '(' + fmtDow(e.date) + ')</span></div>';
  }).join('') : '<div class="empty">다가오는 일정이 없어요</div>';

  var recent = state.entries[0];
  var recentHtml = recent
    ? '<div class="card"><div class="row" style="justify-content:space-between; margin-bottom:6px;"><span class="pill" style="background:var(--sky-bg); color:var(--sky);">' + esc(nameOf(recent.author)) + '</span><span class="faint tabular">' + fmtDate(recent.date) + '</span></div><div style="font-size:14px; line-height:1.5;">' + esc(recent.text).slice(0,120) + '</div></div>'
    : '<div class="empty">아직 기록이 없어요. 기록 탭에서 첫 글을 남겨보세요</div>';

  el.innerHTML =
    '<div class="hero"><div class="names">' + names + '</div>' + ddayHtml + '</div>' +
    '<div class="section-title">다가오는 일정</div>' +
    '<div class="card">' + upcomingHtml + '</div>' +
    '<div class="section-title">최근 기록</div>' +
    recentHtml;
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

  el.innerHTML =
    '<div class="card stack">' +
      '<textarea class="input" id="newEntryText" rows="3" placeholder="오늘 하루, 짧게 남겨보세요"></textarea>' +
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

/* ---------- MESSAGES + QUESTION ---------- */
function renderMessages(){
  var el = document.getElementById('panel-messages');
  var q = todayQuestion();
  var myAns = state.answers.find(function(a){ return a.author === ME && a.date === todayStr(); });
  var partnerAns = state.answers.find(function(a){ return a.author === PARTNER && a.date === todayStr(); });

  var myAnsHtml = myAns
    ? '<div class="ans-box"><div class="who">' + esc(myName()) + '</div><div class="ans-txt">' + esc(myAns.text) + '</div></div>'
    : '<div class="composer"><textarea class="input" id="newAnswer" rows="2" placeholder="오늘 질문에 답해보세요"></textarea><button class="btn" onclick="saveAnswer()">답변</button></div>';
  var partnerAnsHtml = partnerAns
    ? '<div class="ans-box"><div class="who">' + esc(partnerName()) + '</div><div class="ans-txt">' + esc(partnerAns.text) + '</div></div>'
    : '<div class="ans-box"><div class="who">' + esc(partnerName()) + '</div><div class="ans-txt faint">아직 답변 전이에요</div></div>';

  var msgsHtml = state.messages.length ? state.messages.slice().reverse().map(function(m){
    var mine = m.author === ME;
    return '<div class="msg ' + (mine?'me':'partner') + '">' + esc(m.text) +
      (mine ? '<button class="del" onclick="deleteMessage(\''+m.id+'\')" aria-label="삭제">✕</button>' : '') +
      '</div>';
  }).join('') : '<div class="empty">아직 남긴 메시지가 없어요</div>';

  el.innerHTML =
    '<div class="q-card">' +
      '<div class="q-label">오늘의 질문</div>' +
      '<div class="q-text">' + esc(q) + '</div>' +
      '<div class="ans-grid">' + myAnsHtml + partnerAnsHtml + '</div>' +
    '</div>' +
    '<div class="section-title">메시지</div>' +
    '<div style="display:flex; flex-direction:column;">' + msgsHtml + '</div>' +
    '<div class="composer" style="margin-top:12px;">' +
      '<textarea class="input" id="newMessage" rows="1" placeholder="' + esc(partnerName()) + '에게 쪽지 남기기"></textarea>' +
      '<button class="btn" onclick="sendMessage()">전송</button>' +
    '</div>';
}
window.saveAnswer = function(){
  var ta = document.getElementById('newAnswer');
  var text = ta.value.trim();
  if(!text || !dbApi) return;
  dbApi.doc('answers/' + todayStr() + '_' + ME).set({date: todayStr(), author: ME, text: text, createdAt: Date.now()});
};
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
  dbApi.collection('answers').where('date','==', todayStr()).limit(2).onSnapshot(function(qs){
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

async function boot(){
  if(!ME){ renderChooser(); return; }
  document.getElementById('overlayRoot').innerHTML = '';
  switchTab('home');
  initKakao();
  try{
    var cfg = window.ONDA_CONFIG || {};
    if(!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf('YOUR-PROJECT') !== -1){
      dbApi = null;
    } else {
      var client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      dbApi = window.createDocStore(client);
    }
  }catch(e){ dbApi = null; }
  if(!dbApi){
    document.getElementById('panel-home').innerHTML = '<div class="empty">config.js에 Supabase 프로젝트 URL/anon key를 아직 입력하지 않았어요.</div>';
    return;
  }
  subscribe();
}
boot();
