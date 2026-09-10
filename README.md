# onda

둘이서 쓰는 캘린더 / 기록 / 버킷리스트 / 데이트 코스 / 메시지 & 오늘의 질문 웹앱.
순수 HTML/CSS/JS, 빌드 도구 없음. 데이터는 Supabase(Postgres + Realtime)에 저장되고,
접속한 두 사람의 화면이 실시간으로 동기화됩니다.

## 1. Supabase 프로젝트 만들기 (새 계정)

1. https://supabase.com 에서 새 프로젝트 생성 (원하는 새 계정으로)
2. 프로젝트가 생성되면 **SQL Editor**에서 [schema.sql](schema.sql) 내용을 그대로 실행
   → 테이블 7개(profile, events, entries, bucket, messages, answers, lastSeen) + RLS + Realtime이 한 번에 세팅됩니다
3. **Project Settings → API**에서 `Project URL`과 `anon public` 키를 복사
4. [config.js](config.js) 파일을 열어 두 값을 붙여넣기:
   ```js
   window.ONDA_CONFIG = {
     SUPABASE_URL: "https://xxxxx.supabase.co",
     SUPABASE_ANON_KEY: "eyJhbGciOi..."
   };
   ```

## 2. 로컬에서 확인

빌드 없이 정적 파일이라, 아무 정적 서버로 열면 됩니다. 예:
```
npx serve .
```
또는 VS Code의 Live Server 확장.

## 3. 개인 식별 링크

로그인 없이 `?u=a` / `?u=b` 쿼리로 "누가 나인지" 구분합니다. 배포 후:
- `https://<도메인>/?u=a` → 한 사람에게
- `https://<도메인>/?u=b` → 다른 사람에게

한 번 열면 브라우저에 기억되어 다음부턴 그냥 열어도 됩니다.

## 4. 배포 (GitHub → Vercel)

```
git init   # 이미 되어 있음
git remote add origin https://github.com/<계정>/<repo>.git
git add .
git commit -m "onda: initial import"
git push -u origin main
```
그 다음 https://vercel.com 에서 이 GitHub 저장소를 import하면 끝 (빌드 설정 불필요, 정적 사이트).

## 5. 카카오맵 / 네이버맵 장소 자동완성 (선택, 나중에)

지금은 "카카오맵/네이버맵에서 찾기" 버튼이 새 탭에서 검색 결과를 열어주고,
거기서 찾은 장소의 링크를 붙여넣는 방식으로 동작합니다 (API 키 없이 바로 됨).

실시간 자동완성 검색까지 원하면:
1. [Kakao Developers](https://developers.kakao.com)에서 앱 생성 → JavaScript 키 발급 → **플랫폼에 배포 도메인 등록** (Vercel 도메인)
2. `index.html`에 `<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KEY&libraries=services"></script>` 추가
3. `app.js`의 `openMapSearch`를 `kakao.maps.services.Places`로 교체해서 자동완성 UI로 업그레이드
   (이 부분은 실제 배포된 도메인 + 키가 있어야 제대로 테스트되니, 준비되면 요청해 주세요)

## 6. 푸시 알림 (선택, 나중에)

Vercel의 서버리스 함수(`api/` 폴더) + `web-push` 패키지로 추가 가능합니다.
지금은 앱을 열었을 때 메시지 탭에 안읽음 뱃지로 대체되어 있습니다.

## 데이터 구조

`schema.sql` 참고. 각 테이블의 `author` 컬럼은 `'a'` / `'b'`로, 위 2번의 식별 링크와 대응됩니다.
