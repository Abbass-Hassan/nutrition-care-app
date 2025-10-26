# 🧪 TEST ACCOUNTS - Fresh Setup

## 📱 Mobile App Login
```
Email: testclient@test.com
Password: password123
```

## 🖥️ Dashboard Login
```
Email: test@dietitian.com
Password: password123
```

## 🎯 Client Details
- **Name**: Test Client
- **ID**: 9
- **Dietitian**: Dr. Test Smith (ID: 8)

## 📊 Nutrition Targets
- **Daily Calories**: 2000 cal
- **Protein**: 150g
- **Carbs**: 200g
- **Fat**: 65g
- **Tolerance Band**: ±10%

## ✅ Testing Steps

1. **Sign in to Mobile App**
   - Email: `testclient@test.com`
   - Password: `password123`

2. **Add Some Food Logs**
   - Add meals for today
   - Check the calories/macros display

3. **Sign in to Dashboard**
   - Email: `test@dietitian.com`
   - Password: `password123`

4. **View Client Progress**
   - Go to Client Management
   - Click "View Progress" for "Test Client"
   - Check if today's data matches mobile app

## 🐛 Debug Console Logs

The mobile app now logs progress data being sent:
```javascript
console.log('Saving progress:', {
  date: isoDate,        // e.g., "2025-10-23"
  dateString: dateString, // e.g., "Wed Oct 23 2025"
  calories: totalCalories,
  protein: totalProtein,
  carbs: totalCarbs,
  fat: totalFat,
  water: todayWater,
  meals: mealsCount
});
```

Check the console to verify data is being sent correctly!

## 🔧 What Was Fixed
1. ✅ Water intake retrieval (was using wrong format)
2. ✅ Timezone conversion (was converting to UTC)
3. ✅ Date matching between mobile and dashboard
4. ✅ Backend date queries (using `whereDate`)

---

**NO EXISTING LOGS** - This is a completely fresh account for clean testing!
