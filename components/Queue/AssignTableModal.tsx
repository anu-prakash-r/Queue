import React from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { QueueItem } from '@/components/Queue/types';

type AssignTableModalProps = {
  visible: boolean;
  item: QueueItem | null;
  tableNumber: string;
  error: string;
  submitting: boolean;
  keyboardHeight: number;
  onChangeTableNumber: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AssignTableModal({
  visible,
  item,
  tableNumber,
  error,
  submitting,
  keyboardHeight,
  onChangeTableNumber,
  onConfirm,
  onCancel,
}: AssignTableModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType='fade'
      onRequestClose={onCancel}
    >
      <View
        className='flex-1 justify-end'
        style={{ paddingBottom: keyboardHeight }}
      >
        <Pressable onPress={onCancel} className='absolute inset-0 bg-black/40' />

        <View className='max-h-[85%] rounded-t-3xl bg-white p-5 pb-8'>
          <View className='mb-4 items-center'>
            <View className='h-1.5 w-12 rounded-full bg-[#DDD6E2]' />
          </View>

          <View className='mb-4 flex-row items-center justify-between'>
            <Text className='text-[18px] font-bold text-[#442F52]'>
              Assign Table
            </Text>

            <TouchableOpacity
              className='h-8 w-8 items-center justify-center'
              activeOpacity={0.7}
              onPress={onCancel}
            >
              <MaterialIcons name='close' size={24} color='#777180' />
            </TouchableOpacity>
          </View>

          {item && (
            <Text className='mb-3 text-[13px] text-[#777180]'>
              Seating {item.name} ({item.people} people)
            </Text>
          )}

          <Text className='mb-2 text-[14px] font-medium text-[#17132F]'>
            Table Number
            <Text className='text-[#E31B23]'> *</Text>
          </Text>

          <View
            className={`h-[48px] flex-row items-center rounded-xl border bg-white px-3 ${
              error ? 'border-[#E31B23]' : 'border-[#D8D2E2]'
            }`}
          >
            <MaterialIcons
              name='table-restaurant'
              size={20}
              color='#777180'
            />

            <TextInput
              value={tableNumber}
              onChangeText={onChangeTableNumber}
              placeholder='Enter table number (e.g. 5)'
              placeholderTextColor='#77718A'
              keyboardType='number-pad'
              className='ml-2 h-full flex-1 text-[14px] text-[#17132F]'
            />
          </View>

          {error ? (
            <Text className='mt-1 text-[12px] text-[#E31B23]'>{error}</Text>
          ) : null}

          <View className='mt-5 flex-row gap-3'>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={submitting}
              onPress={onCancel}
              className='h-12 flex-1 items-center justify-center rounded-xl border border-[#35116B] bg-white'
            >
              <Text className='text-[14px] font-semibold text-[#35116B]'>
                CANCEL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={submitting}
              onPress={onConfirm}
              className='h-12 flex-1 items-center justify-center rounded-xl bg-[#35116B]'
            >
              {submitting ? (
                <ActivityIndicator size='small' color='#FFFFFF' />
              ) : (
                <Text className='text-[14px] font-semibold text-white'>
                  ASSIGN
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}