import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme';
import { API_BASE } from '../../config';

const SettingsTab = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const formatGoal = (goal) => {
    const goalMap = {
      'lose_weight': 'Lose Weight',
      'maintain': 'Maintain Weight',
      'gain_weight': 'Gain Weight',
      'gain_muscle': 'Gain Muscle',
    };
    return goalMap[goal] || goal;
  };

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Settings</Text>

      {/* Account Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="account" size={24} color={colors.primary} />
          <Text style={styles.cardTitle}>Account Information</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>@{user?.username || 'N/A'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
        </View>

        {user?.profile && (
          <>
            {user.profile.age && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{user.profile.age}</Text>
              </View>
            )}
            
            {user.profile.gender && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>{user.profile.gender}</Text>
              </View>
            )}
            
            {user.profile.height && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Height</Text>
                <Text style={styles.infoValue}>{user.profile.height} cm</Text>
              </View>
            )}
            
            {user.profile.weight && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>{user.profile.weight} kg</Text>
              </View>
            )}
            
            {user.profile.goal && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Goal</Text>
                <Text style={styles.infoValue}>{formatGoal(user.profile.goal)}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Nutrition Goals Card */}
      {user?.active_nutrition_target && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="target" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Nutrition Goals</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Daily Calories</Text>
            <Text style={styles.infoValue}>{user.active_nutrition_target.daily_calorie_target || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Protein Target</Text>
            <Text style={styles.infoValue}>{user.active_nutrition_target.protein_target || 'N/A'} g</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Carbs Target</Text>
            <Text style={styles.infoValue}>{user.active_nutrition_target.carbs_target || 'N/A'} g</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fat Target</Text>
            <Text style={styles.infoValue}>{user.active_nutrition_target.fat_target || 'N/A'} g</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Icon name="logout" size={20} color="#FFFFFF" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  container: { flex: 1, backgroundColor: colors.backgroundLight, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: colors.textSecondary,
  },
  infoValue: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: colors.text,
  },
  signOutButton: { 
    backgroundColor: colors.error, 
    padding: 16, 
    borderRadius: 12, 
    marginTop: 10,
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutText: { 
    color: 'white', 
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SettingsTab; 