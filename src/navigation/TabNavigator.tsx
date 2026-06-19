import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { OrdersScreen } from '../screens/Orders/OrdersScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { AdminOrdersManagementScreen } from '../screens/Admin/OrdersManagementScreen';
import { AdminProductsManagementScreen } from '../screens/Admin/ProductsManagementScreen';
import { AdminReportsScreen } from '../screens/Admin/ReportsScreen';
import { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Pedidos: { active: 'receipt', inactive: 'receipt-outline' },
  AdminPedidos: { active: 'list', inactive: 'list-outline' },
  AdminProdutos: { active: 'cube', inactive: 'cube-outline' },
  AdminRelatorios: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Perfil: { active: 'person-circle', inactive: 'person-circle-outline' },
};

const TAB_OPTIONS = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: '#1A1A1A',
    borderTopColor: '#2A2A2A',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 10,
    paddingTop: 6,
  },
  tabBarActiveTintColor: '#8B1A1A',
  tabBarInactiveTintColor: '#6B7280',
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
};

export function TabNavigator() {
  const { isStaff, isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...TAB_OPTIONS,
        tabBarIcon: ({ color, size, focused }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      {!isStaff ? (
        <>
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Início' }} />
          <Tab.Screen name="Pedidos" component={OrdersScreen} options={{ tabBarLabel: 'Pedidos' }} />
        </>
      ) : (
        <>
          <Tab.Screen
            name="AdminPedidos"
            component={AdminOrdersManagementScreen}
            options={{ tabBarLabel: 'Pedidos' }}
          />
          <Tab.Screen
            name="AdminProdutos"
            component={AdminProductsManagementScreen}
            options={{ tabBarLabel: 'Produtos' }}
          />
          {isAdmin && (
            <Tab.Screen
              name="AdminRelatorios"
              component={AdminReportsScreen}
              options={{ tabBarLabel: 'Relatórios' }}
            />
          )}
        </>
      )}
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}
