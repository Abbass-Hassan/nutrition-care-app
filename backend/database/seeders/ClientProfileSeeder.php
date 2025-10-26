<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ClientProfile;
use App\Models\NutritionTarget;
use App\Models\Measurement;
use App\Models\BloodTest;
use Illuminate\Database\Seeder;

class ClientProfileSeeder extends Seeder
{
    public function run(): void
    {
        // Find the existing client
        $client = User::where('email', 'john@client.com')->first();
        
        if (!$client) {
            $this->command->error('Client john@client.com not found. Please run DatabaseSeeder first.');
            return;
        }

        // Create comprehensive client profile
        ClientProfile::create([
            'user_id' => $client->id,
            'age' => 28,
            'gender' => 'male',
            'height' => 175.5,
            'weight' => 78.2,
            'goal' => 'lose_weight',
            'health_conditions' => ['diabetes', 'high_bp'],
            'allergies' => 'Peanuts, Shellfish',
            'dietary_history' => 'Previously followed keto diet for 6 months. Prefers Mediterranean cuisine.',
            'body_goal_questions' => 'Want to lose 10kg and improve muscle definition. Focus on sustainable weight loss.',
            'appetite_level' => 'medium',
        ]);

        // Create nutrition targets
        NutritionTarget::create([
            'user_id' => $client->id,
            'daily_calorie_target' => 1800,
            'carbs_target' => 180,
            'carbs_percentage' => 40,
            'protein_target' => 135,
            'protein_percentage' => 30,
            'fat_target' => 60,
            'fat_percentage' => 30,
            'tolerance_band' => 10,
            'notes' => 'Targets set for sustainable weight loss with focus on protein for muscle preservation.',
            'is_active' => true,
        ]);

        // Create initial measurement
        Measurement::create([
            'user_id' => $client->id,
            'measurement_date' => now(),
            'weight' => 78.2,
            'body_fat_percentage' => 18.5,
            'muscle_percentage' => 45.2,
            'other_composition' => [
                'water_percentage' => 62.3,
                'bone_density' => 'Normal',
                'visceral_fat' => 8.2
            ],
        ]);

        // Create blood test
        BloodTest::create([
            'user_id' => $client->id,
            'test_date' => now()->subDays(30),
            'hba1c' => 5.8,
            'ldl' => 120,
            'hdl' => 45,
            'total_cholesterol' => 195,
            'fasting_blood_sugar' => 95,
            'triglycerides' => 150,
            'notes' => 'Recent blood work shows good control. Monitor HbA1c closely.',
        ]);

        $this->command->info('Client profile seeded successfully for: ' . $client->name);
    }
}