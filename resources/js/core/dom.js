// Safe DOM and original shared SVG icon builders; no import-time DOM access.
export function appElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
}
export function appIcon(action) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'aria-hidden': 'true' })) svg.setAttribute(key, value);
    path.setAttribute('d', { edit: 'm4 16 12-12 4 4-12 12H4v-4 M14 6l4 4', delete: 'M4 6h16 M9 6V3h6v3 M6 6l1 15h10l1-15 M10 10v7 M14 10v7', move: 'M4 7h16 M16 3l4 4-4 4 M20 17H4 M8 13l-4 4 4 4', check: 'm5 12 4 4L19 6', reopen: 'M4 4v6h6 M4 10a8 8 0 1 1 0 5', calendar: 'M8 2v5 M16 2v5 M3 10h18 M5 5h14v16H5z', clock: 'M12 7v5l3 2 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18', alert: 'M12 8v5 M12 17h.01 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18' }[action] || 'M5 12h14');
    svg.append(path);
    return svg;
}
export const appGet = id => document.getElementById(id);
export function appSvgElement(tag, attrs = {}) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    return node;
}

export function appText(id, text) { const node = appGet(id); if (node) node.textContent = String(text); }
