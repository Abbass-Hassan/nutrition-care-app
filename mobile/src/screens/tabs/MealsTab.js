import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

const MealsTab = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meals</Text>
      <Text style={styles.subtitle}>Your meal plan and logs will appear here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight, padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 16, color: colors.textSecondary },
});

export default MealsTab; 