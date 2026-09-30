<?php

use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::patch('/tasks/{id}/complete', [TaskController::class, 'complete']);
Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);