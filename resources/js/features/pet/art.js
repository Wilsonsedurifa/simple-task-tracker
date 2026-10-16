// pet/art: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appSvgElement as appPetShape } from '../../core/dom.js';
// Original geometric artwork. One rig per species; level/mood classes swap
// posture, face, proportions and accessories without loading images or fonts.
export function appPetArt(species, level = 1, mood = 'idle') {
    const svg = appPetShape('svg', { viewBox: '0 0 200 190', 'aria-hidden': 'true', focusable: 'false', class: 'app-pet-art', 'data-species': species, 'data-level': level, 'data-mood': mood });
    svg.style.setProperty('--pet-art-scale', String(0.6 + (Math.max(1, Math.min(7, level)) - 1) * 0.7 / 6));
    const add = (tag, attrs) => { const node = appPetShape(tag, attrs); svg.append(node); return node; };
    if (species === 'dragon') {
        add('path', { d: 'M60 115 12 65 20 135 65 145 M140 115 188 65 180 135 135 145', class: 'app-pet-wings' });
        add('path', { d: 'm70 52 7-34 15 29 m16 0 15-29 7 34', class: 'app-pet-accessory' });
    }
    add('path', { d: species === 'fox' ? 'M140 139Q195 103 182 146Q173 178 135 166' : species === 'cat' ? 'M140 152Q191 153 174 111' : species === 'dog' ? 'M141 149Q178 113 181 135' : 'M141 143Q170 137 163 159Q153 173 136 164', class: 'app-pet-tail' });
    add('ellipse', { cx: 100, cy: 137, rx: 49, ry: 41, class: 'app-pet-body' });
    add('ellipse', { cx: 100, cy: 141, rx: 28, ry: 25, class: 'app-pet-belly' });
    add('ellipse', { cx: 68, cy: 171, rx: 19, ry: 10, class: 'app-pet-body' });
    add('ellipse', { cx: 132, cy: 171, rx: 19, ry: 10, class: 'app-pet-body' });
    const ears = species === 'bunny' ? ['M65 70Q35-10 64 8Q85 15 83 67', 'M117 67Q115 15 136 8Q165-10 135 70']
        : species === 'dog' ? ['M60 55Q18 43 32 105Q40 118 67 77', 'M140 55Q182 43 168 105Q160 118 133 77']
        : species === 'panda' ? ['M66 65A22 22 0 1 1 83 45', 'M117 45A22 22 0 1 1 134 65']
        : ['M58 73 45 16 87 52', 'M113 52 155 16 142 73'];
    for (const [index, d] of ears.entries()) add('path', { d, class: 'app-pet-ear app-pet-ear-' + index });
    add('ellipse', { cx: 100, cy: 85, rx: 56, ry: 45, class: 'app-pet-head' });
    if (species === 'fox' || species === 'panda') add('path', { d: 'M45 82Q65 108 100 102Q135 108 155 82Q143 133 100 130Q57 133 45 82', class: 'app-pet-belly' });
    if (species === 'panda') for (const cx of [77, 123]) add('ellipse', { cx, cy: 82, rx: 15, ry: 18, class: 'app-pet-patch' });
    for (const cx of [78, 122]) {
        add('ellipse', { cx, cy: 83, rx: 5, ry: 7, class: 'app-pet-eye' });
        add('path', { d: `M${cx - 7} 85q7-7 14 0`, class: 'app-pet-closed-eye' });
    }
    add('path', { d: 'M95 94Q100 91 105 94L100 100Z', class: 'app-pet-nose' });
    add('path', { d: 'M89 105q11 12 22 0', class: 'app-pet-mouth' });
    add('path', { d: 'M89 114q11-12 22 0', class: 'app-pet-frown' });
    add('path', { d: 'M134 94q-12 17 0 17q12 0 0-17', class: 'app-pet-tear' });
    add('path', { d: 'M63 123Q100 139 137 123L133 141Q100 151 67 141Z M117 139l13 24 13-9-14-20', class: 'app-pet-scarf' });
    add('circle', { cx: 100, cy: 139, r: 9, class: 'app-pet-bell' });
    add('path', { d: 'm72 40-5-28 22 14 11-23 11 23 22-14-5 28Z', class: 'app-pet-crown' });
    return svg;
}
