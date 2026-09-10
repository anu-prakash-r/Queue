import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';

type Props = {
  onBack?: () => void;
};

export default function TablesHeader({ onBack }: Props) {
  return (
    <View className='bg-[#35116B] px-5 pb-4 pt-12'>
      <View className='flex-row items-center justify-between'>
        <View className='flex-row items-center'>
          <Text className='text-[16px] font-bold text-white'>
            Tables Master
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/addTable')}

          className='h-[32px] w-[32px] items-center justify-center rounded-full bg-white'
        >
          <MaterialIcons name='add' size={26} color='#35116B' />
        </TouchableOpacity>
      </View>
    </View>
  );
}
