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

const BottomNav = ({ current, onChange }) => {
  return (
    <View style={styles.container}>
      <TabButton label="Home" iconName="home-outline" active={current === 'home'} onPress={() => onChange('home')} />
      <TabButton label="Meals" iconName="silverware-fork-knife" active={current === 'meals'} onPress={() => onChange('meals')} />
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
});

export default BottomNav; 