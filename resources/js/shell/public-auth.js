// public auth: existing UI behavior and lifecycle, initialized explicitly by the app boot.
export function appInitPublicAuth() {
    document.querySelectorAll('[data-password-toggle]').forEach(button => button.addEventListener('click', () => {
        const input = document.getElementById(button.dataset.passwordToggle); if (!input) return;
        const visible = input.type === 'password'; input.type = visible ? 'text' : 'password'; button.textContent = visible ? 'Hide' : 'Show'; button.setAttribute('aria-label', visible ? 'Hide password' : 'Show password'); button.setAttribute('aria-pressed', String(visible));
    }));
    const password = document.querySelector('input[name="password"]'), hint = document.querySelector('[data-password-hint]');
    password?.addEventListener('input', () => hint?.classList.toggle('is-valid', password.value.length >= 8));
    document.querySelectorAll('.auth-card form').forEach(form => form.addEventListener('submit', () => { const button = form.querySelector('[type="submit"]'); if (button) { button.disabled = true; button.textContent = 'Please wait…'; } }));
    document.querySelectorAll('.field-error').forEach((error, index) => {
        error.id ||= 'app-auth-error-' + index;
        const wrapper = error.previousElementSibling, input = wrapper?.matches('input') ? wrapper : wrapper?.querySelector('input');
        if (input) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', error.id); }
    });
    const appMedia = matchMedia('(prefers-color-scheme: dark)');
    function appPublicMeta() { const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue(document.body.classList.contains('app-welcome') ? '--app-splash-bg' : '--bg').trim(); }
    appMedia.addEventListener('change', () => { if (document.documentElement.dataset.themeMode === 'system') document.documentElement.dataset.theme = appMedia.matches ? 'dark' : 'light'; appPublicMeta(); });
    appPublicMeta();
    requestAnimationFrame(() => document.documentElement.classList.add('app-theme-ready'));
}
