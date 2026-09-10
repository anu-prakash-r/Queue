import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type AddTableHeaderProps = {
  onBack?: () => void;
};

export default function AddTableHeader({ onBack }: AddTableHeaderProps) {
  return (
    <View className='bg-[#35116B] px-5 pb-5 pt-12'>
      <View className='flex-row items-center'>
        <TouchableOpacity activeOpacity={0.7} onPress={onBack} className='mr-5'>
          <MaterialIcons name='arrow-back' size={24} color='#FFFFFF' />
        </TouchableOpacity>

        <Text className='text-[18px] font-bold text-white'>Add Table</Text>
      </View>
    </View>
  );
}
