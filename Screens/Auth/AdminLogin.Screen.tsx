import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import Toast from 'react-native-toast-message';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminLoginMutation } from '@/store/api/authApi';
import { SarasSvg } from '@/assets/Svg';

export default function SuperAdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { setToken, isSuperAdmin } = useAuth();

  const isSuperAdminRef = useRef(isSuperAdmin);
  isSuperAdminRef.current = isSuperAdmin;

  const [adminLogin, { isLoading: isLoggingIn }] = useAdminLoginMutation();

  const showToast = (
    type: 'success' | 'error' | 'info',
    text1: string,
    text2?: string,
  ) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });
  };

  const navigateToRoleLanding = async () => {
    const deadline = Date.now() + 3000;

    while (Date.now() < deadline) {
      if (isSuperAdminRef.current) {
        router.replace('/owners');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 150));
    }

    router.replace('/home');
  };

  const handleLogin = async () => {
    if (isLoggingIn) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showToast('error', 'Email Required', 'Please enter your email address.');
      return;
    }

    if (!password.trim()) {
      showToast('error', 'Password Required', 'Please enter your password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      showToast(
        'error',
        'Invalid Email',
        'Please enter a valid email address.',
      );
      return;
    }

    try {
      const response = await adminLogin({
        email: trimmedEmail,
        password,
      }).unwrap();

      if (response.success) {
        const token = response?.data?.token;

        if (token) {
          await setToken(token);

          showToast('success', 'Login Successful', 'Welcome, Super Admin!');

          await navigateToRoleLanding();
        } else {
          showToast(
            'error',

            'Login succeeded but authentication token is missing.',
          );
        }
      } else {
        showToast(
          'error',
          'Login Failed',
          response.message || 'Invalid email or password.',
        );
      }
    } catch (error) {
      showToast('error', 'You are not a Super Admin');
    }
  };

  const handleForgotPassword = () => {
    showToast(
      'info',
      'Forgot Password',
      'Password reset functionality will be available soon.',
    );
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
              hitSlop={10}
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
                  editable={!isLoggingIn}
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
                  editable={!isLoggingIn}
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={isLoggingIn}
                  onPress={() => setShowPassword(prev => !prev)}
                  hitSlop={10}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={22}
                    color='#777180'
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                disabled={isLoggingIn}
                onPress={handleForgotPassword}
                className='mt-3 items-end'
                hitSlop={10}
              >
                <Text className='text-[14px] font-semibold text-[#6C2BD9]'>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={isLoggingIn}
                className='mt-6 h-[48px] flex-row items-center justify-center rounded-2xl bg-[#6C2BD9]'
                hitSlop={10}
              >
                {isLoggingIn ? (
                  <>
                    <ActivityIndicator size='small' color='#FFFFFF' />

                    <Text className='ml-2 text-[16px] font-bold tracking-wide text-white'>
                      LOGGING IN...
                    </Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name='login' size={22} color='#FFFFFF' />

                    <Text className='ml-2 text-[16px] font-bold tracking-wide text-white'>
                      LOGIN AS SUPER ADMIN
                    </Text>
                  </>
                )}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
