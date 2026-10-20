<?php

use App\Http\Controllers\Auth\GoogleRegistrationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\GoogleAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/login', [LoginController::class, 'create'])->name('login');
Route::post('/login', [LoginController::class, 'store'])->name('login.store');

Route::get('/register', [RegisterController::class, 'create'])->name('register');
Route::post('/register', [RegisterController::class, 'store'])->name('register.store');

Route::get('/auth/google/login', [GoogleAuthController::class, 'redirectToLogin'])->name('auth.google.login');
Route::get('/auth/google/register', [GoogleAuthController::class, 'redirectToRegister'])->name('auth.google.register');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->middleware('throttle:10,1')->name('auth.google.callback');
Route::get('/auth/google/confirm', [GoogleRegistrationController::class, 'create'])->name('auth.google.confirm');
Route::post('/auth/google/confirm', [GoogleRegistrationController::class, 'store'])->middleware('throttle:10,1')->name('auth.google.confirm.store');
