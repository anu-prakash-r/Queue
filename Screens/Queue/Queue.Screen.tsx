import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

type QueueStatus = 'Waiting' | 'Serving' | 'Completed';

type QueueCustomer = {
  id: number;
  token: string;
  name: string;
  phone: string;
  people: number;
  waitTime: string;
  status: QueueStatus;
};

const QUEUE_DATA: QueueCustomer[] = [
  {
    id: 1,
    token: 'Q001',
    name: 'Rahul Kumar',
    phone: '+91 98765 43210',
    people: 2,
    waitTime: '5 min',
    status: 'Serving',
  },
  {
    id: 2,
    token: 'Q002',
    name: 'Priya Sharma',
    phone: '+91 98765 12345',
    people: 4,
    waitTime: '12 min',
    status: 'Waiting',
  },
  {
    id: 3,
    token: 'Q003',
    name: 'Arun Kumar',
    phone: '+91 91234 56789',
    people: 3,
    waitTime: '18 min',
    status: 'Waiting',
  },
  {
    id: 4,
    token: 'Q004',
    name: 'Meena Raj',
    phone: '+91 99887 66554',
    people: 2,
    waitTime: '25 min',
    status: 'Waiting',
  },
  {
    id: 5,
    token: 'Q005',
    name: 'Karthik S',
    phone: '+91 98765 11122',
    people: 5,
    waitTime: '32 min',
    status: 'Waiting',
  },
];

