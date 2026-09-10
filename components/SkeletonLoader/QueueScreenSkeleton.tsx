import React from 'react';
import { View } from 'react-native';

const SkeletonBox = ({ className }: { className: string }) => {
  return <View className={`rounded-md bg-[#EDE9F0] ${className}`} />;
};

const QueueCardSkeleton = () => {
  return (
    <View className='mb-3 rounded-2xl border border-[#E9E2ED] bg-white px-4 py-3 shadow-md'>
      <View className='flex-row items-start'>
        <View className='flex-1'>
          <SkeletonBox className='h-4 w-32' />

          <View className='mt-3 flex-row items-center'>
            <SkeletonBox className='h-3 w-20' />
            <SkeletonBox className='ml-3 h-3 w-16' />
          </View>
        </View>

        <View className='mr-2 items-center justify-center'>
          <SkeletonBox className='h-4 w-9' />
          <SkeletonBox className='mt-1 h-3 w-12' />
        </View>

        <SkeletonBox className='h-8 w-7 rounded-lg' />
      </View>

      <View className='mt-3 h-[1px] bg-[#F1EBF5]' />

      <View className='mt-3 flex-row items-center justify-between'>
        <SkeletonBox className='h-3 w-24' />

        <SkeletonBox className='h-[34px] w-[90px] rounded-xl' />
      </View>
    </View>
  );
};

export default function QueueScreenSkeleton() {
  return (
    <View className='px-5 pt-5'>
      <QueueCardSkeleton />
      <QueueCardSkeleton />
      <QueueCardSkeleton />
      <QueueCardSkeleton />
      <QueueCardSkeleton />
    </View>
  );
}
