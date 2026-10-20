import { appRequest } from '../core/api.js';
import { appElement } from '../core/dom.js';

export function initPeopleSearch(input, container) {
    let selected = null, timer, version = 0;
    input.addEventListener('input', () => {
        selected = null;
        clearTimeout(timer);
        const current = ++version, query = input.value.trim();
        container.replaceChildren();
        if (query.length < 2) return;
        container.textContent = 'Searching…';
        timer = setTimeout(async () => {
            try {
                const people = await appRequest('/api/people?q=' + encodeURIComponent(query));
                if (version !== current) return;
                container.replaceChildren();
                if (!people.length) container.textContent = 'No matching people.';
                people.forEach(person => {
                    const button = appElement('button', 'app-person-result', person.name + ' · @' + person.username);
                    button.type = 'button';
                    button.addEventListener('click', () => { selected = person; input.value = '@' + person.username; container.replaceChildren(appElement('p', 'app-person-selected', 'Selected: ' + person.name + ' · @' + person.username)); });
                    container.append(button);
                });
            } catch (error) { if (current === version) container.textContent = error.message; }
        }, 250);
    });
    return { value: () => selected, reset: () => { ++version; clearTimeout(timer); selected = null; input.value = ''; container.replaceChildren(); } };
}
