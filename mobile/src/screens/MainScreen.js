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
            <Text style={styles.sectionTitle}>Main Screen</Text>
            <Text style={styles.sectionText}>Your main screen content will go here.</Text>
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
  sectionText: {
    fontSize: 16,
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