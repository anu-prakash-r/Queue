import React from 'react';
import { View } from 'react-native';

const SkeletonBox = ({
  className,
}: {
  className: string;
}) => {
  return (
    <View
      className={`rounded-md bg-[#EDE9F0] ${className}`}
    />
  );
};

const RestaurantCardSkeleton = () => {
  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-[#E8E2EB] bg-white">
      {/* Restaurant Header */}
      <View className="px-4 py-4">
        <View className="flex-row items-center">
          {/* Restaurant Icon */}
          <SkeletonBox className="h-12 w-12 rounded-xl" />

          {/* Name + Location */}
          <View className="ml-3 flex-1">
            <SkeletonBox className="h-4 w-36" />

            <View className="mt-2 flex-row items-center">
              <SkeletonBox className="h-3 w-3 rounded-full" />
              <SkeletonBox className="ml-2 h-3 w-24" />
            </View>
          </View>

          {/* Status */}
          <SkeletonBox className="mr-2 h-7 w-16 rounded-full" />

          {/* Chevron */}
          <SkeletonBox className="h-6 w-6 rounded-md" />
        </View>
      </View>
    </View>
  );
};

export const RestaurantTabSkeleton = () => {
  return (
    <View className="flex-1">
      {/* Restaurant Cards */}
      <View className="px-4 pt-2">
        <RestaurantCardSkeleton />
        <RestaurantCardSkeleton />
        <RestaurantCardSkeleton />
        <RestaurantCardSkeleton />
        <RestaurantCardSkeleton />
      </View>
    </View>
  );
};