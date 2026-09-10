import React from 'react';
import { View } from 'react-native';

const SkeletonBox = ({ className }: { className: string }) => {
  return <View className={`rounded-md bg-[#EDE9F0] ${className}`} />;
};

const StaffCardSkeleton = () => {
  return (
    <View className='mb-3 overflow-hidden rounded-2xl border border-[#E8E2EB] bg-white'>
      <View className='px-4 py-4'>
        <View className='flex-row items-center'>
          {/* Avatar */}
          <SkeletonBox className='h-12 w-12 rounded-full' />

          {/* Name + mobile */}
          <View className='ml-3 flex-1'>
            <SkeletonBox className='h-4 w-32' />

            <View className='mt-2 flex-row items-center'>
              <SkeletonBox className='h-3 w-3 rounded-full' />
              <SkeletonBox className='ml-2 h-3 w-28' />
            </View>
          </View>

          {/* Role */}
          <SkeletonBox className='mr-2 h-7 w-16 rounded-full' />

          {/* Active dot */}
          <SkeletonBox className='mr-2 h-2.5 w-2.5 rounded-full' />

          {/* Chevron */}
          <SkeletonBox className='h-9 w-9 rounded-full' />
        </View>
      </View>
    </View>
  );
};

export const StaffTabSkeleton = () => {
  return (
    <View className='flex-1'>
      {/* Staff cards */}
      <View className='px-4 pt-2'>
        <StaffCardSkeleton />
        <StaffCardSkeleton />
        <StaffCardSkeleton />
        <StaffCardSkeleton />
        <StaffCardSkeleton />
      </View>
    </View>
  );
};
