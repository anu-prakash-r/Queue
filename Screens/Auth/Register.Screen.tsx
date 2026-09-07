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
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

type Suggestion = {
  placeId: string;
  text: string;
};

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleRegister = () => {
    if (!name.trim()) {
      return;
    }

    if (mobile.length !== 10) {
      return;
    }

    if (!selectedLocation) {
      return;
    }

    const registerData = {
      name: name.trim(),
      mobile,
      location: selectedLocation.address,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    };

    router.push({
      pathname: '/login',
      params: {
        step: '2',
        mobile,
        from: 'register',
      },
    });
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 30,
          }}
        >
          <View className='relative mt-6 flex-row items-center justify-center'>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              className='absolute left-0 h-11 w-11 items-center justify-center rounded-full bg-[#F4EFF7]'
            >
              <MaterialIcons name='arrow-back' size={24} color='#351467' />
            </TouchableOpacity>

            <View className='items-center'>
              <Text className='text-[26px] font-bold text-[#351467]'>
                Create Account
              </Text>

              <Text className='mt-1 text-[14px] text-[#777180]'>
                Register your restaurant
              </Text>
            </View>
          </View>

          <View className='mt-9 items-center'>
            <View className='h-24 w-24 items-center justify-center rounded-full bg-[#F1EAF5]'>
              <MaterialIcons name='restaurant' size={48} color='#351467' />
            </View>
          </View>

          <View className='mt-10'>
            <Text className='mb-2 text-[14px] font-semibold text-[#442F52]'>
              Full Name
            </Text>

            <View className='h-[56px] flex-row items-center rounded-xl border border-[#E3DDE7] bg-white px-4'>
              <MaterialIcons name='person-outline' size={22} color='#777180' />

              <TextInput
                value={name}
                onChangeText={text => {
                  setName(text);
                }}
                placeholder='Enter your name'
                placeholderTextColor='#AAA4AE'
                className='ml-3 flex-1 text-[16px] text-[#351467]'
              />
            </View>
          </View>

          <View className='mt-5'>
            <Text className='mb-2 text-[14px] font-semibold text-[#442F52]'>
              Mobile Number
            </Text>

            <View className='h-[56px] flex-row items-center rounded-xl border border-[#E3DDE7] bg-white px-4'>
              <Text className='text-[16px] font-semibold text-[#351467]'>
                +91
              </Text>

              <View className='mx-3 h-6 w-[1px] bg-[#E3DDE7]' />

              <TextInput
                value={mobile}
                onChangeText={text => {
                  const value = text.replace(/[^0-9]/g, '');

                  setMobile(value);
                }}
                placeholder='Enter mobile number'
                placeholderTextColor='#AAA4AE'
                keyboardType='phone-pad'
                maxLength={10}
                className='flex-1 text-[16px] text-[#351467]'
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRegister}
            className='mt-9 h-[52px] items-center justify-center rounded-xl bg-[#351467]'
          >
            <Text className='text-[16px] font-bold text-white'>Get OTP</Text>
          </TouchableOpacity>

          <View className='mt-5 flex-row items-center justify-center'>
            <Text className='text-[14px] text-[#777180]'>
              Already have an account?
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/login')}
            >
              <Text className='ml-1 text-[14px] font-bold text-[#351467]'>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
