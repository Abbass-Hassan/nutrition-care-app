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
    email: '',
    password: '',
  });

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
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
        Alert.alert('Error', data.message || 'Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Error', 'Sign in failed. Please try again.');
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to track your nutrition journey</Text>
          </View>

          <View style={styles.form}>
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

            <View style={styles.formOptions}>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.link} onPress={handleSignUp}>
                Sign up
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
  header: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  logo: { fontSize: 32, fontWeight: 'bold', color: colors.primary, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 17, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
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
  formOptions: { alignItems: 'flex-end', marginBottom: 35 },
  forgotPassword: { padding: 8 },
  forgotPasswordText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonText: { color: colors.backgroundLight, fontSize: 19, fontWeight: '600' },
  footer: { alignItems: 'center', marginBottom: 40 },
  footerText: { color: colors.textSecondary, fontSize: 16 },
  link: { color: colors.primary, fontWeight: '600' },
});

export default SignInScreen; 