export default function QueueScreen() {
  const [search, setSearch] = useState('');

  const filteredQueue = QUEUE_DATA.filter(customer => {
    const value = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(value) ||
      customer.token.toLowerCase().includes(value) ||
      customer.phone.includes(value)
    );
  });

  const handleAddCustomer = () => {
    Alert.alert('Add Customer', 'Add Customer clicked');
  };

  const handleCall = (customer: QueueCustomer) => {
    Alert.alert('Call Customer', `Call ${customer.name} (${customer.token})`);
  };

  const handleCustomerPress = (customer: QueueCustomer) => {
    Alert.alert(
      customer.name,
      `Token: ${customer.token}\nPeople: ${customer.people}`,
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1 bg-[#F7F6FC]"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <View className="mb-5">
          <Text className="text-[25px] font-bold text-[#442F52]">
            Today's Queue
          </Text>

          <Text className="mt-1 text-[13px] text-[#777180]">
            Manage your customers waiting for a table
          </Text>
        </View>

        <View className="mb-6 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-white p-4">
            <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4E5]">
              <MaterialIcons name="groups" size={21} color="#E58A00" />
            </View>

            <Text className="text-[24px] font-bold text-[#442F52]">4</Text>

            <Text className="mt-1 text-[12px] text-[#777180]">Waiting</Text>
          </View>

          <View className="flex-1 rounded-2xl bg-white p-4">
            <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-[#F1EAF5]">
              <MaterialIcons name="restaurant" size={21} color="#442F52" />
            </View>

            <Text className="text-[24px] font-bold text-[#442F52]">1</Text>

            <Text className="mt-1 text-[12px] text-[#777180]">Serving</Text>
          </View>

          <View className="flex-1 rounded-2xl bg-white p-4">
            <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-[#EAF7EF]">
              <MaterialIcons
                name="check-circle-outline"
                size={21}
                color="#2E9B5B"
              />
            </View>

            <Text className="text-[24px] font-bold text-[#442F52]">12</Text>

            <Text className="mt-1 text-[12px] text-[#777180]">Completed</Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="mb-3 ml-1 text-[12px] font-bold uppercase tracking-wide text-[#8D8791]">
            Currently Serving
          </Text>

          <View className="rounded-2xl bg-[#442F52] p-5">
            <View className="flex-row items-center">
              <View className="h-[58px] w-[58px] items-center justify-center rounded-xl bg-white/15">
                <Text className="text-[17px] font-bold text-white">Q001</Text>
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-[17px] font-bold text-white">
                  Rahul Kumar
                </Text>

                <View className="mt-1 flex-row items-center">
                  <MaterialIcons name="groups" size={15} color="#D8CFDD" />

                  <Text className="ml-1 text-[12px] text-[#D8CFDD]">
                    2 People
                  </Text>

                  <Text className="mx-2 text-[#B9ACBF]">•</Text>

                  <Text className="text-[12px] text-[#D8CFDD]">5 min</Text>
                </View>
              </View>

              <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
                <MaterialIcons name="check" size={20} color="#442F52" />
              </View>
            </View>
          </View>
        </View>

        <View className="mb-3 flex-row items-center justify-between">
          <View>
            <Text className="text-[18px] font-bold text-[#442F52]">Queue</Text>

            <Text className="mt-1 text-[12px] text-[#777180]">
              {filteredQueue.length} customers
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddCustomer}
            className="flex-row items-center rounded-xl bg-[#442F52] px-4 py-3"
          >
            <MaterialIcons name="add" size={19} color="#FFFFFF" />

            <Text className="ml-1 text-[12px] font-bold text-white">
              Add Customer
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4 flex-row items-center rounded-xl bg-white px-4">
          <MaterialIcons name="search" size={21} color="#AAA4AE" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search customer or token"
            placeholderTextColor="#AAA4AE"
            className="ml-2 h-[48px] flex-1 text-[13px] text-[#442F52]"
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={19} color="#AAA4AE" />
            </TouchableOpacity>
          )}
        </View>

        <View className="rounded-2xl bg-white">
          {filteredQueue.map((customer, index) => (
            <View key={customer.id}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleCustomerPress(customer)}
                className="px-4 py-4"
              >
                <View className="flex-row items-center">
                  <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#F1EAF5]">
                    <Text className="text-[12px] font-bold text-[#442F52]">
                      {customer.token}
                    </Text>
                  </View>

                  <View className="ml-3 flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-[14px] font-bold text-[#442F52]">
                        {customer.name}
                      </Text>

                      <StatusBadge status={customer.status} />
                    </View>

                    <View className="mt-1 flex-row items-center">
                      <MaterialIcons name="groups" size={14} color="#AAA4AE" />

                      <Text className="ml-1 text-[11px] text-[#777180]">
                        {customer.people} People
                      </Text>

                      <Text className="mx-2 text-[#C8C2CA]">•</Text>

                      <Text className="text-[11px] text-[#777180]">
                        Waiting {customer.waitTime}
                      </Text>
                    </View>
                  </View>

                  {customer.status === 'Waiting' && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleCall(customer)}
                      className="h-9 w-9 items-center justify-center rounded-full bg-[#F1EAF5]"
                    >
                      <MaterialIcons name="phone" size={18} color="#442F52" />
                    </TouchableOpacity>
                  )}

                  {customer.status === 'Serving' && (
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-[#EAF7EF]">
                      <MaterialIcons
                        name="restaurant"
                        size={17}
                        color="#2E9B5B"
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {index < filteredQueue.length - 1 && (
                <View className="ml-[76px] h-[1px] bg-[#F0EDF2]" />
              )}
            </View>
          ))}

          {filteredQueue.length === 0 && (
            <View className="items-center px-5 py-10">
              <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-[#F1EAF5]">
                <MaterialIcons name="search-off" size={25} color="#442F52" />
              </View>

              <Text className="text-[15px] font-bold text-[#442F52]">
                No customers found
              </Text>

              <Text className="mt-1 text-center text-[12px] text-[#99929D]">
                Try searching with another name or token
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

type StatusBadgeProps = {
  status: QueueStatus;
};

function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'Serving') {
    return (
      <View className="ml-2 rounded-full bg-[#F1EAF5] px-2 py-1">
        <Text className="text-[9px] font-bold text-[#442F52]">SERVING</Text>
      </View>
    );
  }

  if (status === 'Completed') {
    return (
      <View className="ml-2 rounded-full bg-[#EAF7EF] px-2 py-1">
        <Text className="text-[9px] font-bold text-[#2E9B5B]">COMPLETED</Text>
      </View>
    );
  }

  return (
    <View className="ml-2 rounded-full bg-[#FFF4E5] px-2 py-1">
      <Text className="text-[9px] font-bold text-[#E58A00]">WAITING</Text>
    </View>
  );
}
