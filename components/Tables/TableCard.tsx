import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { TableItem } from '@/Screens/Tables/Tables.screen';

const statusConfig = {
  Available: {
    color: '#22A447',
    lightColor: '#EAF8EC',
  },
  Occupied: {
    color: '#E31B23',
    lightColor: '#FDEBEC',
  },
  Reserved: {
    color: '#1468D8',
    lightColor: '#EAF2FD',
  },
  Maintenance: {
    color: '#F28C00',
    lightColor: '#FFF4E5',
  },
};

type Props = {
  table: TableItem;
  onPress?: (table: TableItem) => void;
};

export default function TableCard({ table, onPress }: Props) {
  const config = statusConfig[table.status];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(table)}
      className="mb-3 flex-row items-center overflow-hidden rounded-xl border border-[#E5E1EA] bg-white"
    >
      <View
        className="w-[4px] self-stretch"
        style={{ backgroundColor: config.color }}
      />
      <View className="w-[64px] items-center justify-center">
        <View className="h-[32px] w-[42px] items-center justify-center">
          <FontAwesome5 name="chair" size={25} color={config.color} />
        </View>
      </View>

      {/* Divider */}
      <View className="h-[54px] w-[1px] bg-[#E4DFE9]" />

      {/* Table Information */}
      <View className="flex-1 py-4 pl-4">
        <Text className="text-[18px] font-bold text-[#18182E]">{table.id}</Text>

        <Text className="mt-1 text-[14px] text-[#302B47]">
          {table.seats} Seater
        </Text>
      </View>

      <View className="mr-3 items-end">
        <View
          className="rounded-xl px-3 py-2"
          style={{
            backgroundColor: config.lightColor,
          }}
        >
          <Text
            className="text-[12px] font-semibold"
            style={{ color: config.color }}
          >
            {table.status}
          </Text>
        </View>

        <View className="mt-3 flex-row items-center">
          <Text className="text-[12px] text-[#302B47]">{table.area}</Text>

          <View
            className="mx-2 h-[5px] w-[5px] rounded-full"
            style={{ backgroundColor: config.color }}
          />

          <Text className="text-[12px] text-[#302B47]">{table.floor}</Text>
        </View>
      </View>

      <MaterialIcons
        name="chevron-right"
        size={25}
        color="#302B47"
        style={{ marginRight: 5 }}
      />
    </TouchableOpacity>
  );
}
