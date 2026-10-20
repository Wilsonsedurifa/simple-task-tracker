import { appSvgElement } from '../../../core/dom.js';

export function frontPose(svg) {
    const group = appSvgElement('g', { class: 'pet-front-pose' });
    group.append(...svg.childNodes);
    return group;
}
