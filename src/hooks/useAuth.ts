import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { LoginCredentials, RegisterCredentials, AuthResponse, AuthError } from '../types/auth';

// Mock API functions - replace with actual API calls
const mockLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock validation
  if (credentials.email === 'error@test.com') {
    throw new Error('Invalid credentials');
  }
  
  return {
    user: {
      id: '1',
      email: credentials.email,
      firstName: 'John',
      lastName: 'Doe',
    },
    token: 'mock-jwt-token',
  };
};

const mockRegister = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock validation
  if (credentials.email === 'exists@test.com') {
    throw new Error('Email already exists');
  }
  
  return {
    user: {
      id: '2',
      email: credentials.email,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
    },
    token: 'mock-jwt-token',
  };
};

export const useAuth = () => {
  const { setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: mockLogin,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });

  const registerMutation = useMutation({
    mutationFn: mockRegister,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });

  const logout = () => {
    clearAuth();
  };

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
  };
};