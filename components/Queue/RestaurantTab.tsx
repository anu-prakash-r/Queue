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
import { ApiError } from '@/services/api';
import {
  deleteRestaurant,
  getRestaurantDetails,
  getRestaurants,
  RestaurantDetails,
  RestaurantItem,
  switchRestaurantStatus,
} from '@/services/restaurantApi';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import Toast from 'react-native-toast-message';

type RestaurantTabProps = {
  width: number;
};

const PURPLE = '#4d13af';
const BORDER = '#E8E2EB';
const TEXT_GRAY = '#6F6875';

export default function RestaurantTab({ width }: RestaurantTabProps) {
  const { token } = useAuth();

  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [expandedId, setExpandedId] = useState<number | string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<RestaurantItem | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [switchLoadingId, setSwitchLoadingId] = useState<
    string | number | null
  >(null);

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [details, setDetails] = useState<RestaurantDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    try {
      setError(null);

      if (!token) {
        setLoading(false);
        return;
      }

      const items = await getRestaurants(token);

      setRestaurants(Array.isArray(items) ? items : []);
    } catch (err: unknown) {
      let msg = 'Network error while fetching restaurants.';

      if (err instanceof ApiError) {
        msg = err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchRestaurants();
    }, [fetchRestaurants]),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRestaurants();
  }, [fetchRestaurants]);

  const toggleExpanded = (id: number | string) => {
    setExpandedId(current => (current === id ? null : id));
  };

  const handleDeletePress = (restaurant: RestaurantItem) => {
    setDeleteTarget(restaurant);
  };

  const handleToggleStatus = async (
    restaurant: RestaurantItem,
    index: number,
  ) => {
    const restaurantId = restaurant.id ?? index;

    if (!token) {
      return;
    }

    try {
      setSwitchLoadingId(restaurantId);

      const response = await switchRestaurantStatus(restaurantId, token);

      const failed = Boolean(response && response.success === false);

      if (!failed) {
        setRestaurants(prev =>
          Array.isArray(prev)
            ? prev.map(item =>
                item.id === restaurantId
                  ? { ...item, is_active: !item.is_active }
                  : item,
              )
            : [],
        );

        Toast.show({
          type: 'success',
          text1: response?.message ?? 'Status Updated',
          text2: `${restaurant.name ?? 'Restaurant'} has been ${
            restaurant.is_active ? 'deactivated' : 'activated'
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

      if (error instanceof ApiError) {
        message = error.message;
      } else if (error instanceof Error) {
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

  const handleViewDetails = async (restaurantId: string | number) => {
    if (!token) {
      return;
    }

    try {
      setDetailsLoading(true);
      setDetailsError(null);
      setDetails(null);
      setDetailsVisible(true);

      const detail = await getRestaurantDetails(restaurantId, token);

      setDetails(detail);
    } catch (error: unknown) {
      let message = 'Network error while fetching restaurant details.';

      if (error instanceof ApiError) {
        message = error.message;
      } else if (error instanceof Error) {
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

  const confirmDeleteRestaurant = async () => {
    if (!deleteTarget || !token) {
      return;
    }

    const restaurantId = deleteTarget.id;

    try {
      setDeleteLoading(true);

      const response = await deleteRestaurant(String(restaurantId), token);

      const failed = Boolean(response && response.success === false);

      if (!failed) {
        setRestaurants(prev =>
          Array.isArray(prev)
            ? prev.filter(item => item.id !== restaurantId)
            : [],
        );

        setExpandedId(null);

        setDeleteTarget(null);

        Toast.show({
          type: 'success',
          text1: 'Restaurant Deleted',
          text2: `${deleteTarget.name ?? 'Restaurant'} has been deleted successfully.`,
          visibilityTime: 3000,
        });
      } else {
        const message = response?.message ?? 'Failed to delete restaurant.';

        Toast.show({
          type: 'error',
          text1: 'Delete Failed',
          text2: message,
          visibilityTime: 4000,
        });
      }
    } catch (error: unknown) {
      let message = 'Network error while deleting the restaurant.';

      if (error instanceof ApiError) {
        message = error.message;
      } else if (error instanceof Error) {
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

  const renderRestaurant = ({
    item,
    index,
  }: {
    item: RestaurantItem;
    index: number;
  }) => {
    const restaurantId = item.id ?? index;
    const isExpanded = expandedId === restaurantId;
    const isActive = item.is_active !== false;

    return (
      <View
        className='mb-3 overflow-hidden rounded-2xl border bg-white'
        style={{
          borderColor: BORDER,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => toggleExpanded(restaurantId)}
          className='px-4 py-4'
        >
          <View className='flex-row items-center'>
            <View className='h-12 w-12 items-center justify-center rounded-xl bg-[#F4F0FF]'>
              <MaterialCommunityIcons
                name='store-outline'
                size={24}
                color={PURPLE}
              />
            </View>

            <View className='ml-3 flex-1'>
              <Text
                numberOfLines={1}
                className='text-base font-bold text-[#17131C]'
              >
                {item.name ?? 'Unnamed Restaurant'}
              </Text>

              <View className='mt-1 flex-row items-center'>
                <MaterialCommunityIcons
                  name='map-marker-outline'
                  size={14}
                  color={TEXT_GRAY}
                />

                <Text numberOfLines={1} className='ml-1 text-sm text-[#6F6875]'>
                  {item.city ?? 'Location not available'}
                </Text>
              </View>
            </View>

            <View
              className={`mr-2 flex-row items-center rounded-full px-2.5 py-1.5 ${
                isActive ? 'bg-[#ECFDF3]' : 'bg-[#F3F4F6]'
              }`}
            >
              <View
                className={`mr-1.5 h-2 w-2 rounded-full ${
                  isActive ? 'bg-[#16A34A]' : 'bg-[#9CA3AF]'
                }`}
              />

              <Text
                className={`text-xs font-semibold ${
                  isActive ? 'text-[#15803D]' : 'text-[#6B7280]'
                }`}
              >
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>

            <MaterialCommunityIcons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={TEXT_GRAY}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View className='border-t border-[#F0EDF2] bg-[#FAF9FB] px-3 py-2.5'>
            <View className='flex-row items-center'>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleViewDetails(restaurantId)}
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
                      tab: 'restaurant',
                      mode: 'edit',
                      id: String(item.id ?? ''),
                      restaurant: JSON.stringify(item),
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
                {switchLoadingId === restaurantId ? (
                  <ActivityIndicator size='small' color='#C2410C' />
                ) : (
                  <MaterialCommunityIcons
                    name={
                      isActive ? 'store-off-outline' : 'store-check-outline'
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
            <Text className='text-2xl font-bold text-[#17131C]'>
              Restaurants
            </Text>

            <Text className='mt-1 text-sm text-[#7B747F]'>
              Manage your restaurants
            </Text>
          </View>

          {!loading && !error && (
            <View className='ml-3 h-10 min-w-[42px] items-center justify-center rounded-xl bg-[#F4F0FF] px-3'>
              <Text className='text-base font-bold text-[#4d13af]'>
                {restaurants.length}
              </Text>

              <Text className='text-[8px] font-medium uppercase tracking-wide text-[#7B63B8]'>
                Total
              </Text>
            </View>
          )}
        </View>
      </View>
      {loading ? (
        <View className='flex-1 items-center justify-center'>
          <View className='h-14 w-14 items-center justify-center rounded-2xl bg-[#F4F0FF]'>
            <ActivityIndicator size='small' color={PURPLE} />
          </View>

          <Text className='mt-3 text-sm text-[#7B747F]'>
            Loading restaurants...
          </Text>
        </View>
      ) : error ? (
        <View className='flex-1 items-center justify-center px-8'>
          <View className='h-16 w-16 items-center justify-center rounded-full bg-[#FFF4F4]'>
            <MaterialCommunityIcons
              name='alert-circle-outline'
              size={36}
              color='#D64545'
            />
          </View>

          <Text className='mt-4 text-center text-base font-bold text-[#17131C]'>
            Unable to load restaurants
          </Text>

          <Text className='mt-2 text-center text-sm leading-5 text-[#7B747F]'>
            {error}
          </Text>

          <TouchableOpacity
            onPress={fetchRestaurants}
            activeOpacity={0.8}
            className='mt-4 flex-row items-center rounded-xl bg-[#4d13af] px-5 py-3'
          >
            <MaterialCommunityIcons name='refresh' size={17} color='#fff' />

            <Text className='ml-2 text-sm font-bold text-white'>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          className='flex-1'
          data={restaurants}
          keyExtractor={(item, index) => String(item.id ?? index)}
          renderItem={renderRestaurant}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 100,
            flexGrow: restaurants.length === 0 ? 1 : undefined,
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
              <View className='h-20 w-20 items-center justify-center rounded-2xl bg-[#F4F0FF]'>
                <MaterialCommunityIcons
                  name='store-outline'
                  size={40}
                  color={PURPLE}
                />
              </View>

              <Text className='mt-4 text-lg font-bold text-[#17131C]'>
                No restaurants yet
              </Text>

              <Text className='mt-1 text-center text-sm text-[#8B848F]'>
                Add your first restaurant to start managing it.
              </Text>
            </View>
          }
        />
      )}
      <ConfirmationModal
        visible={deleteTarget !== null}
        title='Delete Restaurant?'
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name ?? 'this restaurant'}"? This action cannot be undone.`
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
        onConfirm={confirmDeleteRestaurant}
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
                  Restaurant Details
                </Text>

                <Text className='mt-0.5 text-xs text-[#8B848F]'>
                  View restaurant information
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

                <Text className='mt-4 text-sm font-medium text-[#17131C]'>
                  Loading restaurant...
                </Text>

                <Text className='mt-1 text-xs text-[#8B848F]'>
                  Please wait a moment
                </Text>
              </View>
            ) : detailsError ? (
              /* Error */
              <View className='items-center justify-center px-8 py-14'>
                <View className='h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F2]'>
                  <MaterialCommunityIcons
                    name='alert-circle-outline'
                    size={34}
                    color='#DC2626'
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
                    color='#FFFFFF'
                  />

                  <Text className='ml-2 text-sm font-bold text-white'>
                    Try Again
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
                      <MaterialCommunityIcons
                        name='storefront-outline'
                        size={25}
                        color={PURPLE}
                      />
                    </View>

                    <View className='ml-3 flex-1'>
                      <Text
                        numberOfLines={1}
                        className='text-base font-bold text-[#17131C]'
                      >
                        {details.name ?? 'Unnamed Restaurant'}
                      </Text>

                      <View className='mt-1 flex-row items-center'>
                        <MaterialCommunityIcons
                          name='map-marker-outline'
                          size={14}
                          color='#8B848F'
                        />

                        <Text
                          numberOfLines={1}
                          className='ml-1 flex-1 text-xs text-[#7B747F]'
                        >
                          {details.city ?? 'Location not available'}
                        </Text>
                      </View>
                    </View>

                    <View
                      className={`ml-2 flex-row items-center rounded-full px-2.5 py-1.5 ${
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
                    Restaurant Information
                  </Text>
                </View>

                <View className='overflow-hidden rounded-2xl border border-[#ECE8EF] bg-white'>
                  <View className='flex-row px-4 py-4'>
                    <View className='h-10 w-10 items-center justify-center rounded-xl bg-[#F4F0FF]'>
                      <MaterialCommunityIcons
                        name='map-marker-outline'
                        size={20}
                        color={PURPLE}
                      />
                    </View>

                    <View className='ml-3 flex-1'>
                      <Text className='text-xs font-medium text-[#8B848F]'>
                        Address
                      </Text>

                      <Text className='mt-1 text-sm leading-5 text-[#17131C]'>
                        {details.address || 'Not available'}
                      </Text>
                    </View>
                  </View>

                  <View className='ml-[68px] h-px bg-[#F0EDF2]' />

                  <View className='flex-row px-4 py-4'>
                    <View className='h-10 w-10 items-center justify-center rounded-xl bg-[#F4F0FF]'>
                      <MaterialCommunityIcons
                        name='city-variant-outline'
                        size={20}
                        color={PURPLE}
                      />
                    </View>

                    <View className='ml-3 flex-1'>
                      <Text className='text-xs font-medium text-[#8B848F]'>
                        City
                      </Text>

                      <Text className='mt-1 text-sm font-medium text-[#17131C]'>
                        {details.city || 'Not available'}
                      </Text>
                    </View>
                  </View>

                  <View className='ml-[68px] h-px bg-[#F0EDF2]' />

                  <View className='flex-row px-4 py-4'>
                    <View className='h-10 w-10 items-center justify-center rounded-xl bg-[#F4F0FF]'>
                      <MaterialCommunityIcons
                        name='clock-outline'
                        size={20}
                        color={PURPLE}
                      />
                    </View>

                    <View className='ml-3 flex-1'>
                      <Text className='text-xs font-medium text-[#8B848F]'>
                        Opening Time
                      </Text>

                      <Text className='mt-1 text-sm font-medium text-[#17131C]'>
                        {details.opening_time || 'Not available'}
                      </Text>
                    </View>
                  </View>

                  <View className='ml-[68px] h-px bg-[#F0EDF2]' />

                  <View className='flex-row px-4 py-4'>
                    <View className='h-10 w-10 items-center justify-center rounded-xl bg-[#F4F0FF]'>
                      <MaterialCommunityIcons
                        name='clock-check-outline'
                        size={20}
                        color={PURPLE}
                      />
                    </View>

                    <View className='ml-3 flex-1'>
                      <Text className='text-xs font-medium text-[#8B848F]'>
                        Closing Time
                      </Text>

                      <Text className='mt-1 text-sm font-medium text-[#17131C]'>
                        {details.closing_time || 'Not available'}
                      </Text>
                    </View>
                  </View>

                  {typeof details.email === 'string' && details.email.trim() ? (
                    <>
                      <View className='ml-[68px] h-px bg-[#F0EDF2]' />

                      <View className='flex-row px-4 py-4'>
                        <View className='h-10 w-10 items-center justify-center rounded-xl bg-[#F4F0FF]'>
                          <MaterialCommunityIcons
                            name='email-outline'
                            size={20}
                            color={PURPLE}
                          />
                        </View>

                        <View className='ml-3 flex-1'>
                          <Text className='text-xs font-medium text-[#8B848F]'>
                            Email
                          </Text>

                          <Text className='mt-1 text-sm text-[#17131C]'>
                            {details.email}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : null}

                  {typeof details.phone === 'string' && details.phone.trim() ? (
                    <>
                      <View className='ml-[68px] h-px bg-[#F0EDF2]' />

                      <View className='flex-row px-4 py-4'>
                        <View className='h-10 w-10 items-center justify-center rounded-xl bg-[#F4F0FF]'>
                          <MaterialCommunityIcons
                            name='phone-outline'
                            size={20}
                            color={PURPLE}
                          />
                        </View>

                        <View className='ml-3 flex-1'>
                          <Text className='text-xs font-medium text-[#8B848F]'>
                            Phone
                          </Text>

                          <Text className='mt-1 text-sm text-[#17131C]'>
                            {details.phone}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : null}
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
    <View className='mb-4 flex-row items-start last:mb-0'>
      <View className='mt-0.5 mr-3 h-8 w-8 items-center justify-center rounded-lg bg-white'>
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
