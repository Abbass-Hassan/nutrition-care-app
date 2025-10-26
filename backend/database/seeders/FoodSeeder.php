<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Food;
use App\Models\User;

class FoodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get Dr. Sarah Johnson specifically
        $dietitian = User::where('email', 'sarah@dietitian.com')->first();
        
        if (!$dietitian) {
            $this->command->error('Dr. Sarah Johnson not found. Please run DatabaseSeeder first.');
            return;
        }

        $foods = [
            [
                'name' => 'Grilled Chicken Breast',
                'category' => 'Protein',
                'default_serving' => '100g',
                'calories' => 165,
                'carbs' => 0,
                'protein' => 31,
                'fat' => 3.6,
                'notes' => 'Lean protein source, perfect for muscle building'
            ],
            [
                'name' => 'Brown Rice',
                'category' => 'Grains',
                'default_serving' => '1 cup (195g)',
                'calories' => 216,
                'carbs' => 45,
                'protein' => 5,
                'fat' => 1.8,
                'notes' => 'Complex carbohydrate, high in fiber'
            ],
            [
                'name' => 'Avocado',
                'category' => 'Healthy Fats',
                'default_serving' => '1 medium (150g)',
                'calories' => 240,
                'carbs' => 13,
                'protein' => 3,
                'fat' => 22,
                'notes' => 'Rich in monounsaturated fats and potassium'
            ],
            [
                'name' => 'Greek Yogurt',
                'category' => 'Dairy',
                'default_serving' => '1 cup (170g)',
                'calories' => 100,
                'carbs' => 6,
                'protein' => 17,
                'fat' => 0,
                'notes' => 'High protein, probiotic-rich dairy product'
            ],
            [
                'name' => 'Salmon Fillet',
                'category' => 'Protein',
                'default_serving' => '100g',
                'calories' => 208,
                'carbs' => 0,
                'protein' => 25,
                'fat' => 12,
                'notes' => 'Rich in omega-3 fatty acids'
            ],
            [
                'name' => 'Sweet Potato',
                'category' => 'Vegetables',
                'default_serving' => '1 medium (130g)',
                'calories' => 112,
                'carbs' => 26,
                'protein' => 2,
                'fat' => 0.1,
                'notes' => 'High in beta-carotene and fiber'
            ],
            [
                'name' => 'Quinoa',
                'category' => 'Grains',
                'default_serving' => '1 cup (185g)',
                'calories' => 222,
                'carbs' => 39,
                'protein' => 8,
                'fat' => 3.6,
                'notes' => 'Complete protein grain, gluten-free'
            ],
            [
                'name' => 'Almonds',
                'category' => 'Nuts',
                'default_serving' => '1 oz (28g)',
                'calories' => 164,
                'carbs' => 6,
                'protein' => 6,
                'fat' => 14,
                'notes' => 'Rich in vitamin E and healthy fats'
            ],
            [
                'name' => 'Spinach',
                'category' => 'Vegetables',
                'default_serving' => '1 cup (30g)',
                'calories' => 7,
                'carbs' => 1,
                'protein' => 1,
                'fat' => 0.1,
                'notes' => 'Iron-rich leafy green vegetable'
            ],
            [
                'name' => 'Eggs',
                'category' => 'Protein',
                'default_serving' => '2 large eggs',
                'calories' => 140,
                'carbs' => 1,
                'protein' => 12,
                'fat' => 10,
                'notes' => 'Complete protein with all essential amino acids'
            ],
            [
                'name' => 'Oatmeal',
                'category' => 'Grains',
                'default_serving' => '1/2 cup dry (40g)',
                'calories' => 150,
                'carbs' => 27,
                'protein' => 5,
                'fat' => 3,
                'notes' => 'High fiber, helps with cholesterol management'
            ],
            [
                'name' => 'Banana',
                'category' => 'Fruits',
                'default_serving' => '1 medium (118g)',
                'calories' => 105,
                'carbs' => 27,
                'protein' => 1.3,
                'fat' => 0.4,
                'notes' => 'Rich in potassium and natural sugars'
            ]
        ];

        foreach ($foods as $foodData) {
            Food::create(array_merge($foodData, ['dietitian_id' => $dietitian->id]));
        }

        $this->command->info('Food seeder completed successfully! Created ' . count($foods) . ' foods for dietitian: ' . $dietitian->name);
    }
}
