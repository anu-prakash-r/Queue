import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Keyboard,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { router, useFocusEffect } from 'expo-router';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import Entypo from '@expo/vector-icons/Entypo';

import Toast from 'react-native-toast-message';

import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';

import { useAuth } from '@/contexts/AuthContext';

import {
  cancelQueue,
  getQueue,
  getQueues,
  seatQueue,
  updateQueue,
  QueueItem as QueueApiItem,
} from '@/services/queueApi';

import { getTables, TableItem } from '@/services/tableApi';

type QueueItem = {
  id: string | number;
  name: string;
  people: number;
  time: string;
  waitingTime: string;
  status?: string;
};

function formatTime(createdAt?: string): string {
  if (!createdAt) {
    return '--';
  }

  const date = new Date(createdAt);

  if (isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatWaitingTime(item: QueueApiItem): string {
  const value = item.estimated_wait ?? item.waiting_time;

  if (value === undefined || value === null) {
    return '--';
  }

  if (typeof value === 'number') {
    return `${Math.round(value)}m`;
  }

  const parsed = Number(value);

  if (!isNaN(parsed)) {
    return `${Math.round(parsed)}m`;
  }

  return String(value);
}

function mapQueueItem(item: QueueApiItem): QueueItem {
  return {
    id: item.id ?? item.token_number ?? item.queue_number ?? '',
    name:
      item.customer_name ??
      item.name ??
      item.customer?.name ??
      item.mobile_number ??
      item.customer?.mobile_number ??
      'Customer',
    people: item.people ?? item.party_size ?? item.guests ?? 1,
    time: formatTime(item.created_at),
    waitingTime: formatWaitingTime(item),
    status: item.status,
  };
}

export default function QueueScreen() {
  const { token } = useAuth();

  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  const loadQueue = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError('');
      setItems([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const queueItems = await getQueues(token, 'waiting');

      setItems(queueItems.map(mapQueueItem));
    } catch {
      setError('Could not load the queue.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadQueue();
    }, [loadQueue]),
  );

  const handleView = (item: QueueItem) => {
    setOpenMenuId(null);

    setDetailItem(item);

    setDetailVisible(true);

    setDetailLoading(true);

    setDetailError('');

    setDetailData(null);

    const loadDetail = async () => {
      if (!token) {
        setDetailLoading(false);

        setDetailError('No auth token.');

        return;
      }

      try {
        const detail = await getQueue(token, item.id);

        setDetailData(detail);
      } catch {
        setDetailError('Could not load queue details.');
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();
  };

  const [detailItem, setDetailItem] = useState<QueueItem | null>(null);

  const [detailVisible, setDetailVisible] = useState(false);

  const [detailLoading, setDetailLoading] = useState(false);

  const [detailError, setDetailError] = useState('');

  const [detailData, setDetailData] = useState<QueueApiItem | null>(null);

  const handleCloseDetail = () => {
    setDetailVisible(false);

    setDetailItem(null);

    setDetailData(null);

    setDetailError('');
  };

  const handleEdit = (item: QueueItem) => {
    setOpenMenuId(null);

    setPendingEdit(item);

    setEditPartySize(item.people);
  };

  const [pendingEdit, setPendingEdit] = useState<QueueItem | null>(null);

  const [editPartySize, setEditPartySize] = useState(1);

  const [editLoading, setEditLoading] = useState(false);

  const decreaseEditPartySize = () => {
    setEditPartySize(previous => Math.max(1, previous - 1));
  };

  const increaseEditPartySize = () => {
    setEditPartySize(previous => Math.min(50, previous + 1));
  };

  const confirmEdit = async () => {
    if (!token || !pendingEdit) {
      return;
    }

    setEditLoading(true);

    try {
      const response = await updateQueue(token, pendingEdit.id, {
        party_size: editPartySize,
      });

      if (response.success) {
        setItems(prev =>
          prev.map(q =>
            q.id === pendingEdit.id ? { ...q, people: editPartySize } : q,
          ),
        );

        setPendingEdit(null);

        Toast.show({
          type: 'success',
          text1: 'Queue updated successfully.',
          visibilityTime: 2500,
        });
      } else {
        const validationErrors = response.errors;

        let errorMessage = response.message ?? 'Failed to update the queue.';

        if (validationErrors && typeof validationErrors === 'object') {
          const firstError = Object.values(validationErrors)
            .flat()
            .find(error => typeof error === 'string');

          if (firstError) {
            errorMessage = firstError;
          }
        }

        Toast.show({
          type: 'error',
          text1: errorMessage,
          visibilityTime: 4000,
        });
      }
    } catch (error: unknown) {
      let message = 'An unexpected error occurred while updating the queue.';

      if (error instanceof Error) {
        message = error.message;
      }

      Toast.show({
        type: 'error',
        text1: message,
        visibilityTime: 4000,
      });
    } finally {
      setEditLoading(false);
    }
  };

  const cancelEdit = () => {
    setPendingEdit(null);
  };

  const handleAssignTable = (item: QueueItem) => {
    setOpenMenuId(null);

    setAssignItem(item);

    setAssignVisible(true);

    setAssignError('');

    setTableNumber('');

    getTables()
      .then(result => setTables(result.tables))
      .catch(() => setTables([]));
  };

  const [assignItem, setAssignItem] = useState<QueueItem | null>(null);

  const [assignVisible, setAssignVisible] = useState(false);

  const [assignError, setAssignError] = useState('');

  const [tableNumber, setTableNumber] = useState('');

  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [tables, setTables] = useState<TableItem[]>([]);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', event => {
      setKeyboardHeight(event.endCoordinates.height);
    });

    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShow.remove();

      keyboardDidHide.remove();
    };
  }, []);

  const handleCloseAssign = () => {
    setAssignVisible(false);

    setAssignItem(null);

    setTableNumber('');

    setAssignError('');

    setTables([]);
  };

  const confirmAssign = async () => {
    if (!token || !assignItem) {
      return;
    }

    const trimmedTableNumber = tableNumber.trim();

    if (!trimmedTableNumber) {
      setAssignError('Please enter a table number.');

      return;
    }

    const matchedTable = tables.find(
      table => String(table.table_number) === trimmedTableNumber,
    );

    if (!matchedTable) {
      setAssignError(
        tables.length === 0
          ? 'Could not load tables. Please try again.'
          : 'Table not found. Please enter a valid table number.',
      );

      return;
    }

    setAssignSubmitting(true);

    setAssignError('');

    try {
      const response = await seatQueue(token, assignItem.id, {
        table_id: String(matchedTable.id),
      });

      if (response.success) {
        setItems(prev => prev.filter(q => q.id !== assignItem.id));

        setAssignVisible(false);

        setAssignSubmitting(false);

        setAssignItem(null);

        setTableNumber('');

        setAssignError('');

        Toast.show({
          type: 'success',
          text1: 'Table assigned successfully.',
          visibilityTime: 2500,
        });
      } else {
        const validationErrors = response.errors;

        let errorMessage = response.message ?? 'Failed to assign the table.';

        if (validationErrors && typeof validationErrors === 'object') {
          const firstError = Object.values(validationErrors)
            .flat()
            .find(error => typeof error === 'string');

          if (firstError) {
            errorMessage = firstError;
          }
        }

        Toast.show({
          type: 'error',
          text1: errorMessage,
          visibilityTime: 4000,
        });
      }
    } catch (error: unknown) {
      let message = 'An unexpected error occurred while assigning the table.';

      if (error instanceof Error) {
        message = error.message;
      }

      Toast.show({
        type: 'error',
        text1: message,
        visibilityTime: 4000,
      });
    } finally {
      setAssignSubmitting(false);
    }
  };

  const [removingId, setRemovingId] = useState<string | number | null>(null);

  const [pendingRemove, setPendingRemove] = useState<QueueItem | null>(null);

  const handleRemovePress = (item: QueueItem) => {
    setOpenMenuId(null);

    setPendingRemove(item);
  };

  const confirmRemove = async () => {
    if (!token || !pendingRemove) {
      return;
    }

    setRemovingId(pendingRemove.id);

    try {
      await cancelQueue(token, pendingRemove.id);

      setItems(prev => prev.filter(q => q.id !== pendingRemove.id));

      setPendingRemove(null);
    } catch {
      setError('Could not remove the customer from the queue.');
    } finally {
      setRemovingId(null);
    }
  };

  const cancelRemove = () => {
    setPendingRemove(null);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className='flex-1 bg-white'>
      <View className='relative border-b border-[#E8E2EB] px-5 py-4'>
        <Text className='text-center text-2xl font-bold text-[#4B197C]'>
          Queue
        </Text>

        <TouchableOpacity
          className='absolute right-5 top-2 h-[40px] w-[40px] items-center justify-center rounded-xl'
          activeOpacity={0.8}
          onPress={() => router.push('/addqueue')}
        >
          <MaterialIcons name='person-add-alt-1' size={22} color='#4B197C' />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        {loading ? (
          /* Loading */
          <View className='items-center justify-center py-24'>
            <ActivityIndicator size='large' color='#4B197C' />
          </View>
        ) : error ? (
          /* Error */
          <View className='items-center justify-center px-10 py-24'>
            <Text className='text-center text-[14px] text-[#4B4552]'>
              {error}
            </Text>

            <TouchableOpacity
              className='mt-4 rounded-xl bg-[#4B197C] px-6 py-2.5'
              activeOpacity={0.8}
              onPress={loadQueue}
            >
              <Text className='text-[13px] font-bold text-white'>RETRY</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          /* Empty Queue */
          <View className='items-center justify-center px-10 py-24'>
            <MaterialIcons name='queue' size={48} color='#C9C2CF' />

            <Text className='mt-3 text-center text-[14px] text-[#4B4552]'>
              No customers waiting right now.
            </Text>
          </View>
        ) : (
          /* Queue List */
          <View className='px-5 pt-5'>
            {items.map(item => {
              const menuIsOpen = openMenuId === item.id;

              return (
                <View
                  key={String(item.id)}
                  className='mb-3 rounded-2xl border border-[#E9E2ED] bg-white px-4 py-3 shadow-md'
                >
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
                          <MaterialIcons
                            name='person-outline'
                            size={17}
                            color='#777180'
                          />

                          <Text className='ml-1 text-[12px] text-[#4B4552]'>
                            {item.people} People
                          </Text>
                        </View>

                        <View className='ml-3 flex-row items-center'>
                          <MaterialIcons
                            name='access-time'
                            size={17}
                            color='#777180'
                          />

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

                      <Text className='mt-0.5 text-[10px] text-[#4B4552]'>
                        Waiting
                      </Text>
                    </View>

                    <TouchableOpacity
                      className='h-[34px] w-[30px] items-center justify-center'
                      activeOpacity={0.7}
                      onPress={() => {
                        setOpenMenuId(menuIsOpen ? null : item.id);
                      }}
                    >
                      <MaterialIcons
                        name='more-vert'
                        size={24}
                        color='#777180'
                      />
                    </TouchableOpacity>
                  </View>

                  {menuIsOpen && (
                    <View className='mt-3 rounded-xl border border-[#E9E2ED]'>
                      <TouchableOpacity
                        className='flex-row items-center border-b border-[#E9E2ED] px-4 py-3'
                        activeOpacity={0.7}
                        onPress={() => handleView(item)}
                      >
                        <MaterialIcons
                          name='visibility'
                          size={20}
                          color='#4B197C'
                        />

                        <Text className='ml-3 text-[14px] font-medium text-[#24113D]'>
                          View Details
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className='flex-row items-center border-b border-[#E9E2ED] px-4 py-3'
                        activeOpacity={0.7}
                        onPress={() => handleEdit(item)}
                      >
                        <MaterialIcons name='edit' size={20} color='#4B197C' />

                        <Text className='ml-3 text-[14px] font-medium text-[#24113D]'>
                          Edit
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className='flex-row items-center border-b border-[#E9E2ED] px-4 py-3'
                        activeOpacity={0.7}
                        onPress={() => handleAssignTable(item)}
                      >
                        <MaterialIcons
                          name='table-restaurant'
                          size={20}
                          color='#4B197C'
                        />

                        <Text className='ml-3 text-[14px] font-medium text-[#24113D]'>
                          Assign Table
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className='flex-row items-center px-4 py-3'
                        activeOpacity={0.7}
                        onPress={() => handleRemovePress(item)}
                      >
                        <MaterialIcons
                          name='person-remove'
                          size={20}
                          color='#C62828'
                        />

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
                      className='h-[34px] w-[90px] flex-row items-center justify-center rounded-xl bg-[#4B197C]'
                      activeOpacity={0.8}
                      onPress={() => {
                        console.log('Calling:', item.name);
                      }}
                    >
                      <MaterialIcons name='phone' size={18} color='#FFFFFF' />

                      <Text className='ml-1.5 text-[14px] font-bold text-white'>
                        CALL
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <ConfirmationModal
        visible={!!pendingRemove}
        title='Remove from Queue'
        message={
          pendingRemove
            ? `Are you sure you want to remove ${pendingRemove.name} from the queue? This action cannot be undone.`
            : ''
        }
        confirmText='Remove'
        cancelText='Cancel'
        icon='person-remove'
        destructive
        loading={removingId !== null}
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />

      <Modal
        transparent
        visible={!!pendingEdit}
        animationType='fade'
        onRequestClose={cancelEdit}
      >
        <View className='flex-1 justify-end'>
          <Pressable
            onPress={cancelEdit}
            className='absolute inset-0 bg-black/40'
          />

          <View className='w-full rounded-t-[28px] bg-white px-5 pb-8 pt-3'>
            <View className='mb-5 items-center'>
              <View className='h-1.5 w-12 rounded-full bg-[#D8D2E2]' />
            </View>

            <View className='flex-row items-center justify-between'>
              <View className='flex-1'>
                <Text className='text-[20px] font-bold text-[#442F52]'>
                  Edit Queue
                </Text>

                {pendingEdit && (
                  <Text
                    numberOfLines={1}
                    className='mt-1 text-[13px] text-[#777180]'
                  >
                    {pendingEdit.name}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={cancelEdit}
                disabled={editLoading}
                className='ml-3 h-10 w-10 items-center justify-center rounded-full bg-[#F6F2F8]'
              >
                <MaterialIcons name='close' size={22} color='#777180' />
              </TouchableOpacity>
            </View>

            <View className='mt-7'>
              <Text className='mb-2 text-[14px] font-semibold text-[#17132F]'>
                Party Size
                <Text className='text-[#E31B23]'> *</Text>
              </Text>

              <View className='h-[54px] w-full flex-row overflow-hidden rounded-xl border border-[#D8D2E2] bg-white'>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={decreaseEditPartySize}
                  disabled={editLoading}
                  className='w-[54px] items-center justify-center border-r border-[#D8D2E2]'
                >
                  <Entypo name='minus' size={22} color='#35116B' />
                </TouchableOpacity>

                <View className='flex-1 items-center justify-center'>
                  <Text className='text-[17px] font-semibold text-[#17132F]'>
                    {editPartySize}
                  </Text>

                  <Text className='mt-0.5 text-[11px] text-[#777180]'>
                    {editPartySize === 1 ? 'Person' : 'People'}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={increaseEditPartySize}
                  disabled={editLoading}
                  className='w-[54px] items-center justify-center border-l border-[#D8D2E2]'
                >
                  <Entypo name='plus' size={22} color='#35116B' />
                </TouchableOpacity>
              </View>
            </View>

            <View className='mt-7 flex-row gap-3'>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={editLoading}
                onPress={cancelEdit}
                className='h-[52px] flex-1 items-center justify-center rounded-xl border border-[#35116B] bg-white'
              >
                <Text className='text-[14px] font-bold text-[#35116B]'>
                  CANCEL
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={editLoading}
                onPress={confirmEdit}
                className='h-[52px] flex-1 items-center justify-center rounded-xl bg-[#35116B]'
              >
                {editLoading ? (
                  <ActivityIndicator size='small' color='#FFFFFF' />
                ) : (
                  <View className='flex-row items-center'>
                    <MaterialIcons name='check' size={18} color='#FFFFFF' />

                    <Text className='ml-1.5 text-[14px] font-bold text-white'>
                      SAVE
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={detailVisible}
        animationType='fade'
        onRequestClose={handleCloseDetail}
      >
        <View className='flex-1 justify-end'>
          <Pressable
            onPress={handleCloseDetail}
            className='absolute inset-0 bg-black/40'
          />

          <View className='max-h-[85%] rounded-t-3xl bg-white p-5 pb-8'>
            <View className='mb-4 items-center'>
              <View className='h-1.5 w-12 rounded-full bg-[#DDD6E2]' />
            </View>

            <View className='mb-4 flex-row items-center justify-between'>
              <Text className='text-[18px] font-bold text-[#442F52]'>
                Queue Details
              </Text>

              <TouchableOpacity
                className='h-8 w-8 items-center justify-center'
                activeOpacity={0.7}
                onPress={handleCloseDetail}
              >
                <MaterialIcons name='close' size={24} color='#777180' />
              </TouchableOpacity>
            </View>

            {detailLoading ? (
              <View className='items-center justify-center py-16'>
                <ActivityIndicator size='large' color='#4B197C' />
              </View>
            ) : detailError ? (
              <View className='items-center justify-center px-8 py-12'>
                <MaterialIcons name='error-outline' size={44} color='#C9C2CF' />

                <Text className='mt-3 text-center text-[14px] text-[#4B4552]'>
                  {detailError}
                </Text>

                <TouchableOpacity
                  className='mt-4 rounded-xl bg-[#4B197C] px-6 py-2.5'
                  activeOpacity={0.8}
                  onPress={() => detailItem && handleView(detailItem)}
                >
                  <Text className='text-[13px] font-bold text-white'>
                    RETRY
                  </Text>
                </TouchableOpacity>
              </View>
            ) : detailData ? (
              <>
                <View className='rounded-2xl border border-[#E9E2ED] bg-[#F7F3FB] p-4'>
                  <Text className='text-[16px] font-bold text-[#24113D]'>
                    {detailData.customer_name ??
                      detailData.name ??
                      detailData.customer?.name ??
                      detailItem?.name ??
                      'Customer'}
                  </Text>

                  <View className='mt-3 flex-row items-center justify-between'>
                    <View className='flex-row items-center'>
                      <MaterialIcons
                        name='local-phone'
                        size={17}
                        color='#777180'
                      />

                      <Text className='ml-2 text-[13px] text-[#4B4552]'>
                        {detailData.mobile_number ??
                          detailData.customer?.mobile_number ??
                          '--'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      className='flex-row items-center rounded-lg bg-[#24113D] px-3 py-2'
                      onPress={() => {
                        const phoneNumber =
                          detailData.mobile_number ??
                          detailData.customer?.mobile_number;

                        if (phoneNumber) {
                          Linking.openURL(`tel:${phoneNumber}`);
                        }
                      }}
                      disabled={
                        !(
                          detailData.mobile_number ??
                          detailData.customer?.mobile_number
                        )
                      }
                    >
                      <MaterialIcons name='call' size={16} color='#FFFFFF' />

                      <Text className='ml-1.5 text-[13px] font-semibold text-white'>
                        Call
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className='mt-4 flex-row flex-wrap'>
                  <DetailInfo
                    icon='group'
                    label='Party Size'
                    value={
                      detailData.party_size ??
                      detailData.people ??
                      detailData.guests ??
                      detailItem?.people ??
                      1
                    }
                  />

                  <DetailInfo
                    icon='access-time'
                    label='Waiting'
                    value={
                      typeof detailData.estimated_wait === 'number'
                        ? `${Math.round(detailData.estimated_wait)}m`
                        : typeof detailData.waiting_time === 'number'
                          ? `${Math.round(detailData.waiting_time)}m`
                          : (detailData.estimated_wait ??
                            detailData.waiting_time ??
                            '--')
                    }
                  />

                  <DetailInfo
                    icon='schedule'
                    label='Joined'
                    value={formatTime(detailData.created_at)}
                  />

                  <DetailInfo
                    icon='info-outline'
                    label='Status'
                    value={detailData.status ?? detailItem?.status ?? 'waiting'}
                  />
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={assignVisible}
        animationType='fade'
        onRequestClose={handleCloseAssign}
      >
        <View
          className='flex-1 justify-end'
          style={{ paddingBottom: keyboardHeight }}
        >
          <Pressable
            onPress={handleCloseAssign}
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
                onPress={handleCloseAssign}
              >
                <MaterialIcons name='close' size={24} color='#777180' />
              </TouchableOpacity>
            </View>

            {assignItem && (
              <Text className='mb-3 text-[13px] text-[#777180]'>
                Seating {assignItem.name} ({assignItem.people} people)
              </Text>
            )}

            <Text className='mb-2 text-[14px] font-medium text-[#17132F]'>
              Table Number
              <Text className='text-[#E31B23]'> *</Text>
            </Text>

            <View
              className={`h-[48px] flex-row items-center rounded-xl border bg-white px-3 ${
                assignError ? 'border-[#E31B23]' : 'border-[#D8D2E2]'
              }`}
            >
              <MaterialIcons
                name='table-restaurant'
                size={20}
                color='#777180'
              />

              <TextInput
                value={tableNumber}
                onChangeText={text => {
                  setTableNumber(text);

                  if (assignError) {
                    setAssignError('');
                  }
                }}
                placeholder='Enter table number (e.g. 5)'
                placeholderTextColor='#77718A'
                keyboardType='number-pad'
                className='ml-2 h-full flex-1 text-[14px] text-[#17132F]'
              />
            </View>

            {assignError ? (
              <Text className='mt-1 text-[12px] text-[#E31B23]'>
                {assignError}
              </Text>
            ) : null}

            <View className='mt-5 flex-row gap-3'>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={assignSubmitting}
                onPress={handleCloseAssign}
                className='h-12 flex-1 items-center justify-center rounded-xl border border-[#35116B] bg-white'
              >
                <Text className='text-[14px] font-semibold text-[#35116B]'>
                  CANCEL
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={assignSubmitting}
                onPress={confirmAssign}
                className='h-12 flex-1 items-center justify-center rounded-xl bg-[#35116B]'
              >
                {assignSubmitting ? (
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
    </SafeAreaView>
  );
}

type DetailInfoProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string | number;
};

function DetailInfo({ icon, label, value }: DetailInfoProps) {
  return (
    <View className='mb-3 w-1/2 pr-3'>
      <View className='flex-row items-center rounded-2xl border border-[#E9E2ED] bg-white px-3 py-3'>
        <View className='h-8 w-8 items-center justify-center rounded-full bg-[#F1EAF5]'>
          <MaterialIcons name={icon} size={16} color='#442F52' />
        </View>

        <View className='ml-2 flex-1'>
          <Text numberOfLines={1} className='text-[10px] text-[#777180]'>
            {label}
          </Text>

          <Text
            numberOfLines={1}
            className='text-[13px] font-semibold text-[#24113D]'
          >
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}
