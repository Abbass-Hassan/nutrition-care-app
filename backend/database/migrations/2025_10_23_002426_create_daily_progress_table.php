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
        Schema::create('daily_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            
            // Calorie tracking
            $table->decimal('calories_consumed', 8, 2)->default(0);
            $table->decimal('calories_goal', 8, 2)->nullable();
            
            // Macros consumed (grams)
            $table->decimal('protein_consumed', 8, 2)->default(0);
            $table->decimal('carbs_consumed', 8, 2)->default(0);
            $table->decimal('fat_consumed', 8, 2)->default(0);
            
            // Macros goals (grams)
            $table->decimal('protein_goal', 8, 2)->nullable();
            $table->decimal('carbs_goal', 8, 2)->nullable();
            $table->decimal('fat_goal', 8, 2)->nullable();
            
            // Macros consumed (percentages)
            $table->decimal('protein_percentage', 5, 2)->default(0);
            $table->decimal('carbs_percentage', 5, 2)->default(0);
            $table->decimal('fat_percentage', 5, 2)->default(0);
            
            // Water tracking
            $table->integer('water_intake')->default(0); // in ml or glasses
            $table->integer('water_goal')->nullable();
            
            // Status indicators
            $table->enum('status', ['excellent', 'good', 'needs_attention', 'poor'])->default('good');
            $table->boolean('within_tolerance')->default(true);
            
            // Meal counts
            $table->integer('meals_logged')->default(0);
            
            $table->timestamps();
            
            // Ensure one entry per user per day
            $table->unique(['user_id', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_progress');
    }
};
