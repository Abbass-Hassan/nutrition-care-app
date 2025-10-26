import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const TabButton = ({ label, active, onPress, iconName }) => (
  <TouchableOpacity style={styles.tab} onPress={onPress}>
    <Icon name={iconName} size={22} color={active ? colors.primary : colors.textSecondary} style={styles.icon} />
    <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
  </TouchableOpacity>
);

const BottomNav = ({ current, onChange, onAddPress }) => {
  return (
    <View style={styles.container}>
      <TabButton label="Home" iconName="home-outline" active={current === 'home'} onPress={() => onChange('home')} />
      <TabButton label="Diary" iconName="book-open-variant" active={current === 'meals'} onPress={() => onChange('meals')} />
      
      {/* Center Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
        <View style={styles.addButtonInner}>
          <Text style={styles.addButtonText}>+</Text>
        </View>
      </TouchableOpacity>
      
      <TabButton label="Chat" iconName="message-text-outline" active={current === 'chat'} onPress={() => onChange('chat')} />
      <TabButton label="Settings" iconName="cog-outline" active={current === 'settings'} onPress={() => onChange('settings')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundLight,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  icon: { fontSize: 20, color: colors.textSecondary, marginBottom: 4 },
  label: { fontSize: 12, color: colors.textSecondary, fontWeight: '700' },
  iconActive: { color: colors.primary },
  labelActive: { color: colors.primary },
  addButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 4,
    borderColor: colors.backgroundLight,
  },
  addButtonText: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.white,
    marginTop: -2,
  },
});

export default BottomNav; 