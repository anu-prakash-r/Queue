import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  unread: boolean;
};

const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'Customer is waiting',
    message: 'Priya Sharma has been waiting for 12 minutes.',
    time: '2 min ago',
    icon: 'groups',
    unread: true,
  },
  {
    id: 2,
    title: 'Table is ready',
    message: 'Table 04 is now available for the next customer.',
    time: '15 min ago',
    icon: 'table-restaurant',
    unread: true,
  },
  {
    id: 3,
    title: 'Queue updated',
    message: 'Rahul Kumar has been moved to serving.',
    time: '32 min ago',
    icon: 'restaurant',
    unread: true,
  },
  {
    id: 4,
    title: 'Customer cancelled',
    message: 'Karthik S cancelled their queue request.',
    time: '1 hour ago',
    icon: 'person-off',
    unread: false,
  },
  {
    id: 5,
    title: 'Daily queue completed',
    message: '12 customers were successfully served today.',
    time: '2 hours ago',
    icon: 'check-circle-outline',
    unread: false,
  },
];

export default function NotificationsScreen() {
  const handleNotificationPress = (notification: Notification) => {
    Alert.alert(notification.title, notification.message);
  };

  const handleMarkAllRead = () => {
    Alert.alert('Notifications', 'All notifications marked as read.');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F6FC]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
      >
        <View className="mb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-[25px] font-bold text-[#442F52]">
              Notifications
            </Text>

            <Text className="mt-1 text-[13px] text-[#777180]">
              Stay updated with your restaurant
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleMarkAllRead}
            className="rounded-xl bg-[#F1EAF5] px-3 py-2"
          >
            <Text className="text-[11px] font-bold text-[#442F52]">
              Mark all read
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="mb-3 ml-1 text-[12px] font-bold uppercase tracking-wide text-[#8D8791]">
          Today
        </Text>

        <View className="mb-6 rounded-2xl bg-white">
          {NOTIFICATIONS.map((notification, index) => (
            <View key={notification.id}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleNotificationPress(notification)}
                className="flex-row px-4 py-4"
              >
                <View
                  className={`h-11 w-11 items-center justify-center rounded-xl ${
                    notification.unread ? 'bg-[#F1EAF5]' : 'bg-[#F7F6FC]'
                  }`}
                >
                  <MaterialIcons
                    name={notification.icon}
                    size={21}
                    color={notification.unread ? '#442F52' : '#99929D'}
                  />
                </View>

                <View className="ml-4 flex-1">
                  <View className="flex-row items-center">
                    <Text
                      className={`flex-1 text-[14px] ${
                        notification.unread
                          ? 'font-bold text-[#442F52]'
                          : 'font-semibold text-[#665F6B]'
                      }`}
                    >
                      {notification.title}
                    </Text>

                    {notification.unread && (
                      <View className="ml-2 h-2 w-2 rounded-full bg-[#4D13AF]" />
                    )}
                  </View>

                  <Text
                    numberOfLines={2}
                    className="mt-1 text-[12px] leading-[18px] text-[#88818D]"
                  >
                    {notification.message}
                  </Text>

                  <Text className="mt-2 text-[10px] font-medium text-[#AAA4AE]">
                    {notification.time}
                  </Text>
                </View>
              </TouchableOpacity>

              {index < NOTIFICATIONS.length - 1 && (
                <View className="ml-[76px] h-[1px] bg-[#F0EDF2]" />
              )}
            </View>
          ))}
        </View>

        <View className="items-center py-5">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#F1EAF5]">
            <MaterialIcons
              name="notifications-none"
              size={25}
              color="#442F52"
            />
          </View>

          <Text className="text-[13px] font-semibold text-[#777180]">
            You're all caught up
          </Text>

          <Text className="mt-1 text-center text-[11px] text-[#AAA4AE]">
            New restaurant updates will appear here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
