import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import QueueTabs from '@/components/Queue/QueueTabs';

export default function ManageScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className='flex-1 bg-white'>
      <View className='relative px-5 py-4'>
        <Text className='text-center text-2xl font-bold text-[#4B197C]'>
          Manage
        </Text>
      </View>
      <QueueTabs showCustomer={false} />
    </SafeAreaView>
  );
}
