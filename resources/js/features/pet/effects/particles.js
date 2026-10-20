import { appElement } from '../../../core/dom.js';

export function clearParticles(room) {
    room.querySelectorAll('.pet-room-heart').forEach(node => node.remove());
}

export function hearts(room) {
    clearParticles(room);
    for (let index = 0; index < 5; index++) {
        const heart = appElement('span', 'pet-room-heart pet-room-heart-' + index, '♥');
        heart.setAttribute('aria-hidden', 'true'); room.append(heart);
    }
}
