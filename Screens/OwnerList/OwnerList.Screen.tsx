import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useFocusEffect } from '@react-navigation/native';

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/contexts/AuthContext';

import {
  useGetOwnersQuery,
  useDeleteOwnerMutation,
  useToggleOwnerActiveMutation,
  Owner,
} from '@/store/api/ownerApi';

import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import OwnerListSkeleton from '@/components/SkeletonLoader/Skeleton.OwnerList';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MenuPosition = {
  top: number;
  right: number;
};

type OwnerListScreenProps = {
  showBack?: boolean;
  bottomSafeArea?: boolean;
};

export default function OwnerListScreen({
  showBack = true,
  bottomSafeArea = true,
}: OwnerListScreenProps) {
  const { token, isSuperAdmin, isRoleLoaded } = useAuth();

  const canLoad = isRoleLoaded && isSuperAdmin;

  const {
    data: owners = [],
    isLoading: loading,
    refetch: fetchOwners,
  } = useGetOwnersQuery(undefined, { skip: !token || !canLoad });

  const [deleteOwner] = useDeleteOwnerMutation();
  const [toggleOwnerActive] = useToggleOwnerActiveMutation();

  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    right: 16,
  });

  const menuButtonRefs = useRef<Record<number, View | null>>({});

  const [deleteOwnerTarget, setDeleteOwnerTarget] = useState<Owner | null>(
    null,
  );

  const [deleteLoading, setDeleteLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (token && canLoad) {
        fetchOwners();
      }
    }, [token, canLoad, fetchOwners]),
  );

  useEffect(() => {
    setOpenMenuId(null);
  }, [search]);

  const filteredOwners = owners.filter(owner => {
    const searchText = search.toLowerCase().trim();

    return (
      owner.name.toLowerCase().includes(searchText) ||
      owner.mobile_number.includes(searchText)
    );
  });

  const closeMenu = () => {
    setOpenMenuId(null);
  };

  const handleThreeDotPress = (ownerId: number) => {
    if (openMenuId === ownerId) {
      setOpenMenuId(null);
      return;
    }

    const buttonRef = menuButtonRefs.current[ownerId];

    if (!buttonRef) {
      setOpenMenuId(ownerId);
      return;
    }

    buttonRef.measureInWindow((x, y, width, height) => {
      const top = y + height + 6;

      let right = SCREEN_WIDTH - (x + width);

      if (right < 10) {
        right = 10;
      }

      setMenuPosition({
        top,
        right,
      });

      setOpenMenuId(ownerId);
    });
  };

  const handleCreateOwner = () => {
    closeMenu();
    router.push('/createowner');
  };

  const handleEditOwner = (owner: Owner) => {
    closeMenu();

    router.push(`/createowner?ownerId=${owner.id}`);
  };

  const handleToggleOwner = async (owner: Owner) => {
    closeMenu();

    const newStatus = owner.is_active ? 'inactive' : 'active';

    try {
      const response = await toggleOwnerActive(owner.id).unwrap();

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: owner.is_active ? 'Owner Deactivated' : 'Owner Activated',
          text2: `${owner.name} is now ${newStatus}.`,
          visibilityTime: 2500,
        });
      } else {
        const message = response.message ?? 'Failed to change owner status.';

        Toast.show({
          type: 'error',
          text1: 'Status Update Failed',
          text2: message,
          visibilityTime: 4000,
        });
      }
    } catch (error: unknown) {
      let message = 'Network error while changing owner status.';

      if (error instanceof Error) {
        message = error.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Status Update Failed',
        text2: message,
        visibilityTime: 4000,
      });
    }
  };

  const handleDeleteOwner = (owner: Owner) => {
    closeMenu();

    setDeleteOwnerTarget(owner);
  };

  const confirmDeleteOwner = async () => {
    if (!deleteOwnerTarget) {
      return;
    }

    const ownerName = deleteOwnerTarget.name;
    const ownerId = deleteOwnerTarget.id;

    try {
      setDeleteLoading(true);

      const response = await deleteOwner(ownerId).unwrap();

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Owner Deleted',
          text2: `${ownerName} has been deleted successfully.`,
          visibilityTime: 3000,
        });

        setDeleteOwnerTarget(null);
      } else {
        const message = response.message ?? 'Failed to delete owner.';

        Toast.show({
          type: 'error',
          text1: 'Delete Failed',
          text2: message,
          visibilityTime: 4000,
        });
      }
    } catch (error: unknown) {
      let message = 'Network error while deleting owner.';

      if (error instanceof Error) {
        message = error.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: message,
        visibilityTime: 4000,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const selectedOwner = owners.find(owner => owner.id === openMenuId);

  const renderOwnerItem = ({ item: owner }: { item: Owner }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          if (openMenuId !== null) {
            closeMenu();
          }
        }}
        className='mb-4 rounded-2xl bg-white p-4'
      >
        <View className='flex-row items-center'>
          <View className='h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F1EAF5]'>
            <Text className='text-[18px] font-bold text-[#442F52]'>
              {owner.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View className='ml-3 flex-1'>
            <View className='flex-row items-center'>
              <Text
                numberOfLines={1}
                className='flex-shrink text-[16px] font-bold text-[#442F52]'
              >
                {owner.name}
              </Text>

              <View className='ml-2 flex-row items-center'>
                <View
                  className={`h-2 w-2 rounded-full ${
                    owner.is_active ? 'bg-[#369653]' : 'bg-[#D64545]'
                  }`}
                />

                <Text
                  className={`ml-1 text-[10px] font-semibold ${
                    owner.is_active ? 'text-[#369653]' : 'text-[#D64545]'
                  }`}
                >
                  {owner.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            <View className='mt-1.5 flex-row items-center'>
              <MaterialIcons name='phone' size={14} color='#99929D' />

              <Text className='ml-1.5 text-[12px] text-[#8D8791]'>
                {owner.mobile_number}
              </Text>
            </View>
          </View>

          <View
            ref={ref => {
              menuButtonRefs.current[owner.id] = ref;
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={event => {
                event.stopPropagation();
                handleThreeDotPress(owner.id);
              }}
              className='ml-2 h-10 w-10 items-center justify-center rounded-xl bg-[#F8F4FA]'
            >
              <MaterialIcons name='more-vert' size={22} color='#442F52' />
            </TouchableOpacity>
          </View>
        </View>

        <View className='my-4 h-[1px] bg-[#F1EEF2]' />

        <View className='flex-row items-center'>
          <View className='flex-1'>
            <View className='flex-row items-center'>
              <View className='h-9 w-9 items-center justify-center rounded-xl bg-[#F8F4FA]'>
                <MaterialIcons name='restaurant' size={18} color='#442F52' />
              </View>

              <View className='ml-2'>
                <Text className='text-[10px] text-[#99929D]'>Restaurants</Text>

                <Text className='mt-0.5 text-[13px] font-bold text-[#442F52]'>
                  {owner.max_restaurants}
                </Text>
              </View>
            </View>
          </View>

          <View className='flex-1'>
            <View className='flex-row items-center'>
              <View className='h-9 w-9 items-center justify-center rounded-xl bg-[#F8F4FA]'>
                <MaterialIcons
                  name='people-outline'
                  size={18}
                  color='#442F52'
                />
              </View>

              <View className='ml-2'>
                <Text className='text-[10px] text-[#99929D]'>Staff</Text>

                <Text className='mt-0.5 text-[13px] font-bold text-[#442F52]'>
                  {owner.max_staff}
                </Text>
              </View>
            </View>
          </View>

          <View className='flex-1'>
            <View className='flex-row items-center'>
              <View className='h-9 w-9 items-center justify-center rounded-xl bg-[#F8F4FA]'>
                <MaterialIcons
                  name='table-restaurant'
                  size={18}
                  color='#442F52'
                />
              </View>

              <View className='ml-2'>
                <Text className='text-[10px] text-[#99929D]'>Tables</Text>

                <Text className='mt-0.5 text-[13px] font-bold text-[#442F52]'>
                  {owner.max_tables}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className='mt-3 flex-row items-center'>
          <MaterialIcons name='calendar-today' size={13} color='#99929D' />

          <Text className='ml-1.5 text-[10px] text-[#99929D]'>
            Created {formatDate(owner.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return <OwnerListSkeleton count={5} />;
    }

    return (
      <View className='items-center rounded-2xl bg-white px-6 py-16'>
        <View className='h-16 w-16 items-center justify-center rounded-full bg-[#F1EAF5]'>
          <MaterialIcons name='people-outline' size={32} color='#442F52' />
        </View>

        <Text className='mt-4 text-[15px] font-bold text-[#442F52]'>
          No owners found
        </Text>

        <Text className='mt-1 text-center text-[12px] text-[#99929D]'>
          No owner accounts available
        </Text>

        {search.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSearch('')}
            className='mt-4 rounded-xl bg-[#442F52] px-4 py-2.5'
          >
            <Text className='text-[12px] font-semibold text-white'>
              Clear Search
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      edges={
        bottomSafeArea
          ? ['top', 'left', 'right', 'bottom']
          : ['top', 'left', 'right']
      }
      className='flex-1 bg-[#F8F6F9]'
    >
      <View className='px-5 pb-5 pt-4'>
        <View className='flex-row items-center justify-between'>
          <View className='flex-row items-center'>
            {showBack && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  closeMenu();
                  router.back();
                }}
                className='h-10 w-10 items-center justify-center rounded-xl bg-white'
              >
                <MaterialIcons name='arrow-back' size={21} color='#442F52' />
              </TouchableOpacity>
            )}

            <View className={showBack ? 'ml-3' : ''}>
              <Text className='text-[21px] font-bold text-[#442F52]'>
                Owner List
              </Text>

              <Text className='mt-0.5 text-[12px] text-[#99929D]'>
                Manage restaurant owners
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCreateOwner}
            className='h-10 w-10 items-center justify-center rounded-xl bg-[#442F52]'
          >
            <MaterialIcons name='add' size={22} color='#FFFFFF' />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={loading ? [] : filteredOwners}
        keyExtractor={item => item.id.toString()}
        renderItem={renderOwnerItem}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <View className='mb-5 flex-row items-center justify-between'>
            <View>
              <Text className='text-[16px] font-bold text-[#442F52]'>
                All Owners
              </Text>

              <Text className='mt-0.5 text-[11px] text-[#99929D]'>
                Restaurant owner accounts
              </Text>
            </View>

            <View className='rounded-full bg-[#F1EAF5] px-3 py-1.5'>
              <Text className='text-[11px] font-bold text-[#442F52]'>
                {filteredOwners.length}{' '}
                {filteredOwners.length === 1 ? 'Owner' : 'Owners'}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={renderEmptyComponent}
      />

      <Modal
        transparent
        visible={openMenuId !== null && selectedOwner !== undefined}
        animationType='fade'
        onRequestClose={closeMenu}
      >
        <View className='flex-1 justify-end'>
          <Pressable
            onPress={closeMenu}
            className='absolute inset-0 bg-black/30'
          />

          {selectedOwner && (
            <View className='rounded-t-[28px] bg-white px-5 pb-8 pt-3'>
              <View className='mb-5 items-center'>
                <View className='h-1.5 w-12 rounded-full bg-[#DDD6E2]' />
              </View>

              <View className='mb-4 flex-row items-center'>
                <View className='h-12 w-12 items-center justify-center rounded-full bg-[#F1EAF5]'>
                  <Text className='text-[18px] font-bold text-[#442F52]'>
                    {selectedOwner.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View className='ml-3 flex-1'>
                  <Text className='text-[16px] font-bold text-[#442F52]'>
                    {selectedOwner.name}
                  </Text>

                  <Text className='mt-0.5 text-[12px] text-[#99929D]'>
                    {selectedOwner.mobile_number}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={closeMenu}
                  className='h-9 w-9 items-center justify-center rounded-full bg-[#F8F4FA]'
                >
                  <MaterialIcons name='close' size={20} color='#442F52' />
                </TouchableOpacity>
              </View>

              <View className='mb-2 h-[1px] bg-[#F1EEF2]' />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleEditOwner(selectedOwner)}
                className='flex-row items-center rounded-xl px-2 py-4'
              >
                <View className='h-10 w-10 items-center justify-center rounded-xl bg-[#F1EAF5]'>
                  <MaterialIcons name='edit' size={20} color='#442F52' />
                </View>

                <Text className='ml-3 flex-1 text-[14px] font-semibold text-[#442F52]'>
                  Edit Owner
                </Text>

                <MaterialIcons name='chevron-right' size={21} color='#99929D' />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleToggleOwner(selectedOwner)}
                className='flex-row items-center rounded-xl px-2 py-4'
              >
                <View
                  className={`h-10 w-10 items-center justify-center rounded-xl ${
                    selectedOwner.is_active ? 'bg-[#FFF0F0]' : 'bg-[#EEF8F1]'
                  }`}
                >
                  <MaterialIcons
                    name={selectedOwner.is_active ? 'person-off' : 'person'}
                    size={20}
                    color={selectedOwner.is_active ? '#D64545' : '#369653'}
                  />
                </View>

                <Text
                  className={`ml-3 flex-1 text-[14px] font-semibold ${
                    selectedOwner.is_active
                      ? 'text-[#D64545]'
                      : 'text-[#369653]'
                  }`}
                >
                  {selectedOwner.is_active
                    ? 'Deactivate Owner'
                    : 'Activate Owner'}
                </Text>

                <MaterialIcons name='chevron-right' size={21} color='#99929D' />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleDeleteOwner(selectedOwner)}
                className='mt-1 flex-row items-center rounded-xl px-2 py-4'
              >
                <View className='h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0F0]'>
                  <MaterialIcons
                    name='delete-outline'
                    size={20}
                    color='#D64545'
                  />
                </View>

                <Text className='ml-3 flex-1 text-[14px] font-semibold text-[#D64545]'>
                  Delete Owner
                </Text>

                <MaterialIcons name='chevron-right' size={21} color='#D64545' />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      <ConfirmationModal
        visible={deleteOwnerTarget !== null}
        title='Delete Owner?'
        message={
          deleteOwnerTarget
            ? `Are you sure you want to delete ${deleteOwnerTarget.name}? This action cannot be undone.`
            : ''
        }
        icon='delete-outline'
        confirmText='Delete'
        cancelText='Cancel'
        destructive
        loading={deleteLoading}
        onCancel={() => {
          if (!deleteLoading) {
            setDeleteOwnerTarget(null);
          }
        }}
        onConfirm={confirmDeleteOwner}
      />
    </SafeAreaView>
  );
}
