import React from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';

import type { QueueItem } from '@/components/Queue/types';

type EditQueueModalProps = {
  visible: boolean;
  loading: boolean;
  item: QueueItem | null;
  partySize: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function EditQueueModal({
  visible,
  loading,
  item,
  partySize,
  onDecrease,
  onIncrease,
  onConfirm,
  onCancel,
}: EditQueueModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType='fade'
      onRequestClose={onCancel}
    >
      <View className='flex-1 justify-end'>
        <Pressable
          onPress={onCancel}
          className='absolute inset-0 bg-black/40'
        />

        <View className='w-full rounded-t-[28px] bg-white px-5 pb-8 pt-3'>
          <View className='mb-5 items-center'>
            <View className='h-1.5 w-12 rounded-full bg-[#D8D2E2]' />
          </View>

          <View className='flex-row items-center justify-between'>
            <View className='flex-1'>
              <Text className='text-[20px] font-bold text-[#442F52]'>
                Edit Queue
              </Text>

              {item && (
                <Text
                  numberOfLines={1}
                  className='mt-1 text-[13px] text-[#777180]'
                >
                  {item.name}
                </Text>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              disabled={loading}
              className='ml-3 h-10 w-10 items-center justify-center rounded-full bg-[#F6F2F8]'
              hitSlop={10}
            >
              <MaterialIcons name='close' size={22} color='#777180' />
            </TouchableOpacity>
          </View>

          <View className='mt-7'>
            <Text className='mb-2 text-[14px] font-semibold text-[#17132F]'>
              Party Size
              <Text className='text-[#E31B23]'> *</Text>
            </Text>

            <View className='h-[54px] w-full flex-row overflow-hidden rounded-xl border border-[#D8D2E2] bg-white'>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onDecrease}
                disabled={loading}
                hitSlop={10}
                className='w-[54px] items-center justify-center border-r border-[#D8D2E2]'
              >
                <Entypo name='minus' size={22} color='#35116B' />
              </TouchableOpacity>

              <View className='flex-1 items-center justify-center'>
                <Text className='text-[17px] font-semibold text-[#17132F]'>
                  {partySize}
                </Text>

                <Text className='mt-0.5 text-[11px] text-[#777180]'>
                  {partySize === 1 ? 'Person' : 'People'}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onIncrease}
                disabled={loading}
                hitSlop={10}
                className='w-[54px] items-center justify-center border-l border-[#D8D2E2]'
              >
                <Entypo name='plus' size={22} color='#35116B' />
              </TouchableOpacity>
            </View>
          </View>

          <View className='mt-7 flex-row gap-3'>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={loading}
              hitSlop={10}
              onPress={onCancel}
              className='h-[52px] flex-1 items-center justify-center rounded-xl border border-[#35116B] bg-white'
            >
              <Text className='text-[14px] font-bold text-[#35116B]'>
                CANCEL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={loading}
              hitSlop={10}
              onPress={onConfirm}
              className='h-[52px] flex-1 items-center justify-center rounded-xl bg-[#35116B]'
            >
              {loading ? (
                <ActivityIndicator size='small' color='#FFFFFF' />
              ) : (
                <View className='flex-row items-center'>
                  <MaterialIcons name='check' size={18} color='#FFFFFF' />

                  <Text className='ml-1.5 text-[14px] font-bold text-white'>
                    SAVE
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
