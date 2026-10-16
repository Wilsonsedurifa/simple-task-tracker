# Landing implementation — full source

These are the complete ready-to-use files. They are also installed at the paths shown. See LANDING_PAGE.md for assumptions and the audit checklist.

## resources/views/landing.blade.php

```php
<!doctype html>
<html lang="en" data-lp-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Deadline views, a task board, a calendar, and an optional pet. Make room for your next small win.">
<link rel="icon" href="data:,"><title>Simple Task Tracker — Your tasks, your pace</title>
<script>(()=>{const r=document.documentElement;r.classList.add('js');try{const t=localStorage.getItem('lp-theme');if(['light','dark','kawaii','racing'].includes(t))r.dataset.lpTheme=t}catch{}})()</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Figtree:wght@400;500;600;700;800&display=swap" rel="stylesheet">
@vite(['resources/css/landing.css', 'resources/js/landing.js'])
</head>
<body class="lp">
<a class="lp-skip" href="#main">Skip to content</a>
<header class="lp-header"><nav class="lp-nav lp-wrap" aria-label="Main navigation">
<a class="lp-logo" href="{{ url('/') }}" aria-label="Simple Task Tracker home"><span aria-hidden="true">✓</span><b>Simple Task<br>Tracker</b></a>
<button class="lp-burger" type="button" aria-expanded="false" aria-controls="lp-links" aria-label="Open navigation"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
<div class="lp-links" id="lp-links">@foreach(['features'=>'Features','how'=>'How it works','pet'=>'Pet','themes'=>'Themes','faq'=>'FAQ'] as $lpId=>$lpLabel)<a href="#{{ $lpId }}">{{ $lpLabel }}</a>@endforeach</div>
<div class="lp-nav-actions"><a class="lp-button lp-login lp-ghost" href="{{ url('/login') }}">Log in</a><a class="lp-button lp-primary" href="{{ url('/register') }}">Get started ↗</a></div>
</nav></header>
<main id="main" tabindex="-1">
<section class="lp-hero lp-wrap">
<div><span class="lp-chip">Your tasks, your pace</span><h1>Finish your tasks.<br><mark>Grow a little friend.</mark></h1><p class="lp-lead">A little structure for your day. A little company along the way. Plan clearly, finish calmly, and watch your optional pet grow.</p><div class="lp-ctas"><a class="lp-button lp-primary" href="{{ url('/register') }}">Get started →</a><a class="lp-button lp-ghost" href="#how">See how it works</a></div><ul class="lp-ticks"><li>Deadline-first views</li><li>Board, list &amp; calendar</li><li>Great on your phone</li></ul></div>
<div class="lp-mock-scene" aria-hidden="true"><div class="lp-mock"><div class="lp-window"><span>● ● ●</span><b>Your daily little wins</b><span>↗</span></div><div class="lp-mock-body"><p class="lp-mini">TODAY, AT YOUR PACE</p><h2>Let's make room.</h2><div class="lp-mock-stats"><div><small>Open</small><strong>4</strong></div><div><small>Done</small><strong>12</strong></div><div><small>Overdue</small><strong>1</strong></div></div><div class="lp-mock-row"><span class="lp-ring"></span><b>Finish the report</b><span class="lp-pill lp-high">High</span></div><div class="lp-mock-row"><span class="lp-ring"></span><b>Plan tomorrow</b><span class="lp-pill lp-medium">Medium</span></div><div class="lp-mock-row lp-done"><span class="lp-ring">✓</span><b>Take the first step</b><span class="lp-pill lp-low">Low</span></div><p class="lp-mock-note">One thing at a time. Kaya mo 'yan!</p></div></div><span class="lp-sticker lp-xp">✦ +20 XP</span><span class="lp-sticker lp-streak">3-day streak</span><span class="lp-sticker lp-due">◷ Due today</span></div>
</section>
<section class="lp-section lp-wrap" id="features"><div class="lp-section-heading lp-rv"><span class="lp-mini">LESS FRICTION. MORE FOCUS.</span><h2>Everything you need,<br>nothing you don't.</h2><p>Useful tools, without making your to-do list another task.</p></div><div class="lp-features">
@foreach([
['📅','Deadline-first','See what is due today, what is coming next, and what needs another look.'],
['🗂️','Board, list & calendar','Move through stages, scan a list, or plan around your dates.'],
['🔎','Search & filters','Find tasks by title or description, then narrow by status or priority.'],
['🔔','Heads-up alerts','Task-based reminders highlight overdue work and upcoming deadlines.'],
['🔒','Private to you','Your signed-in account can only access its own tasks.'],
['📱','Made for phones','Touch-friendly screens keep your tasks close wherever your day goes.']
] as [$lpEmoji,$lpTitle,$lpCopy])<article class="lp-card lp-rv"><span class="lp-feature-icon" aria-hidden="true">{{ $lpEmoji }}</span><h3>{{ $lpTitle }}</h3><p>{{ $lpCopy }}</p></article>@endforeach
</div></section>
<section class="lp-section lp-how" id="how"><div class="lp-wrap"><div class="lp-section-heading lp-rv"><span class="lp-mini">SMALL STEPS COUNT</span><h2>A calmer way to get there.</h2></div><ol class="lp-steps"><li class="lp-card lp-rv"><span aria-hidden="true">01</span><h3>Add a task</h3><p>A title, a priority, maybe a deadline. Start with what's on your mind.</p></li><li class="lp-card lp-rv"><span aria-hidden="true">02</span><h3>Work it through</h3><p>Move from To do to In progress and Review. Pick the view that helps you focus.</p></li><li class="lp-card lp-rv"><span aria-hidden="true">03</span><h3>Finish &amp; grow</h3><p>Mark it complete. With an adopted pet, eligible completions earn XP.</p></li></ol></div></section>
<section class="lp-section lp-wrap lp-pet-section" id="pet"><div class="lp-rv"><span class="lp-mini">A SMALL FRIEND. NOT ANOTHER CHORE.</span><h2>Progress feels better<br>with a little company.</h2><p>Your optional pet grows as you finish tasks. Missed a deadline? No guilt trips. Your pet never dies or gets sick.</p><p class="lp-demo-note">Local demo: sample tasks and XP, not your account or the app's full reward rules.</p><fieldset class="lp-demo"><legend>Help Mochi grow</legend><label><input type="checkbox" data-lp-task value="30"><span>Finish report</span><small>High · 30 XP</small></label><label><input type="checkbox" data-lp-task value="10"><span>Buy groceries</span><small>Low · 10 XP</small></label><label><input type="checkbox" data-lp-task data-lp-overdue value="20"><span>Reply to emails</span><small>Overdue · 20 XP</small></label></fieldset><button id="lp-reset" class="lp-button lp-ghost" type="button">Reset demo</button><noscript><p>The interactive demo needs JavaScript. All page links still work.</p></noscript></div>
<div class="lp-pet-card lp-card lp-rv"><div class="lp-pet-top"><span class="lp-chip">Meet Mochi</span><span>YOUR LITTLE SIDEKICK</span></div><div class="lp-pet-room"><svg class="lp-pet-art" viewBox="0 0 260 240" aria-hidden="true" focusable="false"><path class="lp-pet-tail" d="M188 174c66 20 57-56 28-39"/><path class="lp-pet-body" d="M61 117 57 48q0-13 13-6l40 24q22-7 44 0l39-26q13-8 12 9l-4 70q19 21 17 57-2 47-88 47-87 0-87-47 0-35 18-59Z"/><path class="lp-pet-ear" d="m69 57 4 38 23-19m91-19-26 19 22 16Z"/><ellipse class="lp-pet-belly" cx="130" cy="184" rx="42" ry="27"/><circle class="lp-pet-eye" cx="102" cy="125" r="6"/><circle class="lp-pet-eye" cx="159" cy="125" r="6"/><ellipse class="lp-pet-blush" cx="84" cy="142" rx="12" ry="7"/><ellipse class="lp-pet-blush" cx="176" cy="142" rx="12" ry="7"/><path class="lp-mouth lp-mouth-neutral" d="M119 148h23"/><path class="lp-mouth lp-mouth-happy" d="M117 144q13 21 27 0"/><path class="lp-mouth lp-mouth-sad" d="M118 156q13-17 26 0"/><path class="lp-pet-tear" d="M174 134q-12 20 0 20t0-20Z"/><path class="lp-pet-feet" d="M82 209v11m95-11v11"/></svg><span class="lp-pet-spark" aria-hidden="true">✦</span></div><p id="lp-speech" class="lp-speech" aria-live="polite">Mochi is taking it one task at a time.</p><div id="lp-progress" class="lp-progress" role="progressbar" aria-label="Demo XP progress" aria-valuemin="0" aria-valuemax="60" aria-valuenow="0"><span></span></div><p id="lp-xp-label" class="lp-xp-label">0 XP · Baby</p><p class="lp-demo-note">Your real pet is optional and can be hidden in Settings.</p></div>
</section>
<section class="lp-section lp-themes" id="themes"><div class="lp-wrap"><div class="lp-section-heading lp-rv"><span class="lp-mini">SAME FOCUS. DIFFERENT FEEL.</span><h2>Make it yours.</h2><p>Pick a look for this page. App appearance is saved separately.</p></div><div class="lp-theme-options" role="radiogroup" aria-label="Page theme">@foreach(['light'=>'Light','dark'=>'Dark','kawaii'=>'Kawaii','racing'=>'Racing'] as $lpTheme=>$lpName)<button type="button" role="radio" aria-checked="{{ $loop->first ? 'true' : 'false' }}" tabindex="{{ $loop->first ? '0' : '-1' }}" data-lp-theme-choice="{{ $lpTheme }}"><span class="lp-theme-swatch lp-swatch-{{ $lpTheme }}" aria-hidden="true"></span><span>{{ $lpName }}</span><span class="lp-theme-check" aria-hidden="true">✓</span></button>@endforeach</div><p id="lp-theme-status" class="lp-theme-status" role="status"></p></div></section>
<section class="lp-section lp-wrap lp-faq" id="faq"><div class="lp-section-heading lp-rv"><span class="lp-mini">GOOD QUESTIONS</span><h2>A few things worth knowing.</h2></div>
@foreach([
['Is my data private?','Tasks belong to your signed-in account. Other users cannot view or change them through the task API.'],
['Do I need to install anything?','No. Open the app in your browser, create an account, and get started.'],
['What happens if I miss a deadline?','Your task is marked overdue so you can make a new plan. Your pet never dies or gets sick. Isa-isa lang.'],
['Can I turn the pet off?','Yes. Show pet in Settings hides the pet card, navigation, and XP celebrations. Your earned XP is kept.'],
['Can I use it on my phone?','Yes. The app has mobile layouts for tasks, the calendar, your profile, and notifications.']
] as [$lpQuestion,$lpAnswer])<details class="lp-rv"><summary>{{ $lpQuestion }}<span aria-hidden="true">+</span></summary><p>{{ $lpAnswer }}</p></details>@endforeach
</section>
<section class="lp-final"><div class="lp-wrap"><span class="lp-mini">YOUR NEXT SMALL WIN IS WAITING</span><h2>Ready to clear your list?</h2><p>Make a little room in your day. Kaya mo 'yan!</p><div class="lp-ctas"><a class="lp-button lp-inverted" href="{{ url('/register') }}">Get started →</a><a class="lp-button lp-inverted-ghost" href="{{ url('/login') }}">I already have an account</a></div></div></section>
</main>
<footer class="lp-footer lp-wrap"><p>© {{ date('Y') }} Simple Task Tracker. One small step at a time.</p><nav aria-label="Footer navigation"><a href="#features">Features</a><a href="#pet">Pet</a><a href="#faq">FAQ</a><a href="{{ url('/login') }}">Log in</a></nav></footer>
</body>
</html>
```

