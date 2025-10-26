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
        Schema::create('measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('measurement_date');
            $table->decimal('weight', 5, 2)->nullable(); // kg
            $table->decimal('body_fat_percentage', 5, 2)->nullable();
            $table->decimal('muscle_percentage', 5, 2)->nullable();
            $table->json('other_composition')->nullable(); // Flexible JSON for additional metrics
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('measurements');
    }
};