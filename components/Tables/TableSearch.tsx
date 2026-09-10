import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onFilter?: () => void;
};

export default function TableSearch({ value, onChangeText, onFilter }: Props) {
  return (
    <View className='px-5 pt-5'>
      <View className='flex-row'>
        <View className='flex-1 flex-row items-center rounded-xl border border-[#DDD7E5] bg-white px-4'>
          <MaterialIcons name='search' size={23} color='#625A72' />

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder='Search tables...'
            placeholderTextColor='#817990'
            className='ml-3 flex-1 text-[16px] text-[#24113D]'
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onFilter}
          hitSlop={10}
          className='ml-3 h-[42px] w-[42px] items-center justify-center rounded-xl border border-[#DDD7E5] bg-white'
        >
          <Feather name='filter' size={22} color='#35116B' />
        </TouchableOpacity>
      </View>
    </View>
  );
}
