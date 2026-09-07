import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeSvg, Table, Queue, Profile } from '@/assets/Svg/NavBar';

const PURPLE = '#442F52';
const INACTIVE = '#AAAAAA';
const ACTIVE_BG = '#F1EAF5';

const SIDE_GAP = 18;

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

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
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];

            const isFocused = state.index === index;

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

      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
