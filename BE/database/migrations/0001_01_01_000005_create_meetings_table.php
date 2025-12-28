<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->nullable()->constrained('rooms')->cascadeOnDelete();
            $table->string('passcode', 255)->nullable();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('time_start')->nullable();
            $table->dateTime('time_end')->nullable();
            $table->boolean('is_waiting')->default(false);
            $table->boolean('is_user_allowed_pass_waiting')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};
