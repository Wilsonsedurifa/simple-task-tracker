import { appElement } from '../../../core/dom.js';
import { hearts, clearParticles } from '../effects/particles.js';

const lines = {
    pet: ['That is the spot. Thank you!', 'A little kindness goes a long way.', 'Best teammate ever.'],
    treat: ['A tiny snack for a big adventure!', 'Delicious. You have excellent taste.', 'Snack break? Always a good idea.'],
    play: ['Catch me if you can!', 'One little victory dance!', 'Your turn. High five!'],
};

export function wireReactions(room, behavior, hasPet) {
    let last = 0, timer;
    const widget = room.closest('[data-app-pet-widget]');
    function react(action) {
        if (!hasPet() || Date.now() - last < 1200) return;
        last = Date.now(); clearTimeout(timer);
        room.querySelector('.pet-room-bubble')?.remove();
        const choices = lines[action], message = choices[Math.floor(Math.random() * choices.length)];
        const speech = widget.querySelector('[data-app-pet-speech]');
        speech.textContent = message; speech.setAttribute('aria-live', 'polite');
        const bubble = appElement('span', 'pet-room-bubble', message);
        bubble.setAttribute('aria-hidden', 'true'); room.append(bubble);
        behavior.react(action === 'play' ? 'play-with-toy' : action === 'treat' ? 'eat' : 'jump');
        hearts(room);
        timer = setTimeout(() => { bubble.remove(); clearParticles(room); }, 4000);
    }
    room.querySelector('[data-app-pet-touch]').addEventListener('click', () => react('pet'));
    widget.querySelectorAll('[data-pet-interaction]').forEach(button => button.addEventListener('click', () => react(button.dataset.petInteraction)));
}
