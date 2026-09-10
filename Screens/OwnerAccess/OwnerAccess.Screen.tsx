import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/contexts/AuthContext';
import { createRestaurant, updateRestaurant } from '@/services/restaurantApi';
import {
  createCustomer,
  getCustomers,
  CustomerItem,
  updateCustomer,
} from '@/services/customerApi';
import { createStaff, updateStaff } from '@/services/staffApi';

const TABS = ['Restaurant', 'Staff', 'Customer'] as const;

type TabType = (typeof TABS)[number];

const formatTimeInput = (value: string): string => {
  if (value === '') {
    return '';
  }

  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (!digits) {
    return '';
  }

  if (digits.length <= 2) {
    return digits;
  }

  const hourDigits = digits.slice(0, 2);
  const minuteDigits = digits.slice(2, 4);

  let hour = Number(hourDigits);
  let minute = Number(minuteDigits);

  if (hour > 23) {
    hour = 23;
  }

  if (minute > 59) {
    minute = 59;
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const isValidTime = (value: string): boolean => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
};

export default function OwnerAccessScreen() {
  const { token } = useAuth();

  const { tab, mode, id, restaurant, staff, customer } = useLocalSearchParams<{
    tab?: string;
    mode?: string;
    id?: string;
    restaurant?: string;
    staff?: string;
    customer?: string;
  }>();

  const isEditMode = mode === 'edit' && Boolean(restaurant);

  const isStaffEditMode = mode === 'edit' && Boolean(staff);

  const isCustomerEditMode = mode === 'edit' && Boolean(customer);

  const restaurantScrollRef = useRef<ScrollView>(null);
  const staffScrollRef = useRef<ScrollView>(null);
  const customerScrollRef = useRef<ScrollView>(null);

  const getInitialTab = (): TabType => {
    switch (tab?.toLowerCase()) {
      case 'staff':
        return 'Staff';

      case 'customer':
        return 'Customer';

      default:
        return 'Restaurant';
    }
  };

  const [activeTab] = useState<TabType>(getInitialTab());

  const [submitting, setSubmitting] = useState(false);

  const [restaurantName, setRestaurantName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');

  const [staffName, setStaffName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerMobileNumber, setCustomerMobileNumber] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditMode || !restaurant) {
      return;
    }

    try {
      const parsed = JSON.parse(
        Array.isArray(restaurant) ? restaurant[0] : restaurant,
      ) as Record<string, unknown>;

      if (typeof parsed.name === 'string') {
        setRestaurantName(parsed.name);
      }

      if (typeof parsed.city === 'string') {
        setCity(parsed.city);
      }

      if (typeof parsed.address === 'string') {
        setAddress(parsed.address);
      }

      if (typeof parsed.opening_time === 'string') {
        setOpeningTime(parsed.opening_time);
      }

      if (typeof parsed.closing_time === 'string') {
        setClosingTime(parsed.closing_time);
      }
    } catch {}
  }, [isEditMode, restaurant]);

  useEffect(() => {
    if (!isStaffEditMode || !staff) {
      return;
    }

    try {
      const parsed = JSON.parse(
        Array.isArray(staff) ? staff[0] : staff,
      ) as Record<string, unknown>;

      if (typeof parsed.name === 'string') {
        setStaffName(parsed.name);
      }

      if (typeof parsed.mobile_number === 'string') {
        setMobileNumber(parsed.mobile_number);
      }

      if (typeof parsed.role === 'string') {
        setRole(parsed.role);
      }
    } catch {}
  }, [isStaffEditMode, staff]);

  useEffect(() => {
    if (!isCustomerEditMode || !customer) {
      return;
    }

    try {
      const parsed = JSON.parse(
        Array.isArray(customer) ? customer[0] : customer,
      ) as Record<string, unknown>;

      if (typeof parsed.name === 'string') {
        setCustomerName(parsed.name);
      }

      if (typeof parsed.mobile_number === 'string') {
        setCustomerMobileNumber(parsed.mobile_number);
      }

      if (typeof parsed.email === 'string') {
        setCustomerEmail(parsed.email);
      }

      if (typeof parsed.notes === 'string') {
        setCustomerNotes(parsed.notes);
      }
    } catch {}
  }, [isCustomerEditMode, customer]);

  const showToast = (
    type: 'success' | 'error',
    text1: string,
    text2?: string,
  ) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 50,
    });
  };

  const resolveError = (
    message: string | undefined,
    errors: Record<string, string[]> | undefined,
    fallback: string,
  ) => {
    if (errors && typeof errors === 'object') {
      const firstError = Object.values(errors)
        .flat()
        .find(error => typeof error === 'string');

      if (firstError) {
        return firstError;
      }
    }

    return message || fallback;
  };

  const handleOpeningTimeChange = (value: string) => {
    setOpeningTime(formatTimeInput(value));
  };

  const handleClosingTimeChange = (value: string) => {
    setClosingTime(formatTimeInput(value));
  };

  const scrollRestaurantToBottom = () => {
    setTimeout(() => {
      restaurantScrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 150);
  };

  const scrollStaffToBottom = () => {
    setTimeout(() => {
      staffScrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 150);
  };

  const scrollCustomerToBottom = () => {
    setTimeout(() => {
      customerScrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 150);
  };

  const handleCreateRestaurant = async () => {
    if (submitting) {
      return;
    }

    Keyboard.dismiss();

    if (!token) {
      showToast('error', 'Authentication required', 'Please login again.');
      return;
    }

    const payload = {
      name: restaurantName.trim(),
      city: city.trim(),
      address: address.trim(),
      opening_time: openingTime,
      closing_time: closingTime,
    };

    if (!payload.name || !payload.city || !payload.address) {
      showToast('error', 'Missing details', 'Please fill all required fields.');
      return;
    }

    if (!isValidTime(payload.opening_time)) {
      showToast(
        'error',
        'Invalid opening time',
        'Enter time in HH:mm format, for example 10:00.',
      );
      return;
    }

    if (!isValidTime(payload.closing_time)) {
      showToast(
        'error',
        'Invalid closing time',
        'Enter time in HH:mm format, for example 23:00.',
      );
      return;
    }

    try {
      setSubmitting(true);

      if (isEditMode && id) {
        const response = await updateRestaurant(id, token, payload);

        const failed = Boolean(response && response.success === false);

        if (!failed) {
          showToast(
            'success',
            'Restaurant Updated',
            `${payload.name} has been updated.`,
          );

          router.back();
        } else {
          showToast(
            'error',
            'Update Failed',
            resolveError(
              response?.message,
              response?.errors,
              'Failed to update restaurant.',
            ),
          );
        }

        return;
      }

      const response = await createRestaurant(token, payload);

      const failed = Boolean(response && response.success === false);

      if (!failed) {
        showToast(
          'success',
          'Restaurant Created',
          `${payload.name} has been added.`,
        );

        setRestaurantName('');
        setCity('');
        setAddress('');
        setOpeningTime('10:00');
        setClosingTime('23:00');
      } else {
        showToast(
          'error',
          'Creation Failed',
          resolveError(
            response?.message,
            response?.errors,
            'Failed to create restaurant.',
          ),
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error.';

      showToast('error', 'Creation Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStaff = async () => {
    if (submitting) {
      return;
    }

    Keyboard.dismiss();

    if (!token) {
      showToast('error', 'Authentication required', 'Please login again.');
      return;
    }

    const payload = {
      name: staffName.trim(),
      mobile_number: mobileNumber.trim(),
      role: role.trim(),
    };

    if (!payload.name || payload.mobile_number.length !== 10 || !payload.role) {
      showToast(
        'error',
        'Missing details',
        'Enter a valid name, 10-digit mobile number and role.',
      );
      return;
    }

    try {
      setSubmitting(true);

      if (isStaffEditMode && id) {
        const response = await updateStaff(id, token, payload);

        const failed = Boolean(response && response.success === false);

        if (!failed) {
          showToast(
            'success',
            'Staff Updated',
            `${payload.name} has been updated.`,
          );

          router.back();
        } else {
          showToast(
            'error',
            'Update Failed',
            resolveError(
              response?.message,
              response?.errors,
              'Failed to update staff.',
            ),
          );
        }

        return;
      }

      const response = await createStaff(token, payload);

      const failed = Boolean(response && response.success === false);

      if (!failed) {
        showToast(
          'success',
          'Staff Created',
          `${payload.name} has been added.`,
        );

        setStaffName('');
        setMobileNumber('');
        setRole('');
      } else {
        showToast(
          'error',
          'Creation Failed',
          resolveError(
            response?.message,
            response?.errors,
            'Failed to create staff.',
          ),
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error.';

      showToast('error', 'Creation Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (submitting) {
      return;
    }

    Keyboard.dismiss();

    if (!token) {
      showToast('error', 'Authentication required', 'Please login again.');
      return;
    }

    const payload = {
      name: customerName.trim(),
      mobile_number: customerMobileNumber.trim(),
      email: customerEmail.trim(),
      notes: customerNotes.trim(),
    };

    if (!payload.name || payload.mobile_number.length !== 10) {
      showToast(
        'error',
        'Missing details',
        'Enter a valid name and 10-digit mobile number.',
      );
      return;
    }

    try {
      setSubmitting(true);

      if (isCustomerEditMode && id) {
        const response = await updateCustomer(id, token, payload);

        const failed = Boolean(response && response.success === false);

        if (!failed) {
          showToast(
            'success',
            'Customer Updated',
            `${payload.name} has been updated.`,
          );

          router.back();
        } else {
          showToast(
            'error',
            'Update Failed',
            resolveError(
              response?.message,
              response?.errors,
              'Failed to update customer.',
            ),
          );
        }

        return;
      }

      const response = await createCustomer(token, payload);

      const failed = Boolean(response && response.success === false);

      if (!failed) {
        showToast(
          'success',
          'Customer Created',
          `${payload.name} has been added.`,
        );

        setCustomerName('');
        setCustomerMobileNumber('');
        setCustomerEmail('');
        setCustomerNotes('');

        fetchCustomers();
      } else {
        showToast(
          'error',
          'Creation Failed',
          resolveError(
            response?.message,
            response?.errors,
            'Failed to create customer.',
          ),
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error.';

      showToast('error', 'Creation Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchCustomers = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setCustomersLoading(true);
      setCustomersError(null);

      const result = await getCustomers(token);

      setCustomers(Array.isArray(result) ? result : []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error.';

      setCustomersError(message);
    } finally {
      setCustomersLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'Customer' && token) {
        fetchCustomers();
      }
    }, [activeTab, token, fetchCustomers]),
  );

  const handleBackPress = () => {
    Keyboard.dismiss();
    router.back();
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      className='flex-1 bg-white'
    >
      <View className='relative flex-row items-center border-b border-gray-200 px-5 py-4'>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBackPress}
          className='absolute left-5 z-10 h-10 w-10 items-center justify-center'
        >
          <Ionicons name='arrow-back' size={24} color='#111827' />
        </TouchableOpacity>

        <View className='w-full items-center'>
          <Text className='text-2xl font-bold text-gray-900'>{activeTab}</Text>
        </View>
      </View>

      {activeTab === 'Restaurant' && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={restaurantScrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 40,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
              keyboardDismissMode={
                Platform.OS === 'ios' ? 'interactive' : 'on-drag'
              }
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
              nestedScrollEnabled
            >
              <View className='mb-6'>
                <Text className='text-xl font-bold text-gray-900'>
                  {isEditMode ? 'Edit Restaurant' : 'Add Restaurant'}
                </Text>

                <Text className='mt-1 text-sm text-gray-500'>
                  {isEditMode
                    ? 'Update the restaurant details below'
                    : 'Enter the restaurant details below'}
                </Text>
              </View>

              <View className='mb-5'>
                <Text className='mb-2 text-sm font-semibold text-gray-700'>
                  Restaurant Name
                </Text>

                <View className='rounded-xl border border-gray-200 bg-gray-50 px-4'>
                  <TextInput
                    value={restaurantName}
                    onChangeText={setRestaurantName}
                    placeholder='Enter restaurant name'
                    placeholderTextColor='#9ca3af'
                    returnKeyType='next'
                    className='py-4 text-base text-gray-900'
                  />
                </View>
              </View>

              <View className='mb-5'>
                <Text className='mb-2 text-sm font-semibold text-gray-700'>
                  City
                </Text>

                <View className='rounded-xl border border-gray-200 bg-gray-50 px-4'>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder='Enter city'
                    placeholderTextColor='#9ca3af'
                    returnKeyType='next'
                    className='py-4 text-base text-gray-900'
                  />
                </View>
              </View>

              <View className='mb-5'>
                <Text className='mb-2 text-sm font-semibold text-gray-700'>
                  Address
                </Text>

                <View className='rounded-xl border border-gray-200 bg-gray-50 px-4'>
                  <TextInput
                    value={address}
                    onChangeText={setAddress}
                    placeholder='Enter restaurant address'
                    placeholderTextColor='#9ca3af'
                    multiline
                    textAlignVertical='top'
                    className='min-h-[100px] py-4 text-base text-gray-900'
                  />
                </View>
              </View>

              <View className='mb-6 flex-row'>
                <View className='mr-2 flex-1'>
                  <Text className='mb-2 text-sm font-semibold text-gray-700'>
                    Opening Time
                  </Text>

                  <View className='rounded-xl border border-gray-200 bg-gray-50 px-3'>
                    <TextInput
                      value={openingTime}
                      onChangeText={handleOpeningTimeChange}
                      onFocus={scrollRestaurantToBottom}
                      placeholder='10:00'
                      placeholderTextColor='#9ca3af'
                      keyboardType='number-pad'
                      maxLength={5}
                      returnKeyType='next'
                      className='py-4 text-base text-gray-900'
                    />
                  </View>
                </View>

                <View className='ml-2 flex-1'>
                  <Text className='mb-2 text-sm font-semibold text-gray-700'>
                    Closing Time
                  </Text>

                  <View className='rounded-xl border border-gray-200 bg-gray-50 px-3'>
                    <TextInput
                      value={closingTime}
                      onChangeText={handleClosingTimeChange}
                      onFocus={scrollRestaurantToBottom}
                      placeholder='23:00'
                      placeholderTextColor='#9ca3af'
                      keyboardType='number-pad'
                      maxLength={5}
                      returnKeyType='done'
                      className='py-4 text-base text-gray-900'
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View
              className='border-t border-gray-100 bg-white px-5 pt-3'
              style={{
                paddingBottom: Platform.OS === 'ios' ? 20 : 12,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCreateRestaurant}
                disabled={submitting}
                className='h-14 items-center justify-center rounded-xl bg-[#4d13af]'
              >
                {submitting ? (
                  <ActivityIndicator size='small' color='#FFFFFF' />
                ) : (
                  <Text className='text-base font-bold text-white'>
                    {isEditMode ? 'Update Restaurant' : 'Create Restaurant'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {activeTab === 'Staff' && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={staffScrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 40,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
              keyboardDismissMode={
                Platform.OS === 'ios' ? 'interactive' : 'on-drag'
              }
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
              nestedScrollEnabled
            >
              <View className='mb-6'>
                <Text className='text-xl font-bold text-gray-900'>
                  {isStaffEditMode ? 'Edit Staff' : 'Add Staff'}
                </Text>

                <Text className='mt-1 text-sm text-gray-500'>
                  {isStaffEditMode
                    ? 'Update the staff details below'
                    : 'Enter the staff details below'}
                </Text>
              </View>

              <View className='mb-5'>
                <Text className='mb-2 text-sm font-semibold text-gray-700'>
                  Staff Name
                </Text>

                <View className='rounded-xl border border-gray-200 bg-gray-50 px-4'>
                  <TextInput
                    value={staffName}
                    onChangeText={setStaffName}
                    placeholder='Enter staff name'
                    placeholderTextColor='#9ca3af'
                    returnKeyType='next'
                    className='py-4 text-base text-gray-900'
                  />
                </View>
              </View>

              <View className='mb-5'>
                <Text className='mb-2 text-sm font-semibold text-gray-700'>
                  Mobile Number
                </Text>

                <View className='rounded-xl border border-gray-200 bg-gray-50 px-4'>
                  <TextInput
                    value={mobileNumber}
                    onChangeText={text =>
                      setMobileNumber(text.replace(/[^0-9]/g, '').slice(0, 10))
                    }
                    placeholder='Enter mobile number'
                    placeholderTextColor='#9ca3af'
                    keyboardType='phone-pad'
                    maxLength={10}
                    returnKeyType='next'
                    onFocus={scrollStaffToBottom}
                    className='py-4 text-base text-gray-900'
                  />
                </View>
              </View>

              <View className='mb-6'>
                <Text className='mb-2 text-sm font-semibold text-gray-700'>
                  Role
                </Text>

                <View className='rounded-xl border border-gray-200 bg-gray-50 px-4'>
                  <TextInput
                    value={role}
                    onChangeText={setRole}
                    placeholder='Enter role'
                    placeholderTextColor='#9ca3af'
                    returnKeyType='done'
                    onFocus={scrollStaffToBottom}
                    className='py-4 text-base text-gray-900'
                  />
                </View>
              </View>
            </ScrollView>

            <View
              className='border-t border-gray-100 bg-white px-5 pt-3'
              style={{
                paddingBottom: Platform.OS === 'ios' ? 20 : 12,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCreateStaff}
                disabled={submitting}
                className='h-14 items-center justify-center rounded-xl bg-[#4d13af]'
              >
                {submitting ? (
                  <ActivityIndicator size='small' color='#FFFFFF' />
                ) : (
                  <Text className='text-base font-bold text-white'>
                    {isStaffEditMode ? 'Update Staff' : 'Create Staff'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {activeTab === 'Customer' && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={customerScrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 40,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
              keyboardDismissMode={
                Platform.OS === 'ios' ? 'interactive' : 'on-drag'
              }
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
              nestedScrollEnabled
              refreshControl={
                <RefreshControl
                  refreshing={customersLoading}
                  onRefresh={fetchCustomers}
                />
              }
            >
              <View className='mb-6'>
                <Text className='text-xl font-bold text-gray-900'>
                  {isCustomerEditMode ? 'Edit Customer' : 'Add Customer'}
                </Text>

                <Text className='mt-1 text-sm text-gray-500'>
                  {isCustomerEditMode
                    ? 'Update the customer details below'
                    : 'Enter the customer details below'}
                </Text>
              </View>

              <View className='mb-5'>
                <Text className='mb-2 text-sm font-semibold text-gray-700'>
                  Customer Name
                </Text>

                <View className='rounded-xl border border-gray-200 bg-gray-50 px-4'>
                  <TextInput
                    value={customerName}
                    onChangeText={setCustomerName}
                    placeholder='Enter customer name'
                    placeholderTextColor='#9ca3af'
                    returnKeyType='next'
                    className='py-4 text-base text-gray-900'
                  />
                </View>
              </View>

              <View className='mb-5'>
                <Text className='mb-2 text-sm font-semibold text-gray-700'>
                  Mobile Number
                </Text>

                <View className='rounded-xl border border-gray-200 bg-gray-50 px-4'>
                  <TextInput
                    value={customerMobileNumber}
                    onChangeText={text =>
                      setCustomerMobileNumber(
                        text.replace(/[^0-9]/g, '').slice(0, 10),
                      )
                    }
                    placeholder='Enter mobile number'
                    placeholderTextColor='#9ca3af'
                    keyboardType='phone-pad'
                    maxLength={10}
                    returnKeyType='next'
                    onFocus={scrollCustomerToBottom}
                    className='py-4 text-base text-gray-900'
                  />
                </View>
              </View>

              <View className='mb-5'>
                <Text className='mb-2 text-sm font-semibold text-gray-700'>
                  Email
                </Text>

                <View className='rounded-xl border border-gray-200 bg-gray-50 px-4'>
                  <TextInput
                    value={customerEmail}
                    onChangeText={setCustomerEmail}
                    placeholder='Enter email address'
                    placeholderTextColor='#9ca3af'
                    keyboardType='email-address'
                    autoCapitalize='none'
                    autoCorrect={false}
                    returnKeyType='next'
                    onFocus={scrollCustomerToBottom}
                    className='py-4 text-base text-gray-900'
                  />
                </View>
              </View>

              <View className='mb-6'>
                <Text className='mb-2 text-sm font-semibold text-gray-700'>
                  Notes
                </Text>

                <View className='rounded-xl border border-gray-200 bg-gray-50 px-4'>
                  <TextInput
                    value={customerNotes}
                    onChangeText={setCustomerNotes}
                    placeholder='Enter customer notes'
                    placeholderTextColor='#9ca3af'
                    multiline
                    textAlignVertical='top'
                    onFocus={scrollCustomerToBottom}
                    className='min-h-[120px] py-4 text-base text-gray-900'
                  />
                </View>
              </View>
            </ScrollView>

            <View
              className='border-t border-gray-100 bg-white px-5 pt-3'
              style={{
                paddingBottom: Platform.OS === 'ios' ? 20 : 12,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCreateCustomer}
                disabled={submitting}
                className='h-14 items-center justify-center rounded-xl bg-[#4d13af]'
              >
                {submitting ? (
                  <ActivityIndicator size='small' color='#FFFFFF' />
                ) : (
                  <Text className='text-base font-bold text-white'>
                    {isCustomerEditMode ? 'Update Customer' : 'Create Customer'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
