<?php

use App\Http\Controllers\SettingsController;
use App\Http\Requests\ContinueRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => auth()->check() ? redirect()->route('dashboard') : view('landing'))->name('landing');
Route::view('/welcome', 'landing')->name('welcome');
Route::get('/session-expired', fn () => response()->view('errors.419', [], 419))->name('session.expired');

Route::middleware('guest')->group(function () {
    require __DIR__.'/auth.php';
});

Route::middleware('auth')->group(function () {
    Route::view('/continue', 'auth.continue')->name('continue');
    Route::post('/continue', function (ContinueRequest $request) {
        $request->user()->update($request->validated());
        $intended = $request->session()->pull('url.intended', route('dashboard'));
        $host = parse_url($intended, PHP_URL_HOST);
        if (($host && $host !== $request->getHost()) || str_starts_with($intended, '//')) {
            $intended = route('dashboard');
        }

        return redirect()->to($intended);
    })->name('continue.store');
    Route::get('/dashboard', fn () => view('tasks.dashboard'))->name('dashboard');
    Route::get('/tasks', fn () => view('tasks.index'))->name('tasks');
    Route::view('/calendar', 'tasks.calendar')->name('calendar');
    Route::view('/pet', 'tasks.pet')->name('pet');
    Route::view('/notifications', 'tasks.notifications')->name('notifications');
    Route::view('/settings', 'tasks.settings')->name('settings');
    Route::patch('/settings/profile', [SettingsController::class, 'profile'])->name('settings.profile');
    Route::put('/settings/password', [SettingsController::class, 'password'])->name('settings.password');

    Route::prefix('api')->group(function () {
        require __DIR__.'/pets.php';
        require __DIR__.'/tasks.php';
    });

    Route::post('/logout', function (Request $request) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    })->name('logout');
});

Route::fallback(function (Request $request) {
    if ($request->is('api/*') || $request->expectsJson()) {
        abort(404);
    }

    return response()->view('errors.404', [], 404);
});
