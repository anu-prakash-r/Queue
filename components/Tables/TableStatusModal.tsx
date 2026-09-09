import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { TableItem, updateTableStatus } from '@/services/tableApi';

import { useAuth } from '@/contexts/AuthContext';

type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

type Props = {
  visible: boolean;

  table: TableItem | null;

  onClose: () => void;

  onUpdated?: () => void;
};

const statusConfig: Record<
  TableStatus,
  {
    label: string;
    color: string;
    lightColor: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  }
> = {
  available: {
    label: 'Available',
    color: '#22A447',
    lightColor: '#EAF8EC',
    icon: 'check-circle',
  },

  occupied: {
    label: 'Occupied',
    color: '#E31B23',
    lightColor: '#FDEBEC',
    icon: 'person',
  },

  reserved: {
    label: 'Reserved',
    color: '#1468D8',
    lightColor: '#EAF2FD',
    icon: 'event',
  },

  maintenance: {
    label: 'Maintenance',
    color: '#F28C00',
    lightColor: '#FFF4E5',
    icon: 'build',
  },
};

export default function TableStatusModal({
  visible,
  table,
  onClose,
  onUpdated,
}: Props) {
  const { token } = useAuth();

  const [selectedStatus, setSelectedStatus] =
    useState<TableStatus>('available');

  const [loading, setLoading] = useState(false);

  /**
   * Set current table status
   * when modal opens.
   */
  useEffect(() => {
    if (!table) {
      return;
    }

    const currentStatus = String(
      table.status ?? 'available',
    ).toLowerCase() as TableStatus;

    if (statusConfig[currentStatus]) {
      setSelectedStatus(currentStatus);
    } else {
      setSelectedStatus('available');
    }
  }, [table, visible]);

  /**
   * Select status.
   *
   * No API call here.
   */
  const handleSelectStatus = (status: TableStatus) => {
    if (loading) {
      return;
    }

    setSelectedStatus(status);
  };

  /**
   * Close modal.
   */
  const handleCancel = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  /**
   * Update ONLY table status.
   *
   * PATCH /tables/{id}/status
   */
  const handleUpdate = async () => {
    if (!table || !token || loading) {
      return;
    }

    const currentStatus = String(table.status ?? 'available').toLowerCase();

    /**
     * If status has not changed,
     * don't call API.
     */
    if (currentStatus === selectedStatus) {
      onClose();
      return;
    }

    try {
      setLoading(true);

      /**
       * ONLY status is sent.
       *
       * PATCH /tables/{id}/status
       *
       * Body:
       * {
       *   status: "occupied"
       * }
       */
      const response = await updateTableStatus(
        String(table.id),
        selectedStatus,
        token,
      );

      if (response.success) {
        /**
         * Refresh tables list.
         */
        onUpdated?.();

        /**
         * Close modal.
         */
        onClose();
      } else {
        console.log('FAILED TO UPDATE TABLE STATUS:', response);
      }
    } catch (error) {
      console.log('UPDATE TABLE STATUS ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * No table selected.
   */
  if (!table) {
    return null;
  }

  const currentStatus = String(
    table.status ?? 'available',
  ).toLowerCase() as TableStatus;

  const currentConfig = statusConfig[currentStatus] ?? statusConfig.available;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={handleCancel}
    >
      <Pressable
        className='flex-1 justify-end bg-black/40'
        onPress={handleCancel}
      >
        <Pressable
          className='rounded-t-[28px] bg-white px-5 pb-8 pt-3'
          onPress={event => event.stopPropagation()}
        >
          <View className='mb-4 items-center'>
            <View className='h-[4px] w-[42px] rounded-full bg-[#D6D2DB]' />
          </View>

          <View className='flex-row items-center justify-between'>
            <View className='flex-1'>
              <Text className='text-[20px] font-bold text-[#18182E]'>
                Update Table
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCancel}
              disabled={loading}
              className='h-9 w-9 items-center justify-center rounded-full bg-[#F4F2F6]'
            >
              <MaterialIcons name='close' size={21} color='#302B47' />
            </TouchableOpacity>
          </View>

          <View className='mt-5 rounded-xl bg-[#F8F7FA] px-4 py-3'>
            <View className='flex-row items-center justify-between'>
              <Text className='text-[13px] text-[#6B6578]'>Table</Text>

              <Text className='text-[15px] font-semibold text-[#18182E]'>
                {table.table_number}
              </Text>
            </View>

            <View className='mt-2 flex-row items-center justify-between'>
              <Text className='text-[13px] text-[#6B6578]'>Current status</Text>

              <View className='flex-row items-center'>
                <View
                  className='mr-2 h-[7px] w-[7px] rounded-full'
                  style={{
                    backgroundColor: currentConfig.color,
                  }}
                />

                <Text
                  className='text-[14px] font-semibold'
                  style={{
                    color: currentConfig.color,
                  }}
                >
                  {currentConfig.label}
                </Text>
              </View>
            </View>
          </View>

          <Text className='mt-6 text-[15px] font-semibold text-[#18182E]'>
            Select status
          </Text>

          <View className='mt-3'>
            {(Object.keys(statusConfig) as TableStatus[]).map(status => {
              const config = statusConfig[status];

              const isSelected = selectedStatus === status;

              return (
                <TouchableOpacity
                  key={status}
                  activeOpacity={0.8}
                  disabled={loading}
                  onPress={() => handleSelectStatus(status)}
                  className='mb-3 flex-row items-center rounded-xl border px-4 py-3'
                  style={{
                    borderColor: isSelected ? config.color : '#E5E1EA',

                    backgroundColor: isSelected ? config.lightColor : '#FFFFFF',
                  }}
                >
                  <View
                    className='h-10 w-10 items-center justify-center rounded-full'
                    style={{
                      backgroundColor: config.lightColor,
                    }}
                  >
                    <MaterialIcons
                      name={config.icon}
                      size={21}
                      color={config.color}
                    />
                  </View>

                  <View className='ml-3 flex-1'>
                    <Text
                      className='text-[14px] font-semibold'
                      style={{
                        color: isSelected ? config.color : '#302B47',
                      }}
                    >
                      {config.label}
                    </Text>
                  </View>

                  <View
                    className='h-5 w-5 items-center justify-center rounded-full border-2'
                    style={{
                      borderColor: isSelected ? config.color : '#BDB8C6',
                    }}
                  >
                    {isSelected && (
                      <View
                        className='h-2.5 w-2.5 rounded-full'
                        style={{
                          backgroundColor: config.color,
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {loading && (
            <View className='mb-3 flex-row items-center justify-center'>
              <ActivityIndicator size='small' color='#35116B' />

              <Text className='ml-2 text-[12px] text-[#6B6578]'>
                Updating table status...
              </Text>
            </View>
          )}

          <View className='mt-2 flex-row'>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCancel}
              disabled={loading}
              className='mr-2 h-[48px] flex-1 items-center justify-center rounded-xl border border-[#D9D4DF] bg-white'
            >
              <Text className='text-[14px] font-semibold text-[#302B47]'>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleUpdate}
              disabled={loading}
              className='ml-2 h-[48px] flex-1 items-center justify-center rounded-xl bg-[#35116B]'
            >
              {loading ? (
                <ActivityIndicator size='small' color='#FFFFFF' />
              ) : (
                <Text className='text-[14px] font-semibold text-white'>
                  Update
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
