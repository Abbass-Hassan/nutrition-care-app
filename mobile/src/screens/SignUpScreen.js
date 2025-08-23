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

const SignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          user_type: 'client' // Mobile = client
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Client registered successfully:', data);
        // Store token and navigate to main screen
        // You can store the token here if needed
        navigation.navigate('Main');
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>🍎 NutritionCare</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us for a healthier lifestyle</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textLight}
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.textLight}
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={colors.textLight}
                value={formData.password}
                onChangeText={(value) => handleChange('password', value)}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                textContentType="oneTimeCode"
                autoComplete="off"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textLight}
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange('confirmPassword', value)}
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
              <Text style={styles.submitButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.link} onPress={handleSignIn}>
                Sign in
              </Text>
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
  header: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  logo: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  form: { flex: 1, justifyContent: 'center', paddingHorizontal: 10 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
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
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonText: { color: colors.backgroundLight, fontSize: 18, fontWeight: '600' },
  footer: { alignItems: 'center', marginBottom: 30 },
  footerText: { color: colors.textSecondary, fontSize: 15 },
  link: { color: colors.primary, fontWeight: '600' },
});

export default SignUpScreen; 