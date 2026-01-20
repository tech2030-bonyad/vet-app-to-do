import React, { useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { usePetStore } from '../stores/petStore';

interface NavigationGuardProps {
  children: ReactNode;
}

/**
 * Navigation guard component
 * Handles authentication and route protection
 */
export default function NavigationGuard({ children }: NavigationGuardProps) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const { pets, isLoading: petsLoading, fetchPets } = usePetStore();

  /**
   * Check if current route is in auth group
   */
  const inAuthGroup = segments[0] === 'auth';

  /**
   * Check if current route is in onboarding group
   */
  const inOnboardingGroup = segments[0] === 'onboarding';

  /**
   * Check if current route requires authentication
   */
  const requiresAuth = !inAuthGroup && !inOnboardingGroup && segments[0] !== '+not-found';

  /**
   * Check if user needs onboarding
   */
  const needsOnboarding = isAuthenticated && user && !user.hasCompletedOnboarding;

  /**
   * Check if user needs to add a pet
   */
  const needsPetSetup = isAuthenticated && 
    user?.hasCompletedOnboarding && 
    !petsLoading && 
    pets.length === 0;

  useEffect(() => {
    // Don't navigate while loading
    if (authLoading) return;

    // Fetch pets when authenticated
    if (isAuthenticated && !petsLoading && pets.length === 0) {
      fetchPets().catch(console.error);
    }

    // Handle navigation based on auth state
    if (!isAuthenticated && requiresAuth) {
      // Redirect to login if not authenticated and trying to access protected route
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated and on auth screen
      if (needsOnboarding) {
        router.replace('/onboarding/welcome');
      } else if (needsPetSetup) {
        router.replace('/onboarding/pet-setup');
      } else {
        router.replace('/dashboard');
      }
    } else if (isAuthenticated && needsOnboarding && !inOnboardingGroup) {
      // Redirect to onboarding if user hasn't completed it
      router.replace('/onboarding/welcome');
    } else if (isAuthenticated && needsPetSetup && segments.join('/') !== 'onboarding/pet-setup') {
      // Redirect to pet setup if user has no pets
      router.replace('/onboarding/pet-setup');
    }
  }, [
    isAuthenticated,
    authLoading,
    petsLoading,
    requiresAuth,
    inAuthGroup,
    inOnboardingGroup,
    needsOnboarding,
    needsPetSetup,
    segments,
    router,
    fetchPets,
    pets.length,
    user,
  ]);

  /**
   * Handle deep linking protection
   */
  useEffect(() => {
    // Protect routes that require specific pets
    const petRequiredRoutes = ['health', 'activities', 'care'];
    const currentRoute = segments[0];
    
    if (
      isAuthenticated &&
      !authLoading &&
      !petsLoading &&
      petRequiredRoutes.includes(currentRoute) &&
      pets.length === 0
    ) {
      // Redirect to pet setup if trying to access pet-specific routes without pets
      router.replace('/onboarding/pet-setup');
    }
  }, [
    isAuthenticated,
    authLoading,
    petsLoading,
    pets.length,
    segments,
    router,
  ]);

  /**
   * Handle Android back button behavior
   */
  useEffect(() => {
    const handleBackButton = () => {
      const currentPath = segments.join('/');
      
      // Prevent going back from certain screens
      const noBackRoutes = [
        'auth/login',
        'onboarding/welcome',
        'dashboard',
      ];
      
      if (noBackRoutes.includes(currentPath)) {
        return true; // Prevent default back behavior
      }
      
      return false; // Allow default back behavior
    };

    // Note: In a real app, you'd use BackHandler from react-native
    // BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    
    return () => {
      // BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, [segments]);

  return <>{children}</>;
}