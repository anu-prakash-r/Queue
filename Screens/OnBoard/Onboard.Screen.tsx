import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardSvg, SarasSvg } from '@/assets/Svg';

export default function OnboardingScreen() {
  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleSuperAdminLogin = () => {
    router.push('/adminlogin');
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='flex-1 items-center px-6'>
        <View className='mt-12 items-center'>
          <SarasSvg />
        </View>

        <View className='mt-12 items-center'>
          <Text className='text-center text-[29px] font-semibold text-[#142052]'>
            Restaurant Queue
          </Text>

          <Text className='mt-4 text-center text-[16px] font-medium text-[#777180]'>
            Manage your queue faster and easier.
          </Text>
        </View>

        <View className='flex-1 items-center justify-center'>
          <OnboardSvg />
        </View>

        <View className='mb-10 w-full'>
          <View className='w-full flex-row gap-4'>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogin}
              className='h-[50px] flex-1 items-center justify-center rounded-xl bg-[#17175C]'
            >
              <View className='flex-row items-center'>
                <MaterialIcons name='login' size={21} color='#FFFFFF' />

                <Text className='ml-2 text-[16px] font-semibold text-white'>
                  Login
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRegister}
              className='h-[50px] flex-1 items-center justify-center rounded-xl bg-[#17175C]'
            >
              <View className='flex-row items-center'>
                <Text className='mr-2 text-[16px] font-semibold text-white'>
                  Register
                </Text>

                <MaterialIcons name='person-add' size={21} color='#FFFFFF' />
              </View>
            </TouchableOpacity>
          </View>

          <View className='mt-5 flex-row items-center'>
            <View className='h-[1px] flex-1 bg-[#E5E1EA]' />

            <Text className='mx-3 text-[12px] font-medium text-[#9993A2]'>
              ADMIN ACCESS
            </Text>

            <View className='h-[1px] flex-1 bg-[#E5E1EA]' />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSuperAdminLogin}
            className='mt-3 h-[50px] w-full flex-row items-center justify-center rounded-xl border border-[#17175C] bg-white'
          >
            <View className='h-8 w-8 items-center justify-center rounded-2xl bg-[#F1EAFE]'>
              <MaterialIcons
                name='admin-panel-settings'
                size={20}
                color='#17175C'
              />
            </View>

            <Text className='ml-2 text-[15px] font-bold tracking-wide text-[#17175C]'>
              SUPER ADMIN LOGIN
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
