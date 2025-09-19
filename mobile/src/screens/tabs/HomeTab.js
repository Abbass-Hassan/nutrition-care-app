import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme';

const HomeTab = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>Your personalized nutrition hub</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today at a glance</Text>
        <Text style={styles.cardText}>- No upcoming appointments
- Stay hydrated 💧
- Keep moving 🏃‍♂️</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick tips</Text>
        <Text style={styles.cardText}>Add more colors to your plate for a variety of nutrients.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.backgroundLight },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 18 },
  card: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  cardText: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
});

export default HomeTab; 