## resources/css/landing.css

```css
/* All palette and preview colors live in these .lp-scoped token blocks.
   Stickers use the active theme, not fixed third-party brand colors. */
.lp {
 --bg:#fff9ee;--surface:#fffef9;--surface-2:#eee9dd;--ink:#182344;--muted:#50566b;--line:#182344;
 --brand:#174ce5;--on-brand:#ffffff;--pop:#efdaff;--sun:#ffe27a;--mint:#c8efdc;--bad:#fbd9d9;--sh:#182344;--fur:#f3c48e;--r:22px;--clear:transparent;
 --font-heading:"Bricolage Grotesque",system-ui,sans-serif;--font-body:"Figtree",system-ui,sans-serif;
 --preview-light-paper:#fff9ee;--preview-light-brand:#174ce5;--preview-dark-paper:#101a2b;--preview-dark-brand:#91baff;
 --preview-kawaii-paper:#fff2f8;--preview-kawaii-brand:#b51359;--preview-racing-paper:#111316;--preview-racing-brand:#db263a;
 margin:0;background:var(--bg);color:var(--ink);font-family:var(--font-body);font-size:16px;line-height:1.6;
}
html[data-lp-theme="dark"] .lp {--bg:#101a2b;--surface:#17243a;--surface-2:#23324a;--ink:#eef3ff;--muted:#bac5d8;--line:#c6d4ef;--brand:#91baff;--on-brand:#101a2b;--pop:#3c2d52;--sun:#4a3c13;--mint:#193e35;--bad:#512c38;--sh:#000000;--fur:#dba36f;}
html[data-lp-theme="kawaii"] .lp {--bg:#fff2f8;--surface:#fffaff;--surface-2:#f7e4ef;--ink:#48203e;--muted:#765369;--line:#6e3154;--brand:#b51359;--on-brand:#ffffff;--pop:#e8ddff;--sun:#ffe4a4;--mint:#ceeedd;--bad:#f7ccd9;--sh:#c36d99;--fur:#e8bfd6;--r:30px;}
html[data-lp-theme="racing"] .lp {--bg:#111316;--surface:#1b1e23;--surface-2:#272b31;--ink:#fafafa;--muted:#b8bec8;--line:#e5e7eb;--brand:#db263a;--on-brand:#ffffff;--pop:#463147;--sun:#494018;--mint:#1c4238;--bad:#4d2730;--sh:#9c1727;--fur:#d3a47c;--r:6px;}
html {scroll-behavior:smooth;scroll-padding-top:110px;}
.lp * {box-sizing:border-box;}
.lp [hidden] {display:none!important;}
.lp :is(a,button,input,summary,[tabindex]):focus-visible {outline:3px solid var(--brand);outline-offset:4px;}
.lp a {color:inherit;text-underline-offset:4px;}
.lp button,.lp input {font:inherit;}
.lp button {cursor:pointer;}
.lp h1,.lp h2,.lp h3 {font-family:var(--font-heading);line-height:1.1;letter-spacing:-.04em;text-wrap:balance;}
.lp h1 {font-size:clamp(43px,5.2vw,76px);margin:24px 0;}
.lp h2 {font-size:clamp(32px,3.5vw,49px);margin:12px 0 20px;}
.lp h3 {font-size:24px;margin:18px 0 12px;}
.lp p {margin:0 0 18px;}
.lp-wrap {width:min(1180px,calc(100% - 48px));margin-inline:auto;}
.lp-skip {position:fixed;top:12px;left:16px;z-index:30;padding:12px 18px;background:var(--surface);border:2px solid var(--line);border-radius:var(--r);transform:translateY(-180%);}
.lp-skip:focus {transform:none;}
.lp-header {position:sticky;top:0;z-index:20;background:var(--bg);border-bottom:2px solid var(--clear);}
.lp-header.is-scrolled {border-bottom-color:var(--line);}
.lp-nav {display:flex;align-items:center;gap:24px;min-height:88px;position:relative;}
.lp-logo {display:flex;align-items:center;gap:10px;min-height:44px;text-decoration:none;flex:none;font-family:var(--font-heading);line-height:1.05;letter-spacing:-.03em;}
.lp-logo>span {display:grid;place-items:center;background:var(--brand);color:var(--on-brand);width:40px;height:40px;border:2px solid var(--line);border-radius:12px;font-size:26px;box-shadow:3px 3px 0 var(--sh);}
.lp-links {display:flex;align-items:center;justify-content:center;gap:14px;flex:1;}
.lp-links a {font-weight:700;font-size:14px;text-decoration:none;min-height:44px;display:flex;align-items:center;padding:4px 2px;border-bottom:2px solid var(--clear);}
.lp-links a[aria-current] {border-bottom-color:var(--brand);color:var(--brand);}
.lp-nav-actions {display:flex;gap:10px;flex:none;}
.lp-button {display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:48px;padding:11px 22px;border:2px solid var(--line);border-radius:999px;font-weight:800;text-decoration:none;line-height:1.4;text-align:center;box-shadow:4px 4px 0 var(--sh);transition:transform 160ms;}
.lp-primary {background:var(--brand);color:var(--on-brand)!important;}
.lp-ghost {background:var(--surface);color:var(--ink);}
.lp-button:active {transform:translate(3px,3px);}
.lp-burger {display:none;align-items:center;justify-content:center;width:44px;height:44px;border:2px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);}
.lp-burger svg {width:22px;height:22px;flex:none;}
.lp-hero {display:grid;gap:56px;padding-block:72px 90px;align-items:center;}
.lp-chip {display:inline-block;padding:6px 13px;border:2px solid var(--line);border-radius:999px;background:var(--mint);font-size:12px;font-weight:800;}
.lp h1 mark {background:linear-gradient(var(--clear) 52%,var(--sun) 52%,var(--sun) 96%,var(--clear) 96%);color:inherit;padding-inline:2px;}
.lp-lead {font-size:19px;color:var(--muted);max-width:53ch;}
.lp-ctas {display:flex;flex-wrap:wrap;gap:16px;margin:28px 0;}
.lp-ticks {display:flex;flex-wrap:wrap;gap:9px 18px;list-style:none;padding:0;font-size:12px;font-weight:700;}
.lp-ticks li::before {content:"✓";margin-right:6px;}
.lp-mock-scene {position:relative;min-width:0;padding:24px 12px;max-width:560px;width:100%;margin-inline:auto;}
.lp-mock {border:2px solid var(--line);border-radius:var(--r);background:var(--surface);box-shadow:9px 9px 0 var(--sh);transform:rotate(-3deg);overflow:hidden;}
.lp-window {display:flex;align-items:center;justify-content:space-between;gap:8px;padding:14px 16px;border-bottom:2px solid var(--line);background:var(--surface-2);font-size:11px;}
.lp-window>span:first-child {letter-spacing:3px;}
.lp-mock-body {padding:24px;}
.lp-mini {font-size:11px;font-weight:800;letter-spacing:.12em;}
.lp-mock h2 {font-size:30px;letter-spacing:-.03em;margin:12px 0 20px;}
.lp-mock-stats {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:18px;}
.lp-mock-stats>div {padding:12px;border:2px solid var(--line);border-radius:12px;background:var(--pop);}
.lp-mock-stats>div:nth-child(2) {background:var(--mint);}
.lp-mock-stats>div:nth-child(3) {background:var(--bad);}
.lp-mock-stats small,.lp-mock-stats strong {display:block;}
.lp-mock-stats strong {font:800 29px var(--font-heading);}
.lp-mock-row {display:flex;align-items:center;gap:10px;padding:16px 0;border-top:2px solid var(--line);font-size:12px;}
.lp-mock-row b {flex:1;min-width:0;}
.lp-ring {width:21px;height:21px;flex:none;border:2px solid var(--line);border-radius:50%;text-align:center;line-height:17px;background:var(--surface);}
.lp-done b {text-decoration:line-through;}
.lp-done .lp-ring {background:var(--mint);}
.lp-pill {padding:3px 8px;border:1px solid var(--line);border-radius:999px;font-size:10px;font-weight:800;}
.lp-high {background:var(--bad);}.lp-medium {background:var(--sun);}.lp-low {background:var(--mint);}
.lp-mock-note {font-size:11px;color:var(--muted);margin:12px 0 0!important;}
.lp-sticker {position:absolute;border:2px solid var(--line);padding:9px 14px;border-radius:12px;font-weight:800;font-size:13px;box-shadow:4px 4px 0 var(--sh);animation:lp-float 5s ease-in-out infinite;pointer-events:none;}
.lp-xp {top:0;right:0;background:var(--sun);transform:rotate(8deg);}
.lp-streak {left:0;bottom:0;background:var(--pop);animation-delay:-2s;}
.lp-due {right:-12px;bottom:54px;background:var(--mint);animation-delay:-3s;}
.lp-section {padding-block:88px;}
.lp-section-heading {max-width:650px;margin-bottom:36px;}
.lp-section-heading>p,.lp-card p,.lp-pet-section>div>p {color:var(--muted);}
.lp-features {display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:24px;}
.lp-card {padding:28px;border:2px solid var(--line);border-radius:var(--r);background:var(--surface);box-shadow:5px 5px 0 var(--sh);}
.lp-card p:last-child {margin-bottom:0;}
.lp-feature-icon {display:grid;place-items:center;width:52px;height:52px;border:2px solid var(--line);border-radius:14px;background:var(--sun);font-size:25px;}
.lp-features article:nth-child(2n) .lp-feature-icon {background:var(--pop);}
.lp-features article:nth-child(3n) .lp-feature-icon {background:var(--mint);}
.lp-how {background:var(--surface-2);border-block:2px solid var(--line);}
.lp-steps {list-style:none;margin:0;padding:0;display:grid;gap:24px;}
.lp-steps li>span {font:800 34px var(--font-heading);color:var(--brand);}
.lp-pet-section {display:grid;align-items:center;gap:56px;}
.lp-demo-note {font-size:12px;color:var(--muted);}
.lp-demo {padding:0;margin:24px 0 18px;border:0;display:grid;gap:10px;}
.lp-demo legend {font-weight:800;margin-bottom:12px;}
.lp-demo label {display:flex;align-items:center;gap:10px;min-height:58px;padding:12px;border:2px solid var(--line);border-radius:12px;background:var(--surface);cursor:pointer;font-weight:700;}
.lp-demo input {width:22px;height:22px;flex:none;accent-color:var(--brand);}
.lp-demo small {margin-left:auto;font-size:11px;text-align:right;color:var(--muted);}
.lp-pet-card {text-align:center;min-width:0;}
.lp-pet-top {display:flex;align-items:center;justify-content:space-between;gap:12px;}
.lp-pet-top>span:last-child {font-size:9px;font-weight:800;letter-spacing:.1em;}
.lp-pet-room {height:285px;display:grid;place-items:center;position:relative;margin:24px 0;background:var(--surface-2);border-radius:var(--r);overflow:hidden;}
.lp-pet-art {width:250px;max-width:100%;height:240px;transform:scale(var(--s,.72));transition:transform 400ms cubic-bezier(.2,1.4,.4,1);overflow:visible;}
.lp-pet-body {fill:var(--fur);stroke:var(--line);stroke-width:4;stroke-linejoin:round;}
.lp-pet-tail {fill:none;stroke:var(--fur);stroke-width:17;stroke-linecap:round;}
.lp-pet-ear,.lp-pet-blush {fill:var(--bad);}
.lp-pet-belly {fill:var(--surface);}
.lp-pet-eye {fill:var(--ink);}
.lp-mouth,.lp-pet-feet {fill:none;stroke:var(--ink);stroke-width:4;stroke-linecap:round;}
.lp-mouth-happy,.lp-mouth-sad,.lp-pet-tear {display:none;}
.lp-pet-tear {fill:var(--brand);}
.lp-pet-card[data-mood="happy"] .lp-mouth-neutral,.lp-pet-card[data-mood="sad"] .lp-mouth-neutral {display:none;}
.lp-pet-card[data-mood="happy"] .lp-mouth-happy,.lp-pet-card[data-mood="sad"] :is(.lp-mouth-sad,.lp-pet-tear) {display:block;}
.lp-pet-spark {position:absolute;right:16%;top:14%;font-size:30px;color:var(--brand);}
.lp-speech {min-height:60px;font-weight:700;color:var(--ink)!important;}
.lp-progress {height:22px;border:2px solid var(--line);border-radius:999px;background:var(--surface-2);overflow:hidden;}
.lp-progress>span {display:block;height:100%;width:var(--w,0%);background:var(--brand);transition:width 300ms;}
.lp-xp-label {font-weight:800;margin-top:12px!important;}
.lp-themes {background:var(--pop);border-block:2px solid var(--line);}
.lp-theme-options {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}
.lp-theme-options button {display:flex;align-items:center;gap:12px;border:2px solid var(--line);border-radius:var(--r);background:var(--surface);color:var(--ink);padding:16px;min-height:72px;font-weight:800;box-shadow:4px 4px 0 var(--sh);}
.lp-theme-options [aria-checked="true"] {outline:3px solid var(--brand);outline-offset:3px;}
.lp-theme-swatch {width:40px;height:40px;flex:none;border:2px solid var(--line);border-radius:50%;}
.lp-swatch-light {background:linear-gradient(135deg,var(--preview-light-paper) 50%,var(--preview-light-brand) 50%);}
.lp-swatch-dark {background:linear-gradient(135deg,var(--preview-dark-paper) 50%,var(--preview-dark-brand) 50%);}
.lp-swatch-kawaii {background:linear-gradient(135deg,var(--preview-kawaii-paper) 50%,var(--preview-kawaii-brand) 50%);}
.lp-swatch-racing {background:linear-gradient(135deg,var(--preview-racing-paper) 50%,var(--preview-racing-brand) 50%);}
.lp-theme-check {margin-left:auto;visibility:hidden;}
[aria-checked="true"]>.lp-theme-check {visibility:visible;}
.lp-theme-status {font-size:13px;min-height:24px;margin-top:20px!important;}
.lp-faq {max-width:850px;}
.lp-faq details {border:2px solid var(--line);border-radius:var(--r);background:var(--surface);margin-bottom:14px;overflow:hidden;}
.lp-faq summary {display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 22px;min-height:62px;cursor:pointer;font-weight:800;list-style:none;}
.lp-faq summary::-webkit-details-marker {display:none;}
.lp-faq summary span {font-size:25px;flex:none;}
.lp-faq details[open] summary span {transform:rotate(45deg);}
.lp-faq details>p {padding:0 22px 20px;color:var(--muted);margin:0;}
.lp-final {padding-block:72px;background:var(--brand);color:var(--on-brand);text-align:center;border-block:2px solid var(--line);}
.lp-final .lp-ctas {justify-content:center;margin-bottom:0;}
.lp-inverted {background:var(--on-brand);color:var(--brand)!important;border-color:var(--on-brand);}
.lp-inverted-ghost {background:var(--clear);color:var(--on-brand)!important;border-color:var(--on-brand);}
.lp-final .lp-button:focus-visible {outline-color:var(--on-brand);}
.lp-footer {display:flex;align-items:center;justify-content:space-between;gap:24px;padding-block:30px;font-size:12px;}
.lp-footer p {margin:0;}.lp-footer nav {display:flex;flex-wrap:wrap;gap:16px;}
.lp-footer a {display:inline-flex;align-items:center;min-height:44px;font-weight:700;}
html.js .lp-rv {opacity:0;transform:translateY(18px);transition:opacity 450ms,transform 450ms;}
html.js .lp-rv.is-in {opacity:1;transform:none;}
@keyframes lp-float {0%,100% {transform:translateY(0) rotate(-4deg);}50% {transform:translateY(-9px) rotate(4deg);}}
@media (hover:hover) { .lp-card {transition:transform 160ms;}.lp-features .lp-card:hover {transform:translateY(-5px);}.lp-button:hover {transform:translate(-1px,-2px);} }
@media (min-width:860px) {.lp-pet-section {grid-template-columns:1fr 1fr;}.lp-theme-options {grid-template-columns:repeat(4,minmax(0,1fr));}.lp-steps {grid-template-columns:repeat(3,minmax(0,1fr));}}
@media (min-width:900px) {.lp-hero {grid-template-columns:1.12fr 1fr;}}
@media (max-width:1090px) {.lp-nav {gap:12px;}.lp-links {gap:8px;}.lp-links a {font-size:12px;}.lp-nav-actions .lp-button {padding-inline:15px;font-size:13px;}}
@media (max-width:859px) {
 html:not(.js) .lp-header {position:static;}
 .lp-nav {flex-wrap:wrap;min-height:80px;padding-block:12px;gap:12px;}.lp-nav-actions {margin-left:auto;}.lp-login {display:none;}.lp-logo {font-size:15px;}
 .lp-links {order:4;flex-basis:100%;flex-wrap:wrap;justify-content:flex-start;padding:10px 0;}.lp-links a {font-size:14px;padding-inline:9px;}
 html.js .lp-burger {display:flex;order:3;}html.js .lp-links {display:none;position:absolute;left:0;right:0;top:calc(100% - 1px);padding:16px;background:var(--surface);border:2px solid var(--line);border-radius:var(--r);box-shadow:5px 5px 0 var(--sh);}
 html.js .lp-nav.is-open .lp-links {display:flex;}
 .lp-hero {padding-top:46px;}.lp-mock-scene {max-width:520px;}
}
@media (max-width:559px) {
 .lp-wrap {width:calc(100% - 36px);}.lp-nav {gap:8px;}.lp-logo>span {width:33px;height:33px;font-size:23px;}.lp-logo {gap:7px;font-size:13px;}
 .lp-nav-actions .lp-button {padding:10px 13px;font-size:12px;min-height:44px;box-shadow:3px 3px 0 var(--sh);}.lp-burger {width:44px;min-height:44px;}
 .lp-ctas {flex-direction:column;}.lp-ctas .lp-button {width:100%;}.lp-section {padding-block:56px;}.lp-hero {gap:32px;padding-bottom:50px;}
 .lp-hero h1 {font-size:43px;}.lp-lead {font-size:17px;}.lp-mock-scene {padding:18px 10px;}.lp-mock-body {padding:18px 14px;}.lp-mock h2 {font-size:26px;}
 .lp-mock-stats {gap:7px;}.lp-mock-stats>div {padding:9px;}.lp-mock-row {font-size:11px;gap:7px;}.lp-due {display:none;}
 .lp-sticker {font-size:11px;padding:7px 10px;}.lp-card {padding:22px;}.lp-pet-room {height:250px;}
 .lp-pet-top>span:last-child {font-size:8px;}.lp-demo label {flex-wrap:wrap;gap:8px;font-size:14px;}.lp-demo small {font-size:10px;}
 .lp-theme-options {gap:12px;}.lp-theme-options button {padding:12px;gap:8px;font-size:14px;}.lp-theme-swatch {width:30px;height:30px;}
 .lp-footer {flex-direction:column;align-items:flex-start;gap:10px;}.lp-faq summary {padding:16px;}
}
@media (prefers-reduced-motion:reduce) {
 html {scroll-behavior:auto;} .lp *, .lp *::before,.lp *::after {animation:none!important;transition:none!important;}
 html.js .lp-rv {opacity:1;transform:none;}
}
```

