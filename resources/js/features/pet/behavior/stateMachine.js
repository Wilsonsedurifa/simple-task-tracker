export const states = {
    'idle-sit': 5, walk: 9, 'look-around': 3, sniff: 2, stretch: 2,
    yawn: 1, jump: 1, 'play-with-toy': 2, nap: 1, 'sit-and-groom': 2,
};

export function nextState(previous, random = Math.random) {
    const options = Object.entries(states).filter(([name]) => name !== previous);
    let choice = random() * options.reduce((sum, [, weight]) => sum + weight, 0);
    for (const [name, weight] of options) { choice -= weight; if (choice < 0) return name; }
    return options.at(-1)[0];
}

export function floorTarget(width, height, size, random = Math.random) {
    const margin = 12, half = size / 2;
    const range = Math.max(0, width / 2 - half - margin);
    return { x: (random() * 2 - 1) * range, y: Math.max(0, height * .055) * (random() * 2 - 1), depth: .9 + random() * .15 };
}

export function ease(value) { return value * value * (3 - 2 * value); }
