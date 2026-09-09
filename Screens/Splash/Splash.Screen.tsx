import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import QueueSvg from '@/assets/Svg/Queue.svg';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

const BRAND = '#442F52';
const SVG_ASPECT = 1024 / 1536;

export default function SplashScreenComponent() {
  const { width, height } = useWindowDimensions();
  const { isSuperAdmin } = useAuth();
  const isSuperAdminRef = useRef(isSuperAdmin);
  isSuperAdminRef.current = isSuperAdmin;
  const fade = useRef(new Animated.Value(0)).current;

  const logoWidth = Math.min(width * 0.78, 360);
  const logoHeight = Math.min(logoWidth * SVG_ASPECT, height * 0.42);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();

    const navigateInitial = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          router.replace(isSuperAdminRef.current ? '/owners' : '/home');
        } else {
          router.replace('/onboard');
        }
      } catch (e) {
        console.error('Failed to read auth token', e);
        router.replace('/onboard');
      }
    };

    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
      await navigateInitial();
    }, 2000);

    return () => clearTimeout(timer);
  }, [fade]);

  return (
    <View style={styles.container}>
      <StatusBar style='dark' />
      <Animated.View style={[styles.content, { opacity: fade }]}>
        <QueueSvg width={logoWidth} height={logoHeight} />
        <Text style={styles.title}>Queue</Text>
        <Text style={styles.subtitle}>Manage your restaurant queue</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 28,
    fontSize: 32,
    fontWeight: '700',
    color: BRAND,
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#777180',
  },
});
