import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignInScreen from './src/screens/SignInScreen';
import MainScreen from './src/screens/MainScreen';
import OneSignal from 'react-native-onesignal';
import { ONESIGNAL_APP_ID } from './src/config';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    if (!ONESIGNAL_APP_ID) {
      return;
    }
    // Initialize OneSignal with your App ID
    OneSignal.initialize(ONESIGNAL_APP_ID);
    // Request native push permission prompt (iOS) and notification permission channel (Android 13+)
    OneSignal.Notifications.requestPermission(true);
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SignIn"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#F5F5F5' }
        }}
      >
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
