import {
  HomeSvg,
  Profile,
  Queue,
  Table,
  Manage,
  Owners,
} from '@/assets/Svg/NavBar';

import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';

import { router, usePathname } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

const PURPLE = '#442F52';
const INACTIVE = '#777180';
const ACTIVE_BG = '#F1EAF5';
const BORDER = '#E8E3EA';
const SCREEN_BG = '#FFFFFF';

const DRAWER_ITEMS = [
  {
    label: 'Home',
    href: '/(app)/(tabs)/home' as const,
    match: 'home',
    icon: HomeSvg,
  },
  {
    label: 'Queue',
    href: '/(app)/(tabs)/queue' as const,
    match: 'queue',
    icon: Queue,
  },
  {
    label: 'Tables',
    href: '/(app)/(tabs)/tables' as const,
    match: 'tables',
    icon: Table,
  },
  {
    label: 'Manage',
    href: '/(app)/(tabs)/manage' as const,
    match: 'manage',
    icon: Manage,
  },
  {
    label: 'Owners',
    href: '/(app)/(tabs)/owners' as const,
    match: 'owners',
    icon: Owners,
  },
  {
    label: 'Profile',
    href: '/(app)/(tabs)/profile' as const,
    match: 'profile',
    icon: Profile,
  },
];

export default function AppDrawerContent(props: DrawerContentComponentProps) {
  const pathname = usePathname();
  const { logout, isSuperAdmin } = useAuth();

  const { name, restaurant } = useUserProfile();

  const drawerItems = isSuperAdmin
    ? DRAWER_ITEMS.filter(item => item.match === 'owners' || item.match === 'profile')
    : DRAWER_ITEMS.filter(item => item.match !== 'owners' && item.match !== 'profile');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            props.navigation.closeDrawer();
            await logout();
            router.replace('/onboard');
          } catch (error) {
            console.log('LOGOUT ERROR:', error);
            Alert.alert('Error', 'Unable to logout.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name='restaurant' size={25} color='#FFFFFF' />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.brand}>{name || 'Queue'}</Text>
          <Text style={styles.subtitle}>
            {restaurant || 'Your Restaurant'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <DrawerContentScrollView
        {...props}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.menuTitle}>MENU</Text>

        {drawerItems.map(item => {
          const focused = pathname.includes(item.match);
          const color = focused ? PURPLE : INACTIVE;
          const Icon = item.icon;

          return (
            <DrawerItem
              key={item.match}
              label={item.label}
              focused={focused}
              activeTintColor={PURPLE}
              inactiveTintColor={INACTIVE}
              activeBackgroundColor={ACTIVE_BG}
              pressColor='#F7F4F8'
              labelStyle={[
                styles.label,
                {
                  color,
                },
              ]}
              style={[styles.drawerItem, focused && styles.activeDrawerItem]}
              icon={() => (
                <View
                  style={[
                    styles.iconContainer,
                    focused && styles.activeIconContainer,
                  ]}
                >
                  <Icon width={23} height={23} color={color} />
                </View>
              )}
              onPress={() => {
                router.navigate(item.href);
                props.navigation.closeDrawer();
              }}
            />
          );
        })}
      </DrawerContentScrollView>

      <View style={styles.bottomSection}>
        <View style={styles.divider} />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <View style={styles.logoutIcon}>
            <MaterialIcons name='logout' size={23} color='#C0392B' />
          </View>

          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Queue App • v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 20,
  },

  logoContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE,
    borderRadius: 14,
  },

  headerText: {
    marginLeft: 13,
  },

  brand: {
    fontSize: 21,
    fontWeight: '700',
    color: PURPLE,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '500',
    color: INACTIVE,
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
  },

  scrollContent: {
    paddingTop: 18,
    paddingBottom: 20,
  },

  menuTitle: {
    marginLeft: 20,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#A49DA8',
  },

  drawerItem: {
    marginHorizontal: 12,
    marginVertical: 3,
    borderRadius: 13,
    height: 52,
  },

  activeDrawerItem: {
    borderRadius: 13,
  },

  label: {
    marginLeft: -10,
    fontSize: 15,
    fontWeight: '600',
  },

  iconContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },

  activeIconContainer: {
    backgroundColor: '#E8DDF0',
  },

  bottomSection: {
    paddingBottom: 18,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 12,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: '#FFF5F4',
  },

  logoutIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#C0392B',
  },

  version: {
    marginTop: 12,
    marginBottom: 28,
    textAlign: 'center',
    fontSize: 11,
    color: '#AAA4AE',
  },
});
