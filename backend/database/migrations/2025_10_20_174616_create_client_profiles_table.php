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
        Schema::create('client_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('age')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->decimal('height', 5, 2)->nullable(); // cm
            $table->decimal('weight', 5, 2)->nullable(); // kg
            $table->enum('goal', ['lose_weight', 'maintain', 'gain_weight', 'gain_muscle'])->nullable();
            $table->json('health_conditions')->nullable(); // ['diabetes', 'high_bp', 'allergies', etc.]
            $table->text('allergies')->nullable();
            $table->text('dietary_history')->nullable();
            $table->text('body_goal_questions')->nullable();
            $table->enum('appetite_level', ['low', 'medium', 'high'])->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_profiles');
    }
};