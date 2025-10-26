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
        Schema::create('blood_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('test_date');
            $table->decimal('hba1c', 5, 2)->nullable();
            $table->decimal('ldl', 5, 2)->nullable();
            $table->decimal('hdl', 5, 2)->nullable();
            $table->decimal('total_cholesterol', 5, 2)->nullable();
            $table->decimal('fasting_blood_sugar', 5, 2)->nullable();
            $table->decimal('triglycerides', 5, 2)->nullable();
            $table->string('blood_test_photo_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blood_tests');
    }
};