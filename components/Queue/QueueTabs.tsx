import RestaurantTab from '@/components/Queue/RestaurantTab';
import StaffTab from '@/components/Queue/StaffTab';
import CustomerTab from '@/components/Queue/CustomerTab';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TABS = ['Restaurant', 'Staff', 'Customer'];

const TAB_ICONS: Record<(typeof TABS)[number], string> = {
  Restaurant: 'storefront-outline',
  Staff: 'account-group-outline',
  Customer: 'account-outline',
};

type Props = {
  showCustomer?: boolean;
};

export default function QueueTabs({ showCustomer = true }: Props) {
  const { width: screenWidth } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState(0);

  const scrollRef = useRef<ScrollView>(null);

  const scrollX = useRef(new Animated.Value(0)).current;

  const tabs = showCustomer ? TABS : TABS.filter(tab => tab !== 'Customer');

  const tabCount = tabs.length;

  const tabWidth = screenWidth / tabCount;

  const handleTabPress = (index: number) => {
    setActiveTab(index);

    scrollRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;

    const index = Math.round(offsetX / screenWidth);

    setActiveTab(index);
  };

  const handleFloatingButtonPress = () => {
    const selectedTab = tabs[activeTab].toLowerCase();

    router.push({
      pathname: '/owneraccess',
      params: {
        tab: selectedTab,
      },
    });
  };

  return (
    <>
      <View className='border-b border-gray-200 bg-white'>
        <View className='relative flex-row'>
          {tabs.map((tab, index) => {
            const isActive = activeTab === index;

            return (
              <TouchableOpacity
                key={tab}
                onPress={() => handleTabPress(index)}
                activeOpacity={0.7}
                className='flex-1 items-center justify-center py-4'
                hitSlop={10}
              >
                <Text
                  className={`text-base font-semibold ${
                    isActive ? 'text-[#4d13af]' : 'text-gray-400'
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}

          <Animated.View
            className='absolute bottom-0 h-[2px] rounded-t-full bg-[#4d13af]'
            style={{
              width: tabWidth,

              transform: [
                {
                  translateX: scrollX.interpolate({
                    inputRange: tabs.map((_, index) => index * screenWidth),

                    outputRange: tabs.map((_, index) => index * tabWidth),

                    extrapolate: 'clamp',
                  }),
                },
              ],
            }}
          />
        </View>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  x: scrollX,
                },
              },
            },
          ],
          {
            useNativeDriver: true,
          },
        )}
      >
        <RestaurantTab width={screenWidth} />

        <StaffTab width={screenWidth} />

        {showCustomer && <CustomerTab width={screenWidth} />}
      </Animated.ScrollView>

      <View pointerEvents='box-none' className='absolute bottom-6 right-6'>
        <TouchableOpacity
          onPress={handleFloatingButtonPress}
          activeOpacity={0.8}
          hitSlop={10}
          className='h-14 w-14 flex-row items-center justify-center overflow-hidden rounded-full bg-[#4d13af]'
          style={{
            elevation: 6,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.25,
            shadowRadius: 5,
          }}
        >
          {tabs.map((tab, index) => {
            const start = (index - 1) * screenWidth;
            const center = index * screenWidth;
            const end = (index + 1) * screenWidth;

            return (
              <Animated.View
                key={tab}
                className='absolute flex-row items-center'
                style={{
                  opacity: scrollX.interpolate({
                    inputRange: [start, center, end],
                    outputRange: [0, 1, 0],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      translateX: scrollX.interpolate({
                        inputRange: [start, center, end],
                        outputRange: [35, 0, -35],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      scale: scrollX.interpolate({
                        inputRange: [start, center, end],
                        outputRange: [0.8, 1, 0.8],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                }}
              >
                <MaterialCommunityIcons
                  name={
                    TAB_ICONS[
                      tab
                    ] as keyof typeof MaterialCommunityIcons.glyphMap
                  }
                  size={24}
                  color='white'
                />
              </Animated.View>
            );
          })}
        </TouchableOpacity>
      </View>
    </>
  );
}
