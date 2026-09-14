# onda — project reference

This file is written so a **new Claude session, with zero prior context, can
rebuild or correctly extend this app** without re-deriving decisions that
were already made (and in several cases, corrected after a mistake) over a
very long build session. If you're that new session: read this whole file
before touching code. It is organized so the "what/why", the standing rules,
and the "don't repeat this bug" list are easy to find separately.

## 1. What onda is

A shared web app for a couple (또는 여러 커플, see §6) — calendar, daily
journal entries, a bucket list with real map search, a floating chat widget,
and a rotating "question of the day" with history. Korean UI throughout.
Vanilla HTML/CSS/JS, **no build step, no framework**. Backed by Supabase
(Postgres + Realtime + Auth). The name is 파도/onda (wave), and the whole
visual language is "ocean/water" themed.

## 2. Stack & file map

- `index.html` — the only HTML file. `<div id="authScreen">` (full-screen
  login gate) + `<div id="shell">` (the actual app, empty until boot()) +
  chat widget + settings overlay root. Loads: Supabase JS UMD, Kakao Maps
  SDK, `config.js`, `db-adapter.js`, `app.js`, in that order.
- `app.js` — the entire app. No modules, everything is global functions/vars
  (loaded as a plain `<script>`, not `type="module"`, so top-level
  `function` declarations are implicitly `window.*`).
- `style.css` — everything visual: base layout, 10 selectable color themes,
  5 selectable layout variants, dark-mode handling.
- `db-adapter.js` — a hand-written Firestore-shaped wrapper around the
  Supabase JS client (`db.doc(path).get/set/update/delete/onSnapshot`,
  `db.collection(x).where/orderBy/limit/add/doc`). This exists because the
  app started life as a Claude Artifact prototype using a Firestore-shaped
  `db` capability, and porting to Supabase was done by keeping app.js's
  calling convention identical and writing an adapter, instead of rewriting
  every call site. **Any new backend call in app.js should go through this
  same `dbApi.doc()/dbApi.collection()` interface**, not raw `sb.from()`
  (the auth-specific code in app.js is the one exception — it uses `sb`
  directly for `sb.auth.*` and a few one-off `sb.from('members')` /
  `sb.from('couples')` calls that need finer control than the adapter gives).
- `config.js` — `window.ONDA_CONFIG = {SUPABASE_URL, SUPABASE_ANON_KEY}`.
  The anon key is meant to be public (client-side, access controlled by
  RLS) — safe to commit, safe to expose in a public repo, **as long as RLS
  is actually locked down** (see §5).
