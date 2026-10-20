<dialog id="app-share-modal" class="modal app-share-modal" aria-labelledby="app-share-title">
    <form id="app-share-form" method="dialog" class="modal-body" novalidate>
        <div class="app-share-heading"><div><p class="app-drawer-eyebrow">Collaboration</p><h2 id="app-share-title">Share task</h2></div><button type="button" class="app-task-action" data-app-share-close aria-label="Close share dialog">×</button></div>
        <p id="app-share-error" class="alert alert-error" role="alert" hidden></p>
        <label class="field"><span class="label">Search people</span><input id="app-share-email" class="input" type="search" autocomplete="off" placeholder="Search by @username or exact email" aria-describedby="app-people-help"></label>
        <p id="app-people-help" class="field-hint">Type at least 2 characters, then select a person.</p>
        <div id="app-people-results" class="app-people-results" aria-live="polite"></div>
        <label class="field"><span class="label">Permission</span><select id="app-share-role" class="input"><option value="viewer">Can view</option><option value="editor">Can edit</option></select></label>
        <button class="button button-primary button-block" type="submit">Send invitation</button>
        <section class="app-collaborator-list" aria-labelledby="app-collaborators-title"><h3 id="app-collaborators-title">Collaborators</h3><div id="app-collaborators"></div></section>
        <section class="app-collaborator-list"><h3>Pending invitations</h3><div id="app-pending-invitations"></div></section>
    </form>
</dialog>