## resources/js/landing.js

```js
function lpInit(name, init) {
    try { init(); } catch (error) { console.error('Landing ' + name + ':', error); }
}
lpInit('navigation', () => {
    const nav = document.querySelector('.lp-nav'), button = document.querySelector('.lp-burger'), links = document.getElementById('lp-links'), header = document.querySelector('.lp-header');
    if (!nav || !button || !links) return;
    const media = matchMedia('(max-width:859px)');
    function lpClose(focus = false) { nav.classList.remove('is-open'); button.setAttribute('aria-expanded','false'); button.setAttribute('aria-label','Open navigation'); if (focus) button.focus(); }
    button.addEventListener('click', () => { const open = !nav.classList.contains('is-open'); nav.classList.toggle('is-open',open); button.setAttribute('aria-expanded',String(open)); button.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation'); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { event.preventDefault(); lpClose(true); } });
    document.addEventListener('click', event => { if (!nav.contains(event.target)) lpClose(); });
    links.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]'); if (!link) return;
        const wasOpen = nav.classList.contains('is-open'); lpClose();
        if (wasOpen) { const target = document.querySelector(link.getAttribute('href')); if (target) { target.setAttribute('tabindex','-1'); requestAnimationFrame(() => target.focus({preventScroll:true})); } }
    });
    media.addEventListener('change', () => lpClose());
    const lpScroll = () => header?.classList.toggle('is-scrolled',scrollY > 8);
    addEventListener('scroll',lpScroll,{passive:true}); lpScroll();
});
lpInit('active section', () => {
    const links = [...document.querySelectorAll('#lp-links a[href^="#"]')], visible = new Map();
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
        for (const entry of entries) visible.set(entry.target.id,entry.isIntersecting);
        let active = null, distance = Infinity;
        for (const link of links) { const id = link.hash.slice(1), section = document.getElementById(id); if (section && visible.get(id)) { const delta = Math.abs(section.getBoundingClientRect().top - 110); if (delta < distance) { active = link; distance = delta; } } }
        for (const link of links) if (link === active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
    },{rootMargin:'-90px 0px -30% 0px',threshold:[0,.15,.5]});
    for (const link of links) { const section = document.getElementById(link.hash.slice(1)); if (section) observer.observe(section); }
});
lpInit('theme', () => {
    const buttons = [...document.querySelectorAll('[data-lp-theme-choice]')], root = document.documentElement, note = document.getElementById('lp-theme-status');
    if (!buttons.length) return;
    function lpTheme(theme, announce = true) {
        if (!buttons.some(button => button.dataset.lpThemeChoice === theme)) theme = 'light';
        root.dataset.lpTheme = theme;
        for (const button of buttons) { const active = button.dataset.lpThemeChoice === theme; button.setAttribute('aria-checked',String(active)); button.tabIndex = active ? 0 : -1; }
        let saved = true; try { localStorage.setItem('lp-theme',theme); } catch { saved = false; }
        if (note && announce) note.textContent = theme[0].toUpperCase() + theme.slice(1) + (saved ? ' theme selected.' : ' applied. Browser storage is unavailable.');
    }
    for (const button of buttons) {
        button.addEventListener('click', () => lpTheme(button.dataset.lpThemeChoice));
        button.addEventListener('keydown', event => {
            const index = buttons.indexOf(button), offset = ['ArrowRight','ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 0;
            if (!offset && !['Home','End'].includes(event.key)) return;
            event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length-1 : (index+offset+buttons.length)%buttons.length;
            const target = buttons[next]; if (target) { lpTheme(target.dataset.lpThemeChoice); target.focus(); }
        });
    }
    lpTheme(root.dataset.lpTheme,false);
    addEventListener('storage',event => { if (event.key === 'lp-theme') { const theme = buttons.some(button => button.dataset.lpThemeChoice === event.newValue) ? event.newValue : 'light'; root.dataset.lpTheme = theme; for (const button of buttons) { const active = button.dataset.lpThemeChoice === theme; button.setAttribute('aria-checked',String(active)); button.tabIndex=active?0:-1; } } });
});
lpInit('pet demo', () => {
    const tasks = [...document.querySelectorAll('[data-lp-task]')], card = document.querySelector('.lp-pet-card'), bar = document.getElementById('lp-progress'), speech = document.getElementById('lp-speech'), label = document.getElementById('lp-xp-label'), reset = document.getElementById('lp-reset');
    if (!tasks.length || !card || !bar || !speech || !label) return;
    function lpDemo() {
        const done = tasks.filter(task => task.checked).length, xp = tasks.reduce((total,task) => total + (task.checked ? Number(task.value) : 0),0);
        const overdue = tasks.some(task => task.hasAttribute('data-lp-overdue') && !task.checked);
        const mood = done === tasks.length ? 'happy' : overdue ? 'sad' : done ? 'happy' : 'neutral';
        card.dataset.mood = mood; card.style.setProperty('--s',String(.72 + .14*done)); bar.style.setProperty('--w',xp/60*100+'%'); bar.setAttribute('aria-valuenow',String(xp));
        label.textContent = xp + ' XP · ' + ['Baby','Little','Young','Grown'][done];
        speech.textContent = done === tasks.length ? 'Naubos mo lahat! Mochi grew up!' : overdue ? 'Mochi is sad: 1 task is overdue. Kaya pa yan!' : done ? 'A little progress! Isa-isa lang, tutulungan kita.' : 'One small step? Nandito lang ako.';
    }
    tasks.forEach(task => task.addEventListener('change',lpDemo));
    reset?.addEventListener('click', () => { tasks.forEach(task => { task.checked=false; }); lpDemo(); });
    lpDemo();
});
lpInit('reveal', () => {
    const nodes = [...document.querySelectorAll('.lp-rv')];
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) { nodes.forEach(node => node.classList.add('is-in')); return; }
    try {
        const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); } },{threshold:.08});
        nodes.forEach(node => observer.observe(node));
    } catch (error) { nodes.forEach(node => node.classList.add('is-in')); throw error; }
});
```

