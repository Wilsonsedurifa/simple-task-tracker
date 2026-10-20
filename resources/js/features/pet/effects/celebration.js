import { appReadSettings, appReducedMotion } from '../../../shell/preferences.js';
import { appElement } from '../../../core/dom.js';
import { appPetArt } from '../art.js';

let timer;
export function showCelebration(current, reward) {
    document.querySelector('.pet-completion-card')?.remove(); clearTimeout(timer);
    const card = appElement('aside', 'pet-completion-card');
    card.setAttribute('role', 'status'); card.setAttribute('aria-live', 'polite');
    if (appReducedMotion() || appReadSettings().reducePetMotion) card.classList.add('pet-completion-static');
    const art = appElement('div', 'pet-completion-art'); art.append(appPetArt(current.species, current.level, 'happy'));
    const copy = appElement('div', 'pet-completion-copy');
    copy.append(appElement('strong', '', reward.leveled_up ? current.name + ' leveled up!' : 'Nice work!'), appElement('p', '', '+' + reward.xp_gained + ' XP · ' + current.name + ' is cheering you on.'));
    const close = appElement('button', 'pet-completion-close', '×');
    close.type = 'button'; close.setAttribute('aria-label', 'Dismiss pet celebration'); close.addEventListener('click', () => card.remove());
    card.append(art, copy, close); document.body.append(card); timer = setTimeout(() => card.remove(), 5500);
}
