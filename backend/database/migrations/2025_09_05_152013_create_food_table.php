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
        Schema::create('foods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dietitian_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('category');
            $table->string('default_serving');
            $table->integer('calories');
            $table->float('carbs')->default(0);
            $table->float('protein')->default(0);
            $table->float('fat')->default(0);
            $table->string('photo_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure unique food names per dietitian
            $table->unique(['dietitian_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('foods');
    }
};
