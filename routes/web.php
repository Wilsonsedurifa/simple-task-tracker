<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
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
    Route::view('/continue', 'auth.continue')->name('continue');
    Route::post('/continue', fn () => redirect()->route('tasks'))->name('continue.store');
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
