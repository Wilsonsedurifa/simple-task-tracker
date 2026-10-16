<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\PetController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

Route::get('/', fn () => auth()->check() ? redirect()->route('dashboard') : view('landing'))->name('landing');
Route::view('/welcome', 'landing')->name('welcome');
Route::get('/session-expired', fn () => response()->view('errors.419', [], 419))->name('session.expired');

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');

    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->name('register.store');

    Route::get('/auth/google/login', [GoogleAuthController::class, 'redirectToLogin'])->name('auth.google.login');
    Route::get('/auth/google/register', [GoogleAuthController::class, 'redirectToRegister'])->name('auth.google.register');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->middleware('throttle:10,1')->name('auth.google.callback');
});

Route::middleware('auth')->group(function () {
    Route::view('/continue', 'auth.continue')->name('continue');
    Route::post('/continue', function (Request $request) {
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
        Route::get('/pet', [PetController::class, 'show']);
        Route::post('/pet', [PetController::class, 'store']);
        Route::patch('/pet', [PetController::class, 'update']);
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::patch('/tasks/{task}', [TaskController::class, 'update']);
        Route::patch('/tasks/{task}/complete', [TaskController::class, 'complete']);
        Route::patch('/tasks/{task}/reopen', [TaskController::class, 'reopen']);
        Route::delete('/tasks/completed', [TaskController::class, 'destroyCompleted']);
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
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
