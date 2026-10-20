import { appSvgElement as shape } from '../../../core/dom.js';

export function sidePose() {
    const rig = shape('g', { class: 'pet-side-pose' });
    const body = shape('g', { class: 'pet-side-body' });
    const add = (parent, tag, attrs) => { const node = shape(tag, attrs); parent.append(node); return node; };
    add(body, 'path', { d: 'M53 123Q15 126 24 86Q29 65 35 84Q24 108 58 104', class: 'pet-side-tail pet-outline' });
    for (const [x, pair] of [[66, 'b'], [130, 'a']]) {
        const leg = add(body, 'g', { class: 'pet-leg pet-leg-far pet-pair-' + pair });
        leg.style.setProperty('--hip-x', x + 'px');
        add(leg, 'path', { d: `M${x} 128q-6 21 0 39h15q5-5-6-9l5-30Z`, class: 'pet-outline' });
    }
    add(body, 'ellipse', { cx: 96, cy: 125, rx: 54, ry: 31, class: 'pet-outline' });
    add(body, 'ellipse', { cx: 107, cy: 137, rx: 32, ry: 16, class: 'app-pet-belly' });
    for (const [x, pair] of [[61, 'a'], [129, 'b']]) {
        const leg = add(body, 'g', { class: 'pet-leg pet-pair-' + pair });
        leg.style.setProperty('--hip-x', x + 'px');
        add(leg, 'path', { d: `M${x} 127q-5 22 2 42h17q5-6-7-10l3-32Z`, class: 'pet-outline' });
    }
    const head = add(body, 'g', { class: 'pet-side-head' });
    add(head, 'path', { d: 'M117 81 112 37 140 62 155 39 165 87', class: 'pet-side-ears pet-outline' });
    add(head, 'path', { d: 'M113 78q3-21 28-21 32 0 35 27l12 12q3 8-12 10-8 24-36 19-29-5-27-47Z', class: 'pet-outline' });
    add(head, 'ellipse', { cx: 165, cy: 103, rx: 16, ry: 12, class: 'app-pet-belly' });
    add(head, 'ellipse', { cx: 156, cy: 84, rx: 4, ry: 5, class: 'app-pet-eye' });
    add(head, 'path', { d: 'm178 93 8 1-6 5Z', class: 'app-pet-nose' });
    add(head, 'path', { d: 'M163 105q7 5 11-1', class: 'app-pet-mouth' });
    rig.append(body);
    return rig;
}
