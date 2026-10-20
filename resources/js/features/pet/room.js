import { appReadSettings, appReducedMotion } from '../../shell/preferences.js';
import { appElement } from '../../core/dom.js';
import { createBehavior } from './behavior/movement.js';
import { wireReactions } from './behavior/reactions.js';
import { showCelebration } from './effects/celebration.js';
import { hearts, clearParticles } from './effects/particles.js';

let pet = null;
const behaviors = new Map();

export function renderPetRoom(current) {
    pet = current;
    document.querySelectorAll('[data-pet-next-milestone]').forEach(node => {
        node.textContent = current.xp_for_next === null ? 'Legend reached. Your adventure continues!' : Math.max(0, current.xp_for_next - current.xp_into_level) + ' XP to your next stage';
    });
}

export function initPetRoom() {
    document.querySelectorAll('[data-app-pet-room]').forEach(room => {
        const behavior = createBehavior(room, () => appReducedMotion() || appReadSettings().reducePetMotion);
        behaviors.set(room, behavior);
        for (const [className, text] of [['pet-room-toy', '●'], ['pet-room-zzz', 'z z z'], ['pet-room-dust', ''], ['pet-room-cloud', '']]) {
            const element = appElement('span', className, text); element.setAttribute('aria-hidden', 'true'); room.append(element);
        }
        wireReactions(room, behavior, () => Boolean(pet));
    });
}

export function celebratePetTask(current, reward) {
    if (!appReadSettings().showPet || reward.xp_gained <= 0) return;
    behaviors.forEach((behavior, room) => { behavior.react('celebrate'); hearts(room); setTimeout(() => clearParticles(room), 4000); });
    showCelebration(current, reward);
}
