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
        Schema::create('nutrition_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('daily_calorie_target')->nullable(); // kcal
            $table->decimal('carbs_target', 5, 2)->nullable(); // grams
            $table->decimal('carbs_percentage', 5, 2)->nullable(); // %
            $table->decimal('protein_target', 5, 2)->nullable(); // grams
            $table->decimal('protein_percentage', 5, 2)->nullable(); // %
            $table->decimal('fat_target', 5, 2)->nullable(); // grams
            $table->decimal('fat_percentage', 5, 2)->nullable(); // %
            $table->integer('tolerance_band')->default(10); // ±10%
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nutrition_targets');
    }
};