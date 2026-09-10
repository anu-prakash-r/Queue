import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import {
  useGetQueuesQuery,
  QueueItem as QueueApiItem,
} from '@/store/api/queueApi';
import TodaysQueueSkeleton from '../SkeletonLoader/TodaysQueueSkeleton';

type QueueItem = {
  id: string | number;
  name: string;
  people: number;
  time: string;
  waitingTime: string;
  mobileNumber?: string;
};

type TodaysQueueProps = {
  onViewAll?: () => void;
  onCallPress?: (item: QueueItem) => void;
  onAddCustomer?: () => void;
  onManageTables?: () => void;
};

const MAX_ITEMS = 5;

function formatTime(createdAt?: string): string {
  if (!createdAt) {
    return '--';
  }

  const date = new Date(createdAt);

  if (isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatWaitingTime(item: QueueApiItem): string {
  const value = item.estimated_wait ?? item.waiting_time;

  if (value === undefined || value === null) {
    return '--';
  }

  if (typeof value === 'number') {
    return `${Math.round(value)}m`;
  }

  const parsed = Number(value);

  if (!isNaN(parsed)) {
    return `${Math.round(parsed)}m`;
  }

  return String(value);
}

function mapQueueItem(item: QueueApiItem): QueueItem {
  return {
    id: item.id ?? item.token_number ?? item.queue_number ?? '',
    name:
      item.customer_name ??
      item.name ??
      item.customer?.name ??
      item.mobile_number ??
      item.customer?.mobile_number ??
      'Customer',
    people: item.people ?? item.party_size ?? item.guests ?? 1,
    time: formatTime(item.created_at),
    waitingTime: formatWaitingTime(item),
    mobileNumber: item.mobile_number ?? item.customer?.mobile_number,
  };
}

export default function TodaysQueue({
  onCallPress,
  onAddCustomer,
}: TodaysQueueProps) {
  const { token } = useAuth();

  const {
    data: queueItems = [],
    isLoading: loading,
    error,
    refetch: refetchQueues,
  } = useGetQueuesQuery('waiting', { skip: !token });

  const items: QueueItem[] = useMemo(
    () => queueItems.slice(0, MAX_ITEMS).map(mapQueueItem),
    [queueItems],
  );

  const err = error ? 'Could not load the queue.' : '';

  useFocusEffect(
    useCallback(() => {
      if (token) {
        refetchQueues();
      }
    }, [token, refetchQueues]),
  );

  if (loading) {
    return <TodaysQueueSkeleton />;
  }

  return (
    <View className='mt-6 px-5'>
      <View className='rounded-[24px] border border-[#E9E2ED] bg-white px-5 py-5 shadow-md'>
        <View className='mb-5 flex-row items-center justify-between'>
          <Text className='text-[16px] font-bold text-[#24113D]'>
            Today&apos;s Queue
          </Text>

          <TouchableOpacity
            className='flex-row items-center'
            activeOpacity={0.7}
            onPress={() => router.push('/queue')}
          >
            <Text className='text-[12px] font-semibold text-[#442F52]'>
              View All
            </Text>

            <MaterialIcons name='chevron-right' size={20} color='#442F52' />
          </TouchableOpacity>
        </View>

        {err ? (
          <View className='items-center justify-center py-8'>
            <Text className='text-[13px] text-[#4B4552]'>{err}</Text>

            <TouchableOpacity
              className='mt-3 rounded-xl bg-[#4B197C] px-5 py-2'
              activeOpacity={0.8}
              onPress={() => refetchQueues()}
            >
              <Text className='text-[13px] font-bold text-white'>RETRY</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <View className='items-center justify-center py-8'>
            <Text className='text-[13px] text-[#4B4552]'>
              No customers waiting right now.
            </Text>
          </View>
        ) : (
          items.map(item => (
            <View
              key={String(item.id)}
              className='mb-2 flex-row items-center rounded-xl border border-[#E9E2ED] bg-white px-3 py-3'
            >
              <View className='flex-1'>
                <Text
                  numberOfLines={1}
                  className='text-[13px] font-bold text-[#24113D]'
                >
                  {item.name}
                </Text>

                <View className='mt-2 flex-row items-center'>
                  <View className='flex-row items-center'>
                    <MaterialIcons
                      name='person-outline'
                      size={17}
                      color='#777180'
                    />

                    <Text className='ml-1 text-[12px] text-[#4B4552]'>
                      {item.people} People
                    </Text>
                  </View>

                  <View className='ml-2 flex-row items-center'>
                    <MaterialIcons
                      name='access-time'
                      size={17}
                      color='#777180'
                    />

                    <Text className='ml-1 text-[12px] text-[#4B4552]'>
                      {item.time}
                    </Text>
                  </View>
                </View>
              </View>

              <View className='mr-3 items-center justify-center'>
                <Text className='text-[14px] font-semibold text-[#43943C]'>
                  {item.waitingTime}
                </Text>

                <Text className='mt-0.5 text-[10px] text-[#4B4552]'>
                  Waiting
                </Text>
              </View>

              <TouchableOpacity
                className='h-[34px] w-[80px] flex-row items-center justify-center rounded-xl bg-[#4B197C] opacity-100 disabled:opacity-40'
                activeOpacity={0.8}
                disabled={!item.mobileNumber}
                onPress={() => onCallPress?.(item)}
              >
                <MaterialIcons name='phone' size={20} color='#FFFFFF' />

                <Text className='ml-1.5 text-[14px] font-bold text-white'>
                  CALL
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View className='mt-4 flex-row gap-3'>
          <TouchableOpacity
            className='h-[44px] flex-1 flex-row items-center justify-center rounded-xl  bg-[#4B197C]'
            activeOpacity={0.7}
            onPress={onAddCustomer}
          >
            <MaterialIcons name='person-add-alt-1' size={22} color='white' />

            <Text className='ml-2 text-[13px] font-bold text-white'>
              ADD QUEUE
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            className='h-[40px] flex-1 flex-row items-center justify-center rounded-xl bg-[#4B197C]'
            activeOpacity={0.8}
            onPress={onManageTables}
          >
            <MaterialIcons name='grid-view' size={22} color='#FFFFFF' />

            <Text className='ml-2 text-[13px] font-bold text-white'>
              MANAGE TABLES
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
}
