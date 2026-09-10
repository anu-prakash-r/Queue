import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { QueueItem } from '@/components/Queue/types';

type QueueCardProps = {
  item: QueueItem;
  menuIsOpen: boolean;
  onToggleMenu: () => void;
  onView: (item: QueueItem) => void;
  onEdit: (item: QueueItem) => void;
  onAssignTable: (item: QueueItem) => void;
  onRemove: (item: QueueItem) => void;
  onCall: (item: QueueItem) => void;
  onWhatsApp: (item: QueueItem) => void;
};

export default function QueueCard({
  item,
  menuIsOpen,
  onToggleMenu,
  onView,
  onEdit,
  onAssignTable,
  onRemove,
  onCall,
}: QueueCardProps) {
  return (
    <View className='mb-3 rounded-2xl border border-[#E9E2ED] bg-white px-4 py-3 shadow-md'>
      <View className='flex-row items-start'>
        <View className='flex-1'>
          <Text
            numberOfLines={1}
            className='text-[15px] font-bold text-[#24113D]'
          >
            {item.name}
          </Text>

          <View className='mt-2 flex-row items-center'>
            <View className='flex-row items-center'>
              <MaterialIcons name='person-outline' size={17} color='#777180' />

              <Text className='ml-1 text-[12px] text-[#4B4552]'>
                {item.people} People
              </Text>
            </View>

            <View className='ml-3 flex-row items-center'>
              <MaterialIcons name='access-time' size={17} color='#777180' />

              <Text className='ml-1 text-[12px] text-[#4B4552]'>
                {item.time}
              </Text>
            </View>
          </View>
        </View>

        <View className='mr-2 items-center justify-center'>
          <Text className='text-[14px] font-semibold text-[#43943C]'>
            {item.waitingTime}
          </Text>

          <Text className='mt-0.5 text-[10px] text-[#4B4552]'>Waiting</Text>
        </View>

        <TouchableOpacity
          className='h-[34px] w-[30px] items-center justify-center'
          activeOpacity={0.7}
          onPress={onToggleMenu}
          hitSlop={10}
        >
          <MaterialIcons name='more-vert' size={24} color='#777180' />
        </TouchableOpacity>
      </View>

      {menuIsOpen && (
        <View className='mt-3 rounded-xl border border-[#E9E2ED]'>
          <TouchableOpacity
            className='flex-row items-center border-b border-[#E9E2ED] px-4 py-3'
            activeOpacity={0.7}
            onPress={() => onView(item)}
            hitSlop={10}
          >
            <MaterialIcons name='visibility' size={20} color='#4B197C' />

            <Text className='ml-3 text-[14px] font-medium text-[#24113D]'>
              View Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row items-center border-b border-[#E9E2ED] px-4 py-3'
            activeOpacity={0.7}
            onPress={() => onEdit(item)}
            hitSlop={10}
          >
            <MaterialIcons name='edit' size={20} color='#4B197C' />

            <Text className='ml-3 text-[14px] font-medium text-[#24113D]'>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row items-center border-b border-[#E9E2ED] px-4 py-3'
            activeOpacity={0.7}
            onPress={() => onAssignTable(item)}
            hitSlop={10}
          >
            <MaterialIcons name='table-restaurant' size={20} color='#4B197C' />

            <Text className='ml-3 text-[14px] font-medium text-[#24113D]'>
              Assign Table
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row items-center px-4 py-3'
            activeOpacity={0.7}
            hitSlop={10}
            onPress={() => onRemove(item)}
          >
            <MaterialIcons name='person-remove' size={20} color='#C62828' />

            <Text className='ml-3 text-[14px] font-medium text-[#C62828]'>
              Remove from Queue
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View className='mt-3 h-[1px] bg-[#F1EBF5]' />

      <View className='mt-3 flex-row items-center justify-between'>
        <Text className='text-[12px] text-[#777180]'>
          {item.waitingTime} Waiting
        </Text>

        <TouchableOpacity
          className='h-[34px] w-[40px] flex-row items-center justify-center rounded-xl bg-[#4B197C] opacity-100 disabled:opacity-40'
          activeOpacity={0.8}
          disabled={!item.mobileNumber}
          onPress={() => onCall(item)}
          hitSlop={10}
        >
          <MaterialIcons name='phone' size={18} color='#FFFFFF' />
        </TouchableOpacity>
      </View>
    </View>
  );
}
