import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Props = {
  total: number;
  lastUpdated: string;
  onRefresh?: () => void;
};

export default function TablesFooter({ total, lastUpdated, onRefresh }: Props) {
  return (
    <View className='mt-3 flex-row items-center justify-between px-6'>
      <Text className='text-[14px] text-[#302B47]'>{total} Tables</Text>

      <View className='flex-row items-center'>
        <Text className='text-[12px] text-[#302B47]'>
          Last updated {lastUpdated}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onRefresh}
          className='ml-2'
        >
          <MaterialIcons name='refresh' size={18} color='#4E4860' />
        </TouchableOpacity>
      </View>
    </View>
  );
}
