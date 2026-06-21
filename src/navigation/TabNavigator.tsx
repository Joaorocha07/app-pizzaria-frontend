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
import { AdminMoreScreen } from '../screens/Admin/AdminMoreScreen';
import { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Pedidos: { active: 'receipt', inactive: 'receipt-outline' },
  AdminPedidos: { active: 'list', inactive: 'list-outline' },
  AdminProdutos: { active: 'cube', inactive: 'cube-outline' },
  AdminRelatorios: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  AdminGerenciar: { active: 'settings', inactive: 'settings-outline' },
  Perfil: { active: 'person-circle', inactive: 'person-circle-outline' },
};

const TAB_OPTIONS = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: '#141414',
    borderTopColor: '#242424',
    borderTopWidth: 1,
    height: 68,
    paddingBottom: 11,
    paddingTop: 7,
  },
  tabBarActiveTintColor: '#E32626',
  tabBarInactiveTintColor: '#7B8190',
  tabBarLabelStyle: { fontSize: 11, fontWeight: '800' as const },
  tabBarItemStyle: { paddingVertical: 2 },
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
          {isAdmin && (
            <Tab.Screen
              name="AdminGerenciar"
              component={AdminMoreScreen}
              options={{ tabBarLabel: 'Gerenciar' }}
            />
          )}
        </>
      )}
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}