- `schema.sql` — canonical schema for a **brand new** Supabase project.
- `migrate-to-auth.sql`, `migrate-to-couples.sql` — deltas that were
  actually run against the real, already-existing project, in that order.
  Don't re-run `schema.sql` against a project that already ran these — it
  will error trying to (re)create policies that already exist (harmless:
  Supabase's SQL editor runs a pasted script as one transaction, so the
  failure rolled back with zero effect — but don't do it anyway).
- `scripts/gen-themes.js`, `scripts/gen-layout-gallery.js`,
  `scripts/recolor-winter.js` — **historical scaffolding, now stale.**
  These generated the *first draft* of the theme CSS and the 32-concept
  design gallery. Everything they produced was then hand-edited directly
  in `style.css` many times over (bug fixes, specificity fixes, fidelity
  fixes against the gallery). **`style.css` is the source of truth now —
  do not regenerate from these scripts, they will blow away real fixes.**
  `design-exploration.html` / `design-exploration-winter.html` are the
  gallery's own output, published as standalone Claude Artifacts for
  sharing — not part of the live app, purely a design reference.
- `README.md` — **currently stale** (describes the old `?u=a/?u=b` scheme,
  the pre-auth 7-table schema, and Vercel deployment). Needs a rewrite to
  match this file; hasn't been done yet as of this writing.

## 3. Identity, auth, and the multi-couple model

This went through two major redesigns — know the *current* end state:

**Current state**: real Supabase Auth (email+password under the hood, but
the UI only ever asks for a plain "아이디" — see below), gating a
full-screen login/signup flow, on top of a **multi-couple** data model
(any number of couples can share one Supabase project, matched via a
6-character invite code).

- **Username, not email**: Supabase Auth only speaks email. The UI asks for
  an "아이디" (`[a-z0-9_]{3,20}`, case-insensitive) and `usernameToEmail()`
  silently appends a fixed `@onda.app` suffix to build a real-format email
  Supabase will accept. Never surfaced to the user, no mail is ever sent
  there (Confirm-email is off — see below). This exact suffix was chosen
  because Supabase rejects RFC 2606 reserved domains (`example.com`,
  `.invalid`, etc.) for signup — verified live, not assumed.
- **Two-step signup**: step 1 is just username/password
  (`submitAuth()` → `sb.auth.signUp()`). Step 2, after a session exists, is
  `renderCoupleSetupScreen()`: pick "커플 만들기" (create — generates a
  random 6-char code via `genCoupleCode()`, inserts a `couples` row, shows
  the code on a reveal screen) or "코드로 참여하기" (join — looks up
  `couples` by code), then pick a role (🐰 = 'a' / 🐈‍⬛ = 'b' — see §4 for
  why emoji, not "1번/2번"), then `sb.from('members').insert({uid, coupleId,
  role})`. The DB's `unique(coupleId, role)` constraint plus a `with check`
  clause on the insert policy is what actually enforces "exactly 2 accounts
  per couple, self-serve, no admin step."
- **Recovery for interrupted signups**: if `signUp()` succeeds but a later
  step fails (rate limit, closed the tab, table didn't exist yet mid-
  migration), the account exists in `auth.users` with no `members` row.
  `afterAuth()` detects "signed in, but no members row" and routes to the
  *same* `renderCoupleSetupScreen()` instead of dead-ending — this is not
  an edge case you can skip, it's the actual thing that happened during
  real testing and needed a real fix, twice.
- **MY_COUPLE_ID**: set once after login/signup resolves (`afterAuth()` /
  `submitCoupleSetup()` / `finishCodeReveal()`). Every write to a
  couple-scoped table must include `coupleId: MY_COUPLE_ID`. Reads need no
  client-side filtering — RLS does it transparently (`using ("coupleId" =
  (select "coupleId" from members where uid = auth.uid()))` on every
  couple-scoped table). The `members` table itself is deliberately **not**
  couple-scoped for SELECT (any signed-in user can read it) — join-by-code
  has to check whether a *different* couple's role slot is free before you
  have a `members` row of your own to scope a restrictive policy by.
- **Doc-id schemes that had to become couple-scoped**: `profile`'s row id
  *is* the couple's own uuid (was the fixed string `'profile'`);
  `lastSeen` id is `{coupleId}_{a|b}` (was just `'a'`/`'b'`); `answers` id
  is `{coupleId}_{date}_{author}` (was `{date}_{author}`) — all three used
  to assume "there's only one couple in the whole app."
- **Supabase project setting required**: Authentication → Providers →
  Email → **"Confirm email" must be OFF** (current UI may show this as
  "Confirm sign up" under Authentication → Emails → Templates →
  Authentication section). Without it, `signUp()` doesn't return an active
  session immediately and the whole "sign up → set up couple → land in
  app, one flow" design breaks.
- **Logout**: `window.logout()`, called from the settings sheet's 두 사람
  정보 tab (bottom of `renderInfoTab()`).
- **Error messages**: every Supabase auth/db error is routed through
  `translateAuthError()` (auth errors) or explicit Korean strings — **raw
  English from Supabase must never reach the screen.** This was a real bug
  found from a user screenshot ("email rate limit exceeded" leaking
  through) — if you add a new Supabase call in the auth flow, translate its
  error too, don't assume the existing patterns cover it.
- **`isMissingTable(err)`**: checks for Postgres error code `PGRST205` /
  "could not find the table" — used everywhere in the auth flow to show
  "DB 설정이 아직 안 끝났어요..." instead of a misleading "already taken"
  message when a migration hasn't been run yet. This distinction mattered
  in practice: a missing-table error and a real conflict look identical to
  the user otherwise, and produced a genuinely confusing dead end before
  it was fixed (see §7).

## 4. Design system — rules that must never be silently reintroduced

These were **explicit, repeated instructions from the user**, each one
enforced only after being caught violating it once:

1. **No color gradients, anywhere.** Not in themes, not in layout variants,
   not even a `radial-gradient` used as a decorative soft-glow. (A dot-grid
   background texture built from `radial-gradient(color 1px, transparent
   1px)` — i.e. a repeating hard-edged pattern, not a color blend — was
   judged acceptable and kept for the c06 "chat shell" layout; if in doubt,
   flat colors only.) The live app's hero card (`.ocean-card`) still uses a
   gradient in its *undecorated* base form — that predates the no-gradient
   rule and was never explicitly flagged, but the 5 layout variants each
   override it to a flat color (see §5's specificity note for *why* that
   override needed a `:root[data-layout=…]` selector, not a plain
   `[data-layout=…]` one).
2. **One typeface everywhere: Pretendard.** No per-theme font changes, no
   "playful" fonts like 궁서체/Jua — Jua was added early and explicitly
   removed later for violating this.
3. **Theme color combos must relate to onda/water thematically**, no two
   themes may share a palette, summer + winter themes are required, **no**
   spring/autumn themes. Current 10: wave (default), supabase (minimal
   mono+green), summer, winter, midnight, storm, coral-reef, sea-salt,
   high-tide, yunseul — see `THEMES` array in app.js for exact hex swatches
   and `[data-app-theme="…"]` blocks in style.css for the full rule sets
   (each theme also defines its own `.hero`/`.q-card` colors — **some are
   light-card+dark-text, not all dark+white** — "supabase" specifically is
   light. Never assume every theme is dark-with-white-text.).
4. **No real brand names in sample/demo content.** 스벅(Starbucks) was
   caught and replaced with 투썸(Twosome Place) mid-session.
5. **Role labels are 🐰 (rabbit, role 'a') and 🐈‍⬛ (black cat, role 'b')**,
   never "1번"/"2번" — this was a direct correction; all 5 places that used
   to hardcode "1번"/"2번" fallback text now read from one `ROLE_EMOJI`
   map (`nameOf()`'s fallback, the couple-setup role picker, both name-
   field labels in settings, the home hero's name fallback) specifically
   so they can't drift out of sync again.
6. **Login is a full-screen takeover, not an overlay** — `#authScreen` is
   `position:fixed; inset:0; z-index:100`, and boot() only ever runs after
   it's hidden. This was an explicit requirement ("완전한 화면 전환"), not
   an implementation detail left to discretion.

## 5. Layout variant system (the "레이아웃" picker)

**History, so you don't rebuild concepts that were deliberately cut**: 32
structurally distinct home-screen concepts were explored and reviewed in a
standalone gallery (`scripts/gen-layout-gallery.js` → published as a
shareable Artifact), narrowed to 9 chosen ones (c01, c02, c06, c07, c11,
c15, c19, c20, c23), ported into the live app as `?layout=cXX` CSS/JS
variants — then, over several later rounds, the user explicitly cut c11
and c20, then separately cut c15 and c23. **Current final set is 5: c01
(사이드바 대시보드), c02 (에디토리얼 탑탭), c06 (채팅앱 셸), c07
(저널/일기장), c19 (센터드 노 사이드바).** Do not resurrect c11/c15/c20/c23
— their CSS/JS was deliberately deleted, not just hidden.

- **Selection**: originally URL-only (`?layout=cXX`), later promoted to a
  real Settings tab ("레이아웃", third tab alongside 두 사람 정보/테마),
  persisted to `localStorage.onda_layout`, applied live via
  `applyAppLayout()` + `document.documentElement.setAttribute('data-
  layout', id)`. `?layout=cXX` in the URL still works as a one-off preview
  for that single page load without overwriting the saved choice.
- **Two kinds of CSS for each variant**: (a) an *unconditional* block
  (color/shape signature: flat hero color, dday text treatment, palette)
  that applies at every viewport width, including mobile — added
  specifically because the user pointed out every layout looked identical
  on a phone; (b) a `@media (min-width:880px)` block (nav repositioning,
  spacing) that's desktop-only on purpose — mobile always keeps the
  standard bottom nav dock regardless of which layout is picked.
- **This is not purely a CSS system** — c01 and c06 generate *different
  markup*, not just different styling (`renderHome()` branches on
  `LAYOUT_MODE === 'c01'` to build a `.stat-tiles` grid instead of the
  plain hero; `renderNavSub()` only runs `if(LAYOUT_MODE === 'c06')` to set
  each navbtn's `data-sub` attribute for the conversation-list subtitle
  line). This is *why* `chooseLayout()` in Settings has to call
  `renderAll()`, not just flip the CSS attribute the way `chooseTheme()`
  can get away with.
- **Fidelity discipline**: several rounds of this session were the user
  directly comparing a live layout screenshot against the gallery
  reference and finding real mismatches — nav on the wrong side (c01/c06
  defaulted to the right because `#nav` comes after `<main>` in the DOM
  and nothing overrode `order`), a two-tone seam in c11 (topbar and hero
  used two different CSS vars that happened to differ), c06's nav reading
  as generic icon buttons instead of an actual conversation list (letter
  avatars + subtitle line). **If asked to fix a layout to "match the
  design," actually re-derive it from `scripts/gen-layout-gallery.js`'s
  source (the `add(...)` call for that concept) and compare a real
  screenshot against a rendered reference, don't eyeball it.**
- **CSS specificity gotcha specific to this codebase**: a
  `[data-layout="c01"] .hero{...}` rule and a `[data-app-theme="winter"]
  .hero{...}` rule have *identical* specificity (attribute + class) — this
  means whichever is declared later in the file wins, which silently broke
  layout-specific colors on any non-default theme until every such rule
  was bumped to `:root[data-layout="c01"] .hero{...}` (root pseudo-class
  adds one specificity point, guaranteeing the layout rule wins regardless
  of file order or which theme is active). **Any new layout-scoped
  override of something a theme also styles must use the `:root[data-
  layout=…]` form, not the plain attribute form**, or it will silently
  lose to whatever theme happens to be active — this exact bug shipped
  once and was only caught from a user screenshot showing illegible text.
- **Related, separate bug class**: don't assume a CSS variable used as a
  background is "always dark enough for white overlay text" — `var(--
  primary-active)` is picked per-theme as an *interactive accent* color,
  not guaranteed dark, and using it that way broke text contrast on at
  least one theme. Prefer reusing a component the *theme itself* already
  styles correctly (`.hero`/`.q-card`, which every theme defines with a
  matched background+text-color pair) over introducing a new guessed-color
  surface. Where that's not possible (`c23`'s `#heroBlock`, a plain div
  with no theme-aware styling of its own — since removed along with c23,
  but the lesson generalizes), the only correct fix was enumerating every
  theme's actual color explicitly, not guessing one variable.

## 6. Feature list (what actually works, per tab)

- **홈**: dday counter, upcoming events (next 3), recent entries (up to
  10). Layout-variant-dependent chrome (stat tiles / giant typography /
  chat bubble / paper journal / centered card).
- **캘린더**: month grid, multi-dot per day by author, tap a day to see/add
  events for it, anniversary marker.
- **기록**: free-text daily journal entries, timeline view, delete own
  entries.
- **버킷**: two sub-tabs — plain bucket list items, and a "데이트 코스"
  list with **real Kakao Places search** (`kakao.maps.services.Places`,
  JS key in `index.html`'s SDK `<script src>`, domain must be registered
  per-deployment-target in Kakao Developers — localhost and the GitHub
  Pages domain both had to be registered separately, a custom domain would
  need its own registration too) and an in-page multi-pin
  `kakao.maps.Map`/`Marker`/`InfoWindow` showing every added place at
  once (deliberately not "one map per item" — the user specifically asked
  for one shared map with all pins).
- **질문**: rotating question-of-the-day (`QUESTIONS` array, picked via
  `dayOfYear(date) % QUESTIONS.length`, so the same question always falls
  on the same day-of-year). **My own answer is editable and deletable**
  (not just write-once — this was a direct feature request; edit swaps the
  answer into the same composer textarea pre-filled, delete removes the
  row and the composer reappears). **Past days' Q&A history is browsable**
  below today's card (also a direct request) — every date either partner
  has answered shows that day's reconstructed question
  (`questionForDate()`) plus both answers, in the same styling as today's
  card (see §5's "don't guess a background color" lesson — this needed the
  dark `.q-card` treatment, not the plain light `.card`, or the white
  answer text would be illegible).
- **Floating chat widget** (not a tab — a FAB + full-panel overlay,
  independent of tab navigation): plain text messages, delete own
  messages, unread badge.
- **설정** (gear icon, top right): 3 tabs — 두 사람 정보 (names +
  anniversary date + logout), 테마 (10 color themes), 레이아웃 (5 layout
  variants, §5).

## 7. Notable bugs found and fixed (read before assuming something "just works")

- **Flexbox line-wrap doesn't force a break the way you'd expect when
  `max-width` clamps a sibling's basis.** `#nav`'s own `max-width:480px`
  (for the c15/c19 pill-nav look) made it share a flex line with `main`
  instead of getting a full row to itself, even with `flex:0 0 100%` —
  fixed by introducing `#navWrap` as the real full-width flex item, with
  `#nav` centered inside it as normal block flow. (c15 itself was later
  removed, but c19 still depends on `#navWrap` — don't delete it.)
- **`[hidden]` vs. an unconditional author `display` rule**: an author CSS
  rule that sets `display` on a selector *unconditionally* (`.chat-panel
  {display:flex}`) beats the browser's default `[hidden]{display:none}`
  regardless of specificity, because author origin always beats UA origin
  for the same property on the same element. A rule *gated by an attribute
  selector* (`[data-layout="cXX"] #el{display:flex}`) is safe because it
  simply doesn't match unless that attribute is set. `#authScreen` was
  built with this in mind from the start (`#authScreen[hidden]{display:
  none;}` explicit override alongside its own unconditional `display:flex`).
- **Node vs. bash `/tmp` path resolution differ on this Windows machine**:
  a literal `/tmp/...` path passed to Node's `fs`/Playwright resolves to
  the real `C:\tmp\...`, which is a *different* directory than git-bash's
  own `/tmp` (→ `AppData\Local\Temp\...`). A file written by a Node script
  using `/tmp/x` must be read back via `C:\tmp\x`, not bash's `/tmp/x`.
  Wasted real debugging time before being pinned down precisely.
- **Playwright element screenshots, not manual clip-box math**, for
  anything taller than the current viewport after scrolling — manual
  `page.screenshot({clip:{...}})` truncated tall elements unreliably;
  `locator.screenshot()` doesn't have this problem.
- **RLS subqueries are themselves subject to RLS** unless the referenced
  table's SELECT policy is permissive — this is *why* `members`' SELECT
  policy stays "any signed-in user" rather than couple-scoped: the
  join-by-code INSERT policy's `not exists (select 1 from members
  where...)` check would silently see zero rows (looking like "slot free"
  even when it isn't) for a couple the caller isn't part of yet, if
  `members` SELECT were itself couple-scoped.
- **A missing table produces a generic/misleading error that looks
  identical to a real conflict** unless you specifically check for it
  (`isMissingTable()`, §3) — cost real user confusion (signup said
  "already exists," login said "account not found," actual cause was
  "the `members` table doesn't exist yet") before being root-caused via a
  direct `page.evaluate()` call against the live Supabase client rather
  than guessing from symptoms.

## 8. Deployment

- **GitHub**: public repo at `https://github.com/merhiver/onda` (remote
  `origin`, branch `master`). Push requires the right GitHub account
  authenticated in Windows' Git Credential Manager (`git config --system
  credential.helper` → `manager`) — a stale cached login for the wrong
  account (`jwaves-wyn`, no write access) had to be cleared with
  `git-credential-manager github logout jwaves-wyn --no-ui` before pushing
  as the correct account (`merhiver`) worked.
- **GitHub Pages**: enabled via Settings → Pages → Deploy from branch →
  `master` / `/(root)` — no build step needed, it's a static site. Live at
  `https://merhiver.github.io/onda/`.
