import React, { useState } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';

import Toast from 'react-native-toast-message';

import { useAuth } from '@/contexts/AuthContext';

import { useCreateQueueMutation } from '@/store/api/queueApi';

export default function AddQueueScreen() {
  const { token } = useAuth();

  const [customerName, setCustomerName] = useState('');

  const [mobileNumber, setMobileNumber] = useState('');

  const [partySize, setPartySize] = useState(1);

  const [notes, setNotes] = useState('');

  const [showValidation, setShowValidation] = useState(false);

  const [createQueue, { isLoading: loading }] = useCreateQueueMutation();

  const decreasePartySize = () => {
    setPartySize(previous => Math.max(1, previous - 1));
  };

  const increasePartySize = () => {
    setPartySize(previous => Math.min(50, previous + 1));
  };

  const handleSave = async () => {
    setShowValidation(true);

    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Authentication token not found.',
        visibilityTime: 4000,
      });

      return;
    }

    const trimmedName = customerName.trim();

    const trimmedMobile = mobileNumber.trim();

    if (!trimmedName || !trimmedMobile) {
      Toast.show({
        type: 'error',
        text1: 'Please enter all required queue details.',
        visibilityTime: 4000,
      });

      return;
    }

    const payload = {
      customer_name: trimmedName,
      mobile_number: trimmedMobile,
      party_size: partySize,
      notes: notes.trim(),
    };

    try {
      const response = await createQueue(payload).unwrap();

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Added to queue successfully.',
          visibilityTime: 2500,
        });

        setTimeout(() => {
          router.back();
        }, 800);

        return;
      }

      const validationErrors = response.errors;

      let errorMessage = response.message ?? 'Failed to add to queue.';

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
    } catch (error: unknown) {
      let message = 'An unexpected error occurred while adding to the queue.';

      if (error instanceof Error) {
        message = error.message;
      }

      Toast.show({
        type: 'error',
        text1: message,
        visibilityTime: 4000,
      });
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const nameError = showValidation && !customerName.trim();

  const mobileError = showValidation && !mobileNumber.trim();

  return (
    <KeyboardAvoidingView
      className='flex-1 bg-[#FCFBFD]'
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className='flex-1'>
        <View className='bg-[#35116B] px-5 pb-5 pt-12'>
          <View className='flex-row items-center'>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBack}
              className='mr-5'
              hitSlop={10}
            >
              <MaterialIcons name='arrow-back' size={24} color='#FFFFFF' />
            </TouchableOpacity>

            <Text className='text-[18px] font-bold text-white'>
              Add to Queue
            </Text>
          </View>
        </View>

        <View className='flex-1'>
          <ScrollView
            className='flex-1 bg-[#FCFBFD]'
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 25,
              paddingBottom: 30,
            }}
          >
            <View className='mb-5'>
              <Text className='mb-2 text-[14px] font-medium text-[#17132F]'>
                Customer Name
                <Text className='text-[#E31B23]'> *</Text>
              </Text>

              <TextInput
                value={customerName}
                onChangeText={setCustomerName}
                placeholder='Enter customer name'
                placeholderTextColor='#77718A'
                className={`h-[44px] rounded-xl border bg-white px-4 text-[14px] text-[#17132F] ${
                  nameError ? 'border-[#E31B23]' : 'border-[#D8D2E2]'
                }`}
              />

              {nameError && (
                <Text className='mt-1 text-[12px] text-[#E31B23]'>
                  Customer name is required.
                </Text>
              )}
            </View>

            <View className='mb-5'>
              <Text className='mb-2 text-[14px] font-medium text-[#17132F]'>
                Mobile Number
                <Text className='text-[#E31B23]'> *</Text>
              </Text>

              <TextInput
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder='Enter mobile number'
                placeholderTextColor='#77718A'
                keyboardType='phone-pad'
                maxLength={10}
                className={`h-[44px] rounded-xl border bg-white px-4 text-[14px] text-[#17132F] ${
                  mobileError ? 'border-[#E31B23]' : 'border-[#D8D2E2]'
                }`}
              />

              {mobileError && (
                <Text className='mt-1 text-[12px] text-[#E31B23]'>
                  Mobile number is required.
                </Text>
              )}
            </View>

            <View className='mb-5'>
              <Text className='mb-2 text-[14px] font-medium text-[#17132F]'>
                Party Size
                <Text className='text-[#E31B23]'> *</Text>
              </Text>

              <View className='h-[50px] w-[220px] flex-row overflow-hidden rounded-xl border border-[#D8D2E2] bg-white'>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={decreasePartySize}
                  className='w-[50px] items-center justify-center border-r border-[#D8D2E2]'
                  hitSlop={10}
                >
                  <Entypo name='minus' size={24} color='black' />
                </TouchableOpacity>

                <View className='flex-1 items-center justify-center'>
                  <Text className='text-[16px] font-medium text-[#17132F]'>
                    {partySize}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={increasePartySize}
                  className='w-[50px] items-center justify-center border-l border-[#D8D2E2]'
                  hitSlop={10}
                >
                  <Entypo name='plus' size={24} color='black' />
                </TouchableOpacity>
              </View>
            </View>

            <View className='mb-5'>
              <View className='mb-2 flex-row'>
                <Text className='text-[14px] font-medium text-[#17132F]'>
                  Notes
                </Text>

                <Text className='ml-1 text-[14px] font-medium text-[#514B68]'>
                  (Optional)
                </Text>
              </View>

              <View className='h-[118px] rounded-xl border border-[#D8D2E2] bg-white'>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder='Any preferences or notes...'
                  placeholderTextColor='#77718A'
                  multiline
                  maxLength={200}
                  textAlignVertical='top'
                  className='flex-1 px-4 pt-4 text-[14px] text-[#17132F]'
                />

                <Text className='absolute bottom-2 right-3 text-[13px] text-[#77718A]'>
                  {notes.length}/200
                </Text>
              </View>
            </View>
          </ScrollView>

          {loading && (
            <View
              className='absolute inset-0 items-center justify-center bg-black/10'
              pointerEvents='auto'
            >
              <View className='rounded-xl bg-white px-6 py-5'>
                <ActivityIndicator size='large' color='#35116B' />
              </View>
            </View>
          )}
        </View>

        <View className='mb-4 border-t border-[#E7E2EB] bg-white px-5 py-5'>
          <View className='flex-row gap-3'>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCancel}
              className='h-[46px] flex-1 items-center justify-center rounded-xl border border-[#35116B] bg-white'
              hitSlop={10}
            >
              <Text className='text-[14px] font-semibold text-[#35116B]'>
                CANCEL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              className='h-[46px] flex-1 items-center justify-center rounded-xl bg-[#35116B]'
              hitSlop={10}
            >
              <Text className='text-[14px] font-semibold text-white'>
                ADD TO QUEUE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
