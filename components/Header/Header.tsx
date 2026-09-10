import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

type AppHeaderProps = {
  name?: string;
  restaurantName?: string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
};

export default function AppHeader({
  name = 'Name',
  restaurantName = 'Dark Restaurant',
  onMenuPress,
  onNotificationPress,
}: AppHeaderProps) {
  return (
    <View className='flex-row items-center justify-between px-5 py-4'>
      <View className='flex-row items-center'>
        <TouchableOpacity
          onPress={onMenuPress}
          activeOpacity={0.7}
          className='mr-4 h-10 w-10 items-center justify-center rounded-xl'
          hitSlop={10}
        >
          <AntDesign name='menu' size={26} color='#442F52' />
        </TouchableOpacity>

        <View>
          <Text className='text-[14px] font-bold text-[#777180]'>
            Hi, {name} 👋
          </Text>

          <View className='mt-0.5 flex-row items-center'>
            <Text className='text-[13px] text-[#777180]'>{restaurantName}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={onNotificationPress}
        activeOpacity={0.7}
        className='relative h-11 w-11 items-center justify-center rounded-full'
        hitSlop={10}
      >
        <MaterialIcons name='notifications-none' size={27} color='#442F52' />

        <View className='absolute left-6 top-0 h-5 min-w-[20px] items-center justify-center rounded-full bg-[#4d13af] px-1'>
          <Text className='text-[11px] font-bold text-white'>5</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
