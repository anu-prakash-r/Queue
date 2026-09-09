import { View, ScrollView } from 'react-native';
import React from 'react';

import AppHeader from '@/components/Header/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import QueueStats from '@/components/Status/Status';
import TodaysQueue from '@/components/Status/TodayQueue';

import { router, useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { HomeQueueSvg } from '@/assets/Svg';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function HomeScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const { name, restaurant } = useUserProfile();

  const handleMenuPress = () => {
    navigation.openDrawer();
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className='flex-1 bg-white'>
      <AppHeader
        name={name}
        restaurantName={restaurant}
        onMenuPress={handleMenuPress}
        onNotificationPress={() => router.push('/notification')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        <View className='-mt-24 -mb-36'>
          <HomeQueueSvg width='100%' height={320} />
        </View>

        <QueueStats />

        <TodaysQueue
          onCallPress={item => {
            console.log('Calling:', item.name);
          }}
          onAddCustomer={() => {
            router.push('/addqueue');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
