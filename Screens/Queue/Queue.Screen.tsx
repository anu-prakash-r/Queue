import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import AssignTableModal from '@/components/Queue/AssignTableModal';
import EditQueueModal from '@/components/Queue/EditQueueModal';
import QueueCard from '@/components/Queue/QueueCard';
import QueueDetailModal from '@/components/Queue/QueueDetailModal';
import type { QueueItem } from '@/components/Queue/types';
import { formatTime, formatWaitingTime } from '@/components/Queue/utils';
import { useAuth } from '@/contexts/AuthContext';

import { makeWhatsAppCall, openWhatsAppChat } from '@/services/contact';
import {
  useGetQueuesQuery,
  useLazyGetQueueQuery,
  useUpdateQueueMutation,
  useCancelQueueMutation,
  useSeatQueueMutation,
  QueueItem as QueueApiItem,
} from '@/store/api/queueApi';
import { useGetTablesQuery, TableItem } from '@/store/api/tableApi';

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
    mobileNumber: item.mobile_number ?? item.customer?.mobile_number,
  };
}

export default function QueueScreen() {
  const { token, isSuperAdmin, isRoleLoaded } = useAuth();

  const canLoad = isRoleLoaded && !isSuperAdmin;

  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  const {
    data: queueItems = [],
    isLoading: loading,
    error: queueError,
    refetch: refetchQueues,
  } = useGetQueuesQuery('waiting', { skip: !token || !canLoad });

  const [triggerGetQueue, { isFetching: isQueueDetailFetching }] =
    useLazyGetQueueQuery();

  const [updateQueue] = useUpdateQueueMutation();
  const [cancelQueue] = useCancelQueueMutation();
  const [seatQueue] = useSeatQueueMutation();

  const { data: tablesResult } = useGetTablesQuery(undefined, {
    skip: !token || !canLoad,
  });

  const items: QueueItem[] = useMemo(() => {
    const sortKey = (item: QueueApiItem, index: number): number => {
      const createdAt = Date.parse(item.created_at ?? '');

      if (Number.isFinite(createdAt)) {
        return createdAt;
      }

      if (typeof item.position === 'number') {
        return item.position;
      }

      const token = Number(item.token_number ?? item.queue_number);

      if (Number.isFinite(token)) {
        return token;
      }

      return index;
    };

    return [...queueItems]
      .map((item, index) => ({ item, index }))
      .sort((a, b) => sortKey(a.item, a.index) - sortKey(b.item, b.index))
      .map(entry => mapQueueItem(entry.item));
  }, [queueItems]);

  const error = queueError ? 'Could not load the queue.' : '';

  useFocusEffect(
    useCallback(() => {
      if (token && canLoad) {
        refetchQueues();
      }
    }, [token, canLoad, refetchQueues]),
  );

  const handleView = (item: QueueItem) => {
    setOpenMenuId(null);

    setDetailItem(item);

    setDetailVisible(true);

    setDetailError('');

    setDetailData(null);

    if (!token || !canLoad) {
      setDetailError(canLoad ? 'No auth token.' : 'Access denied.');

      return;
    }

    triggerGetQueue(item.id)
      .unwrap()
      .then((detail: QueueApiItem | null) => {
        setDetailData(detail);
      })
      .catch(() => {
        setDetailError('Could not load queue details.');
      });
  };

  const [detailItem, setDetailItem] = useState<QueueItem | null>(null);

  const [detailVisible, setDetailVisible] = useState(false);

  const [detailError, setDetailError] = useState('');

  const [detailData, setDetailData] = useState<QueueApiItem | null>(null);

  const detailLoading = isQueueDetailFetching;

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
      const response = await updateQueue({
        queueId: pendingEdit.id,
        payload: { party_size: editPartySize },
      }).unwrap();

      if (response.success) {
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
  };

  const [assignItem, setAssignItem] = useState<QueueItem | null>(null);

  const [assignVisible, setAssignVisible] = useState(false);

  const [assignError, setAssignError] = useState('');

  const [tableNumber, setTableNumber] = useState('');

  const [assignSubmitting, setAssignSubmitting] = useState(false);

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
  };

  const handleTableSelect = (table: TableItem) => {
    setTableNumber(String(table.table_number));

    if (assignError) {
      setAssignError('');
    }
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

    const matchedTable = (tablesResult?.tables ?? []).find(
      table => String(table.table_number) === trimmedTableNumber,
    );

    if (!matchedTable) {
      setAssignError(
        (tablesResult?.tables ?? []).length === 0
          ? 'Could not load tables. Please try again.'
          : 'Table not found. Please enter a valid table number.',
      );

      return;
    }

    setAssignSubmitting(true);

    setAssignError('');

    try {
      const response = await seatQueue({
        queueId: assignItem.id,
        payload: { table_id: String(matchedTable.id) },
      }).unwrap();

      if (response.success) {
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
      await cancelQueue(pendingRemove.id).unwrap();

      setPendingRemove(null);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Could not remove the customer from the queue.',
        visibilityTime: 4000,
      });
    } finally {
      setRemovingId(null);
    }
  };

  const cancelRemove = () => {
    setPendingRemove(null);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className='flex-1 bg-white'>
      <StatusBar style='dark' />
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
              onPress={() => refetchQueues()}
            >
              <Text className='text-[13px] font-bold text-white'>RETRY</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          /* Empty Queue */
          <View className='items-center justify-center  px-10 py-16'>
            <View className='h-16 w-16 items-center justify-center rounded-2xl bg-[#F4F0FF]'>
              <MaterialIcons name='queue' size={34} color='#4d13af' />
            </View>

            <Text className='mt-4 text-center text-base font-bold text-[#17131C]'>
              Queue is empty
            </Text>

            <Text className='mt-1.5 text-center text-sm text-[#7B747F]'>
              No customers are waiting right now.
            </Text>
          </View>
        ) : (
          /* Queue List */
          <View className='px-5 pt-5'>
            {items.map(item => {
              const menuIsOpen = openMenuId === item.id;

              return (
                <QueueCard
                  key={String(item.id)}
                  item={item}
                  menuIsOpen={menuIsOpen}
                  onToggleMenu={() => {
                    setOpenMenuId(menuIsOpen ? null : item.id);
                  }}
                  onView={handleView}
                  onEdit={handleEdit}
                  onAssignTable={handleAssignTable}
                  onRemove={handleRemovePress}
                  onCall={item => {
                    if (item.mobileNumber) {
                      makeWhatsAppCall(item.mobileNumber);
                    }
                  }}
                  onWhatsApp={item => {
                    if (item.mobileNumber) {
                      openWhatsAppChat(item.mobileNumber);
                    }
                  }}
                />
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

      <EditQueueModal
        visible={!!pendingEdit}
        loading={editLoading}
        item={pendingEdit}
        partySize={editPartySize}
        onDecrease={decreaseEditPartySize}
        onIncrease={increaseEditPartySize}
        onConfirm={confirmEdit}
        onCancel={cancelEdit}
      />

      <QueueDetailModal
        visible={detailVisible}
        loading={detailLoading}
        error={detailError}
        item={detailItem}
        data={detailData}
        onRetry={() => {
          if (detailItem) {
            handleView(detailItem);
          }
        }}
        onClose={handleCloseDetail}
      />

      <AssignTableModal
        visible={assignVisible}
        item={assignItem}
        tables={tablesResult?.tables ?? []}
        tableNumber={tableNumber}
        error={assignError}
        submitting={assignSubmitting}
        keyboardHeight={keyboardHeight}
        onSelectTable={handleTableSelect}
        onConfirm={confirmAssign}
        onCancel={handleCloseAssign}
      />
    </SafeAreaView>
  );
}
