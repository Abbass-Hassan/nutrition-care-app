import React, { useState, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Modal, TouchableOpacity, Text } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '../theme';
import HomeTab from './tabs/HomeTab';
import MealsTab from './tabs/MealsTab';
import ChatTab from './tabs/ChatTab';
import SettingsTab from './tabs/SettingsTab';
import BottomNav from './tabs/BottomNav';

const MainScreen = ({ navigation }) => {
  const [tab, setTab] = useState('home');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const mealsTabRef = useRef(null);

  const renderTab = () => {
    switch (tab) {
      case 'meals':
        return <MealsTab ref={mealsTabRef} />;
      case 'chat':
        return <ChatTab />;
      case 'settings':
        return <SettingsTab navigation={navigation} />;
      case 'home':
      default:
        return <HomeTab />;
    }
  };

  const handleAddFood = () => {
    setShowAddMenu(false);
    setTab('meals');
    // Small delay to ensure tab is rendered
    setTimeout(() => {
      if (mealsTabRef.current?.openAddPanel) {
        mealsTabRef.current.openAddPanel('all');
      }
    }, 100);
  };

  const handleCreateMeal = () => {
    setShowAddMenu(false);
    setTab('meals');
    setTimeout(() => {
      if (mealsTabRef.current?.openCreateMeal) {
        mealsTabRef.current.openCreateMeal();
      }
    }, 100);
  };

  const handleCreateFood = () => {
    setShowAddMenu(false);
    setTab('meals');
    setTimeout(() => {
      if (mealsTabRef.current?.openCreateFood) {
        mealsTabRef.current.openCreateFood();
      }
    }, 100);
  };

  const handleViewMyFoods = () => {
    setShowAddMenu(false);
    setTab('meals');
    setTimeout(() => {
      if (mealsTabRef.current?.openAddPanel) {
        mealsTabRef.current.openAddPanel('myfoods');
      }
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderTab()}</View>
      <BottomNav current={tab} onChange={setTab} onAddPress={() => setShowAddMenu(true)} />

      {/* Add Menu Modal */}
      <Modal
        visible={showAddMenu}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAddMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setShowAddMenu(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
            </View>
            
            <TouchableOpacity style={styles.menuOption} onPress={handleAddFood}>
              <View style={styles.menuIconContainer}>
                <Icon name="food" size={24} color={colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuOptionTitle}>Add Food</Text>
                <Text style={styles.menuOptionSubtitle}>Browse all available foods</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuOption} onPress={handleCreateMeal}>
              <View style={styles.menuIconContainer}>
                <Icon name="food-variant" size={24} color={colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuOptionTitle}>Create Meal</Text>
                <Text style={styles.menuOptionSubtitle}>Combine multiple foods</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuOption} onPress={handleCreateFood}>
              <View style={styles.menuIconContainer}>
                <Icon name="plus" size={24} color={colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuOptionTitle}>Create Food</Text>
                <Text style={styles.menuOptionSubtitle}>Add custom food item</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight },
  content: { flex: 1 },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8ECF1',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E8ECF1',
  },
  menuIcon: {
    fontSize: 24,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  menuOptionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: '300',
  },
});

export default MainScreen; 