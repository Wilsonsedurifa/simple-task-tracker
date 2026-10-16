<?php

use App\Http\Controllers\PetController;
use Illuminate\Support\Facades\Route;

Route::get('/pet', [PetController::class, 'show']);
Route::post('/pet', [PetController::class, 'store']);
Route::patch('/pet', [PetController::class, 'update']);
