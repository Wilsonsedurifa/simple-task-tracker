# Public landing page

Full implementation files (ready to use):

- `resources/views/landing.blade.php`: standalone Blade document, single H1, marketing sections, original inline SVG Mochi, native FAQ, auth links, fonts and one-line anti-flash snippet.
- `resources/css/landing.css`: isolated `.lp` theme tokens, four palettes, responsive layout, stickers, focus/target sizes and reduced-motion fallback.
- `resources/js/landing.js`: individually guarded navigation, active-section tracking, themes, pet demo and reveal modules. No API requests.
- `routes/web.php`: only the guest root view changed from `welcome` to `landing`; authenticated root still redirects to Dashboard. Auth, Continue and every other route are unchanged.
- `tests/Feature/LandingPageTest.php`: public content/auth links, isolated assets, no inline Blade styles, and authenticated root redirect.
- `tests/Feature/PageFlowTest.php`, `MobileFoundationTest.php`, `ExampleTest.php`, `AccessControlTest.php`: replace assertions tied to the superseded welcome/marketing copy and anchors, preserving auth protections.
- `tests/browser/landing-checks.mjs`: six widths, all palette contrast pairs, theme reload/keyboard behavior, all eight demo checkbox combinations, reset, menu, FAQ, reduced motion, blocked storage, no private requests and JS-disabled links.
- `tests/browser/mobile-checks.mjs`: public welcome expectation now targets the requested marketing page; auth checks are retained.
- `tests/browser/workspace.mjs`: include the landing audit; `--landing-only` runs it separately.
- `docs/LANDING_PAGE.md`: this handoff.
- `docs/LANDING_IMPLEMENTATION.md`: full contents of the three files, new feature test, existing Vite config, and exact route diff.

## Vite

No config change was needed: `vite.config.js` already includes both `resources/css/landing.css` and `resources/js/landing.js` as separate inputs. Existing app/auth entries and plugins were preserved. The landing document imports only its two entries, so it does not load the private app bundle. No framework or dependency was added.

## Assumptions and conflicts resolved

- The existing landing files were an older priority-sorting/API showcase, not attached design reference files. They were replaced to match this specification.
- The latest request supersedes the earlier splash screen at guest `/`. The unused old welcome view is retained; the legacy `/welcome` URL keeps its existing route and now displays the new landing view.
- Landing appearance uses `lp-theme`, separately from signed-in app preferences. It offers exactly the four requested themes; System remains available in the app.
- Mockup stats are decorative sample UI, not user counts, ratings or adoption claims. The interactive demo is labeled as local sample tasks/XP, distinct from the real priority/on-time/cap reward rules.
- Mood precedence follows the specification: all done → happy; unchecked overdue item → sad; otherwise some done → happy; otherwise neutral. Thus the reset/all-unchecked state is sad, because the overdue task is still unchecked.
- No images or SVG files were added. Mochi is original, generic inline vector artwork.

## Manual checklist

- At 360, 390, 768, 1024, 1280 and 1920: no horizontal overflow; full-width hero/final CTAs on phones; mockup/stickers stay contained.
- Menu: Enter/Space, Tab through links, Escape, outside click, link click and resize; `aria-expanded`, focus and active-section `aria-current` update correctly.
- Themes: four selected states, Arrow/Home/End keys, reload restoration, no flash, blocked/corrupt storage; check body, buttons, muted text, highlighter and pills.
- Demo: each task combination, scale/XP/stage, overdue mood/tear, all-done speech and Reset. It makes zero task/API requests.
- Native FAQs work with keyboard and JS disabled. Reduced motion disables floating, reveals, smooth scroll and transitions.
- With JS disabled, all content/navigation and register/login links remain usable. The demo has a noscript explanation.
- Guest `/` is public; authenticated `/` redirects to Dashboard; `/continue` and all private app pages still work.

Unverified outside browser emulation: physical devices and assistive-technology sessions. Google Fonts requires a network connection; system-ui fallbacks are supplied.

Suggested commit: `feat: build standalone themed marketing landing page`
