import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { SafeAreaView } from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import { ApiError } from '@/services/api';

import { useAuth } from '@/contexts/AuthContext';

import { createOwner, editOwner, getOwners } from '@/services/ownerApi';

export default function CreateOwnerScreen() {
  const { token } = useAuth();

  const { ownerId } = useLocalSearchParams<{
    ownerId?: string;
  }>();

  const [name, setName] = useState('');

  const [mobileNumber, setMobileNumber] = useState('');

  const [maxRestaurants, setMaxRestaurants] = useState('');

  const [maxStaff, setMaxStaff] = useState('');

  const [maxTables, setMaxTables] = useState('');

  const [restaurantName, setRestaurantName] = useState('');

  const [city, setCity] = useState('');

  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [errors, setErrors] = useState({
    name: false,
    mobileNumber: false,
    maxRestaurants: false,
    maxStaff: false,
    maxTables: false,
    restaurantName: false,
    city: false,
    address: false,
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', event => {
      setKeyboardHeight(event.endCoordinates.height);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!ownerId || !token) {
      return;
    }

    const loadOwner = async () => {
      try {
        const response = await getOwners(token);

        if (response.success && response.data) {
          const owner = response.data.find(o => o.id === Number(ownerId));

          if (owner) {
            setName(owner.name ?? '');

            setMobileNumber(owner.mobile_number ?? '');

            setMaxRestaurants(String(owner.max_restaurants ?? ''));

            setMaxStaff(String(owner.max_staff ?? ''));

            setMaxTables(String(owner.max_tables ?? ''));

            setRestaurantName(owner.restaurant_name ?? '');

            setCity(owner.city ?? '');

            setAddress(owner.address ?? '');
          }
        }
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Something went wrong while loading owner details.';

        Toast.show({
          type: 'error',
          text1: 'Unable to Load Owner',
          text2: message,
          visibilityTime: 4000,
        });
      }
    };

    loadOwner();
  }, [ownerId, token]);

  const clearError = (
    field:
      | 'name'
      | 'mobileNumber'
      | 'maxRestaurants'
      | 'maxStaff'
      | 'maxTables'
      | 'restaurantName'
      | 'city'
      | 'address',
  ) => {
    setErrors(prev => ({
      ...prev,
      [field]: false,
    }));
  };

  const resetErrors = () => {
    setErrors({
      name: false,
      mobileNumber: false,
      maxRestaurants: false,
      maxStaff: false,
      maxTables: false,
      restaurantName: false,
      city: false,
      address: false,
    });
  };

  const showRequiredError = (
    field:
      | 'name'
      | 'mobileNumber'
      | 'maxRestaurants'
      | 'maxStaff'
      | 'maxTables'
      | 'restaurantName'
      | 'city'
      | 'address',
    title: string,
    message: string,
  ) => {
    setErrors(prev => ({
      ...prev,
      [field]: true,
    }));

    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: 3000,
    });
  };

  const handleCreateOwner = async () => {
    resetErrors();

    if (!name.trim()) {
      showRequiredError(
        'name',
        'Owner Name Required',
        'Please enter owner name.',
      );
      return;
    }

    if (!mobileNumber.trim()) {
      showRequiredError(
        'mobileNumber',
        'Mobile Number Required',
        'Please enter mobile number.',
      );
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      setErrors(prev => ({
        ...prev,
        mobileNumber: true,
      }));

      Toast.show({
        type: 'error',
        text1: 'Invalid Mobile Number',
        text2: 'Please enter a valid 10-digit mobile number.',
        visibilityTime: 3000,
      });

      return;
    }

    if (!maxRestaurants.trim()) {
      showRequiredError(
        'maxRestaurants',
        'Maximum Restaurants Required',
        'Please enter maximum restaurants.',
      );
      return;
    }

    if (!maxStaff.trim()) {
      showRequiredError(
        'maxStaff',
        'Maximum Staff Required',
        'Please enter maximum staff.',
      );
      return;
    }

    if (!maxTables.trim()) {
      showRequiredError(
        'maxTables',
        'Maximum Tables Required',
        'Please enter maximum tables.',
      );
      return;
    }

    if (!restaurantName.trim()) {
      showRequiredError(
        'restaurantName',
        'Restaurant Name Required',
        'Please enter restaurant name.',
      );
      return;
    }

    if (!city.trim()) {
      showRequiredError('city', 'City Required', 'Please enter city.');
      return;
    }

    if (!address.trim()) {
      showRequiredError('address', 'Address Required', 'Please enter address.');
      return;
    }

    const ownerData = {
      name: name.trim(),

      mobile_number: mobileNumber.trim(),

      max_restaurants: Number(maxRestaurants),

      max_staff: Number(maxStaff),

      max_tables: Number(maxTables),

      restaurant_name: restaurantName.trim(),

      city: city.trim(),

      address: address.trim(),
    };

    try {
      setLoading(true);

      let response;

      if (ownerId) {
        response = await editOwner(Number(ownerId), ownerData, token ?? '');
      } else {
        response = await createOwner(ownerData, token ?? '');
      }

      if (response.success) {
        Toast.show({
          type: 'success',

          text1: ownerId ? 'Owner Updated' : 'Owner Created',

          text2: ownerId
            ? 'Owner details updated successfully.'
            : 'New owner created successfully.',

          visibilityTime: 2500,
        });

        setTimeout(() => {
          router.back();
        }, 500);

        return;
      }

      Toast.show({
        type: 'error',

        text1: ownerId ? 'Update Failed' : 'Creation Failed',

        text2:
          response.message ??
          (ownerId ? 'Failed to update owner.' : 'Failed to create owner.'),

        visibilityTime: 4000,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        Toast.show({
          type: 'error',

          text1: ownerId ? 'Update Failed' : 'Creation Failed',

          text2: error.message || 'Request failed.',

          visibilityTime: 5000,
        });

        return;
      }

      if (error instanceof Error) {
        Toast.show({
          type: 'error',

          text1: 'Something went wrong',

          text2: error.message,

          visibilityTime: 5000,
        });

        return;
      }

      Toast.show({
        type: 'error',

        text1: 'Something went wrong',

        text2: 'Unable to save owner. Please try again.',

        visibilityTime: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      className='flex-1 bg-white'
    >
      <View className='flex-row items-center border-b border-[#F0EDF2] bg-white px-5 py-4'>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className='mr-3 h-10 w-10 items-center justify-center rounded-xl'
        >
          <MaterialIcons name='arrow-back' size={24} color='#442F52' />
        </TouchableOpacity>

        <View className='flex-1'>
          <Text className='text-[20px] font-bold text-[#442F52]'>
            {ownerId ? 'Update Owner' : 'Create Owner'}
          </Text>

          <Text className='mt-0.5 text-[12px] text-[#8D8791]'>
            {ownerId ? 'Edit restaurant owner' : 'Add a new restaurant owner'}
          </Text>
        </View>
      </View>

      <ScrollView
        className='flex-1'
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode='none'
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 30,
        }}
      >
        <Text className='mb-3 text-[15px] font-bold text-[#442F52]'>
          Owner Details
        </Text>

        <View className='rounded-2xl bg-white p-4'>
          <View className='mb-4'>
            <Text className='mb-2 text-[13px] font-semibold text-[#442F52]'>
              Owner Name
            </Text>

            <View
              className={`flex-row items-center rounded-xl border bg-white px-4 ${
                errors.name ? 'border-red-500' : 'border-[#E8E2EB]'
              }`}
            >
              <MaterialIcons
                name='person-outline'
                size={20}
                color={errors.name ? '#EF4444' : '#8D8791'}
              />

              <TextInput
                value={name}
                onChangeText={text => {
                  setName(text);

                  if (errors.name) {
                    clearError('name');
                  }
                }}
                placeholder='Enter owner name'
                placeholderTextColor='#AAA4AE'
                autoCapitalize='words'
                returnKeyType='next'
                className='ml-3 flex-1 py-3.5 text-[14px] text-[#442F52]'
              />
            </View>

            {errors.name && (
              <Text className='mt-1.5 text-[11px] text-red-500'>
                Owner name is required
              </Text>
            )}
          </View>

          <View className='mb-1'>
            <Text className='mb-2 text-[13px] font-semibold text-[#442F52]'>
              Mobile Number
            </Text>

            <View
              className={`flex-row items-center rounded-xl border bg-white px-4 ${
                errors.mobileNumber ? 'border-red-500' : 'border-[#E8E2EB]'
              }`}
            >
              <MaterialIcons
                name='phone'
                size={20}
                color={errors.mobileNumber ? '#EF4444' : '#8D8791'}
              />

              <TextInput
                value={mobileNumber}
                onChangeText={text => {
                  setMobileNumber(text.replace(/[^0-9]/g, ''));

                  if (errors.mobileNumber) {
                    clearError('mobileNumber');
                  }
                }}
                placeholder='Enter mobile number'
                placeholderTextColor='#AAA4AE'
                keyboardType='phone-pad'
                maxLength={10}
                returnKeyType='next'
                className='ml-3 flex-1 py-3.5 text-[14px] text-[#442F52]'
              />
            </View>

            {errors.mobileNumber && (
              <Text className='mt-1.5 text-[11px] text-red-500'>
                Please enter a valid mobile number
              </Text>
            )}
          </View>
        </View>

        <Text className='mb-3 mt-6 text-[15px] font-bold text-[#442F52]'>
          Restaurant Details
        </Text>

        <View className='rounded-2xl bg-white p-4'>
          <View className='mb-4'>
            <Text className='mb-2 text-[13px] font-semibold text-[#442F52]'>
              Restaurant Name
            </Text>

            <View
              className={`flex-row items-center rounded-xl border bg-white px-4 ${
                errors.restaurantName ? 'border-red-500' : 'border-[#E8E2EB]'
              }`}
            >
              <MaterialIcons
                name='restaurant'
                size={20}
                color={errors.restaurantName ? '#EF4444' : '#8D8791'}
              />

              <TextInput
                value={restaurantName}
                onChangeText={text => {
                  setRestaurantName(text);

                  if (errors.restaurantName) {
                    clearError('restaurantName');
                  }
                }}
                placeholder='Enter restaurant name'
                placeholderTextColor='#AAA4AE'
                autoCapitalize='words'
                returnKeyType='next'
                className='ml-3 flex-1 py-3.5 text-[14px] text-[#442F52]'
              />
            </View>

            {errors.restaurantName && (
              <Text className='mt-1.5 text-[11px] text-red-500'>
                Restaurant name is required
              </Text>
            )}
          </View>

          <View className='mb-4'>
            <Text className='mb-2 text-[13px] font-semibold text-[#442F52]'>
              City
            </Text>

            <View
              className={`flex-row items-center rounded-xl border bg-white px-4 ${
                errors.city ? 'border-red-500' : 'border-[#E8E2EB]'
              }`}
            >
              <MaterialIcons
                name='location-city'
                size={20}
                color={errors.city ? '#EF4444' : '#8D8791'}
              />

              <TextInput
                value={city}
                onChangeText={text => {
                  setCity(text);

                  if (errors.city) {
                    clearError('city');
                  }
                }}
                placeholder='Enter city'
                placeholderTextColor='#AAA4AE'
                autoCapitalize='words'
                returnKeyType='next'
                className='ml-3 flex-1 py-3.5 text-[14px] text-[#442F52]'
              />
            </View>

            {errors.city && (
              <Text className='mt-1.5 text-[11px] text-red-500'>
                City is required
              </Text>
            )}
          </View>

          <View className='mb-1'>
            <Text className='mb-2 text-[13px] font-semibold text-[#442F52]'>
              Address
            </Text>

            <View
              className={`flex-row items-start rounded-xl border bg-white px-4 ${
                errors.address ? 'border-red-500' : 'border-[#E8E2EB]'
              }`}
            >
              <MaterialIcons
                name='location-on'
                size={20}
                color={errors.address ? '#EF4444' : '#8D8791'}
                style={{
                  marginTop: 14,
                }}
              />

              <TextInput
                value={address}
                onChangeText={text => {
                  setAddress(text);

                  if (errors.address) {
                    clearError('address');
                  }
                }}
                placeholder='Enter restaurant address'
                placeholderTextColor='#AAA4AE'
                multiline
                numberOfLines={3}
                textAlignVertical='top'
                className='ml-3 min-h-[90px] flex-1 py-3.5 text-[14px] text-[#442F52]'
              />
            </View>

            {errors.address && (
              <Text className='mt-1.5 text-[11px] text-red-500'>
                Address is required
              </Text>
            )}
          </View>
        </View>

        <Text className='mb-3 mt-6 text-[15px] font-bold text-[#442F52]'>
          Account Limits
        </Text>

        <View className='rounded-2xl bg-white p-4'>
          <View className='mb-4'>
            <Text className='mb-2 text-[13px] font-semibold text-[#442F52]'>
              Maximum Restaurants
            </Text>

            <View
              className={`flex-row items-center rounded-xl border bg-white px-4 ${
                errors.maxRestaurants ? 'border-red-500' : 'border-[#E8E2EB]'
              }`}
            >
              <MaterialIcons
                name='store'
                size={20}
                color={errors.maxRestaurants ? '#EF4444' : '#8D8791'}
              />

              <TextInput
                value={maxRestaurants}
                onChangeText={text => {
                  setMaxRestaurants(text.replace(/[^0-9]/g, ''));

                  if (errors.maxRestaurants) {
                    clearError('maxRestaurants');
                  }
                }}
                placeholder='e.g. 3'
                placeholderTextColor='#AAA4AE'
                keyboardType='numeric'
                returnKeyType='next'
                className='ml-3 flex-1 py-3.5 text-[14px] text-[#442F52]'
              />
            </View>

            {errors.maxRestaurants && (
              <Text className='mt-1.5 text-[11px] text-red-500'>
                Maximum restaurants is required
              </Text>
            )}
          </View>

          <View className='mb-4'>
            <Text className='mb-2 text-[13px] font-semibold text-[#442F52]'>
              Maximum Staff
            </Text>

            <View
              className={`flex-row items-center rounded-xl border bg-white px-4 ${
                errors.maxStaff ? 'border-red-500' : 'border-[#E8E2EB]'
              }`}
            >
              <MaterialIcons
                name='groups'
                size={20}
                color={errors.maxStaff ? '#EF4444' : '#8D8791'}
              />

              <TextInput
                value={maxStaff}
                onChangeText={text => {
                  setMaxStaff(text.replace(/[^0-9]/g, ''));

                  if (errors.maxStaff) {
                    clearError('maxStaff');
                  }
                }}
                placeholder='e.g. 10'
                placeholderTextColor='#AAA4AE'
                keyboardType='numeric'
                returnKeyType='next'
                className='ml-3 flex-1 py-3.5 text-[14px] text-[#442F52]'
              />
            </View>

            {errors.maxStaff && (
              <Text className='mt-1.5 text-[11px] text-red-500'>
                Maximum staff is required
              </Text>
            )}
          </View>

          <View className='mb-1'>
            <Text className='mb-2 text-[13px] font-semibold text-[#442F52]'>
              Maximum Tables
            </Text>

            <View
              className={`flex-row items-center rounded-xl border bg-white px-4 ${
                errors.maxTables ? 'border-red-500' : 'border-[#E8E2EB]'
              }`}
            >
              <MaterialIcons
                name='table-restaurant'
                size={20}
                color={errors.maxTables ? '#EF4444' : '#8D8791'}
              />

              <TextInput
                value={maxTables}
                onChangeText={text => {
                  setMaxTables(text.replace(/[^0-9]/g, ''));

                  if (errors.maxTables) {
                    clearError('maxTables');
                  }
                }}
                placeholder='e.g. 50'
                placeholderTextColor='#AAA4AE'
                keyboardType='numeric'
                returnKeyType='done'
                onSubmitEditing={Keyboard.dismiss}
                className='ml-3 flex-1 py-3.5 text-[14px] text-[#442F52]'
              />
            </View>

            {errors.maxTables && (
              <Text className='mt-1.5 text-[11px] text-red-500'>
                Maximum tables is required
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          marginBottom: keyboardHeight,
        }}
        className='bg-white px-5 pb-5 pt-3'
      >
        <View className='flex-row gap-3'>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            disabled={loading}
            className='h-12 flex-1 items-center justify-center rounded-xl border border-[#DDD6E2] bg-white'
          >
            <Text className='text-[14px] font-semibold text-[#5E5665]'>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCreateOwner}
            disabled={loading}
            className={`h-12 flex-1 items-center justify-center rounded-xl ${
              loading ? 'bg-[#806C89]' : 'bg-[#442F52]'
            }`}
          >
            {loading ? (
              <ActivityIndicator size='small' color='#FFFFFF' />
            ) : (
              <View className='flex-row items-center'>
                <MaterialIcons
                  name={ownerId ? 'check' : 'add'}
                  size={20}
                  color='#FFFFFF'
                />

                <Text className='ml-2 text-[14px] font-bold text-white'>
                  {ownerId ? 'Update Owner' : 'Create Owner'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
