import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../theme';
import HomeTab from './tabs/HomeTab';
import MealsTab from './tabs/MealsTab';
import ChatTab from './tabs/ChatTab';
import SettingsTab from './tabs/SettingsTab';
import BottomNav from './tabs/BottomNav';

const MainScreen = ({ navigation }) => {
  const [tab, setTab] = useState('home');

  const renderTab = () => {
    switch (tab) {
      case 'meals':
        return <MealsTab />;
      case 'chat':
        return <ChatTab />;
      case 'settings':
        return <SettingsTab navigation={navigation} />;
      case 'home':
      default:
        return <HomeTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderTab()}</View>
      <BottomNav current={tab} onChange={setTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight },
  content: { flex: 1 },
});

export default MainScreen; 