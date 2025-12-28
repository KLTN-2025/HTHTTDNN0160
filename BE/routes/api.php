<?php

use App\Http\Controllers\AuthClientController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RoomController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('rooms', RoomController::class);
    Route::apiResource('meetings', MeetingController::class)->except("show");
    Route::post('meetings-now', [MeetingController::class, 'createNowMeeting']);
});


Route::post('/login', [AuthClientController::class, 'login']);
Route::post('/register', [AuthClientController::class, 'register']);
