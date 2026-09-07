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

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = 'help-outline',
  loading = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType='fade'
      onRequestClose={onCancel}
    >
      <View className='flex-1 items-center justify-center px-6'>
        {/* Background Overlay */}
        <Pressable
          onPress={onCancel}
          className='absolute inset-0 bg-black/40'
        />

        {/* Modal */}
        <View className='w-full max-w-[380px] rounded-3xl bg-white p-5'>
          {/* Icon */}
          <View className='items-center'>
            <View
              className={`h-16 w-16 items-center justify-center rounded-full ${
                destructive ? 'bg-[#FFF0F0]' : 'bg-[#F1EAF5]'
              }`}
            >
              <MaterialIcons
                name={icon}
                size={30}
                color={destructive ? '#D64545' : '#442F52'}
              />
            </View>
          </View>

          {/* Title */}
          <Text className='mt-4 text-center text-[18px] font-bold text-[#442F52]'>
            {title}
          </Text>

          {/* Message */}
          <Text className='mt-2 text-center text-[13px] leading-5 text-[#777180]'>
            {message}
          </Text>

          {/* Buttons */}
          <View className='mt-6 flex-row gap-3'>
            {/* Cancel */}
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={loading}
              onPress={onCancel}
              className='h-12 flex-1 items-center justify-center rounded-xl border border-[#DDD6E2] bg-white'
            >
              <Text className='text-[14px] font-semibold text-[#5E5665]'>
                {cancelText}
              </Text>
            </TouchableOpacity>

            {/* Confirm */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={loading}
              onPress={onConfirm}
              className={`h-12 flex-1 items-center justify-center rounded-xl ${
                destructive ? 'bg-[#D64545]' : 'bg-[#442F52]'
              } ${loading ? 'opacity-60' : 'opacity-100'}`}
            >
              {loading ? (
                <ActivityIndicator size='small' color='#FFFFFF' />
              ) : (
                <Text className='text-[14px] font-bold text-white'>
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
