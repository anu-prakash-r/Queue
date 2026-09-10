import React from 'react';
import { View } from 'react-native';

const SkeletonBox = ({ className }: { className: string }) => {
  return <View className={`rounded-md bg-[#EDE9F0] ${className}`} />;
};

const QueueRowSkeleton = () => {
  return (
    <View className='mb-2 flex-row items-center rounded-xl border border-[#E9E2ED] bg-white px-3 py-3'>
      <View className='flex-1'>
        <SkeletonBox className='h-4 w-28' />

        <View className='mt-3 flex-row items-center'>
          <SkeletonBox className='h-3 w-20' />
          <SkeletonBox className='ml-3 h-3 w-16' />
        </View>
      </View>

      <View className='mr-3 items-center justify-center'>
        <SkeletonBox className='h-4 w-8' />
        <SkeletonBox className='mt-1 h-3 w-12' />
      </View>

      <SkeletonBox className='h-[34px] w-[80px] rounded-xl' />
    </View>
  );
};

export default function TodaysQueueSkeleton() {
  return (
    <View className='mt-6 px-5'>
      <View className='rounded-[24px] border border-[#E9E2ED] bg-white px-5 py-5 shadow-md'>
        <View className='mb-5 flex-row items-center justify-between'>
          <SkeletonBox className='h-5 w-28' />
        </View>
        <QueueRowSkeleton />
        <QueueRowSkeleton />
        <QueueRowSkeleton />
        <QueueRowSkeleton />
        <QueueRowSkeleton />

        <View className='mt-4'>
          <SkeletonBox className='h-[44px] w-full rounded-xl' />
        </View>
      </View>
    </View>
  );
}
