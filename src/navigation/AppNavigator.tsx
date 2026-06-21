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
import { AdminProductFormScreen } from '../screens/Admin/ProductFormScreen';
import { AdminCategoriesManagementScreen } from '../screens/Admin/CategoriesManagementScreen';
import { AdminCategoryFormScreen } from '../screens/Admin/CategoryFormScreen';
import { AdminCrustsManagementScreen } from '../screens/Admin/CrustsManagementScreen';
import { AdminCrustFormScreen } from '../screens/Admin/CrustFormScreen';
import { AdminCouponsManagementScreen } from '../screens/Admin/CouponsManagementScreen';
import { AdminCouponFormScreen } from '../screens/Admin/CouponFormScreen';
import { AdminBannersManagementScreen } from '../screens/Admin/BannersManagementScreen';
import { AdminBannerFormScreen } from '../screens/Admin/BannerFormScreen';
import { AdminStoreConfigScreen } from '../screens/Admin/StoreConfigScreen';
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
      <Stack.Screen name="AdminProductForm" component={AdminProductFormScreen} />
      <Stack.Screen name="AdminCategories" component={AdminCategoriesManagementScreen} />
      <Stack.Screen name="AdminCategoryForm" component={AdminCategoryFormScreen} />
      <Stack.Screen name="AdminCrusts" component={AdminCrustsManagementScreen} />
      <Stack.Screen name="AdminCrustForm" component={AdminCrustFormScreen} />
      <Stack.Screen name="AdminCoupons" component={AdminCouponsManagementScreen} />
      <Stack.Screen name="AdminCouponForm" component={AdminCouponFormScreen} />
      <Stack.Screen name="AdminBanners" component={AdminBannersManagementScreen} />
      <Stack.Screen name="AdminBannerForm" component={AdminBannerFormScreen} />
      <Stack.Screen name="AdminStoreConfig" component={AdminStoreConfigScreen} />
    </Stack.Navigator>
  );
}
