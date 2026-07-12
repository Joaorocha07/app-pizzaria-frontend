import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { fontFamily } from '../theme/theme';
import { AppHeader } from '../components/common/AppHeader';
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

/* ─── TabItem ────────────────────────────────────────────────── */
interface TabItemProps {
  routeName: string;
  label: string;
  focused: boolean;
  inactiveColor: string;
  activeColor: string;
  onPress: () => void;
}

/**
 * Aba estilo Nobile: sem pill — o ativo ganha um pequeno diamante dourado
 * sob o ícone e o label em CAPS espaçada na cor primária.
 */
function TabItem({ routeName, label, focused, inactiveColor, activeColor, onPress }: TabItemProps) {
  const diamondScale = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const contentScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(diamondScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 30,
          bounciness: 12,
        }),
        Animated.sequence([
          Animated.spring(contentScale, {
            toValue: 1.12,
            useNativeDriver: true,
            speed: 60,
            bounciness: 12,
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
      Animated.timing(diamondScale, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }).start();
    }
  }, [focused]);

  const icons = TAB_ICONS[routeName] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
  const iconColor = focused ? activeColor : inactiveColor;

  return (
    <Pressable
      onPress={onPress}
      style={tabItemStyles.container}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View
        style={[tabItemStyles.content, { transform: [{ scale: contentScale }] }]}
      >
        <Ionicons
          name={focused ? icons.active : icons.inactive}
          size={22}
          color={iconColor}
        />
        <Text style={[tabItemStyles.label, { color: iconColor }]}>
          {label.toUpperCase()}
        </Text>
        {/* Diamante indicador do ativo */}
        <Animated.View
          style={[
            tabItemStyles.diamond,
            { backgroundColor: activeColor, transform: [{ rotate: '45deg' }, { scale: diamondScale }] },
          ]}
        />
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
  },
  content: {
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  diamond: {
    width: 5,
    height: 5,
    marginTop: 1,
  },
});

/* ─── CustomTabBar ───────────────────────────────────────────── */
interface CustomTabBarProps extends BottomTabBarProps {
  onTabChange?: (routeName: string) => void;
}

function CustomTabBar({ state, descriptors, navigation, onTabChange }: CustomTabBarProps) {
  const focusedName = state.routes[state.index]?.name;
  useEffect(() => {
    onTabChange?.(focusedName);
  }, [focusedName]);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.tabBar }}>
      {/* Filete duplo superior — assinatura de impresso vintage */}
      <View style={[tabBarStyles.rule, { backgroundColor: colors.tabBarBorder }]} />
      <View style={[tabBarStyles.ruleThin, { backgroundColor: colors.tabBarBorder }]} />

      <View
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
              activeColor={colors.tabActive}
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
      </View>
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    elevation: 0,
  },
  rule: {
    height: 1,
  },
  ruleThin: {
    height: StyleSheet.hairlineWidth,
    marginTop: 2,
  },
});

/* ─── TabNavigator ───────────────────────────────────────────── */
export function TabNavigator() {
  const { isStaff, isAdmin } = useAuth();
  const [activeRoute, setActiveRoute] = useState('Home');

  const showAppHeader = !isStaff && activeRoute !== 'Perfil';

  return (
    <View style={{ flex: 1 }}>
      {showAppHeader && <AppHeader />}
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} onTabChange={setActiveRoute} />}
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
    </View>
  );
}
