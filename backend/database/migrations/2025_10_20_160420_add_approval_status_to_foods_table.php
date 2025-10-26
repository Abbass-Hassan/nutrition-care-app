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
        Schema::table('foods', function (Blueprint $table) {
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('approved')->after('dietitian_id');
            $table->foreignId('created_by_client_id')->nullable()->constrained('users')->cascadeOnDelete()->after('approval_status');
            $table->text('rejection_reason')->nullable()->after('created_by_client_id');
            $table->timestamp('approved_at')->nullable()->after('rejection_reason');
            $table->foreignId('approved_by_dietitian_id')->nullable()->constrained('users')->cascadeOnDelete()->after('approved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('foods', function (Blueprint $table) {
            $table->dropForeign(['created_by_client_id']);
            $table->dropForeign(['approved_by_dietitian_id']);
            $table->dropColumn(['approval_status', 'created_by_client_id', 'rejection_reason', 'approved_at', 'approved_by_dietitian_id']);
        });
    }
};
