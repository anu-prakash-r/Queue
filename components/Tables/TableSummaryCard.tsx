import React from 'react';
import { Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Props = {
  icon: string;
  value: number;
  label: string;
  color: string;
  bgColor: string;
};

export default function TableSummaryCard({
  icon,
  value,
  label,
  color,
  bgColor,
}: Props) {
  return (
    <View className='flex-1 items-center rounded-xl border border-[#F0EDF3] bg-white px-1 py-4 shadow-sm'>
      <View
        className='h-10 w-10 items-center justify-center rounded-full'
        style={{ backgroundColor: bgColor }}
      >
        <MaterialIcons name={icon as any} size={23} color={color} />
      </View>

      <Text className='mt-2 text-[25px] font-bold text-[#18182E]'>{value}</Text>

      <Text className='mt-1 text-center text-[13px] text-[#292640]'>
        {label}
      </Text>
    </View>
  );
}
