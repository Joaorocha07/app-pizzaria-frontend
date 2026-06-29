import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoadingSpinner } from './src/components/common/LoadingSpinner';
import { ThemePickerModal } from './src/components/common/ThemePickerModal';

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { needsThemePick } = useTheme();
  if (isLoading) return <LoadingSpinner fullScreen message="Carregando..." />;
  return (
    <>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      {isAuthenticated && needsThemePick && <ThemePickerModal />}
    </>
  );
}

function AppContent() {
  const { colors } = useTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer>
              <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
              <RootNavigator />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
