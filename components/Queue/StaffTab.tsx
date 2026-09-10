import React, { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import {
  useGetStaffQuery,
  useLazyGetStaffDetailsQuery,
  useToggleStaffActiveMutation,
  useDeleteStaffMutation,
  StaffDetails,
  StaffItem,
} from '@/store/api/staffApi';

import { useAuth } from '@/contexts/AuthContext';

import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';

import Toast from 'react-native-toast-message';
import { StaffTabSkeleton } from '../SkeletonLoader/StaffSkeleton';

type StaffTabProps = {
  width: number;
};

const PURPLE = '#4d13af';
const BORDER = '#E8E2EB';
const TEXT_DARK = '#17131C';
const TEXT_GRAY = '#7B747F';

const ROLE_COLORS: Record<string, string> = {
  manager: '#15803D',
  staff: '#1D4ED8',
  chef: '#B45309',
  waiter: '#7C3AED',
};

export default function StaffTab({ width }: StaffTabProps) {
  const { token, isOwner, isRoleLoaded } = useAuth();

  const canLoad = isRoleLoaded && isOwner;

  const {
    data: staff = [],
    isLoading: loading,
    error,
    refetch,
  } = useGetStaffQuery(undefined, { skip: !token || !canLoad });

  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [switchLoadingId, setSwitchLoadingId] = useState<
    string | number | null
  >(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [details, setDetails] = useState<StaffDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [triggerStaffDetails] = useLazyGetStaffDetailsQuery();
  const [toggleStaffActive] = useToggleStaffActiveMutation();
  const [deleteStaff] = useDeleteStaffMutation();

  const errorText = error ? 'Unable to load. Please try again.' : null;

  useFocusEffect(
    useCallback(() => {
      if (token && canLoad) {
        refetch();
      }
    }, [token, canLoad, refetch]),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const toggleExpanded = (id: number | string) => {
    setExpandedId(current => (current === id ? null : id));
  };

  const getInitials = (name?: string): string => {
    if (!name) {
      return '?';
    }

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('');
  };

  const getRoleColor = (role?: string): string => {
    const normalized = (role ?? '').toLowerCase();

    return ROLE_COLORS[normalized] ?? '#6B7280';
  };

  const handleViewDetails = async (staffId: string | number) => {
    if (!token) {
      return;
    }

    try {
      setDetailsLoading(true);
      setDetailsError(null);
      setDetails(null);
      setDetailsVisible(true);

      const detail = await triggerStaffDetails(staffId).unwrap();

      setDetails(detail);
    } catch (error: unknown) {
      let message = 'Network error while fetching staff details.';

      if (error instanceof Error) {
        message = error.message;
      }

      setDetailsError(message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    if (detailsLoading) {
      return;
    }

    setDetailsVisible(false);
    setDetails(null);
    setDetailsError(null);
  };

  const handleToggleStatus = async (member: StaffItem, index: number) => {
    const memberId = member.id ?? index;

    if (!token) {
      return;
    }

    try {
      setSwitchLoadingId(memberId);

      const response = await toggleStaffActive(memberId).unwrap();

      const failed = Boolean(response && response.success === false);

      if (!failed) {
        refetch();

        Toast.show({
          type: 'success',
          text1: response?.message ?? 'Status Updated',
          text2: `${member.name ?? 'Staff'} has been ${
            member.is_active ? 'deactivated' : 'activated'
          } successfully.`,
          visibilityTime: 3000,
        });
      } else {
        const message = response?.message ?? 'Failed to update status.';

        Toast.show({
          type: 'error',
          text1: 'Status Update Failed',
          text2: message,
          visibilityTime: 4000,
        });
      }
    } catch (error: unknown) {
      let message = 'Network error while updating the status.';

      if (error instanceof Error) {
        message = error.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Status Update Failed',
        text2: message,
        visibilityTime: 4000,
      });
    } finally {
      setSwitchLoadingId(null);
    }
  };

  const handleDeletePress = (member: StaffItem) => {
    setDeleteTarget(member);
  };

  const confirmDeleteStaff = async () => {
    if (!deleteTarget || !token) {
      return;
    }

    const staffId = deleteTarget.id;

    try {
      setDeleteLoading(true);

      const response = await deleteStaff(String(staffId)).unwrap();

      const failed = Boolean(response && response.success === false);

      if (!failed) {
        refetch();

        setExpandedId(null);
        setDeleteTarget(null);

        Toast.show({
          type: 'success',
          text1: 'Staff Deleted',
          text2: `${
            deleteTarget.name ?? 'Staff'
          } has been deleted successfully.`,
          visibilityTime: 3000,
        });
      } else {
        const message = response?.message ?? 'Failed to delete staff.';

        Toast.show({
          type: 'error',
          text1: 'Delete Failed',
          text2: message,
          visibilityTime: 4000,
        });
      }
    } catch (error: unknown) {
      let message = 'Network error while deleting staff.';

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

  const renderStaff = ({ item, index }: { item: StaffItem; index: number }) => {
    const staffId = item.id ?? index;

    const isExpanded = expandedId === staffId;

    const isActive = item.is_active !== false;

    const roleColor = getRoleColor(item.role);

    return (
      <View
        className='mb-3 overflow-hidden rounded-2xl border bg-white'
        style={{
          borderColor: BORDER,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => toggleExpanded(staffId)}
          className='px-4 py-4'
        >
          <View className='flex-row items-center'>
            <View className='h-12 w-12 items-center justify-center rounded-full bg-[#F4F0FF]'>
              <Text className='text-base font-bold text-[#4d13af]'>
                {getInitials(item.name)}
              </Text>
            </View>

            <View className='ml-3 flex-1'>
              <Text
                numberOfLines={1}
                className='text-base font-bold text-[#17131C]'
              >
                {item.name ?? 'Unnamed Staff'}
              </Text>

              <View className='mt-1 flex-row items-center'>
                <MaterialCommunityIcons
                  name='cellphone'
                  size={14}
                  color={TEXT_GRAY}
                />

                <Text
                  numberOfLines={1}
                  className='ml-1 flex-1 text-sm text-[#6F6875]'
                >
                  {item.mobile_number ?? 'No mobile number'}
                </Text>
              </View>
            </View>

            <View
              className='mr-2 rounded-full px-2.5 py-1'
              style={{
                backgroundColor: `${roleColor}1A`,
              }}
            >
              <Text
                className='text-xs font-semibold capitalize'
                style={{
                  color: roleColor,
                }}
              >
                {item.role ?? 'Staff'}
              </Text>
            </View>

            <View
              className={`mr-2 h-2.5 w-2.5 rounded-full ${
                isActive ? 'bg-[#16A34A]' : 'bg-[#9CA3AF]'
              }`}
            />

            <View className='h-9 w-9 items-center justify-center rounded-full bg-[#F4F0FF]'>
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={23}
                color={PURPLE}
              />
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View className='border-t border-[#F0EDF2] bg-[#FAF9FB] px-3 py-3'>
            <View className='flex-row items-center'>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleViewDetails(staffId)}
                className='mr-1.5 flex-1 flex-row items-center justify-center rounded-lg bg-white px-2 py-2.5'
              >
                <MaterialCommunityIcons
                  name='eye-outline'
                  size={17}
                  color={PURPLE}
                />

                <Text className='ml-1.5 text-xs font-semibold text-[#17131C]'>
                  View
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/owneraccess',
                    params: {
                      tab: 'staff',
                      mode: 'edit',
                      id: String(item.id ?? ''),
                      staff: JSON.stringify(item),
                    },
                  })
                }
                className='mr-1.5 flex-1 flex-row items-center justify-center rounded-lg bg-white px-2 py-2.5'
              >
                <MaterialCommunityIcons
                  name='pencil-outline'
                  size={17}
                  color={PURPLE}
                />

                <Text className='ml-1.5 text-xs font-semibold text-[#17131C]'>
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                disabled={switchLoadingId !== null}
                onPress={() => handleToggleStatus(item, index)}
                className='mr-1.5 flex-1 flex-row items-center justify-center rounded-lg bg-white px-1.5 py-2.5'
              >
                {switchLoadingId === staffId ? (
                  <ActivityIndicator
                    size='small'
                    color={isActive ? '#C2410C' : '#16A34A'}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={
                      isActive
                        ? 'account-cancel-outline'
                        : 'account-check-outline'
                    }
                    size={17}
                    color={isActive ? '#EA580C' : '#16A34A'}
                  />
                )}

                <Text
                  numberOfLines={1}
                  className={`ml-1 text-[11px] font-semibold ${
                    isActive ? 'text-[#C2410C]' : 'text-[#15803D]'
                  }`}
                >
                  {isActive ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleDeletePress(item)}
                className='flex-1 flex-row items-center justify-center rounded-lg bg-white px-2 py-2.5'
              >
                <MaterialCommunityIcons
                  name='trash-can-outline'
                  size={17}
                  color='#DC2626'
                />

                <Text className='ml-1.5 text-xs font-semibold text-[#DC2626]'>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ width }} className='flex-1 bg-[#FAF9FB]'>
      <View className='px-4 pb-3 pt-4'>
        <View className='flex-row items-center justify-between'>
          <View className='flex-1'>
            <Text className='text-2xl font-bold text-[#17131C]'>Staff</Text>

            <Text className='mt-1 text-sm text-[#7B747F]'>
              Manage your staff members
            </Text>
          </View>

          {!loading && !error && staff.length > 0 ? (
            <View className='ml-3 h-11 min-w-[44px] items-center justify-center rounded-xl bg-[#F4F0FF] px-3'>
              <Text className='text-lg font-bold text-[#4d13af]'>
                {staff.length}
              </Text>

              <Text className='text-[9px] font-medium uppercase tracking-wide text-[#7B63B8]'>
                Total
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {loading ? (
        <StaffTabSkeleton />
      ) : errorText ? (
        <View className='flex-1 items-center justify-center px-8'>
          <View className='h-20 w-20 items-center justify-center rounded-full bg-[#FFF4F4]'>
            <MaterialCommunityIcons
              name='alert-circle-outline'
              size={42}
              color='#D64545'
            />
          </View>

          <Text className='mt-5 text-center text-lg font-bold text-[#17131C]'>
            Unable to load staff
          </Text>

          <Text className='mt-2 text-center text-sm leading-5 text-[#7B747F]'>
            {errorText}
          </Text>

          <TouchableOpacity
            onPress={() => refetch()}
            activeOpacity={0.8}
            className='mt-5 flex-row items-center rounded-xl bg-[#4d13af] px-5 py-3'
          >
            <MaterialCommunityIcons name='refresh' size={18} color='#fff' />

            <Text className='ml-2 text-sm font-bold text-white'>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          className='flex-1'
          data={staff}
          keyExtractor={(item, index) => String(item.id ?? index)}
          renderItem={renderStaff}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 110,
            flexGrow: staff.length === 0 ? 1 : undefined,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={PURPLE}
              colors={[PURPLE]}
            />
          }
          ListEmptyComponent={
            <View className='flex-1 items-center justify-center px-8'>
              <Text className='mt-4 text-2xl font-bold text-[#17131C]'>
                No staff yet
              </Text>

              <Text className='mt-1 text-center text-sm text-[#8B848F]'>
                Add your first staff member to start managing them.
              </Text>
            </View>
          }
        />
      )}

      <ConfirmationModal
        visible={deleteTarget !== null}
        title='Delete Staff?'
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name ?? 'this staff member'}"? This action cannot be undone.`
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
        onConfirm={confirmDeleteStaff}
      />

      <Modal
        visible={detailsVisible}
        transparent
        animationType='fade'
        onRequestClose={closeDetails}
      >
        <View className='flex-1 justify-end'>
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeDetails}
            className='absolute inset-0 bg-black/40'
          />

          <View className='max-h-[88%] overflow-hidden rounded-t-[30px] bg-white'>
            <View className='items-center pt-3'>
              <View className='h-1.5 w-12 rounded-full bg-[#D8D3DC]' />
            </View>

            <View className='flex-row items-center justify-between px-5 pb-4 pt-3'>
              <View className='flex-1'>
                <Text className='text-lg font-bold text-[#17131C]'>
                  Staff Details
                </Text>

                <Text className='mt-0.5 text-xs text-[#8B848F]'>
                  View staff information
                </Text>
              </View>

              <TouchableOpacity
                onPress={closeDetails}
                activeOpacity={0.7}
                hitSlop={10}
                className='h-9 w-9 items-center justify-center rounded-full bg-[#F4F0FF]'
              >
                <MaterialCommunityIcons name='close' size={20} color={PURPLE} />
              </TouchableOpacity>
            </View>

            <View className='h-px bg-[#F0EDF2]' />

            {detailsLoading ? (
              <View className='items-center justify-center py-16'>
                <View className='h-16 w-16 items-center justify-center rounded-2xl bg-[#F4F0FF]'>
                  <ActivityIndicator size='small' color={PURPLE} />
                </View>

                <Text className='mt-4 text-sm text-[#7B747F]'>
                  Loading details...
                </Text>
              </View>
            ) : detailsError ? (
              <View className='items-center justify-center px-8 py-14'>
                <View className='h-16 w-16 items-center justify-center rounded-full bg-[#FFF4F4]'>
                  <MaterialCommunityIcons
                    name='alert-circle-outline'
                    size={34}
                    color='#D64545'
                  />
                </View>

                <Text className='mt-4 text-center text-base font-bold text-[#17131C]'>
                  Unable to load details
                </Text>

                <Text className='mt-2 text-center text-sm leading-5 text-[#7B747F]'>
                  {detailsError}
                </Text>

                <TouchableOpacity
                  onPress={() => details?.id && handleViewDetails(details.id)}
                  activeOpacity={0.8}
                  className='mt-5 flex-row items-center rounded-xl bg-[#4d13af] px-5 py-3'
                >
                  <MaterialCommunityIcons
                    name='refresh'
                    size={18}
                    color='#fff'
                  />

                  <Text className='ml-2 text-sm font-bold text-white'>
                    Try again
                  </Text>
                </TouchableOpacity>
              </View>
            ) : details ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingTop: 18,
                  paddingBottom: 35,
                }}
              >
                <View className='rounded-2xl border border-[#ECE8EF] bg-[#FAF9FB] p-4'>
                  <View className='flex-row items-center'>
                    <View className='h-12 w-12 items-center justify-center rounded-xl bg-[#F4F0FF]'>
                      <Text className='text-base font-bold text-[#4d13af]'>
                        {getInitials(details.name)}
                      </Text>
                    </View>

                    <View className='ml-3 flex-1'>
                      <Text
                        numberOfLines={1}
                        className='text-base font-bold text-[#17131C]'
                      >
                        {details.name ?? 'Unnamed Staff'}
                      </Text>

                      <View className='mt-1 flex-row items-center'>
                        <MaterialCommunityIcons
                          name='cellphone'
                          size={14}
                          color={TEXT_GRAY}
                        />

                        <Text
                          numberOfLines={1}
                          className='ml-1 flex-1 text-xs text-[#7B747F]'
                        >
                          {details.mobile_number ?? 'No mobile number'}
                        </Text>
                      </View>
                    </View>

                    <View
                      className='mr-2 rounded-full px-2.5 py-1'
                      style={{
                        backgroundColor: `${getRoleColor(details.role)}1A`,
                      }}
                    >
                      <Text
                        className='text-xs font-semibold capitalize'
                        style={{
                          color: getRoleColor(details.role),
                        }}
                      >
                        {details.role ?? 'Staff'}
                      </Text>
                    </View>

                    <View
                      className={`flex-row items-center rounded-full px-2.5 py-1.5 ${
                        details.is_active !== false
                          ? 'bg-[#ECFDF3]'
                          : 'bg-[#F3F4F6]'
                      }`}
                    >
                      <View
                        className={`mr-1.5 h-2 w-2 rounded-full ${
                          details.is_active !== false
                            ? 'bg-[#16A34A]'
                            : 'bg-[#9CA3AF]'
                        }`}
                      />

                      <Text
                        className={`text-xs font-semibold ${
                          details.is_active !== false
                            ? 'text-[#15803D]'
                            : 'text-[#6B7280]'
                        }`}
                      >
                        {details.is_active !== false ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className='mb-3 mt-6 flex-row items-center'>
                  <View className='mr-2 h-6 w-1 rounded-full bg-[#4d13af]' />

                  <Text className='text-base font-bold text-[#17131C]'>
                    Staff Information
                  </Text>
                </View>

                <View className='overflow-hidden rounded-2xl border border-[#ECE8EF] bg-white p-4'>
                  <DetailRow
                    icon='account-outline'
                    label='Name'
                    value={details.name}
                  />

                  <DetailRow
                    icon='cellphone'
                    label='Mobile Number'
                    value={details.mobile_number}
                  />

                  <DetailRow
                    icon='briefcase-outline'
                    label='Role'
                    value={details.role}
                  />
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

type DetailRowProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value?: string | number;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View className='mb-4 flex-row items-start'>
      <View className='mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-lg bg-[#F4F0FF]'>
        <MaterialCommunityIcons name={icon} size={16} color={PURPLE} />
      </View>

      <View className='flex-1'>
        <Text className='text-xs font-medium uppercase tracking-wide text-[#9B949F]'>
          {label}
        </Text>

        <Text className='mt-0.5 text-sm font-semibold text-[#17131C]'>
          {value ?? '—'}
        </Text>
      </View>
    </View>
  );
}
