import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LoginCredentials, RegisterCredentials } from '../../types/auth';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: LoginCredentials | RegisterCredentials) => void;
  loading?: boolean;
  error?: string;
}

// Validation rules
const validationRules = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address',
    },
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters',
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Password must contain uppercase, lowercase, and number',
    },
  },
  firstName: {
    required: 'First name is required',
    minLength: {
      value: 2,
      message: 'First name must be at least 2 characters',
    },
  },
  lastName: {
    required: 'Last name is required',
    minLength: {
      value: 2,
      message: 'Last name must be at least 2 characters',
    },
  },
};

export const AuthForm: React.FC<AuthFormProps> = ({
  type,
  onSubmit,
  loading = false,
  error,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginCredentials | RegisterCredentials>({
    mode: 'onChange',
    defaultValues: type === 'login' 
      ? { email: '', password: '' }
      : { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const handleFormSubmit = (data: LoginCredentials | RegisterCredentials) => {
    if (type === 'register') {
      const registerData = data as RegisterCredentials;
      if (registerData.password !== registerData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
    }
    onSubmit(data);
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        {type === 'register' && (
          <>
            <Controller
              control={control}
              name="firstName"
              rules={validationRules.firstName}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="First Name"
                  placeholder="Enter your first name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.firstName?.message}
                  leftIcon="person-outline"
                  autoCapitalize="words"
                  textContentType="givenName"
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              rules={validationRules.lastName}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Last Name"
                  placeholder="Enter your last name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.lastName?.message}
                  leftIcon="person-outline"
                  autoCapitalize="words"
                  textContentType="familyName"
                />
              )}
            />
          </>
        )}

        <Controller
          control={control}
          name="email"
          rules={validationRules.email}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={validationRules.password}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              placeholder="Enter your password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              leftIcon="lock-closed-outline"
              isPassword
              textContentType="password"
              autoComplete={type === 'login' ? 'password' : 'new-password'}
            />
          )}
        />

        {type === 'register' && (
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Please confirm your password',
              validate: (value) =>
                value === password || 'Passwords do not match',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                leftIcon="lock-closed-outline"
                isPassword
                textContentType="newPassword"
                autoComplete="new-password"
              />
            )}
          />
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Button
          title={type === 'login' ? 'Sign In' : 'Create Account'}
          onPress={handleSubmit(handleFormSubmit)}
          loading={loading}
          disabled={!isValid}
          variant="primary"
          size="large"
          style={styles.submitButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 24,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
  },
});