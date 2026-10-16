// : existing UI behavior and lifecycle, initialized explicitly by the app boot.
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
