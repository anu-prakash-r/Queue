import React from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { QueueItem } from '@/components/Queue/types';
import type { TableItem } from '@/store/api/tableApi';

type AssignTableModalProps = {
  visible: boolean;
  item: QueueItem | null;
  tables: TableItem[];
  tableNumber: string;
  error: string;
  submitting: boolean;
  keyboardHeight: number;
  onSelectTable: (table: TableItem) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AssignTableModal({
  visible,
  item,
  tables,
  tableNumber,
  error,
  submitting,
  keyboardHeight,
  onSelectTable,
  onConfirm,
  onCancel,
}: AssignTableModalProps) {
const availableTables = tables.filter(table => {
    if (table.status?.trim().toLowerCase() !== 'available') return false;
    if (item && item.people > 0 && table.seating_capacity < item.people) return false;
    return true;
  });
  const isTableSelected = (table: TableItem): boolean =>
    String(table.table_number) === tableNumber.trim();

  return (
    <Modal
      transparent
      visible={visible}
      animationType='fade'
      onRequestClose={onCancel}
    >
      <View
        className='flex-1 justify-end'
        style={{ paddingBottom: keyboardHeight }}
      >
        <Pressable
          onPress={onCancel}
          className='absolute inset-0 bg-black/40'
        />

        <View className='max-h-[85%] rounded-t-3xl bg-white p-5 pb-8'>
          <View className='mb-4 items-center'>
            <View className='h-1.5 w-12 rounded-full bg-[#DDD6E2]' />
          </View>

          <View className='mb-4 flex-row items-center justify-between'>
            <Text className='text-[18px] font-bold text-[#442F52]'>
              Assign Table
            </Text>

            <TouchableOpacity
              className='h-8 w-8 items-center justify-center'
              activeOpacity={0.7}
              onPress={onCancel}
            >
              <MaterialIcons name='close' size={24} color='#777180' />
            </TouchableOpacity>
          </View>

          {item && (
            <Text className='mb-3 text-[13px] text-[#777180]'>
              Seating {item.name} ({item.people} people)
            </Text>
          )}

          <Text className='mb-2 text-[14px] font-medium text-[#17132F]'>
            Available Tables
          </Text>

          {error ? (
            <Text className='mb-2 text-[12px] text-[#E31B23]'>{error}</Text>
          ) : null}

          {availableTables.length === 0 ? (
            <View className='items-center rounded-xl border border-dashed border-[#D8D2E2] bg-[#FAF8FB] px-4 py-6'>
              <MaterialIcons name='event-busy' size={22} color='#8D8791' />

              <Text className='mt-2 text-[13px] text-[#77718A]'>
                {item
                  ? 'No available tables for this party size right now.'
                  : 'No available tables right now.'}
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 220 }}
            >
              <View className='gap-2 pb-1'>
                {availableTables.map(table => {
                  const selected = isTableSelected(table);

                  const label =
                    table.table_name?.trim() || `Table ${table.table_number}`;

                  return (
                    <TouchableOpacity
                      key={table.id}
                      activeOpacity={0.7}
                      onPress={() => onSelectTable(table)}
                      className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                        selected
                          ? 'border-[#2E7D32] bg-[#E8F5E9]'
                          : 'border-[#E9E2ED] bg-white'
                      }`}
                    >
                      <View className='flex-1 pr-3'>
                        <Text
                          numberOfLines={1}
                          className={`text-[14px] font-bold ${
                            selected ? 'text-[#2E7D32]' : 'text-[#24113D]'
                          }`}
                        >
                          {label}
                        </Text>

                        <Text
                          className={`mt-0.5 text-[12px] ${
                            selected ? 'text-[#2E7D32]' : 'text-[#77718A]'
                          }`}
                        >
                          {table.seating_capacity > 0
                            ? `${table.seating_capacity} seats`
                            : 'Table'}
                        </Text>
                      </View>

                      {selected && (
                        <MaterialIcons
                          name='check-circle'
                          size={22}
                          color='#2E7D32'
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}

          <View className='mt-5 flex-row gap-3'>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={submitting}
              onPress={onCancel}
              className='h-12 flex-1 items-center justify-center rounded-xl border border-[#35116B] bg-white'
            >
              <Text className='text-[14px] font-semibold text-[#35116B]'>
                CANCEL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={submitting || availableTables.length === 0 || !tableNumber.trim()}
              onPress={onConfirm}
              className={`h-12 flex-1 items-center justify-center rounded-xl ${
                submitting || availableTables.length === 0 || !tableNumber.trim()
                  ? 'bg-[#A894B5]'
                  : 'bg-[#35116B]'
              }`}
            >
              {submitting ? (
                <ActivityIndicator size='small' color='#FFFFFF' />
              ) : (
                <Text className='text-[14px] font-semibold text-white'>
                  ASSIGN
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
