import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../../config';
import { colors } from '../../theme';
import Svg, { Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Circular Progress Component
const CircularProgress = ({ size = 120, strokeWidth = 12, progress = 0, color = colors.primary, backgroundColor = '#E8ECF1' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </G>
    </Svg>
  );
};

const HomeTab = () => {
  const [nutritionGoals, setNutritionGoals] = useState(null);
  const [loggedFoods, setLoggedFoods] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadNutritionGoals(),
        loadLoggedFoods(),
        loadWaterIntake()
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user-specific storage key
  const getUserStorageKey = async (baseKey) => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return `${baseKey}_${user.id}`;
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return baseKey; // Fallback to base key if user not found
  };

  const loadNutritionGoals = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/nutrition-goals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNutritionGoals(data.goals);
        }
      }
    } catch (error) {
      console.error('Error loading nutrition goals:', error);
    }
  };

  const loadLoggedFoods = async () => {
    try {
      const key = await getUserStorageKey('loggedFoods');
      const logged = await AsyncStorage.getItem(key);
      if (logged) {
        setLoggedFoods(JSON.parse(logged));
      }
    } catch (error) {
      console.error('Error loading logged foods:', error);
    }
  };

  const loadWaterIntake = async () => {
    try {
      const today = new Date().toDateString();
      const key = await getUserStorageKey('waterIntake');
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const waterData = JSON.parse(stored);
        setWaterIntake(waterData[today] || 0);
      }
    } catch (error) {
      console.error('Error loading water intake:', error);
    }
  };

  const addWaterGlass = async () => {
    const today = new Date().toDateString();
    const newAmount = waterIntake + 250; // 250ml per glass
    
    try {
      const key = await getUserStorageKey('waterIntake');
      const stored = await AsyncStorage.getItem(key);
      const waterData = stored ? JSON.parse(stored) : {};
      waterData[today] = newAmount;
      await AsyncStorage.setItem(key, JSON.stringify(waterData));
      setWaterIntake(newAmount);
    } catch (error) {
      console.error('Error saving water intake:', error);
    }
  };

  const formatDate = (date) => {
    return date.toDateString();
  };

  const getTodayCalories = () => {
    const today = new Date();
    const dateString = formatDate(today);
    const dateEntry = loggedFoods.find(entry => entry.date === dateString);
    if (!dateEntry || !dateEntry.meals) return 0;
    
    let total = 0;
    Object.values(dateEntry.meals).forEach(mealFoods => {
      mealFoods.forEach(food => {
        total += food.calories * food.quantity;
      });
    });
    return total;
  };

  const getTodayMacros = () => {
    const today = new Date();
    const dateString = formatDate(today);
    const dateEntry = loggedFoods.find(entry => entry.date === dateString);
    if (!dateEntry || !dateEntry.meals) return { protein: 0, carbs: 0, fat: 0 };
    
    let protein = 0, carbs = 0, fat = 0;
    Object.values(dateEntry.meals).forEach(mealFoods => {
      mealFoods.forEach(food => {
        protein += (food.protein || 0) * (food.quantity || 1);
        carbs += (food.carbs || 0) * (food.quantity || 1);
        fat += (food.fat || 0) * (food.quantity || 1);
      });
    });
    return { protein, carbs, fat };
  };

  const currentCalories = getTodayCalories();
  const calorieGoal = nutritionGoals?.daily_calorie_target || 2000;
  const calorieProgress = Math.min((currentCalories / calorieGoal) * 100, 100);
  const caloriesRemaining = Math.max(calorieGoal - currentCalories, 0);

  const macros = getTodayMacros();
  const proteinGoal = nutritionGoals?.protein_target_grams || 150;
  const carbsGoal = nutritionGoals?.carbs_target_grams || 200;
  const fatGoal = nutritionGoals?.fat_target_grams || 65;

  const proteinProgress = Math.min((macros.protein / proteinGoal) * 100, 100);
  const carbsProgress = Math.min((macros.carbs / carbsGoal) * 100, 100);
  const fatProgress = Math.min((macros.fat / fatGoal) * 100, 100);

  const waterGoal = 2500; // 2.5L in ml
  const waterProgress = Math.min((waterIntake / waterGoal) * 100, 100);
  const waterGlasses = Math.floor(waterIntake / 250);

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Today's Progress</Text>
      <Text style={styles.subtitle}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>

      {/* Calories Widget */}
      <View style={styles.widgetCard}>
        <View style={styles.widgetHeader}>
          <View style={styles.widgetTitleRow}>
            <Icon name="fire" size={24} color="#FF6B35" />
            <Text style={styles.widgetTitle}>Calories</Text>
          </View>
        </View>
        
        <View style={styles.circularProgressContainer}>
          <CircularProgress 
            size={140} 
            strokeWidth={14} 
            progress={calorieProgress} 
            color="#FF6B35"
          />
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressValue}>{currentCalories.toFixed(0)}</Text>
            <Text style={styles.progressSubtext}>of {calorieGoal}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{caloriesRemaining.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{calorieGoal}</Text>
            <Text style={styles.statLabel}>Goal</Text>
          </View>
        </View>
      </View>

      {/* Macros Widget */}
      <View style={styles.widgetCard}>
        <View style={styles.widgetHeader}>
          <View style={styles.widgetTitleRow}>
            <Icon name="nutrition" size={24} color={colors.primary} />
            <Text style={styles.widgetTitle}>Macronutrients</Text>
          </View>
        </View>

        <View style={styles.macrosContainer}>
          {/* Protein */}
          <View style={styles.macroItem}>
            <CircularProgress 
              size={90} 
              strokeWidth={10} 
              progress={proteinProgress} 
              color="#4CAF50"
            />
            <View style={styles.macroTextContainer}>
              <Text style={styles.macroValue}>{macros.protein.toFixed(0)}g</Text>
              <Text style={styles.macroGoal}>/ {proteinGoal}g</Text>
            </View>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>

          {/* Carbs */}
          <View style={styles.macroItem}>
            <CircularProgress 
              size={90} 
              strokeWidth={10} 
              progress={carbsProgress} 
              color="#2196F3"
            />
            <View style={styles.macroTextContainer}>
              <Text style={styles.macroValue}>{macros.carbs.toFixed(0)}g</Text>
              <Text style={styles.macroGoal}>/ {carbsGoal}g</Text>
            </View>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>

          {/* Fat */}
          <View style={styles.macroItem}>
            <CircularProgress 
              size={90} 
              strokeWidth={10} 
              progress={fatProgress} 
              color="#FF9800"
            />
            <View style={styles.macroTextContainer}>
              <Text style={styles.macroValue}>{macros.fat.toFixed(0)}g</Text>
              <Text style={styles.macroGoal}>/ {fatGoal}g</Text>
            </View>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
      </View>

      {/* Water Intake Widget */}
      <View style={styles.widgetCard}>
        <View style={styles.widgetHeader}>
          <View style={styles.widgetTitleRow}>
            <Icon name="water" size={24} color="#03A9F4" />
            <Text style={styles.widgetTitle}>Water Intake</Text>
          </View>
        </View>

        <View style={styles.waterContainer}>
          <View style={styles.waterProgressSection}>
            <CircularProgress 
              size={140} 
              strokeWidth={14} 
              progress={waterProgress} 
              color="#03A9F4"
            />
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressValue}>{(waterIntake / 1000).toFixed(1)}L</Text>
              <Text style={styles.progressSubtext}>of {(waterGoal / 1000).toFixed(1)}L</Text>
            </View>
          </View>

          <View style={styles.waterGlassesContainer}>
            <Text style={styles.waterGlassesText}>{waterGlasses} glasses</Text>
            <View style={styles.glassesGrid}>
              {[...Array(8)].map((_, i) => (
                <Icon 
                  key={i}
                  name={i < waterGlasses ? 'cup-water' : 'cup-outline'}
                  size={24}
                  color={i < waterGlasses ? '#03A9F4' : '#E8ECF1'}
                  style={styles.glassIcon}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.addWaterButton} onPress={addWaterGlass}>
              <Icon name="plus" size={20} color={colors.white} />
              <Text style={styles.addWaterText}>Add Glass (250ml)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: '#F5F7FA',
    paddingBottom: 100,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: colors.text, 
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 15, 
    color: colors.textSecondary, 
    marginBottom: 20,
    fontWeight: '500',
  },
  
  // Widget Card Styles
  widgetCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  widgetHeader: {
    marginBottom: 20,
  },
  widgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

  // Circular Progress Container
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
  },
  progressSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Stats Row (Calories Widget)
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },

  // Macros Container
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroTextContainer: {
    position: 'absolute',
    top: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  macroGoal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },

  // Water Container
  waterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  waterProgressSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterGlassesContainer: {
    flex: 1,
  },
  waterGlassesText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  glassesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  glassIcon: {
    width: 28,
  },
  addWaterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#03A9F4',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
    shadowColor: '#03A9F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addWaterText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});

export default HomeTab; 