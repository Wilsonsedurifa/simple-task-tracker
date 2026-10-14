<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Task Tracker: a task list that sorts itself</title>
    <meta name="description" content="High priority first, then medium, then low. Oldest first when priorities match.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    @vite(['resources/css/base.css', 'resources/css/landing.css', 'resources/js/landing.js'])
</head>
<body>
    <header class="nav"><div class="wrap"><a href="{{ route('landing') }}" class="brand">Task Tracker</a><nav class="nav__links" aria-label="Primary navigation"><a href="#sorting">Sorting</a><a href="#how">How to use</a><a href="#api">API</a><a href="#faq">FAQ</a>@guest<a href="{{ route('login') }}">Log in</a>@endguest<a href="{{ auth()->check() && auth()->user()->hasVerifiedEmail() ? route('tasks') : route('login') }}" class="btn btn--sm">Open app</a></nav></div></header>
    <main>
        <section class="hero"><div class="wrap"><div><span class="eyebrow">A considered task list</span><h1>A task list that <em>sorts itself.</em></h1><p class="lead">High priority comes first, then Medium, then Low. When tasks match, the oldest one stays ahead. Nothing to drag, nothing to reorder.</p><div class="hero__cta"><a href="{{ route('tasks') }}" class="btn">Open your list</a><a href="#sorting" class="link">See the rule <span aria-hidden="true">&rarr;</span></a></div><div class="stack"><span>Laravel</span><span>MySQL</span><span>Vanilla JS</span><span>PHPUnit</span></div></div>
            <div class="app" id="demo"><div class="app__top"><b>Today</b><span id="count"></span></div><div class="app__body"><aside class="app__side"><p class="lbl">Filter</p><button class="chip is-on" type="button" data-f="all">All <i id="c-all"></i></button><button class="chip" type="button" data-f="high">High <i id="c-high"></i></button><button class="chip" type="button" data-f="medium">Medium <i id="c-medium"></i></button><button class="chip" type="button" data-f="low">Low <i id="c-low"></i></button><form id="add"><p class="lbl">New task</p><input id="title" placeholder="Prepare project handoff" aria-label="Task title"><select id="prio" aria-label="Priority"><option value="medium">Medium</option><option value="high">High</option><option value="low">Low</option></select><button class="btn" type="submit">Add task</button></form></aside><ul id="list" aria-label="Demo tasks"></ul></div></div>
        </div></section>
        <section class="section" id="sorting"><div class="wrap split"><div><span class="eyebrow">The sorting rule</span><h2>Important first. <em>No rearranging.</em></h2><p>Every task has a priority and a creation date. The list is ordered by those two things, every time, on the server, so it looks the same wherever you open it.</p><div class="rule"><b>1</b><p>Higher priority always goes first.</p></div><div class="rule"><b>2</b><p>Same priority? The task that has waited longest goes first.</p></div></div><div class="compare" aria-hidden="true"><div><p class="lbl">Before</p><ul><li>Archive notes <span class="pill p-low">Low</span></li><li>Weekly update <span class="pill p-medium">Medium</span></li><li>Fix checkout <span class="pill p-high">High</span></li><li>Review handoff <span class="pill p-medium">Medium</span></li></ul></div><div class="arrow">&rarr;</div><div class="after"><p class="lbl">Sorted</p><ul><li><span>Fix checkout</span><span class="pill p-high">High</span></li><li><span>Weekly update</span><span class="pill p-medium">Medium</span></li><li><span>Review handoff</span><span class="pill p-medium">Medium</span></li><li><span>Archive notes</span><span class="pill p-low">Low</span></li></ul></div></div></div></section>
        <section class="section" id="how"><div class="wrap split"><div class="sticky"><span class="eyebrow">How to use it</span><h2>Four steps. <em>That's all.</em></h2></div><ol class="steps"><li><div><h3>Add a task</h3><p>Type a title, pick High, Medium or Low, and press Add task. A title is required.</p></div></li><li><div><h3>Read the list</h3><p>Your task lands in the right spot automatically. The top of the list is what to do next.</p></div></li><li><div><h3>Filter when you need focus</h3><p>Choose a priority in the sidebar to see only those tasks. Pick All to bring everything back.</p></div></li><li><div><h3>Complete or delete</h3><p>Tick the circle when a task is done. Delete it when it no longer matters.</p></div></li></ol></div></section>
        <section class="section" id="api"><div class="wrap"><span class="eyebrow">Under the hood</span><h2 class="api-title">A small, honest <em>REST API.</em></h2><div class="code"><div><span>Method</span><span>Endpoint</span><span>What it does</span><span>Errors</span></div><div><span class="m m-get">GET</span><span>/api/tasks</span><span>List tasks, sorted</span><span>none</span></div><div><span class="m m-post">POST</span><span>/api/tasks</span><span>Create a task</span><span>400</span></div><div><span class="m m-patch">PATCH</span><span>/api/tasks/{id}/complete</span><span>Mark as complete</span><span>404</span></div><div><span class="m m-del">DELETE</span><span>/api/tasks/{id}</span><span>Remove a task</span><span>404</span></div></div></div></section>
        <section class="section" id="faq">
            <div class="wrap split">
                <div><span class="eyebrow">FAQ</span><h2>Good <em>questions.</em></h2></div>
                <div class="faq">
                    <details><summary>What if I add a task with no title?</summary><p>A title is required. The app shows the validation message and the API returns <code>400</code>; no empty task is saved.</p></details>
                    <details><summary>Can I change a priority later?</summary><p>Yes. Choose Edit on the task, select High, Medium, or Low, then save the change. The list updates to its new sorted position.</p></details>
                    <details><summary>What happens with a task that does not exist?</summary><p>Editing, completing, or deleting a task that is missing—or belongs to someone else—returns <code>404</code>.</p></details>
                    <details><summary>Where is my data kept?</summary><p>Your tasks are stored in MySQL and are private to your signed-in account.</p></details>
                </div>
            </div>
        </section>
        <div class="wrap" id="cta"><div class="cta"><div><h2>Put the right task <em>on top.</em></h2><p>Add your first task in under ten seconds.</p></div><a href="{{ route('tasks') }}" class="btn">Open your list</a></div></div>
    </main>
    <footer class="wrap foot"><span>Task Tracker</span><span>Built with Laravel and MySQL</span></footer>
</body>
</html>
