import React from 'react';
import { View } from 'react-native';
import TableSummaryCard from './TableSummaryCard';

type Props = {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
};

export default function TableSummary({
  total,
  available,
  occupied,
  reserved,
}: Props) {
  return (
    <View className="mt-5 px-5">
      <View className="flex-row gap-2">
        <TableSummaryCard
          icon="table-restaurant"
          value={total}
          label="Total Tables"
          color="#229B39"
          bgColor="#EAF8EC"
        />

        <TableSummaryCard
          icon="check-circle-outline"
          value={available}
          label="Available"
          color="#229B39"
          bgColor="#EAF8EC"
        />

        <TableSummaryCard
          icon="people-outline"
          value={occupied}
          label="Occupied"
          color="#F28C00"
          bgColor="#FFF4E5"
        />

        <TableSummaryCard
          icon="remove-circle-outline"
          value={reserved}
          label="Reserved"
          color="#E31B23"
          bgColor="#FDEBEC"
        />
      </View>
    </View>
  );
}
