import React from 'react';
import { View } from 'react-native';

const QueueStatusSkeletonItem = () => {
  return (
    <View className='flex-1 rounded-2xl border border-[#E9E2ED] bg-white px-2 py-4 shadow-md'>
      <View className='ml-1 h-10 w-10 rounded-full bg-[#EDE9F0]' />

      <View className='ml-1 mt-3 h-7 w-12 rounded-md bg-[#EDE9F0]' />

      <View className='mt-3 w-full'>
        <View className='ml-1 h-3 w-22 rounded-md bg-[#EDE9F0]' />
      </View>
    </View>
  );
};

export default function QueueStatusSkeleton() {
  return (
    <View className='bg-white px-5'>
      <View className='flex-row gap-3'>
        <QueueStatusSkeletonItem />
        <QueueStatusSkeletonItem />
        <QueueStatusSkeletonItem />
        <QueueStatusSkeletonItem />
      </View>
    </View>
  );
}
