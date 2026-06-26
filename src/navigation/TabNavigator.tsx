import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { MenuScreen } from '../screens/Menu/MenuScreen';
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
  Home:            { active: 'home',         inactive: 'home-outline' },
  Cardapio:        { active: 'restaurant',   inactive: 'restaurant-outline' },
  Pedidos:         { active: 'bag-handle',   inactive: 'bag-handle-outline' },
  AdminPedidos:    { active: 'clipboard',    inactive: 'clipboard-outline' },
  AdminProdutos:   { active: 'grid',         inactive: 'grid-outline' },
  AdminRelatorios: { active: 'stats-chart',  inactive: 'stats-chart-outline' },
  AdminGerenciar:  { active: 'construct',    inactive: 'construct-outline' },
  Perfil:          { active: 'person',       inactive: 'person-outline' },
};

const ACTIVE_BG = '#C0392B';

/* ─── TabItem ────────────────────────────────────────────────── */
interface TabItemProps {
  routeName: string;
  label: string;
  focused: boolean;
  inactiveColor: string;
  onPress: () => void;
}

function TabItem({ routeName, label, focused, inactiveColor, onPress }: TabItemProps) {
  const pillScale = useRef(new Animated.Value(focused ? 1 : 0.6)).current;
  const pillOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const contentScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(pillScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 35,
          bounciness: 10,
        }),
        Animated.timing(pillOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(contentScale, {
            toValue: 1.18,
            useNativeDriver: true,
            speed: 60,
            bounciness: 14,
          }),
          Animated.spring(contentScale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 4,
          }),
        ]),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(pillOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.spring(pillScale, {
          toValue: 0.7,
          useNativeDriver: true,
          speed: 30,
        }),
      ]).start();
    }
  }, [focused]);

  const icons = TAB_ICONS[routeName] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
  const iconColor = focused ? '#FFFFFF' : inactiveColor;

  return (
    <Pressable
      onPress={onPress}
      style={tabItemStyles.container}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      {/* Active pill background */}
      <Animated.View
        style={[
          tabItemStyles.pill,
          {
            opacity: pillOpacity,
            transform: [{ scale: pillScale }],
          },
        ]}
      />

      {/* Icon + label */}
      <Animated.View
        style={[tabItemStyles.content, { transform: [{ scale: contentScale }] }]}
      >
        <Ionicons
          name={focused ? icons.active : icons.inactive}
          size={22}
          color={iconColor}
        />
        <Text style={[tabItemStyles.label, { color: iconColor }]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const tabItemStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    width: 60,
    height: 52,
    borderRadius: 16,
    backgroundColor: ACTIVE_BG,
  },
  content: {
    alignItems: 'center',
    gap: 3,
    zIndex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

/* ─── CustomTabBar ───────────────────────────────────────────── */
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const gradientColors = (
    isDark
      ? ['#0F0F0F', '#000000']
      : ['#F8F5F0', '#EFECE8']
  ) as [string, string];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        tabBarStyles.bar,
        {
          paddingBottom: insets.bottom || 12,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label = (options.tabBarLabel ?? route.name) as string;

        return (
          <TabItem
            key={route.key}
            routeName={route.name}
            label={label}
            focused={focused}
            inactiveColor={colors.tabInactive}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          />
        );
      })}
    </LinearGradient>
  );
}

const tabBarStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    elevation: 0,
  },
});

/* ─── TabNavigator ───────────────────────────────────────────── */
export function TabNavigator() {
  const { isStaff, isAdmin } = useAuth();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {!isStaff ? (
        <>
          <Tab.Screen name="Home"     component={HomeScreen}  options={{ tabBarLabel: 'Início' }} />
          <Tab.Screen name="Cardapio" component={MenuScreen}  options={{ tabBarLabel: 'Cardápio' }} />
          <Tab.Screen name="Pedidos"  component={OrdersScreen} options={{ tabBarLabel: 'Pedidos' }} />
        </>
      ) : (
        <>
          <Tab.Screen name="AdminPedidos"  component={AdminOrdersManagementScreen}   options={{ tabBarLabel: 'Pedidos' }} />
          <Tab.Screen name="AdminProdutos" component={AdminProductsManagementScreen} options={{ tabBarLabel: 'Produtos' }} />
          {isAdmin && (
            <Tab.Screen name="AdminRelatorios" component={AdminReportsScreen} options={{ tabBarLabel: 'Relatórios' }} />
          )}
          {isAdmin && (
            <Tab.Screen name="AdminGerenciar"  component={AdminMoreScreen}   options={{ tabBarLabel: 'Gerenciar' }} />
          )}
        </>
      )}
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarLabel: 'Conta' }} />
    </Tab.Navigator>
  );
}