- **Custom domain**: not set up — would require the user to actually own a
  domain (GitHub doesn't provide one), then a CNAME/A-record pointing at
  `merhiver.github.io` plus the custom domain entered in the Pages
  settings. Also would need its own Kakao Developers domain registration
  (see §6) if map search should work there.
- **Why RLS had to be locked down before any of this**: the original
  schema used `using (true) with check (true))` ("allow all") on every
  table, which was fine while the app only ever ran on localhost, but
  going public meant the (necessarily public, client-side) anon key would
  sit forever in a public repo's commit history — anyone who found it
  could read/write everything. This is the actual reason the auth +
  multi-couple work (§3) happened at all, in this order, before deploying.

## 9. Chronological summary of explicit user requests (condensed)

For traceability — if a new session needs to understand *why* something is
the way it is, the request that caused it is here, roughly in order:

1. Build a shared couple app: calendar, records, bucket list, date-course
   with real map search, messages, notifications (badge-based initially,
   extensible later), identified by a private per-person link.
2. Design per a pasted Notion design-system doc, then per a pasted
   DESIGN-supabase.md doc; fix desktop spacing/gap inconsistencies (found
   and fixed twice — first attempt didn't fully solve it, the real fix
   needed actual `boundingBox()` measurement, not another guess).
3. Kakao map: not a "search then open a new tab" link — an actual in-page
   map with all added places pinned together.
4. GitHub repo setup guidance; anticipate needing push notifications later.
5. Make the app work well on both desktop and mobile, not mobile-only.
6. Redesign completely around the "wave" concept — layout, nav position,
   typography all fair game, but every existing feature must survive.
7. 10 selectable themes, with the hard rules in §4.
8. Unify typography to Pretendard (no per-theme fonts).
9. "The sides look too empty on wide screens" → 4 live alternatives via
   distinct URLs to compare.
10. Rejected all 4 outright — "번 gallery of 30+ structurally distinct
    designs, self-review each at least twice before showing me." →
    32-concept gallery, twice-reviewed, bugs found and fixed.
11. Make the gallery mobile-considered too; produce a shareable comparison
    page for outside opinions.
12. Swap the sample cafe name to a non-real brand mid-task.
13. A 한겨울(winter)-recolored share link of the gallery.
14. Caught a gradient violation in the gallery — fixed globally.
15. Pick 9 of the 32 concepts, make them **actually live and functional**
    (not mockups) at distinct URLs.
16. Those 9 didn't visually match the gallery reference — re-derive from
    source and re-verify against real screenshots (§5's fidelity
    discipline point).
17. Remove c11 and c20 from the set; review mobile for all remaining ones
    — found "every layout looks identical on mobile," fixed by adding the
    unconditional color/shape CSS layer (§5).
18. A specific theme's hero text was illegible → root-caused as the CSS
    specificity issue in §5, fixed systematically across all layouts, not
    just the one reported.
19. Editable/deletable question answers + browsable past-question history.
20. Remove c15 and c23 from the set (final set of 5, §5).
21. Move the layout picker into Settings instead of URL-only.
22. Publish the code on GitHub, publicly, so others can actually visit a
    live link (not just browse source) — surfaced the "allow all" RLS
    problem before agreeing to proceed, user chose "real auth" over "swap
    in a disposable demo database."
23. Confirmed end users don't need their own Supabase accounts (Supabase
    Auth is app-level, not asking users to sign up for Supabase itself).
