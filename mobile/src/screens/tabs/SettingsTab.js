import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme';

const SettingsTab = ({ navigation }) => {
  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          // Clear all AsyncStorage data
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <Text style={styles.cardText}>Username: @you</Text>
        <Text style={styles.cardText}>Plan: Free</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight, padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 14 },
  card: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  cardText: { fontSize: 15, color: colors.textSecondary, marginBottom: 6 },
  signOutButton: { backgroundColor: colors.error, padding: 12, borderRadius: 12, marginTop: 10, alignItems: 'center' },
  signOutText: { color: 'white', fontWeight: '700' },
});

export default SettingsTab; 