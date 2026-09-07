import React from 'react';

import { FlatList, ListRenderItem, View } from 'react-native';

type SkeletonBlockProps = {
  className?: string;
};

const SkeletonBlock = ({ className = '' }: SkeletonBlockProps) => {
  return <View className={`rounded-lg bg-[#E9E4EB] ${className}`} />;
};

const OwnerCardSkeleton = () => {
  return (
    <View className='mb-4 rounded-2xl bg-white p-4'>
      {/* Top section */}
      <View className='flex-row items-center'>
        {/* Avatar */}
        <SkeletonBlock className='h-12 w-12 rounded-full' />

        {/* Owner details */}
        <View className='ml-3 flex-1'>
          <View className='flex-row items-center'>
            <SkeletonBlock className='h-4 w-32' />

            <SkeletonBlock className='ml-2 h-3 w-12 rounded-full' />
          </View>

          <SkeletonBlock className='mt-2 h-3 w-28' />
        </View>

        {/* Three dot button */}
        <SkeletonBlock className='ml-2 h-10 w-10 rounded-xl' />
      </View>

      {/* Divider */}
      <View className='my-4 h-[1px] bg-[#F1EEF2]' />

      {/* Stats */}
      <View className='flex-row items-center'>
        {/* Restaurants */}
        <View className='flex-1'>
          <View className='flex-row items-center'>
            <SkeletonBlock className='h-9 w-9 rounded-xl' />

            <View className='ml-2'>
              <SkeletonBlock className='h-2.5 w-16' />

              <SkeletonBlock className='mt-1.5 h-3.5 w-7' />
            </View>
          </View>
        </View>

        {/* Staff */}
        <View className='flex-1'>
          <View className='flex-row items-center'>
            <SkeletonBlock className='h-9 w-9 rounded-xl' />

            <View className='ml-2'>
              <SkeletonBlock className='h-2.5 w-10' />

              <SkeletonBlock className='mt-1.5 h-3.5 w-7' />
            </View>
          </View>
        </View>

        {/* Tables */}
        <View className='flex-1'>
          <View className='flex-row items-center'>
            <SkeletonBlock className='h-9 w-9 rounded-xl' />

            <View className='ml-2'>
              <SkeletonBlock className='h-2.5 w-12' />

              <SkeletonBlock className='mt-1.5 h-3.5 w-7' />
            </View>
          </View>
        </View>
      </View>

      {/* Created date */}
      <View className='mt-3 flex-row items-center'>
        <SkeletonBlock className='h-3 w-3 rounded-sm' />

        <SkeletonBlock className='ml-1.5 h-2.5 w-28' />
      </View>
    </View>
  );
};

type OwnerListSkeletonProps = {
  count?: number;
};

export default function OwnerListSkeleton({
  count = 5,
}: OwnerListSkeletonProps) {
  const skeletonData = React.useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: `owner-skeleton-${index}`,
      })),
    [count],
  );

  const renderSkeletonItem: ListRenderItem<{
    id: string;
  }> = () => {
    return <OwnerCardSkeleton />;
  };

  return (
    <FlatList
      data={skeletonData}
      keyExtractor={item => item.id}
      renderItem={renderSkeletonItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    />
  );
}
