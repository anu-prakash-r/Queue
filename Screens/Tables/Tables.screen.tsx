import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';

import {
  useGetTablesQuery,
  useDeleteTableMutation,
  TableItem,
} from '@/store/api/tableApi';
import TableStatusModal from '@/components/Tables/TableStatusModal';
import TablesHeader from '@/components/Tables/TableHeader';
import TableSearch from '@/components/Tables/TableSearch';
import TableSummary from '@/components/Tables/TableSummary';
import TableCard from '@/components/Tables/TableCard';
import TablesFooter from '@/components/Tables/TablesFooter';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';

import { useAuth } from '@/contexts/AuthContext';
import {
  TablesScreenSkeleton,
  TableSummarySkeleton,
} from '@/components/SkeletonLoader/TablesScreenSkeleton';

export default function TablesScreen() {
  const { token } = useAuth();

  const {
    data: tablesData,
    isLoading: loading,
    error,
    refetch: fetchTables,
  } = useGetTablesQuery(undefined, { skip: !token });

  const [deleteTable, { isLoading: deleteLoading }] = useDeleteTableMutation();

  const tables = tablesData?.tables ?? [];

  const summary = {
    total_tables: tablesData?.summary?.total_tables ?? 0,
    available: tablesData?.summary?.available ?? 0,
    occupied: tablesData?.summary?.occupied ?? 0,
    reserved: tablesData?.summary?.reserved ?? 0,
  };

  const [search, setSearch] = useState('');

  const [sortAscending, setSortAscending] = useState(true);

  const [lastUpdated, setLastUpdated] = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<TableItem | null>(null);

  const errorText = error ? 'Unable to load tables. Please try again.' : '';

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchTables();
      }
    }, [token, fetchTables]),
  );

  useEffect(() => {
    if (tablesData) {
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    }
  }, [tablesData]);

  const filteredTables = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    const tableArray: TableItem[] = Array.isArray(tables) ? tables : [];

    return [...tableArray]
      .filter(table => {
        const tableId = String(table?.id ?? '').toLowerCase();

        return tableId.includes(searchText);
      })
      .sort((a, b) => {
        const aId = String(a?.id ?? '');

        const bId = String(b?.id ?? '');

        return sortAscending ? aId.localeCompare(bId) : bId.localeCompare(aId);
      });
  }, [tables, search, sortAscending]);

  const total = summary.total_tables;

  const available = summary.available;

  const occupied = summary.occupied;

  const reserved = summary.reserved;

  const handleEditTable = (table: TableItem) => {
    router.push({
      pathname: '/addTable',
      params: {
        mode: 'edit',
        id: String(table.id),
        table: JSON.stringify(table),
      },
    });
  };

  const handleUpdateTable = (table: TableItem) => {
    setSelectedTable(table);
    setStatusModalVisible(true);
  };

  const handleDeleteTable = (table: TableItem) => {
    setDeleteTarget(table);
  };

  const confirmDeleteTable = async () => {
    if (!deleteTarget || !token) {
      return;
    }

    const tableId = deleteTarget.id;

    try {
      const response = await deleteTable(String(tableId)).unwrap();

      const failed = Boolean(response && response.success === false);

      if (!failed) {
        Toast.show({
          type: 'success',
          text1: 'Table Deleted',
          text2: `Table T${deleteTarget.table_number} has been deleted successfully.`,
          visibilityTime: 3000,
        });

        setDeleteTarget(null);
      } else {
        const message = response?.message ?? 'Failed to delete table.';

        Toast.show({
          type: 'error',
          text1: 'Delete Failed',
          text2: message,
          visibilityTime: 4000,
        });
      }
    } catch (error: unknown) {
      let message = 'Network error while deleting the table.';

      if (error instanceof Error) {
        message = error.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: message,
        visibilityTime: 4000,
      });
    }
  };

  const handleSort = () => {
    setSortAscending(previous => !previous);
  };

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
        {loading ? (
          <TableSummarySkeleton />
        ) : (
          <TableSummary
            total={total}
            available={available}
            occupied={occupied}
            reserved={reserved}
          />
        )}

        <View className='mt-7 flex-row items-center justify-between px-5'>
          <Text className='text-[16px] font-bold text-[#18182E]'>
            All Tables
          </Text>

          {/* <TouchableOpacity
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
          </TouchableOpacity> */}
        </View>

        <View className='mt-5 px-5'>
          {loading ? (
            <TablesScreenSkeleton />
          ) : error ? (
            <View className='items-center rounded-2xl bg-white px-6 py-16'>
              <View className='h-16 w-16 items-center justify-center rounded-full bg-[#F1EAF5]'>
                <MaterialIcons name='error-outline' size={32} color='#35116B' />
              </View>

              <Text className='mt-4 text-[15px] font-bold text-[#18182E]'>
                Something went wrong
              </Text>

              <Text className='mt-1 text-center text-[12px] text-[#99929D]'>
                {errorText}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => fetchTables()}
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
                key={String(table.id)}
                table={table}
                onUpdate={handleUpdateTable}
                onEdit={handleEditTable}
                onDelete={handleDeleteTable}
              />
            ))
          )}
        </View>

        {total > 0 && (
          <TablesFooter
            total={total}
            lastUpdated={lastUpdated}
            onRefresh={handleRefresh}
          />
        )}

        <TableStatusModal
          visible={statusModalVisible}
          table={selectedTable}
          onClose={() => {
            setStatusModalVisible(false);
            setSelectedTable(null);
          }}
          onUpdated={() => {
            fetchTables();
          }}
        />

        <ConfirmationModal
          visible={deleteTarget !== null}
          title='Delete Table?'
          message={
            deleteTarget
              ? `Are you sure you want to delete T${deleteTarget.table_number}? This action cannot be undone.`
              : ''
          }
          icon='delete-outline'
          confirmText='Delete'
          cancelText='Cancel'
          destructive
          loading={deleteLoading}
          onCancel={() => {
            if (!deleteLoading) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={confirmDeleteTable}
        />
      </ScrollView>
    </View>
  );
}
