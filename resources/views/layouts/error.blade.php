<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>@yield('title') | Simple Task Tracker</title>
<script>(()=>{let m='system';try{m=localStorage.getItem('task-tracker-theme')||m}catch{}document.documentElement.dataset.theme=m==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m})()</script>
<link rel="icon" href="data:,">
@vite('resources/css/tasks.css')
</head>
<body class="app-body app-error-page"><main class="panel app-error-card"><p class="eyebrow">SIMPLE TASK TRACKER</p>@yield('content')</main></body>
</html>
