import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type AddTableFooterProps = {
  onCancel?: () => void;
  onSave?: () => void;
};

export default function AddTableFooter({
  onCancel,
  onSave,
}: AddTableFooterProps) {
  return (
    <View className='mb-4 border-t border-[#E7E2EB] bg-white px-5 py-5'>
      <View className='flex-row gap-3'>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCancel}
          className='h-[46px] flex-1 items-center justify-center rounded-xl border border-[#35116B] bg-white'
        >
          <Text className='text-[14px] font-semibold text-[#35116B]'>
            CANCEL
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSave}
          className='h-[46px] flex-1 items-center justify-center rounded-xl bg-[#35116B]'
        >
          <Text className='text-[14px] font-semibold text-white'>
            SAVE TABLE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
