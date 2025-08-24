import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors } from '../theme';

const SignInScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    if (!formData.password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          user_type: 'client' // Mobile = client
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Client signed in successfully:', data);
        // Store token and navigate to main screen
        // You can store the token here if needed
        navigation.navigate('Main');
      } else {
        Alert.alert('Error', data.message || 'Sign in failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Error', 'Sign in failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>⚕ NutritionCare</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in with the credentials provided by your dietitian
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor={colors.textLight}
                value={formData.username}
                onChangeText={(value) => handleChange('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textLight}
                value={formData.password}
                onChangeText={(value) => handleChange('password', value)}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                textContentType="oneTimeCode"
                autoComplete="off"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Need help? Contact your dietitian for assistance.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight },
  keyboardView: { flex: 1 },
  content: { flex: 1, padding: 16, justifyContent: 'space-between' },
  header: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  logo: { fontSize: 32, fontWeight: 'bold', color: colors.primary, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 12, textAlign: 'center' },
  subtitle: { 
    fontSize: 17, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    lineHeight: 22,
    paddingHorizontal: 20
  },
  form: { flex: 1, justifyContent: 'center', paddingHorizontal: 10 },
  formGroup: { marginBottom: 28 },
  label: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 12 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 18,
    fontSize: 17,
    backgroundColor: colors.backgroundLight,
    color: colors.text,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonText: { color: colors.backgroundLight, fontSize: 19, fontWeight: '600' },
  footer: { alignItems: 'center', marginBottom: 40 },
  footerText: { 
    color: colors.textSecondary, 
    fontSize: 16, 
    textAlign: 'center',
    paddingHorizontal: 20
  },
});

export default SignInScreen; 