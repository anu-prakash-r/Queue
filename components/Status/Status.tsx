import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useFocusEffect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useGetQueuesQuery } from '@/store/api/queueApi';
import { useGetTablesQuery } from '@/store/api/tableApi';
import QueueStatusSkeleton from '../SkeletonLoader/QueueStatusSkeleton';

type QueueStatusItemProps = {
  icon: string;
  title: string;
  value: string | number;
  bgColor: string;
  iconColor: string;
  highlightText?: string;
  highlightColor?: string;
  highlightOnNewLine?: boolean;
};

const QueueStatusItem = ({
  icon,
  title,
  value,
  bgColor,
  iconColor,
  highlightText,
  highlightColor,
  highlightOnNewLine = false,
}: QueueStatusItemProps) => {
  const renderTitle = () => {
    if (!highlightText) {
      return (
        <Text className='text-left text-[12px] text-[#777180]'>{title}</Text>
      );
    }

    if (highlightOnNewLine) {
      return (
        <Text className='ml-1 text-left text-[12px] text-[#777180]'>
          {title}
          {'\n'}
          <Text style={{ color: highlightColor }}>{highlightText}</Text>
        </Text>
      );
    }

    const parts = title.split(highlightText);

    return (
      <Text className='ml-1 text-left text-[12px] text-[#777180]'>
        {parts[0]}
        <Text style={{ color: highlightColor }}>{highlightText}</Text>
        {parts[1]}
      </Text>
    );
  };

  return (
    <View className='flex-1 rounded-2xl border border-[#E9E2ED] bg-white px-2 py-4 shadow-md'>
      <View
        className='ml-1 h-10 w-10 items-center justify-center rounded-full'
        style={{
          backgroundColor: bgColor,
        }}
      >
        {icon === 'groups' && (
          <FontAwesome6 name='user-group' size={16} color={iconColor} />
        )}

        {icon === 'table-restaurant' && (
          <MaterialIcons name='table-restaurant' size={22} color={iconColor} />
        )}

        {icon === 'access-time' && (
          <MaterialIcons name='access-time' size={22} color={iconColor} />
        )}

        {icon === 'check-circle-outline' && (
          <MaterialIcons
            name='check-circle-outline'
            size={22}
            color={iconColor}
          />
        )}
      </View>

      <Text className='ml-1 mt-1 text-[24px] font-bold text-[#24113D]'>
        {value}
      </Text>

      <View className='mt-2 w-full'>{renderTitle()}</View>
    </View>
  );
};

type QueueStatusProps = {
  waitTime?: string;
  servedCount?: number;
};

export default function QueueStatus({
  waitTime = '18 m',
  servedCount = 25,
}: QueueStatusProps) {
  const { token, isSuperAdmin, isRoleLoaded } = useAuth();

  const canLoad = isRoleLoaded && !isSuperAdmin;

  const {
    data: queueItems = [],
    refetch: refetchQueues,
    isLoading: isQueuesLoading,
  } = useGetQueuesQuery('waiting', {
    skip: !token || !canLoad,
  });

  const {
    data: tablesResult,
    refetch: refetchTables,
    isLoading: isTablesLoading,
  } = useGetTablesQuery(undefined, {
    skip: !token || !canLoad,
  });

  const waitingCount = queueItems.length;
  const tablesCount = tablesResult?.summary?.available ?? 0;

  useFocusEffect(
    useCallback(() => {
      if (token && canLoad) {
        refetchQueues();
        refetchTables();
      }
    }, [token, canLoad, refetchQueues, refetchTables]),
  );

  const isLoading = isQueuesLoading || isTablesLoading;

  if (isLoading) {
    return <QueueStatusSkeleton />;
  }

  return (
    <View className='bg-white px-5'>
      <View className='flex-row gap-3'>
        <QueueStatusItem
          icon='groups'
          title='Waiting in queue'
          value={waitingCount}
          bgColor='#E9D5F5'
          iconColor='#7C3AED'
          highlightText='queue'
          highlightColor='#7C3AED'
        />

        <QueueStatusItem
          icon='table-restaurant'
          title='Tables available'
          value={tablesCount}
          bgColor='#D1FAE5'
          iconColor='#16A34A'
          highlightText='available'
          highlightColor='#16A34A'
        />

        <QueueStatusItem
          icon='access-time'
          title='Avg. Wait Time'
          value={waitTime}
          bgColor='#FFEDD5'
          iconColor='#EA580C'
          highlightText='Today'
          highlightColor='#EA580C'
          highlightOnNewLine
        />

        <QueueStatusItem
          icon='check-circle-outline'
          title='Served'
          value={servedCount}
          bgColor='#DBEAFE'
          iconColor='#2563EB'
          highlightText='Today'
          highlightColor='#2563EB'
          highlightOnNewLine
        />
      </View>
    </View>
  );
}
