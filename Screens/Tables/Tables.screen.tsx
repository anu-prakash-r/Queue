import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { StatusBar } from 'expo-status-bar';

import Toast from 'react-native-toast-message';

import { ApiError } from '@/services/api';

import { getTables, TableItem } from '@/services/tableApi';

import TablesHeader from '@/components/Tables/TableHeader';
import TableSearch from '@/components/Tables/TableSearch';
import TableSummary from '@/components/Tables/TableSummary';
import TableCard from '@/components/Tables/TableCard';
import TablesFooter from '@/components/Tables/TablesFooter';

export default function TablesScreen() {
  const [tables, setTables] = useState<TableItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [sortAscending, setSortAscending] = useState(true);

  /**
   * Fetch tables from API
   */
  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getTables();

      setTables(data);
    } catch (err: unknown) {
      let msg = 'Network error while fetching tables.';

      if (err instanceof ApiError) {
        msg = err.message;
      } else if (err instanceof Error) {
        console.log('ERROR:', err.message);

        msg = err.message;
      }

      setError(msg);

      Toast.show({
        type: 'error',
        text1: 'Unable to Load Tables',
        text2: msg,
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load tables when screen opens
   */
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  /**
   * Filter and sort tables
   */
  const filteredTables = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return [...tables]
      .filter(table => table.id.toLowerCase().includes(searchText))
      .sort((a, b) =>
        sortAscending ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id),
      );
  }, [tables, search, sortAscending]);

  /**
   * Summary
   */
  const total = tables.length;

  const available = tables.filter(table => table.status === 'Available').length;

  const occupied = tables.filter(table => table.status === 'Occupied').length;

  const reserved = tables.filter(table => table.status === 'Reserved').length;

  /**
   * Table press
   */
  const handleTablePress = (table: TableItem) => {
    console.log('Selected table:', table);
  };

  /**
   * Sort
   */
  const handleSort = () => {
    setSortAscending(prev => !prev);
  };

  /**
   * Refresh
   */
  const handleRefresh = () => {
    fetchTables();
  };

  return (
    <View className='flex-1 bg-[#FCFBFD]'>
      <StatusBar style='light' />

      <TablesHeader
        onBack={() => {
          console.log('Back');
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        <TableSearch
          value={search}
          onChangeText={setSearch}
          onFilter={() => {
            console.log('Filter');
          }}
        />

        <TableSummary
          total={total}
          available={available}
          occupied={occupied}
          reserved={reserved}
        />

        <View className='mt-7 flex-row items-center justify-between px-5'>
          <Text className='text-[16px] font-bold text-[#18182E]'>
            All Tables
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSort}
            className='flex-row items-center'
          >
            <Text className='text-[12px] font-semibold text-[#35116B]'>
              By Table No.
            </Text>

            <MaterialIcons
              name='swap-vert'
              size={22}
              color='#35116B'
              style={{
                marginLeft: 5,
              }}
            />
          </TouchableOpacity>
        </View>

        <View className='mt-5 px-5'>
          {loading ? (
            <View className='items-center py-20'>
              <ActivityIndicator size='large' color='#35116B' />

              <Text className='mt-3 text-[12px] text-[#99929D]'>
                Loading tables...
              </Text>
            </View>
          ) : error ? (
            <View className='items-center rounded-2xl bg-white px-6 py-16'>
              <View className='h-16 w-16 items-center justify-center rounded-full bg-[#F1EAF5]'>
                <MaterialIcons name='error-outline' size={32} color='#35116B' />
              </View>

              <Text className='mt-4 text-[15px] font-bold text-[#18182E]'>
                Something went wrong
              </Text>

              <Text className='mt-1 text-center text-[12px] text-[#99929D]'>
                {error}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={fetchTables}
                className='mt-5 rounded-xl bg-[#35116B] px-5 py-3'
              >
                <Text className='text-[12px] font-semibold text-white'>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : filteredTables.length === 0 ? (
            <View className='items-center rounded-2xl bg-white px-6 py-16'>
              <View className='h-16 w-16 items-center justify-center rounded-full bg-[#F1EAF5]'>
                <MaterialIcons
                  name='table-restaurant'
                  size={32}
                  color='#35116B'
                />
              </View>

              <Text className='mt-4 text-[15px] font-bold text-[#18182E]'>
                No tables found
              </Text>

              <Text className='mt-1 text-center text-[12px] text-[#99929D]'>
                {search
                  ? 'Try searching with another table number.'
                  : 'No tables are available.'}
              </Text>

              {search.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setSearch('');
                  }}
                  className='mt-4 rounded-xl bg-[#35116B] px-4 py-2.5'
                >
                  <Text className='text-[12px] font-semibold text-white'>
                    Clear Search
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredTables.map(table => (
              <TableCard
                key={table.id}
                table={table}
                onPress={handleTablePress}
              />
            ))
          )}
        </View>

        <TablesFooter
          total={total}
          lastUpdated='09:40 AM'
          onRefresh={handleRefresh}
        />
      </ScrollView>
    </View>
  );
}
