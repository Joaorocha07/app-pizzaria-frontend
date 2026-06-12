import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { ProductDetailsScreen } from '../screens/Products/ProductDetailsScreen';
import { CartScreen } from '../screens/Cart/CartScreen';
import { CheckoutScreen } from '../screens/Checkout/CheckoutScreen';
import { OrderTrackingScreen } from '../screens/Orders/OrderTrackingScreen';
import { EditProfileScreen } from '../screens/Profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/Profile/ChangePasswordScreen';
import { AddressesScreen } from '../screens/Addresses/AddressesScreen';
import { AddressFormScreen } from '../screens/Addresses/AddressFormScreen';
import { NotificationsScreen } from '../screens/Notifications/NotificationsScreen';
import { ReviewScreen } from '../screens/Reviews/ReviewScreen';
import { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen} />
      <Stack.Screen name="Notificacoes" component={NotificationsScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
    </Stack.Navigator>
  );
}
