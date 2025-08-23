import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../theme';

const MainScreen = ({ navigation }) => {
  const handleSignOut = () => {
    // Clear stored data and go back to signin
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.logo}>🍎 NutritionCare</Text>
          <Text style={styles.welcome}>Welcome to Your Nutrition Journey</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Plan</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Breakfast</Text>
              <Text style={styles.cardText}>Oatmeal with berries and nuts</Text>
              <Text style={styles.calories}>320 calories</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Lunch</Text>
              <Text style={styles.cardText}>Grilled chicken salad</Text>
              <Text style={styles.calories}>450 calories</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dinner</Text>
              <Text style={styles.cardText}>Salmon with quinoa and vegetables</Text>
              <Text style={styles.calories}>580 calories</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionText}>Track Meal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>💧</Text>
                <Text style={styles.actionText}>Log Water</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>⚖️</Text>
                <Text style={styles.actionText}>Weight Log</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>📈</Text>
                <Text style={styles.actionText}>Progress</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Stats</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1,350</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>6</Text>
                <Text style={styles.statLabel}>Glasses Water</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8,240</Text>
                <Text style={styles.statLabel}>Steps</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 20,
    backgroundColor: colors.primary,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.backgroundLight,
    marginBottom: 10,
  },
  welcome: {
    fontSize: 18,
    color: colors.backgroundLight,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  card: {
    backgroundColor: colors.backgroundLight,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  calories: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: colors.backgroundLight,
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: colors.error,
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.backgroundLight,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MainScreen; 