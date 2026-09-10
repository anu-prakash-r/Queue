import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HomeSvg,
  Table,
  Queue,
  Profile,
  Manage,
  Owners,
} from '@/assets/Svg/NavBar';
import { useAuth } from '@/contexts/AuthContext';

const PURPLE = '#442F52';
const INACTIVE = '#AAAAAA';
const ACTIVE_BG = '#F1EAF5';

const SIDE_GAP = 18;

const ADMIN_TABS = ['owners', 'profile'];
const OWNER_TABS = ['home', 'queue', 'tables', 'manage'];
const STAFF_TABS = ['home', 'queue', 'tables'];
const TAB_ROUTES = [...ADMIN_TABS, ...OWNER_TABS];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const { isSuperAdmin, isOwner } = useAuth();

  const visibleRoutes = state.routes.filter(route => {
    if (route.name === 'owners' || route.name === 'profile') {
      return isSuperAdmin;
    }

    if (route.name === 'manage') {
      return isOwner;
    }

    return !isSuperAdmin;
  });

  return (
    <View
      style={[
        {
          paddingBottom: insets.bottom,
          paddingLeft: SIDE_GAP + insets.left,
          paddingRight: SIDE_GAP + insets.right,
          backgroundColor: '#ffffff',
        },
      ]}
    >
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          {visibleRoutes.map(route => {
            const { options } = descriptors[route.key];

            const stateIndex = state.routes.findIndex(r => r.key === route.key);

            const isFocused = state.index === stateIndex;

            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.name;

            const color = isFocused ? PURPLE : INACTIVE;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const renderIcon = () => {
              if (route.name === 'home') {
                return <HomeSvg width={24} height={24} color={color} />;
              }

              if (route.name === 'queue') {
                return <Queue width={26} height={26} color={color} />;
              }

              if (route.name === 'tables') {
                return <Table width={28} height={28} color={color} />;
              }

              if (route.name === 'profile') {
                return <Profile width={24} height={24} color={color} />;
              }

              if (route.name === 'manage') {
                return <Manage width={26} height={26} color={color} />;
              }

              if (route.name === 'owners') {
                return <Owners width={26} height={26} color={color} />;
              }

              return null;
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tabButton}
              >
                {isFocused && <View style={styles.activeBorder} />}

                <View
                  style={[
                    styles.iconBackground,
                    isFocused && styles.activeIconBackground,
                  ]}
                >
                  {renderIcon()}
                </View>

                <Text
                  style={[
                    styles.label,
                    {
                      color,
                    },
                  ]}
                >
                  {label as string}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { isSuperAdmin, isOwner, isRoleLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Keep the focused tab valid for the current role. When the role resolves
  // (e.g., right after login) the tab navigator can be left focused on a
  // hidden tab (home for super admins, owners/profile for owners), showing the
  // wrong screen with no active tab highlighted. This re-routes to the
  // correct landing tab in those cases.
  useEffect(() => {
    if (!isRoleLoaded) {
      return;
    }

    const current = pathname.split('/').filter(Boolean).pop() ?? '';

    if (!TAB_ROUTES.includes(current)) {
      return;
    }

    const allowed = isSuperAdmin
      ? ADMIN_TABS
      : isOwner
        ? OWNER_TABS
        : STAFF_TABS;

    if (!allowed.includes(current)) {
      router.replace(isSuperAdmin ? '/owners' : '/home');
    }
  }, [isRoleLoaded, isSuperAdmin, isOwner, pathname, router]);

  // Wait for the /auth/me call to resolve so the correct role-specific tabs
  // are rendered (and role-appropriate API calls are made).
  if (!isRoleLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size='large' color={PURPLE} />
      </View>
    );
  }

  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name='home'
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name='queue'
        options={{
          title: 'Queue',
        }}
      />

      <Tabs.Screen
        name='tables'
        options={{
          title: 'Tables',
        }}
      />

      {isSuperAdmin ? (
        <Tabs.Screen
          name='owners'
          options={{
            title: 'Owners',
          }}
        />
      ) : (
        <Tabs.Screen
          name='owners'
          options={{
            href: null,
          }}
        />
      )}

      {isSuperAdmin ? (
        <Tabs.Screen
          name='profile'
          options={{
            title: 'Profile',
          }}
        />
      ) : (
        <Tabs.Screen
          name='profile'
          options={{
            href: null,
          }}
        />
      )}

      {isOwner ? (
        <Tabs.Screen
          name='manage'
          options={{
            title: 'Manage',
          }}
        />
      ) : (
        <Tabs.Screen
          name='manage'
          options={{
            href: null,
          }}
        />
      )}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  tabBarWrapper: {
    height: 68,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },

  tabBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 3,
    paddingHorizontal: 2,
  },
  activeBorder: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 2,
    backgroundColor: PURPLE,
    borderRadius: 2,
  },
  iconBackground: {
    width: 38,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    marginBottom: 2,
  },

  activeIconBackground: {
    backgroundColor: ACTIVE_BG,
    borderRadius: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 15,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
