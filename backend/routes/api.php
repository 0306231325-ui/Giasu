<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BannerController;

Route::get('/test-db', function () {
    return DB::select("SHOW TABLES");
});

Route::get('/test', function () {
    return response()->json([
        'message' => 'Laravel API ok'
    ]);
});



Route::get('/banner', [BannerController::class, 'index']);