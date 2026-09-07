import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

import { adminLogin } from '@/services/authApi';
import { SarasSvg } from '@/assets/Svg';

export default function SuperAdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setToken } = useAuth();

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter your password.');
      return;
    }

    try {
      const response = await adminLogin({ email, password });
      if (response.success) {
        const token = response?.data?.token;
        if (token) {
          await setToken(token);
        } else {
          console.warn('Login succeeded but token missing in response');
        }
        router.replace('/home');
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Login error';
      Alert.alert('Error', msg);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password:', email);
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <StatusBar barStyle='dark-content' backgroundColor='#FFFFFF' />

      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName='flex-grow'
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          <View className='flex-1 px-6'>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              className='mt-3 h-11 w-11 items-center justify-center rounded-full bg-[#F4EFF7]'
            >
              <MaterialIcons name='arrow-back' size={24} color='#351467' />
            </TouchableOpacity>

            <View className='mt-8 items-center'>
              <SarasSvg />
            </View>

            <View className='mt-10 items-center'>
              <Text className='mt-5 text-center text-[29px] font-bold text-[#24113D]'>
                Super Admin
              </Text>

              <Text className='mt-2 text-center text-[15px] leading-6 text-[#777180]'>
                Sign in to manage your restaurant
                {'\n'}
                queue system
              </Text>
            </View>

            <View className='mt-9 rounded-3xl border border-[#EAE5F0] bg-white p-5'>
              <Text className='mb-2 text-[14px] font-semibold text-[#352B40]'>
                Email Address
              </Text>

              <View className='h-[48px] flex-row items-center rounded-2xl border border-[#D8D2DF] bg-[#FAF9FC] px-4'>
                <MaterialIcons name='email' size={22} color='#777180' />

                <TextInput
                  className='ml-3 flex-1 text-[16px] text-[#24113D]'
                  placeholder='Enter your email'
                  placeholderTextColor='#A09AA8'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Text className='mb-2 mt-5 text-[14px] font-semibold text-[#352B40]'>
                Password
              </Text>

              <View className='h-[48px] flex-row items-center rounded-2xl border border-[#D8D2DF] bg-[#FAF9FC] px-4'>
                <MaterialIcons name='lock-outline' size={22} color='#777180' />

                <TextInput
                  className='ml-3 flex-1 text-[16px] text-[#24113D]'
                  placeholder='Enter your password'
                  placeholderTextColor='#A09AA8'
                  secureTextEntry={!showPassword}
                  autoCapitalize='none'
                  autoCorrect={false}
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(prev => !prev)}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={22}
                    color='#777180'
                  />
                </TouchableOpacity>
              </View>

              {/* <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleForgotPassword}
                className='mt-4 items-end'
              >
                <Text className='text-[14px] font-semibold text-[#6C2BD9]'>
                  Forgot Password?
                </Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogin}
                className='mt-6 h-[48px] flex-row items-center justify-center rounded-2xl bg-[#6C2BD9]'
              >
                <MaterialIcons name='login' size={22} color='#FFFFFF' />

                <Text className='ml-2 text-[16px] font-bold tracking-wide text-white'>
                  LOGIN AS SUPER ADMIN
                </Text>
              </TouchableOpacity>
            </View>

            <View className='mt-5 flex-row items-center justify-center'>
              <View className='h-8 w-8 items-center justify-center rounded-full bg-[#F1EAFE]'>
                <MaterialIcons name='verified-user' size={18} color='#6C2BD9' />
              </View>

              <Text className='ml-2 text-[13px] text-[#777180]'>
                Secure administrator access
              </Text>
            </View>

            {/* <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.replace('/login')}
              className='mt-5 mb-10 items-center'
            >
              <Text className='text-[14px] text-[#777180]'>
                Are you a waiter?{' '}
                <Text className='font-bold text-[#351467]'>Login here</Text>
              </Text>
            </TouchableOpacity> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
