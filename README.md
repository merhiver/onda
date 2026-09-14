# onda

둘이서(혹은 여러 커플이 각자) 쓰는 캘린더 / 기록 / 버킷리스트 / 데이트 코스 / 메시지 &
오늘의 질문 웹앱. 순수 HTML/CSS/JS, 빌드 도구 없음. 데이터는 Supabase(Postgres +
Realtime + Auth)에 저장되고, 같은 커플끼리 실시간으로 동기화됩니다.

> 프로젝트 구조, 설계 결정, 지켜야 할 규칙, 지금까지 잡은 버그들은
> [CLAUDE.md](CLAUDE.md)에 훨씬 자세히 정리되어 있습니다 — 코드 건드리기 전에
> 먼저 읽어보세요.

## 1. Supabase 프로젝트 만들기 (새 프로젝트인 경우)

1. https://supabase.com 에서 새 프로젝트 생성
2. **SQL Editor**에서 [schema.sql](schema.sql) 내용을 그대로 실행
   → couples/members/profile 등 테이블 전체 + RLS + Realtime이 한 번에 세팅됩니다
3. **Authentication → Providers → Email → "Confirm email"(또는 최신 UI에서는
   "Confirm sign up")을 꺼주세요** — 안 끄면 가입 후 바로 로그인되지 않습니다
4. **Project Settings → API**에서 `Project URL`과 `anon public` 키를 복사해
   [config.js](config.js)에 붙여넣기

이미 있는(예전 버전으로 만든) 프로젝트를 업그레이드하는 거라면 `schema.sql`
대신 [migrate-to-auth.sql](migrate-to-auth.sql) → [migrate-to-couples.sql](migrate-to-couples.sql)을
순서대로 실행하세요 (둘 다 델타이고, `migrate-to-couples.sql`은 실행 시 기존
데이터를 초기화합니다 — CLAUDE.md §3, §8 참고).

## 2. 로컬에서 확인

빌드 없이 정적 파일이라, 아무 정적 서버로 열면 됩니다:
```
npx serve .
```

## 3. 로그인 / 커플 매칭

로그인 없는 `?u=a`/`?u=b` 방식은 더 이상 안 씁니다 — 실제 Supabase Auth로
아이디/비밀번호를 만들어 로그인합니다. 처음 가입할 때:
- 한 명이 **"커플 만들기"** → 6자리 초대 코드 발급
- 상대방이 **"코드로 참여하기"** → 그 코드 입력

이렇게 매칭된 두 계정만 서로의 데이터를 보고 씁니다 (RLS로 강제). 다른
커플이 같은 배포본을 써도 서로의 데이터는 안 섞입니다.

## 4. 배포 (GitHub Pages)

```
git remote add origin https://github.com/<계정>/<repo>.git
git push -u origin master
```
그다음 저장소 **Settings → Pages → Source: Deploy from a branch →
master / (root)** 로 켜면 끝 (빌드 불필요, 정적 사이트).

anon key가 공개 저장소에 같이 올라가는 건 의도된 것입니다 — RLS가 "가입된
커플 멤버만" 접근 가능하도록 잠겨 있어서 안전합니다 (CLAUDE.md §8).

## 5. 카카오맵 장소 검색

`index.html`의 Kakao Maps SDK `<script>` 태그에 키가 이미 박혀 있고,
`app.js`가 `kakao.maps.services.Places`로 실시간 검색 + 여러 장소를 한
지도에 핀으로 표시합니다. **배포 도메인마다** Kakao Developers 콘솔의
플랫폼 → Web 사이트 도메인에 등록해야 지도가 동작합니다 (예: localhost,
GitHub Pages 도메인, 커스텀 도메인은 각각 따로 등록).

## 6. 푸시 알림

아직 없습니다. 지금은 메시지 탭에 안읽음 뱃지로 대체되어 있습니다.

## 데이터 구조

[schema.sql](schema.sql) 참고. 모든 테이블에 `coupleId`가 있어서 커플별로
데이터가 분리됩니다. 각 테이블의 `author` 컬럼은 `'a'`(🐰) / `'b'`(🐈‍⬛)로,
그 커플의 `members` 테이블에 등록된 역할과 대응됩니다.
