import React from 'react';

import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { QueueItem } from '@/components/Queue/types';
import { formatTime } from '@/components/Queue/utils';
import { QueueItem as QueueApiItem } from '@/store/api/queueApi';

type QueueDetailModalProps = {
  visible: boolean;
  loading: boolean;
  error: string;
  item: QueueItem | null;
  data: QueueApiItem | null;
  onRetry: () => void;
  onClose: () => void;
};

export default function QueueDetailModal({
  visible,
  loading,
  error,
  item,
  data,
  onRetry,
  onClose,
}: QueueDetailModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType='fade'
      onRequestClose={onClose}
    >
      <View className='flex-1 justify-end'>
        <Pressable onPress={onClose} className='absolute inset-0 bg-black/40' />

        <View className='max-h-[85%] rounded-t-3xl bg-white p-5 pb-8'>
          <View className='mb-4 items-center'>
            <View className='h-1.5 w-12 rounded-full bg-[#DDD6E2]' />
          </View>

          <View className='mb-4 flex-row items-center justify-between'>
            <Text className='text-[18px] font-bold text-[#442F52]'>
              Queue Details
            </Text>

            <TouchableOpacity
              className='h-8 w-8 items-center justify-center'
              activeOpacity={0.7}
              onPress={onClose}
            >
              <MaterialIcons name='close' size={24} color='#777180' />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className='items-center justify-center py-16'>
              <ActivityIndicator size='large' color='#4B197C' />
            </View>
          ) : error ? (
            <View className='items-center justify-center px-8 py-12'>
              <MaterialIcons name='error-outline' size={44} color='#C9C2CF' />

              <Text className='mt-3 text-center text-[14px] text-[#4B4552]'>
                {error}
              </Text>

              <TouchableOpacity
                className='mt-4 rounded-xl bg-[#4B197C] px-6 py-2.5'
                activeOpacity={0.8}
                onPress={onRetry}
              >
                <Text className='text-[13px] font-bold text-white'>RETRY</Text>
              </TouchableOpacity>
            </View>
          ) : data ? (
            <>
              <View className='rounded-2xl border border-[#E9E2ED] bg-[#F7F3FB] p-4'>
                <Text className='text-[16px] font-bold text-[#24113D]'>
                  {data.customer_name ??
                    data.name ??
                    data.customer?.name ??
                    item?.name ??
                    'Customer'}
                </Text>

                <View className='mt-3 flex-row items-center justify-between'>
                  <View className='flex-row items-center'>
                    <MaterialIcons
                      name='local-phone'
                      size={17}
                      color='#777180'
                    />

                    <Text className='ml-2 text-[13px] text-[#4B4552]'>
                      {data.mobile_number ??
                        data.customer?.mobile_number ??
                        '--'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    className='flex-row items-center rounded-lg bg-[#24113D] px-3 py-2'
                    onPress={() => {
                      const phoneNumber =
                        data.mobile_number ?? data.customer?.mobile_number;

                      if (phoneNumber) {
                        Linking.openURL(`tel:${phoneNumber}`);
                      }
                    }}
                    disabled={
                      !(data.mobile_number ?? data.customer?.mobile_number)
                    }
                  >
                    <MaterialIcons name='call' size={16} color='#FFFFFF' />

                    <Text className='ml-1.5 text-[13px] font-semibold text-white'>
                      Call
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className='mt-4 flex-row flex-wrap'>
                <DetailInfo
                  icon='group'
                  label='Party Size'
                  value={
                    data.party_size ??
                    data.people ??
                    data.guests ??
                    item?.people ??
                    1
                  }
                />

                <DetailInfo
                  icon='access-time'
                  label='Waiting'
                  value={
                    typeof data.estimated_wait === 'number'
                      ? `${Math.round(data.estimated_wait)}m`
                      : typeof data.waiting_time === 'number'
                        ? `${Math.round(data.waiting_time)}m`
                        : (data.estimated_wait ??
                          data.waiting_time ??
                          '--')
                  }
                />

                <DetailInfo
                  icon='schedule'
                  label='Joined'
                  value={formatTime(data.created_at)}
                />

                <DetailInfo
                  icon='info-outline'
                  label='Status'
                  value={data.status ?? item?.status ?? 'waiting'}
                />
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

type DetailInfoProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string | number;
};

function DetailInfo({ icon, label, value }: DetailInfoProps) {
  return (
    <View className='mb-3 w-1/2 pr-3'>
      <View className='flex-row items-center rounded-2xl border border-[#E9E2ED] bg-white px-3 py-3'>
        <View className='h-8 w-8 items-center justify-center rounded-full bg-[#F1EAF5]'>
          <MaterialIcons name={icon} size={16} color='#442F52' />
        </View>

        <View className='ml-2 flex-1'>
          <Text numberOfLines={1} className='text-[10px] text-[#777180]'>
            {label}
          </Text>

          <Text
            numberOfLines={1}
            className='text-[13px] font-semibold text-[#24113D]'
          >
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}