import React, { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useGetCustomersQuery, CustomerItem } from '@/store/api/customerApi';

import { useAuth } from '@/contexts/AuthContext';

type CustomerTabProps = {
  width: number;
};

const PURPLE = '#4d13af';
const BORDER = '#E8E2EB';
const TEXT_DARK = '#17131C';
const TEXT_GRAY = '#7B747F';

export default function CustomerTab({ width }: CustomerTabProps) {
  const { token } = useAuth();

  const {
    data: customers = [],
    isLoading: loading,
    error,
    refetch,
  } = useGetCustomersQuery(undefined, { skip: !token });

  const [refreshing, setRefreshing] = useState(false);

  const [expandedId, setExpandedId] = useState<number | string | null>(null);

  const [detailsItem, setDetailsItem] = useState<CustomerItem | null>(null);

  const errorText = error ? 'Unable to load. Please try again.' : null;

  useFocusEffect(
    useCallback(() => {
      if (token) {
        refetch();
      }
    }, [token, refetch]),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const toggleExpanded = (id: number | string) => {
    setExpandedId(current => (current === id ? null : id));
  };

  const getInitials = (name?: string): string => {
    if (!name) {
      return '?';
    }

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('');
  };

  const renderCustomer = ({
    item,
    index,
  }: {
    item: CustomerItem;
    index: number;
  }) => {
    const customerId = item.id ?? index;

    const isExpanded = expandedId === customerId;

    return (
      <View className='mb-3 overflow-hidden rounded-2xl border border-[#E8E2EB] bg-white'>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => toggleExpanded(customerId)}
          className='px-4 py-4'
        >
          <View className='flex-row items-center'>
            <View className='h-12 w-12 items-center justify-center rounded-full bg-[#F4F0FF]'>
              <Text className='text-base font-bold text-[#4d13af]'>
                {getInitials(item.name)}
              </Text>
            </View>

            <View className='ml-3 flex-1'>
              <Text
                numberOfLines={1}
                className='text-base font-bold text-[#17131C]'
              >
                {item.name ?? 'Unnamed Customer'}
              </Text>

              <View className='mt-1 flex-row items-center'>
                <MaterialCommunityIcons
                  name='cellphone'
                  size={14}
                  color={TEXT_GRAY}
                />

                <Text
                  numberOfLines={1}
                  className='ml-1 flex-1 text-sm text-[#7B747F]'
                >
                  {item.mobile_number ?? 'No mobile number'}
                </Text>
              </View>
            </View>

            {item.email ? (
              <View className='mr-2 max-w-[110px] rounded-full bg-[#F4F0FF] px-2.5 py-1'>
                <Text
                  numberOfLines={1}
                  className='text-xs font-semibold text-[#4d13af]'
                >
                  {item.email}
                </Text>
              </View>
            ) : null}

            <View className='h-9 w-9 items-center justify-center rounded-full bg-[#F4F0FF]'>
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={23}
                color={PURPLE}
              />
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View className='border-t border-[#F0EDF2] bg-[#FAF9FB] px-3 py-3'>
            {item.notes ? (
              <View className='mb-2.5 rounded-xl bg-white px-3 py-2.5'>
                <View className='flex-row items-start'>
                  <MaterialCommunityIcons
                    name='note-text-outline'
                    size={16}
                    color={PURPLE}
                  />

                  <Text
                    numberOfLines={3}
                    className='ml-2 flex-1 text-xs leading-4 text-[#6F6875]'
                  >
                    {item.notes}
                  </Text>
                </View>
              </View>
            ) : null}

            <View className='flex-row items-center'>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setDetailsItem(item)}
                className='mr-1.5 flex-1 flex-row items-center justify-center rounded-lg bg-white px-2 py-2.5'
              >
                <MaterialCommunityIcons
                  name='eye-outline'
                  size={17}
                  color={PURPLE}
                />

                <Text className='ml-1.5 text-xs font-semibold text-[#17131C]'>
                  View
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/owneraccess',
                    params: {
                      tab: 'customer',
                      mode: 'edit',
                      id: String(item.id ?? ''),
                      customer: JSON.stringify(item),
                    },
                  })
                }
                className='flex-1 flex-row items-center justify-center rounded-lg bg-white px-2 py-2.5'
              >
                <MaterialCommunityIcons
                  name='pencil-outline'
                  size={17}
                  color={PURPLE}
                />

                <Text className='ml-1.5 text-xs font-semibold text-[#17131C]'>
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ width }} className='flex-1 bg-[#FAF9FB]'>
      <View className='px-4 pb-3 pt-4'>
        <View className='flex-row items-center justify-between'>
          <View className='flex-1'>
            <Text className='text-2xl font-bold text-[#17131C]'>Customers</Text>

            <Text className='mt-1 text-sm text-[#7B747F]'>
              Manage your customers
            </Text>
          </View>

          {!loading && !error ? (
            <View className='ml-3 h-11 min-w-[44px] items-center justify-center rounded-xl bg-[#F4F0FF] px-3'>
              <Text className='text-lg font-bold text-[#4d13af]'>
                {customers.length}
              </Text>

              <Text className='text-[9px] font-medium uppercase tracking-wide text-[#7B63B8]'>
                Total
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View className='flex-1 items-center justify-center'>
          <View className='h-16 w-16 items-center justify-center rounded-2xl bg-[#F4F0FF]'>
            <ActivityIndicator size='small' color={PURPLE} />
          </View>

          <Text className='mt-4 text-sm text-[#7B747F]'>
            Loading customers...
          </Text>
        </View>
      ) : errorText ? (
        <View className='flex-1 items-center justify-center px-8'>
          <View className='h-20 w-20 items-center justify-center rounded-full bg-[#FFF4F4]'>
            <MaterialCommunityIcons
              name='alert-circle-outline'
              size={42}
              color='#D64545'
            />
          </View>

          <Text className='mt-5 text-center text-lg font-bold text-[#17131C]'>
            Unable to load customers
          </Text>

          <Text className='mt-2 text-center text-sm leading-5 text-[#7B747F]'>
            {errorText}
          </Text>

          <TouchableOpacity
            onPress={() => refetch()}
            activeOpacity={0.8}
            className='mt-5 flex-row items-center rounded-xl bg-[#4d13af] px-5 py-3'
          >
            <MaterialCommunityIcons name='refresh' size={18} color='#fff' />

            <Text className='ml-2 text-sm font-bold text-white'>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          className='flex-1'
          data={customers}
          keyExtractor={(item, index) => String(item.id ?? index)}
          renderItem={renderCustomer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 110,
            flexGrow: customers.length === 0 ? 1 : undefined,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={PURPLE}
              colors={[PURPLE]}
            />
          }
          ListEmptyComponent={
            <View className='flex-1 items-center justify-center px-8'>
              <View className='h-20 w-20 items-center justify-center rounded-2xl bg-[#F4F0FF]'>
                <MaterialCommunityIcons
                  name='account-plus-outline'
                  size={40}
                  color={PURPLE}
                />
              </View>

              <Text className='mt-4 text-lg font-bold text-[#17131C]'>
                No customers yet
              </Text>

              <Text className='mt-1 text-center text-sm text-[#8B848F]'>
                Add your first customer to start managing them.
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={detailsItem !== null}
        transparent
        animationType='fade'
        onRequestClose={() => setDetailsItem(null)}
      >
        <View className='flex-1 justify-end'>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setDetailsItem(null)}
            className='absolute inset-0 bg-black/40'
          />

          <View className='max-h-[88%] overflow-hidden rounded-t-[30px] bg-white'>
            <View className='items-center pt-3'>
              <View className='h-1.5 w-12 rounded-full bg-[#D8D3DC]' />
            </View>

            <View className='flex-row items-center justify-between px-5 pb-4 pt-3'>
              <View className='flex-1'>
                <Text className='text-lg font-bold text-[#17131C]'>
                  Customer Details
                </Text>

                <Text
                  numberOfLines={1}
                  className='mt-0.5 text-xs text-[#8B848F]'
                >
                  View customer information
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setDetailsItem(null)}
                hitSlop={10}
                activeOpacity={0.7}
                className='h-9 w-9 items-center justify-center rounded-full bg-[#F4F0FF]'
              >
                <MaterialCommunityIcons name='close' size={20} color={PURPLE} />
              </TouchableOpacity>
            </View>

            <View className='h-px bg-[#F0EDF2]' />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 18,
                paddingBottom: 35,
              }}
            >
              <View className='rounded-2xl border border-[#ECE8EF] bg-[#FAF9FB] p-4'>
                <View className='flex-row items-center'>
                  <View className='h-12 w-12 items-center justify-center rounded-xl bg-[#F4F0FF]'>
                    <Text className='text-base font-bold text-[#4d13af]'>
                      {getInitials(detailsItem?.name)}
                    </Text>
                  </View>

                  <View className='ml-3 flex-1'>
                    <Text
                      numberOfLines={1}
                      className='text-base font-bold text-[#17131C]'
                    >
                      {detailsItem?.name ?? 'Unnamed Customer'}
                    </Text>

                    <View className='mt-1 flex-row items-center'>
                      <MaterialCommunityIcons
                        name='cellphone'
                        size={14}
                        color={TEXT_GRAY}
                      />

                      <Text
                        numberOfLines={1}
                        className='ml-1 flex-1 text-xs text-[#7B747F]'
                      >
                        {detailsItem?.mobile_number ?? 'No mobile number'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className='mb-3 mt-6 flex-row items-center'>
                <View className='mr-2 h-6 w-1 rounded-full bg-[#4d13af]' />

                <Text className='text-base font-bold text-[#17131C]'>
                  Customer Information
                </Text>
              </View>

              <View className='overflow-hidden rounded-2xl border border-[#ECE8EF] bg-white p-4'>
                <DetailRow
                  icon='account-outline'
                  label='Name'
                  value={detailsItem?.name}
                />

                <DetailRow
                  icon='cellphone'
                  label='Mobile Number'
                  value={detailsItem?.mobile_number}
                />

                <DetailRow
                  icon='email-outline'
                  label='Email'
                  value={detailsItem?.email}
                />

                <DetailRow
                  icon='note-text-outline'
                  label='Notes'
                  value={detailsItem?.notes}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type DetailRowProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value?: string | number;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View className='mb-4 flex-row items-start'>
      <View className='mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-lg bg-[#F4F0FF]'>
        <MaterialCommunityIcons name={icon} size={16} color={PURPLE} />
      </View>

      <View className='flex-1'>
        <Text className='text-xs font-medium uppercase tracking-wide text-[#9B949F]'>
          {label}
        </Text>

        <Text className='mt-0.5 text-sm font-semibold text-[#17131C]'>
          {value ?? '—'}
        </Text>
      </View>
    </View>
  );
}
