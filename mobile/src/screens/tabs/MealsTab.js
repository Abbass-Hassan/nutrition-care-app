import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
  StatusBar
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme';
import { API_BASE } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: screenHeight } = Dimensions.get('window');

const MealsTab = forwardRef((props, ref) => {
  const topInset = Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight || 0);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggedFoods, setLoggedFoods] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [servingQuantity, setServingQuantity] = useState(1);
  const [collapsedMeals, setCollapsedMeals] = useState({});
  const [showFoodsList, setShowFoodsList] = useState(true);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addPanelTab, setAddPanelTab] = useState('all'); // 'all' | 'meals' | 'myfoods'
  const [searchQuery, setSearchQuery] = useState('');
  const [myMeals, setMyMeals] = useState([]);
  const [showCreateMealModal, setShowCreateMealModal] = useState(false);
  const [createMealName, setCreateMealName] = useState('');
  const [createMealSelection, setCreateMealSelection] = useState({}); // {foodId: quantity}
  const [showSavedMealTypePicker, setShowSavedMealTypePicker] = useState(false);
  const [pendingSavedMeal, setPendingSavedMeal] = useState(null);
  const [showCreateFoodModal, setShowCreateFoodModal] = useState(false);
  
  // Nutrition Goals State
  const [nutritionGoals, setNutritionGoals] = useState(null);
  
  // Custom Food States
  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  
  // Edit Food Log States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null); // {mealType, foodIndex, food}
  const [editServingQuantity, setEditServingQuantity] = useState(1);

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: 'weather-sunset-up' },
    { key: 'lunch', label: 'Lunch', icon: 'weather-sunny' },
    { key: 'dinner', label: 'Dinner', icon: 'weather-night' },
    { key: 'snacks', label: 'Snacks', icon: 'food-apple' }
  ];

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openAddPanel: (tab = 'all') => {
      setAddPanelTab(tab);
      setShowAddPanel(true);
    },
    openCreateMeal: () => {
      setShowCreateMealModal(true);
    },
    openCreateFood: () => {
      setShowCreateFoodModal(true);
    },
  }));

  useEffect(() => {
    loadFoods();
    loadLoggedFoods();
    loadMyMeals();
    loadNutritionGoals();
  }, []);

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

  const formatDate = (date) => {
    return date.toDateString();
  };

  const getDateDisplay = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const loadFoods = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/client-foods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFoods(data.foods);
        } else {
          Alert.alert('Error', data.message || 'Failed to load foods');
        }
      } else {
        Alert.alert('Error', 'Failed to load foods');
      }
    } catch (error) {
      console.error('Error loading foods:', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch nutrition goals from API
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

  const saveLoggedFoods = async (newLoggedFoods) => {
    try {
      const key = await getUserStorageKey('loggedFoods');
      await AsyncStorage.setItem(key, JSON.stringify(newLoggedFoods));
      setLoggedFoods(newLoggedFoods);
      
      // Save daily progress to backend
      await saveDailyProgress(newLoggedFoods);
    } catch (error) {
      console.error('Error saving logged foods:', error);
    }
  };

  const saveDailyProgress = async (loggedFoods) => {
    try {
      const dateString = formatDate(selectedDate);
      const dateEntry = loggedFoods.find(entry => entry.date === dateString);
      
      if (!dateEntry || !dateEntry.meals) {
        return; // No data to save
      }

      // Calculate daily totals
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let mealsCount = 0;

      Object.values(dateEntry.meals).forEach(mealFoods => {
        if (Array.isArray(mealFoods)) {
          mealFoods.forEach(food => {
            totalCalories += (food.calories || 0) * (food.quantity || 1);
            totalProtein += (food.protein || 0) * (food.quantity || 1);
            totalCarbs += (food.carbs || 0) * (food.quantity || 1);
            totalFat += (food.fat || 0) * (food.quantity || 1);
          });
          if (mealFoods.length > 0) mealsCount++;
        }
      });

      // FIX: Get water intake for the correct date
      const waterKey = await getUserStorageKey('waterIntake');
      const waterData = await AsyncStorage.getItem(waterKey);
      const waterIntakeObj = waterData ? JSON.parse(waterData) : {};
      const todayWater = waterIntakeObj[dateString] || 0; // Get water for THIS date

      // Send to backend
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Convert selectedDate to ISO format (YYYY-MM-DD) using local timezone
      // FIX: Avoid timezone conversion issues by using local date components
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${day}`;

      console.log('Saving progress:', {
        date: isoDate,
        dateString: dateString,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        water: todayWater,
        meals: mealsCount
      });

      const response = await fetch(`${API_BASE}/progress/daily`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          date: isoDate,
          calories_consumed: totalCalories,
          protein_consumed: totalProtein,
          carbs_consumed: totalCarbs,
          fat_consumed: totalFat,
          water_intake: todayWater,
          meals_logged: mealsCount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Daily progress saved successfully:', data);
      } else {
        const errorData = await response.json();
        console.error('Failed to save progress:', errorData);
      }
    } catch (error) {
      console.error('Error saving daily progress:', error);
    }
  };

  const loadMyMeals = async () => {
    try {
      const key = await getUserStorageKey('myMeals');
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setMyMeals(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading my meals', e);
    }
  };

  const saveMyMeals = async (newMeals) => {
    try {
      const key = await getUserStorageKey('myMeals');
      await AsyncStorage.setItem(key, JSON.stringify(newMeals));
      setMyMeals(newMeals);
    } catch (e) {
      console.error('Error saving my meals', e);
    }
  };



  const toggleMealCollapse = (mealType) => {
    setCollapsedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };

  const toggleFoodsList = () => {
    setShowFoodsList(!showFoodsList);
  };

  const openFoodModal = (food) => {
    setSelectedFood(food);
    setSelectedMealType('breakfast');
    setServingQuantity(1);
    setShowAddPanel(false); // Close Add Food panel immediately
    setShowFoodModal(true);
  };

  const openCreateMealModal = () => {
    setShowAddPanel(false); // Close Add Food panel immediately
    setShowCreateMealModal(true);
  };

  const logFood = () => {
    if (!selectedFood) return;

    const dateString = formatDate(selectedDate);
    const newLoggedFoods = [...loggedFoods];
    
    // Find or create date's entry
    let dateEntry = newLoggedFoods.find(entry => entry.date === dateString);
    if (!dateEntry) {
      dateEntry = { date: dateString, meals: {} };
      newLoggedFoods.push(dateEntry);
    }

    // Initialize meals object if it doesn't exist
    if (!dateEntry.meals) {
      dateEntry.meals = {};
    }

    // Initialize meal type if it doesn't exist
    if (!dateEntry.meals[selectedMealType]) {
      dateEntry.meals[selectedMealType] = [];
    }

    // Add food to the specific meal
    const foodEntry = {
      ...selectedFood,
      quantity: servingQuantity,
      loggedAt: new Date().toISOString()
    };

    dateEntry.meals[selectedMealType].push(foodEntry);
    
    saveLoggedFoods(newLoggedFoods);
    setShowFoodModal(false);
    Alert.alert('Success', `${selectedFood.name} added to ${mealTypes.find(m => m.key === selectedMealType)?.label}!`);
  };

  const openEditModal = (mealType, foodIndex, food) => {
    setEditingLog({ mealType, foodIndex, food });
    setEditServingQuantity(food.quantity);
    setShowEditModal(true);
  };

  const handleEditFood = () => {
    if (!editingLog) return;

    const dateString = formatDate(selectedDate);
    const newLoggedFoods = [...loggedFoods];
    const dateEntry = newLoggedFoods.find(entry => entry.date === dateString);
    
    if (dateEntry && dateEntry.meals[editingLog.mealType]) {
      // Update the food entry
      dateEntry.meals[editingLog.mealType][editingLog.foodIndex] = {
        ...editingLog.food,
        quantity: editServingQuantity
      };
      
      saveLoggedFoods(newLoggedFoods);
      setShowEditModal(false);
      setEditingLog(null);
      Alert.alert('Updated', `${editingLog.food.name} has been updated!`);
    }
  };

  const handleDeleteFood = (mealType, foodIndex, foodName) => {
    Alert.alert(
      'Delete Food',
      `Are you sure you want to remove "${foodName}" from this meal?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const dateString = formatDate(selectedDate);
            const newLoggedFoods = [...loggedFoods];
            const dateEntry = newLoggedFoods.find(entry => entry.date === dateString);
            
            if (dateEntry && dateEntry.meals[mealType]) {
              // Remove the food entry
              dateEntry.meals[mealType].splice(foodIndex, 1);
              
              // If meal is now empty, remove it
              if (dateEntry.meals[mealType].length === 0) {
                delete dateEntry.meals[mealType];
              }
              
              // If no meals left for this date, remove the date entry
              if (Object.keys(dateEntry.meals).length === 0) {
                const dateIndex = newLoggedFoods.findIndex(entry => entry.date === dateString);
                if (dateIndex !== -1) {
                  newLoggedFoods.splice(dateIndex, 1);
                }
              }
              
              saveLoggedFoods(newLoggedFoods);
              Alert.alert('Deleted', `${foodName} has been removed`);
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFoods();
    await loadNutritionGoals();
    setRefreshing(false);
  };

  // Combine foods from dietitian and custom foods for "All" tab
  const allFoods = foods;
  
  const filteredFoods = allFoods.filter(f => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name?.toLowerCase().includes(q) ||
      f.category?.toLowerCase().includes(q)
    );
  });

  const filteredMyFoods = foods.filter(f => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name?.toLowerCase().includes(q) ||
      f.category?.toLowerCase().includes(q)
    ) && f.created_by_client_id; // Only show foods created by the client
  });

  const toggleCreateMealFood = (foodId) => {
    setCreateMealSelection(prev => {
      const next = { ...prev };
      if (next[foodId]) {
        // toggle off
        delete next[foodId];
      } else {
        next[foodId] = 1; // default quantity
      }
      return next;
    });
  };

  // Reusable Meal Type selector (chip style)
  const MealTypeSelector = ({ value, onChange }) => (
    <View style={styles.mealChipsRow}>
      {mealTypes.map(m => {
        const selected = value === m.key;
        return (
          <TouchableOpacity
            key={m.key}
            style={[styles.mealChip, selected && styles.mealChipSelected]}
            onPress={() => onChange(m.key)}
            activeOpacity={0.8}
          >
            <Icon 
              name={m.icon} 
              size={18} 
              color={selected ? colors.primary : colors.textSecondary} 
              style={styles.mealChipIcon}
            />
            <Text style={[styles.mealChipText, selected && styles.mealChipTextSelected]}>{m.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const adjustCreateMealQty = (foodId, delta) => {
    setCreateMealSelection(prev => {
      const next = { ...prev };
      const current = next[foodId] || 0;
      const updated = Math.max(0, current + delta);
      if (updated <= 0) delete next[foodId]; else next[foodId] = updated;
      return next;
    });
  };

  const createMeal = () => {
    const ids = Object.keys(createMealSelection);
    if (!createMealName.trim()) {
      Alert.alert('Name required', 'Please give your meal a name.');
      return;
    }
    if (ids.length === 0) {
      Alert.alert('Add foods', 'Select at least one food to include.');
      return;
    }
    const items = ids.map(id => {
      const food = foods.find(f => f.id === Number(id));
      return { id: food.id, name: food.name, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, quantity: createMealSelection[id], default_serving: food.default_serving, category: food.category };
    });
    const newMeals = [
      { id: Date.now(), name: createMealName.trim(), items },
      ...myMeals
    ];
    saveMyMeals(newMeals);
    setShowCreateMealModal(false);
    setCreateMealName('');
    setCreateMealSelection({});
    Alert.alert('Saved', 'Meal saved to My Meals');
  };

  const addSavedMealToLog = (savedMeal) => {
    setPendingSavedMeal(savedMeal);
    setSelectedMealType('breakfast');
    setShowSavedMealTypePicker(true);
  };

  const confirmAddSavedMeal = () => {
    if (!pendingSavedMeal) return;
    const dateString = formatDate(selectedDate);
    const newLoggedFoods = [...loggedFoods];
    let dateEntry = newLoggedFoods.find(entry => entry.date === dateString);
    if (!dateEntry) {
      dateEntry = { date: dateString, meals: {} };
      newLoggedFoods.push(dateEntry);
    }
    if (!dateEntry.meals) dateEntry.meals = {};
    if (!dateEntry.meals[selectedMealType]) dateEntry.meals[selectedMealType] = [];

    pendingSavedMeal.items.forEach(item => {
      dateEntry.meals[selectedMealType].push({ ...item, loggedAt: new Date().toISOString() });
    });

    saveLoggedFoods(newLoggedFoods);
    setShowSavedMealTypePicker(false);
    setShowAddPanel(false); // Close Add Food panel after adding
    setPendingSavedMeal(null);
    Alert.alert('Added', `${pendingSavedMeal.name} added to ${mealTypes.find(m => m.key === selectedMealType)?.label}`);
  };

  const handleAddCustomFood = async () => {
    // Validation
    if (!customFoodName.trim()) {
      Alert.alert('Required', 'Please enter a food name');
      return;
    }
    if (!customCalories || customCalories === '0') {
      Alert.alert('Required', 'Please enter calories');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please sign in again');
        return;
      }

      const response = await fetch(`${API_BASE}/client-foods/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: customFoodName.trim(),
          calories: parseFloat(customCalories) || 0,
          protein: parseFloat(customProtein) || 0,
          carbs: parseFloat(customCarbs) || 0,
          fat: parseFloat(customFat) || 0,
          default_serving: '1 serving',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Reset custom food form
        setCustomFoodName('');
        setCustomCalories('');
        setCustomProtein('');
        setCustomCarbs('');
        setCustomFat('');

        // Close the create food modal
        setShowCreateFoodModal(false);
        
        Alert.alert(
          'Submitted for Approval', 
          `${data.food.name} has been submitted to your dietitian for approval. You'll be able to use it once approved.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to submit food');
      }
    } catch (error) {
      console.error('Error submitting custom food:', error);
      Alert.alert('Error', 'Failed to submit food for approval');
    }
  };

  const getTotalCalories = () => {
    const dateString = formatDate(selectedDate);
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

  const getMealCalories = (mealType) => {
    const dateString = formatDate(selectedDate);
    const dateEntry = loggedFoods.find(entry => entry.date === dateString);
    if (!dateEntry || !dateEntry.meals || !dateEntry.meals[mealType]) return 0;
    
    return dateEntry.meals[mealType].reduce((total, food) => {
      return total + (food.calories * food.quantity);
    }, 0);
  };

  const getTotalMacros = () => {
    const dateString = formatDate(selectedDate);
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

  const renderFoodItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.foodItem} 
      onPress={() => openFoodModal(item)}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodCategory}>{item.category}</Text>
        <Text style={styles.foodServing}>{item.default_serving}</Text>
        <View style={styles.nutritionInfo}>
          <Text style={styles.nutritionText}>Calories: {item.calories}</Text>
          <Text style={styles.nutritionText}>Protein: {item.protein}g</Text>
          <Text style={styles.nutritionText}>Carbs: {item.carbs}g</Text>
          <Text style={styles.nutritionText}>Fat: {item.fat}g</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => openFoodModal(item)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderLoggedFoods = () => {
    const dateString = formatDate(selectedDate);
    const dateEntry = loggedFoods.find(entry => entry.date === dateString);
    
    if (!dateEntry || !dateEntry.meals || Object.keys(dateEntry.meals).length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No foods logged for {getDateDisplay(selectedDate)}</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add foods</Text>
        </View>
      );
    }

    const hasLoggedFoods = Object.values(dateEntry.meals).some(mealFoods => mealFoods.length > 0);

    return (
      <View style={styles.loggedFoodsContainer}>
        {mealTypes.map(mealType => {
          const mealFoods = dateEntry.meals[mealType.key] || [];
          const mealCalories = getMealCalories(mealType.key);
          const isCollapsed = collapsedMeals[mealType.key];
          
          if (mealFoods.length === 0) return null;
          
          return (
            <View key={mealType.key} style={styles.mealSection}>
              <TouchableOpacity 
                style={styles.mealHeader}
                onPress={() => toggleMealCollapse(mealType.key)}
                activeOpacity={0.7}
              >
                <View style={styles.mealHeaderLeft}>
                  <Icon 
                    name={mealType.icon} 
                    size={20} 
                    color={colors.primary} 
                    style={styles.mealHeaderIcon}
                  />
                  <Text style={styles.mealTitle}>{mealType.label}</Text>
                  <Text style={styles.mealCount}>({mealFoods.length})</Text>
                </View>
                <View style={styles.mealHeaderRight}>
                  <Text style={styles.mealCalories}>{mealCalories.toFixed(0)} cal</Text>
                  <Icon 
                    name={isCollapsed ? 'chevron-down' : 'chevron-up'} 
                    size={18} 
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
              
              {!isCollapsed && (
                <View style={styles.mealFoodsContainer}>
                  {mealFoods.map((food, index) => (
                    <View key={index} style={styles.loggedFoodItem}>
                      <View style={styles.loggedFoodInfo}>
                        <Text style={styles.loggedFoodName}>
                          {food.name} x{food.quantity}
                        </Text>
                        <Text style={styles.loggedFoodCalories}>
                          {(food.calories * food.quantity).toFixed(0)} cal
                        </Text>
                      </View>
                      <View style={styles.loggedFoodActions}>
                        <TouchableOpacity 
                          style={styles.loggedFoodActionBtn}
                          onPress={() => openEditModal(mealType.key, index, food)}
                        >
                          <Icon name="pencil" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.loggedFoodActionBtn}
                          onPress={() => handleDeleteFood(mealType.key, index, food.name)}
                        >
                          <Icon name="delete" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading foods...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* Date Navigation */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => navigateDate(-1)}
          >
            <Icon name="chevron-left" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <Text style={styles.dateDisplay}>{getDateDisplay(selectedDate)}</Text>
          
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => navigateDate(1)}
          >
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
    </View>

        {/* Calorie Tracker - Simple & Elegant */}
        <View style={styles.calorieTracker}>
          <View style={styles.calorieRow}>
            <View style={styles.calorieItem}>
              <Text style={styles.calorieValue}>{nutritionGoals?.daily_calorie_target || 'N/A'}</Text>
              <Text style={styles.calorieLabel}>Limit</Text>
            </View>
            <View style={styles.calorieIconContainer}>
              <Icon name="minus" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.calorieItem}>
              <Text style={styles.calorieValue}>{getTotalCalories().toFixed(0)}</Text>
              <Text style={styles.calorieLabel}>Intake</Text>
            </View>
            <View style={styles.calorieIconContainer}>
              <Icon name="equal" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.calorieItem}>
              <Text style={[
                styles.calorieValue,
                (nutritionGoals?.daily_calorie_target || 0) - getTotalCalories() < 0 
                  ? styles.calorieOverLimit 
                  : styles.calorieRemaining
              ]}>
                {nutritionGoals?.daily_calorie_target 
                  ? ((nutritionGoals.daily_calorie_target - getTotalCalories()).toFixed(0))
                  : 'N/A'
                }
              </Text>
              <Text style={styles.calorieLabel}>Remaining</Text>
            </View>
          </View>
        </View>
        
        {renderLoggedFoods()}
      </ScrollView>

      {/* Food Logging Modal */}
      <Modal
        visible={showFoodModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowFoodModal(false)}
        statusBarTranslucent={true}
        presentationStyle="pageSheet"
      >
        <View style={styles.extraordinaryModalContainer}>
          <View style={styles.extraordinaryModalHeader}>
            <View>
              <Text style={styles.extraordinaryModalTitle}>Add to Log</Text>
              <Text style={styles.extraordinaryModalSubtitle}>{selectedFood?.name}</Text>
            </View>
          </View>
          
          <ScrollView style={styles.extraordinaryModalBody} showsVerticalScrollIndicator={false}>
            {/* Food Details Card */}
            <View style={styles.foodDetailsCard}>
              <Text style={styles.foodDetailsLabel}>Nutrition per serving</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{selectedFood?.calories || 0}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{selectedFood?.protein || 0}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{selectedFood?.carbs || 0}g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{selectedFood?.fat || 0}g</Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              </View>
            </View>

            {/* Meal Type Selection */}
            <Text style={styles.extraordinaryLabel}>Select Meal</Text>
            <MealTypeSelector value={selectedMealType} onChange={setSelectedMealType} />

            {/* Serving Quantity */}
            <Text style={styles.extraordinaryLabel}>Serving Quantity</Text>
            <View style={styles.extraordinaryQuantityContainer}>
              <TouchableOpacity 
                style={styles.extraordinaryQuantityButton}
                onPress={() => setServingQuantity(Math.max(0.5, servingQuantity - 0.5))}
              >
                <Icon name="minus" size={20} color={colors.white} />
              </TouchableOpacity>
              
              <View style={styles.extraordinaryQuantityDisplay}>
                <Text style={styles.extraordinaryQuantityText}>{servingQuantity}</Text>
                <Text style={styles.extraordinaryQuantityUnit}>servings</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.extraordinaryQuantityButton}
                onPress={() => setServingQuantity(servingQuantity + 0.5)}
              >
                <Icon name="plus" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.extraordinaryModalFooter}>
            <TouchableOpacity 
              style={styles.extraordinaryCancelButton}
              onPress={() => setShowFoodModal(false)}
            >
              <Text style={styles.extraordinaryCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.extraordinaryAddButton}
              onPress={logFood}
            >
              <Text style={styles.extraordinaryAddText}>Add to Meal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Food Panel */}
      <Modal
        visible={showAddPanel}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAddPanel(false)}
        statusBarTranslucent={true}
      >
        <View style={[styles.fullscreenContainer, { paddingTop: topInset }] }>
          <View style={styles.addPanelFull}>
            <View style={styles.addPanelHeader}>
              <Text style={styles.addPanelTitle}>Add Food</Text>
            </View>

            <View style={styles.searchBar}>
              <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  placeholder="Search foods..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                    <Icon name="close" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.tabBar}>
              <TouchableOpacity onPress={() => setAddPanelTab('all')} style={[styles.tabItem, addPanelTab === 'all' && styles.tabItemActive]}>
                <Text style={[styles.tabText, addPanelTab === 'all' && styles.tabTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAddPanelTab('meals')} style={[styles.tabItem, addPanelTab === 'meals' && styles.tabItemActive]}>
                <Text style={[styles.tabText, addPanelTab === 'meals' && styles.tabTextActive]}>Meals</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAddPanelTab('myfoods')} style={[styles.tabItem, addPanelTab === 'myfoods' && styles.tabItemActive]}>
                <Text style={[styles.tabText, addPanelTab === 'myfoods' && styles.tabTextActive]}>My Food</Text>
              </TouchableOpacity>
            </View>

            {addPanelTab === 'all' ? (
              <FlatList
                data={filteredFoods}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.addRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.foodServing}>{item.default_serving}</Text>
                      <Text style={styles.foodCategory}>{item.category}</Text>
                    </View>
                    <TouchableOpacity style={styles.addRowButton} onPress={() => openFoodModal(item)}>
                      <Icon name="plus" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : addPanelTab === 'meals' ? (
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={styles.createMealButton} onPress={openCreateMealModal}>
                  <Icon name="plus" size={16} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={styles.createMealButtonText}>Create Meal</Text>
                </TouchableOpacity>

                {myMeals.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No saved meals yet</Text>
                    <Text style={styles.emptySubtext}>Tap Create Meal to build your own</Text>
                  </View>
                ) : (
                  <FlatList
                    data={myMeals}
                    keyExtractor={(m) => m.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.savedMealCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.savedMealTitle}>{item.name}</Text>
                          <Text style={styles.savedMealSubtitle}>{item.items.length} items</Text>
                        </View>
                        <TouchableOpacity style={styles.addRowButton} onPress={() => addSavedMealToLog(item)}>
                          <Icon name="plus" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                  />
                )}
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                  <Text style={styles.customFoodTitle}>My Foods ({filteredMyFoods.length})</Text>
                  <Text style={styles.customFoodSubtitle}>Your custom food items</Text>
                  
                  {filteredMyFoods.length > 0 ? (
                    filteredMyFoods.map((item) => (
                      <View key={item.id} style={styles.addRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.foodName}>{item.name}</Text>
                          <Text style={styles.foodServing}>{item.calories} cal | P: {item.protein}g C: {item.carbs}g F: {item.fat}g</Text>
                        </View>
                        <TouchableOpacity style={styles.addRowButton} onPress={() => openFoodModal(item)}>
                          <Icon name="plus" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View style={{ marginTop: 40, alignItems: 'center' }}>
                      <Icon name="food" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
                      <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
                        No custom foods yet.{'\n'}Create your first custom food!
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Meal Modal */}
      <Modal
        visible={showCreateMealModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCreateMealModal(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.extraordinaryModalContainer}>
          <View style={styles.extraordinaryModalHeader}>
            <View>
              <Text style={styles.extraordinaryModalTitle}>Create Meal</Text>
              <Text style={styles.extraordinaryModalSubtitle}>Build your custom meal</Text>
            </View>
          </View>

          <ScrollView style={styles.extraordinaryModalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.extraordinaryLabel}>Meal name</Text>
            <TextInput
              value={createMealName}
              onChangeText={setCreateMealName}
              placeholder="e.g. Protein Breakfast"
              placeholderTextColor={colors.textSecondary}
              style={styles.extraordinaryTextField}
            />

            <Text style={styles.extraordinaryLabel}>Pick foods</Text>
            <FlatList
              data={filteredFoods}
              keyExtractor={(f) => f.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const selected = !!createMealSelection[item.id];
                const qty = createMealSelection[item.id] || 0;
                return (
                  <TouchableOpacity style={[styles.createMealFoodRow, selected && styles.createMealFoodRowSelected]} onPress={() => toggleCreateMealFood(item.id)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.createMealFoodName}>{item.name}</Text>
                      <Text style={styles.createMealFoodServing}>{item.default_serving}</Text>
                    </View>
                    {selected ? (
                      <View style={styles.qtyPills}>
                        <TouchableOpacity style={styles.pillButton} onPress={() => adjustCreateMealQty(item.id, -1)}>
                          <Icon name="minus" size={14} color={colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.pillQty}>{qty}</Text>
                        <TouchableOpacity style={styles.pillButton} onPress={() => adjustCreateMealQty(item.id, 1)}>
                          <Icon name="plus" size={14} color={colors.white} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={styles.createMealSelectHint}>Tap to add</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </ScrollView>

          <View style={styles.extraordinaryModalFooter}>
            <TouchableOpacity style={styles.extraordinaryCancelButton} onPress={() => setShowCreateMealModal(false)}>
              <Text style={styles.extraordinaryCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.extraordinaryAddButton} onPress={createMeal}>
              <Text style={styles.extraordinaryAddText}>Save Meal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Saved Meal Type Picker */}
      <Modal
        visible={showSavedMealTypePicker}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSavedMealTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose meal type</Text>
            <MealTypeSelector value={selectedMealType} onChange={setSelectedMealType} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowSavedMealTypePicker(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addToMealButton} onPress={confirmAddSavedMeal}>
                <Text style={styles.addToMealButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Food Modal */}
      <Modal
        visible={showCreateFoodModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateFoodModal(false)}
      >
        <View style={styles.compactModalOverlay}>
          <View style={styles.compactModalContainer}>
            <View style={styles.compactModalHeader}>
              <Text style={styles.compactModalTitle}>Create Custom Food</Text>
            </View>

            <ScrollView style={styles.compactModalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.compactFormGroup}>
                <Text style={styles.compactLabel}>Food Name *</Text>
                <TextInput
                  placeholder="e.g., Homemade Smoothie"
                  placeholderTextColor={colors.textSecondary}
                  value={customFoodName}
                  onChangeText={setCustomFoodName}
                  style={styles.compactTextField}
                />
              </View>

              <View style={styles.compactFormGroup}>
                <Text style={styles.compactLabel}>Calories *</Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={customCalories}
                  onChangeText={setCustomCalories}
                  keyboardType="numeric"
                  style={styles.compactTextField}
                />
              </View>

              <View style={styles.compactFormGroup}>
                <Text style={styles.compactLabel}>Protein (g)</Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={customProtein}
                  onChangeText={setCustomProtein}
                  keyboardType="numeric"
                  style={styles.compactTextField}
                />
              </View>

              <View style={styles.compactFormGroup}>
                <Text style={styles.compactLabel}>Carbs (g)</Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={customCarbs}
                  onChangeText={setCustomCarbs}
                  keyboardType="numeric"
                  style={styles.compactTextField}
                />
              </View>

              <View style={styles.compactFormGroup}>
                <Text style={styles.compactLabel}>Fat (g)</Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={customFat}
                  onChangeText={setCustomFat}
                  keyboardType="numeric"
                  style={styles.compactTextField}
                />
              </View>
            </ScrollView>

            <View style={styles.compactModalFooter}>
              <TouchableOpacity style={styles.compactCancelButton} onPress={() => setShowCreateFoodModal(false)}>
                <Text style={styles.compactCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.compactAddButton} onPress={handleAddCustomFood}>
                <Text style={styles.compactAddText}>Create Food</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Food Log Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowEditModal(false)}
        statusBarTranslucent={true}
        presentationStyle="pageSheet"
      >
        <View style={styles.extraordinaryModalContainer}>
          <View style={styles.extraordinaryModalHeader}>
            <View>
              <Text style={styles.extraordinaryModalTitle}>Edit Food Log</Text>
              <Text style={styles.extraordinaryModalSubtitle}>{editingLog?.food.name}</Text>
            </View>
          </View>
          
          <ScrollView style={styles.extraordinaryModalBody} showsVerticalScrollIndicator={false}>
            {/* Food Details Card */}
            <View style={styles.foodDetailsCard}>
              <Text style={styles.foodDetailsLabel}>Nutrition per serving</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{editingLog?.food.calories || 0}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{editingLog?.food.protein || 0}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{editingLog?.food.carbs || 0}g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{editingLog?.food.fat || 0}g</Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              </View>
            </View>

            {/* Serving Quantity */}
            <Text style={styles.extraordinaryLabel}>Serving Quantity</Text>
            <View style={styles.extraordinaryQuantityContainer}>
              <TouchableOpacity 
                style={styles.extraordinaryQuantityButton}
                onPress={() => setEditServingQuantity(Math.max(0.5, editServingQuantity - 0.5))}
              >
                <Icon name="minus" size={20} color={colors.white} />
              </TouchableOpacity>
              
              <View style={styles.extraordinaryQuantityDisplay}>
                <Text style={styles.extraordinaryQuantityText}>{editServingQuantity}</Text>
                <Text style={styles.extraordinaryQuantityUnit}>servings</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.extraordinaryQuantityButton}
                onPress={() => setEditServingQuantity(editServingQuantity + 0.5)}
              >
                <Icon name="plus" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.extraordinaryModalFooter}>
            <TouchableOpacity 
              style={styles.extraordinaryCancelButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.extraordinaryCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.extraordinaryAddButton}
              onPress={handleEditFood}
            >
              <Text style={styles.extraordinaryAddText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: colors.text, 
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 14, 
    color: colors.textSecondary,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  // Date Navigation Styles
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dateButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  dateDisplay: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  // Calorie Tracker Styles - Simple & Elegant
  calorieTracker: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calorieItem: {
    alignItems: 'center',
    flex: 1,
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  calorieLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calorieIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  calorieRemaining: {
    color: colors.primary,
  },
  calorieOverLimit: {
    color: colors.error,
  },
  // Meals Container Styles
  loggedFoodsContainer: {
    flex: 1,
    marginBottom: 80,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  // Meal Section Styles
  mealSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8ECF1',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealHeaderIcon: {
    marginRight: 8,
  },
  mealHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginRight: 8,
  },
  mealCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 8,
  },
  mealFoodsContainer: {
    backgroundColor: '#FAFBFC',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  loggedFoodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E8ECF1',
  },
  loggedFoodInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loggedFoodName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    fontWeight: '600',
  },
  loggedFoodCalories: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 8,
  },
  loggedFoodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  loggedFoodActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalCalories: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 72, // ensure space above FAB
  },
  totalCaloriesText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  macroPill: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  macroPillText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Foods List Styles
  foodsListContainer: {
    maxHeight: screenHeight * 0.3,
  },
  foodList: {
    paddingBottom: 20,
  },
  foodItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  foodServing: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  nutritionInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nutritionText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginRight: 12,
    marginBottom: 2,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  // Floating Action Button
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    paddingTop: 200,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: screenHeight * 0.45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    backgroundColor: colors.backgroundLight,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalScrollView: {
    maxHeight: screenHeight * 0.25,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  // Meal chips
  mealChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  mealChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealChipSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  mealChipIcon: {
    marginRight: 6,
  },
  mealChipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  mealChipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 6,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.backgroundLight,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealTypeButtonSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  mealTypeEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  mealTypeTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  quantityButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  quantityButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    minWidth: 50,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  addToMealButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addToMealButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  // Fullscreen Add Panel
  fullscreenContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  addPanelFull: {
    flex: 1,
  },
  addPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  addPanelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  searchBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.primary,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addRowSelected: {
    backgroundColor: colors.primary + '10',
  },
  addRowButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addRowButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  createMealButton: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  createMealButtonText: {
    color: colors.white,
    fontWeight: '800',
  },
  savedMealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  savedMealTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  savedMealSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  textField: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    marginBottom: 12,
  },
  qtyPills: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillButton: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    color: colors.white,
    fontWeight: '800',
  },
  pillQty: {
    minWidth: 28,
    textAlign: 'center',
    fontWeight: '800',
    color: colors.text,
    marginHorizontal: 8,
  },
  addHint: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  // Extraordinary Modal Styles
  extraordinaryModalContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  extraordinaryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  extraordinaryModalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  extraordinaryModalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  extraordinaryCloseButton: {
    backgroundColor: colors.backgroundLight,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraordinaryCloseText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
  },
  // Compact Modal Styles
  compactModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  compactModalContainer: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  compactModalHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  compactModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  compactModalBody: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  compactFormGroup: {
    marginBottom: 16,
  },
  compactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  compactTextField: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.backgroundLight,
    color: colors.text,
  },
  compactModalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  compactCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
  },
  compactCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  compactAddButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  compactAddText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundLight,
  },
  extraordinaryModalBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  extraordinaryLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  extraordinaryTextField: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  foodDetailsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  foodDetailsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  extraordinaryQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  extraordinaryQuantityButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  extraordinaryQuantityButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
  },
  extraordinaryQuantityDisplay: {
    alignItems: 'center',
    marginHorizontal: 32,
  },
  extraordinaryQuantityText: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
  },
  extraordinaryQuantityUnit: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  extraordinaryModalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  extraordinaryCancelButton: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  extraordinaryCancelText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  extraordinaryAddButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  extraordinaryAddText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  // Create Meal Food Row
  createMealFoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createMealFoodRowSelected: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  createMealFoodName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  createMealFoodServing: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  createMealSelectHint: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  // Custom Food Form Styles
  customFoodTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  customFoodSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  customFoodForm: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  customFieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customTextInput: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECF1',
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  nutritionField: {
    flex: 1,
  },
  addCustomFoodButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addCustomFoodButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default MealsTab; 