24. Full-screen login→home transition, not an overlay.
25. Username-based accounts, not email; role labels as 🐰/🐈‍⬛ emoji, not
    "1번"/"2번".
26. Translate every auth error to Korean — caught a raw-English leak from
    a real screenshot.
27. Support other couples using the same app → invite-code-based
    multi-couple matching (§3), explicitly requested as "가입 시 코드를
    입력해서 커플을 분리"; user chose "reset all data as part of this
    migration" rather than attempting to preserve/backfill pre-couple data.
28. Push to `github.com/merhiver/onda`, enable GitHub Pages, register the
    Pages domain with Kakao.

## 10. If you're building a *new* app on top of onda's foundation

Given the stated goal (per the request that produced this file): the
reusable foundation is really §2 (vanilla JS + `db-adapter.js`'s
Firestore-shaped Supabase wrapper — copy this pattern for any new
Supabase-backed vanilla app), §3's auth/multi-tenant pattern (username→
email shim, invite-code matching, RLS keyed off a join table — generalize
"couple" to whatever your tenant unit is), and §4/§5's theme + layout
variant architecture (CSS-custom-property-driven, `data-*` attribute
selectors, settings-persisted-to-localStorage). The *specific* content
(calendar/journal/bucket-list/chat/question-of-the-day) is onda-specific
product surface, not foundation — don't assume a new app wants those
features just because it's forked from this code.
