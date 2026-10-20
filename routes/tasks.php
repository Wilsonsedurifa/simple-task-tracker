<?php

use App\Http\Controllers\PeopleSearchController;
use App\Http\Controllers\TaskCollaborationController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskInvitationController;
use Illuminate\Support\Facades\Route;

Route::get('/tasks', [TaskController::class, 'index']);
Route::get('/people', PeopleSearchController::class)->middleware('throttle:30,1');
Route::post('/tasks', [TaskController::class, 'store']);
Route::patch('/tasks/{task}', [TaskController::class, 'update']);
Route::patch('/tasks/{task}/complete', [TaskController::class, 'complete']);
Route::patch('/tasks/{task}/reopen', [TaskController::class, 'reopen']);
Route::delete('/tasks/completed', [TaskController::class, 'destroyCompleted']);
Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
Route::post('/tasks/{task}/invitations', [TaskCollaborationController::class, 'store']);
Route::get('/tasks/{task}/invitations', [TaskCollaborationController::class, 'pending']);
Route::get('/tasks/{task}/collaborators', [TaskCollaborationController::class, 'index']);
Route::delete('/tasks/{task}/collaborators/{user}', [TaskCollaborationController::class, 'destroy']);
Route::get('/invitations', [TaskInvitationController::class, 'index']);
Route::post('/invitations/{invitation}/accept', [TaskInvitationController::class, 'accept']);
Route::post('/invitations/{invitation}/decline', [TaskInvitationController::class, 'decline']);
