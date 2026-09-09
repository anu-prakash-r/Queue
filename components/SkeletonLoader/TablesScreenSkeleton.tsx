import React from 'react';
import { View } from 'react-native';

const SkeletonBox = ({ className }: { className: string }) => {
  return <View className={`rounded-md bg-[#EDE9F0] ${className}`} />;
};

const SummaryCardSkeleton = () => {
  return (
    <View className='flex-1 items-center rounded-xl border border-[#F0EDF3] bg-white px-1 py-4 shadow-sm'>
      <SkeletonBox className='h-9 w-9 rounded-full' />

      <SkeletonBox className='mt-2 h-6 w-9' />

      <SkeletonBox className='mt-2 h-5 w-16' />
    </View>
  );
};

export const TableSummarySkeleton = () => {
  return (
    <View className='mt-5 px-5'>
      <View className='flex-row gap-2'>
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*                            Table List Skeleton                             */
/* -------------------------------------------------------------------------- */

const TableCardSkeleton = () => {
  return (
    <View className='mb-3 rounded-2xl border border-[#E9E2ED] bg-white px-4 py-4'>
      <View className='flex-row items-center justify-between'>
        <View className='flex-1'>
          <SkeletonBox className='h-4 w-24' />

          <SkeletonBox className='mt-2 h-3 w-32' />
        </View>

        <SkeletonBox className='h-7 w-20 rounded-full' />

        <SkeletonBox className='ml-3 h-8 w-8 rounded-lg' />
      </View>

      <View className='mt-4 h-[1px] bg-[#F1EBF5]' />

      <View className='mt-3 flex-row items-center justify-between'>
        <SkeletonBox className='h-3 w-20' />

        <SkeletonBox className='h-3 w-16' />
      </View>
    </View>
  );
};

export const TablesScreenSkeleton = () => {
  return (
    <View>
      <View className='mt-5'>
        <TableCardSkeleton />
        <TableCardSkeleton />
        <TableCardSkeleton />
        <TableCardSkeleton />
        <TableCardSkeleton />
      </View>
    </View>
  );
};
