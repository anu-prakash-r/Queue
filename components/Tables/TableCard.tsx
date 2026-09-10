import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { TableItem } from '@/services/tableApi';

const statusConfig = {
  available: {
    color: '#22A447',
    lightColor: '#EAF8EC',
    label: 'Available',
  },

  occupied: {
    color: '#E31B23',
    lightColor: '#FDEBEC',
    label: 'Occupied',
  },

  reserved: {
    color: '#1468D8',
    lightColor: '#EAF2FD',
    label: 'Reserved',
  },

  maintenance: {
    color: '#F28C00',
    lightColor: '#FFF4E5',
    label: 'Maintenance',
  },
} as const;

type Props = {
  table: TableItem;
  onPress?: (table: TableItem) => void;
  onEdit?: (table: TableItem) => void;
  onUpdate?: (table: TableItem) => void;
  onDelete?: (table: TableItem) => void;
};

export default function TableCard({
  table,
  onPress,
  onEdit,
  onUpdate,
  onDelete,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const statusKey = String(
    table?.status ?? 'available',
  ).toLowerCase() as keyof typeof statusConfig;

  const config = statusConfig[statusKey] ?? statusConfig.available;

  const handleToggle = () => {
    setExpanded(previous => !previous);

    onPress?.(table);
  };

  const handleEdit = () => {
    onEdit?.(table);
  };

  return (
    <View className='mb-4 overflow-hidden rounded-xl border border-[#E5E1EA] bg-white'>
      <View className='flex-row'>
        {/* FULL STATUS BORDER */}
        <View
          className='w-[4px]'
          style={{
            backgroundColor: config.color,
          }}
        />

        <View className='flex-1'>
          {/* MAIN CARD */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggle}
            className='min-h-[86px] flex-row items-center'
          >
            {/* ICON */}
            <View className='w-[64px] items-center justify-center'>
              <View className='h-[36px] w-[42px] items-center justify-center'>
                <FontAwesome5 name='chair' size={25} color={config.color} />
              </View>
            </View>

            {/* DIVIDER */}
            <View className='h-[54px] w-[1px] bg-[#E4DFE9]' />

            {/* TABLE INFO */}
            <View className='flex-1 py-4 pl-4'>
              <Text className='text-[18px] font-bold text-[#18182E]'>
                T{table.table_number}
              </Text>

              <Text className='mt-1 text-[14px] text-[#302B47]'>
                {table.seating_capacity} Seater
              </Text>
            </View>

            {/* RIGHT INFO */}
            <View className='mr-2 items-end'>
              <View
                className='rounded-xl px-3 py-2'
                style={{
                  backgroundColor: config.lightColor,
                }}
              >
                <Text
                  className='text-[12px] font-semibold'
                  style={{
                    color: config.color,
                  }}
                >
                  {config.label}
                </Text>
              </View>

              <View className='mt-3 flex-row items-center'>
                <Text className='text-[12px] text-[#302B47]'>{table.area}</Text>

                <View
                  className='mx-2 h-[5px] w-[5px] rounded-full'
                  style={{
                    backgroundColor: config.color,
                  }}
                />

                <Text className='text-[12px] text-[#302B47]'>
                  {table.floor}
                </Text>
              </View>
            </View>

            {/* ARROW */}
            <View className='w-[42px] items-center justify-center'>
              <MaterialIcons
                name={expanded ? 'keyboard-arrow-up' : 'chevron-right'}
                size={26}
                color='#302B47'
              />
            </View>
          </TouchableOpacity>

          {/* EXPANDED ACTIONS */}
          {expanded && (
            <View className='border-t border-[#E5E1EA] px-5 py-5'>
              <View className='flex-row items-center justify-end'>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleEdit}
                  className='px-5 py-2'
                >
                  <Text className='text-[13px] font-semibold text-[#35116B]'>
                    Edit
                  </Text>
                </TouchableOpacity>

                <View className='mx-2 h-5 w-[1px] bg-[#D9D4DF]' />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onUpdate?.(table)}
                  className='px-5 py-2'
                >
                  <Text className='text-[13px] font-semibold text-[#1468D8]'>
                    Update
                  </Text>
                </TouchableOpacity>

                <View className='mx-2 h-5 w-[1px] bg-[#D9D4DF]' />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onDelete?.(table)}
                  className='px-5 py-2'
                >
                  <Text className='text-[13px] font-semibold text-[#E31B23]'>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
