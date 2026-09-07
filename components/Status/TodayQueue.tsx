import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type QueueItem = {
  id: number;
  name: string;
  people: number;
  time: string;
  waitingTime: string;
};

type TodaysQueueProps = {
  data?: QueueItem[];
  onViewAll?: () => void;
  onCallPress?: (item: QueueItem) => void;
  onAddCustomer?: () => void;
  onManageTables?: () => void;
};

const defaultQueueData: QueueItem[] = [
  {
    id: 1,
    name: 'Ravi Kumar',
    people: 4,
    time: '12:30 PM',
    waitingTime: '18m',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    people: 2,
    time: '12:34 PM',
    waitingTime: '14m',
  },
  {
    id: 3,
    name: 'Suresh Babu',
    people: 3,
    time: '12:38 PM',
    waitingTime: '10m',
  },
  {
    id: 4,
    name: 'Karthik M',
    people: 5,
    time: '12:45 PM',
    waitingTime: '5m',
  },
];

export default function TodaysQueue({
  data = defaultQueueData,
  onViewAll,
  onCallPress,
  onAddCustomer,
  onManageTables,
}: TodaysQueueProps) {
  return (
    <View className="mt-6 px-5">
      <View className="rounded-[24px] border border-[#E9E2ED] bg-white px-5 py-5 shadow-md">
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-[20px] font-bold text-[#24113D]">
            Today&apos;s Queue
          </Text>

          <TouchableOpacity
            className="flex-row items-center"
            activeOpacity={0.7}
            onPress={onViewAll}
          >
            <Text className="text-[15px] font-semibold text-[#442F52]">
              View All
            </Text>

            <MaterialIcons name="chevron-right" size={24} color="#442F52" />
          </TouchableOpacity>
        </View>

        {data.map(item => (
          <View
            key={item.id}
            className="mb-2 flex-row items-center rounded-xl border border-[#E9E2ED] bg-white px-3 py-3"
          >
            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="text-[15px] font-bold text-[#24113D]"
              >
                {item.name}
              </Text>

              <View className="mt-2 flex-row items-center">
                <View className="flex-row items-center">
                  <MaterialIcons
                    name="person-outline"
                    size={19}
                    color="#777180"
                  />

                  <Text className="ml-1 text-[13px] text-[#4B4552]">
                    {item.people} People
                  </Text>
                </View>

                <View className="ml-2 flex-row items-center">
                  <MaterialIcons name="access-time" size={18} color="#777180" />

                  <Text className="ml-1 text-[13px] text-[#4B4552]">
                    {item.time}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mr-3 items-center justify-center">
              <Text
                className={`text-[16px] font-semibold ${
                  item.id === data.length ? 'text-[#EA580C]' : 'text-[#43943C]'
                }`}
              >
                {item.waitingTime}
              </Text>

              <Text className="mt-0.5 text-[12px] text-[#4B4552]">Waiting</Text>
            </View>

            <TouchableOpacity
              className="h-[36px] w-[82px] flex-row items-center justify-center rounded-xl bg-[#4B197C]"
              activeOpacity={0.8}
              onPress={() => onCallPress?.(item)}
            >
              <MaterialIcons name="phone" size={20} color="#FFFFFF" />

              <Text className="ml-1.5 text-[14px] font-bold text-white">
                CALL
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <View className="mt-4 flex-row gap-3">
          <TouchableOpacity
            className="h-[44px] flex-1 flex-row items-center justify-center rounded-xl border-2 border-[#442F52] bg-white"
            activeOpacity={0.7}
            onPress={onAddCustomer}
          >
            <MaterialIcons name="person-add-alt-1" size={23} color="#442F52" />

            <Text className="ml-2 text-[14px] font-bold text-[#442F52]">
              ADD CUSTOMER
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="h-[44px] flex-1 flex-row items-center justify-center rounded-xl bg-[#4B197C]"
            activeOpacity={0.8}
            onPress={onManageTables}
          >
            <MaterialIcons name="grid-view" size={23} color="#FFFFFF" />

            <Text className="ml-2 text-[14px] font-bold text-white">
              MANAGE TABLES
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
