import { nextState, floorTarget, ease } from './stateMachine.js';

export function createBehavior(room, reduced) {
    const pet = room.querySelector('[data-app-pet-touch]');
    let state = 'idle-sit', elapsed = 0, duration = 2200, visible = false, frame, last = 0;
    let position = { x: 0, y: 0, depth: 1 }, origin = position, target = position;
    let interrupted = null, didLook = false, lookUntil = 0;
    let nearToy = false;
    function paint() {
        pet.style.setProperty('--pet-x', position.x + 'px');
        pet.style.setProperty('--pet-y', position.y + 'px');
        pet.style.setProperty('--pet-depth', position.depth);
    }
    const setState = value => { state = value; room.dataset.petState = value; };
    function enter(value) {
        setState(value); elapsed = 0; didLook = false;
        duration = value === 'nap' ? 8000 : 2400 + Math.random() * 2600;
        if (value === 'walk') {
            origin = { ...position };
            target = floorTarget(room.clientWidth, room.clientHeight, Math.max(pet.offsetWidth, pet.offsetHeight) * 1.35);
            pet.dataset.direction = target.x < origin.x ? 'left' : 'right';
            const style = getComputedStyle(room);
            duration = Math.max(parseFloat(style.getPropertyValue('--pet-walk-min')) || 2500, Math.abs(target.x - origin.x) * (parseFloat(style.getPropertyValue('--pet-walk-speed')) || 35));
        }
    }
    function tick(now) {
        const delta = last ? Math.min(now - last, 80) : 0; last = now;
        if (document.hidden || !visible) { frame = null; return; }
        if (!reduced()) {
            if (lookUntil > now) { frame = requestAnimationFrame(tick); return; }
            if (lookUntil) { lookUntil = 0; setState('walk'); }
            elapsed += delta;
            if (state === 'walk') {
                const progress = Math.min(1, elapsed / duration), t = ease(progress);
                position = { x: origin.x + (target.x - origin.x) * t, y: origin.y + (target.y - origin.y) * t, depth: origin.depth + (target.depth - origin.depth) * t };
                paint();
                if (!didLook && progress > .45 && Math.random() < .015) { didLook = true; lookUntil = now + 1000; room.dataset.petState = 'look-around'; }
            }
            if (elapsed >= duration) {
                const inspectToy = state === 'walk' && target.x > room.clientWidth * .12 && !nearToy;
                nearToy = inspectToy;
                const next = interrupted || (inspectToy ? 'sniff' : nextState(state)); interrupted = null; enter(next);
            }
        } else if (state !== 'idle-sit') { enter('idle-sit'); }
        frame = requestAnimationFrame(tick);
    }
    function resume() { if (!frame && visible && !document.hidden) { last = 0; frame = requestAnimationFrame(tick); } }
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; room.dataset.petPaused = String(!visible || document.hidden); resume(); });
    observer.observe(room);
    new ResizeObserver(() => {
        const limit = floorTarget(room.clientWidth, room.clientHeight, Math.max(pet.offsetWidth, pet.offsetHeight) * 1.35, () => 1);
        position.x = Math.max(-limit.x, Math.min(limit.x, position.x));
        position.y = Math.max(-limit.y, Math.min(limit.y, position.y));
        paint();
        if (state === 'walk') enter('look-around');
    }).observe(room);
    document.addEventListener('visibilitychange', () => { room.dataset.petPaused = String(document.hidden || !visible); resume(); });
    room.dataset.petState = state;
    return {
        react(action) { interrupted = nextState(state); lookUntil = 0; enter(action); duration = 3800; },
    };
}
