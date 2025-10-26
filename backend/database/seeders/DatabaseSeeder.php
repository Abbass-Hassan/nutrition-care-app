<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a dietitian user
        $dietitian = User::create([
            'name' => 'Dr. Sarah Johnson',
            'email' => 'sarah@dietitian.com',
            'username' => 'sarah_dietitian',
            'password' => bcrypt('password123'),
            'user_type' => 'dietitian',
        ]);

        // Create a client user
        $client = User::create([
            'name' => 'John Client',
            'email' => 'john@client.com',
            'username' => 'john_client',
            'password' => bcrypt('password123'),
            'user_type' => 'client',
            'dietitian_id' => $dietitian->id,
        ]);

        // Seed foods for the dietitian
        $this->call(FoodSeeder::class);
    }
}
