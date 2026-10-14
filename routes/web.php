<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

Route::view('/', 'landing')->name('landing');

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
    Route::get('/email/verify', [EmailVerificationController::class, 'notice'])->name('verification.notice');
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware('throttle:6,1')
        ->name('verification.verify');
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'send'])
        ->middleware('throttle:3,1')
        ->name('verification.send');
    Route::get('/email/status', [EmailVerificationController::class, 'status'])->name('verification.status');
    Route::post('/email/start-over', [EmailVerificationController::class, 'restart'])->name('verification.restart');

    Route::middleware('verified')->group(function () {
    Route::get('/tasks', fn () => view('tasks.index'))->name('tasks');

    Route::prefix('api')->group(function () {
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::patch('/tasks/{task}', [TaskController::class, 'update']);
        Route::patch('/tasks/{task}/complete', [TaskController::class, 'complete']);
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    });

    Route::post('/logout', function (Request $request) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    })->name('logout');
    });
});