## tests/Feature/LandingPageTest.php

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class LandingPageTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_guest_marketing_page_has_real_auth_links_and_separate_assets(): void
    {
        $html = $this->get('/')->assertOk()->assertViewIs('landing')
            ->assertSee('Get started')->assertSee('href="'.url('/register').'"', false)
            ->assertSee('href="'.url('/login').'"', false)->assertSee('Finish your tasks.')
            ->assertSee('id="lp-progress"', false)->getContent();
        $this->assertSame(1, substr_count($html, '<h1>'));
        $this->assertSame(5, substr_count($html, '<details'));
        $this->assertStringNotContainsString('<style', $html);
        $this->assertStringNotContainsString(' style=', $html);
        $this->assertStringNotContainsString('/api/tasks', $html);
        $this->assertStringNotContainsString('assets/tasks-', $html);
    }

    public function test_authenticated_root_still_redirects_to_dashboard(): void
    {
        $this->actingAs(User::factory()->create())->get('/')->assertRedirect('/dashboard');
    }
}
```

## routes/web.php change

```diff
-Route::get('/', fn () => auth()->check() ? redirect()->route('dashboard') : view('welcome'))->name('landing');
+Route::get('/', fn () => auth()->check() ? redirect()->route('dashboard') : view('landing'))->name('landing');
```

## vite.config.js

No change was required. Both separate entry points were already configured; all existing entries were retained:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/css/base.css',
                'resources/css/tasks.css',
                'resources/js/tasks.js',
                'resources/css/landing.css',
                'resources/js/landing.js',
                'resources/css/auth.css',
                'resources/js/auth.js',
            ],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                    optimizedFallbacks: false,
                }),
            ],
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
```
