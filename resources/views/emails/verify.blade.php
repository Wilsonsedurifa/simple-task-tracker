<!doctype html>
<html lang="en">
<body>
    <h1>Task Tracker</h1>
    <p>Hi {{ $user->name }},</p>
    <p>Please confirm your email address to finish setting up your task list.</p>
    <p><a href="{{ $url }}">Confirm my email</a></p>
    <p>If the button does not work, open this link: {{ $url }}</p>
    <p>This link expires in 60 minutes. If you did not sign up, you can ignore this email.</p>
</body>
</html>
