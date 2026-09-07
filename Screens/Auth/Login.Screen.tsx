import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import CountryPicker, {
  Country,
  CountryCode,
} from 'react-native-country-picker-modal';

import { OnboardSvg, SarasSvg } from '@/assets/Svg';
import { sendOtp } from '@/services/authApi';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { verifyOtp } from '@/services/authApi';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const params = useLocalSearchParams<{
    step?: string;
    mobile?: string;
    from?: string;
  }>();

  const cameFromRegister = params.from === 'register';
  const { token, setToken, isSuperAdmin } = useAuth();

  const [step, setStep] = useState<1 | 2>(params.step === '2' ? 2 : 1);

  const [mobile, setMobile] = useState(
    String(params.mobile ?? '')
      .replace(/\D/g, '')
      .slice(0, 10),
  );

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);

  const [countryCode, setCountryCode] = useState<CountryCode>('IN');

  const [callingCode, setCallingCode] = useState('91');

  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const otpInputs = useRef<TextInput[]>([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (token) {
      // User already has a token; go to home screen directly
      router.replace('/home');
    }
  }, [token]);

  useEffect(() => {
    if (params.mobile) {
      setMobile(String(params.mobile).replace(/\D/g, '').slice(0, 10));
    }

    if (params.step === '2') {
      setOtp('');
      setTimer(60);
      setStep(2);
    }
  }, [params.mobile, params.step]);

  useEffect(() => {
    if (step !== 2 || timer === 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timer]);

  const handleGetOTP = async () => {
    if (isSendingOtp) {
      return;
    }

    if (mobile.length !== 10) {
      Alert.alert('Invalid number', 'Enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsSendingOtp(true);

      await sendOtp({
        mobile_number: mobile,
      });

      setOtp('');
      setTimer(60);
      setStep(2);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send OTP. Please try again.';

      Alert.alert('Unable to send OTP', message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    setTimer(60);

    setTimeout(() => {
      otpInputs.current[0]?.focus();
    }, 100);
  };

  const handleOtpChange = (text: string, index: number) => {
    const numbersOnly = text.replace(/\D/g, '');

    if (numbersOnly.length > 1) {
      const otpArray = numbersOnly.slice(0, 6).split('');

      setOtp(otpArray.join(''));

      const nextIndex = Math.min(otpArray.length, 5);

      setTimeout(() => {
        otpInputs.current[nextIndex]?.focus();
      }, 50);

      return;
    }

    const otpArray = otp.padEnd(6, ' ').split('');

    otpArray[index] = numbersOnly;

    const newOtp = otpArray.join('').replace(/\s/g, '');

    setOtp(newOtp);

    if (numbersOnly && index < 5) {
      setTimeout(() => {
        otpInputs.current[index + 1]?.focus();
      }, 50);
    }
  };

  const handleOtpKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const otpArray = otp.split('');

      otpArray[index - 1] = '';

      setOtp(otpArray.join('').replace(/\s/g, ''));

      setTimeout(() => {
        otpInputs.current[index - 1]?.focus();
      }, 50);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      return;
    }

    try {
      const response = await verifyOtp({ mobile_number: mobile, otp });
      if (response.success && response.token) {
        setToken(response.token);
        router.replace('/home');
      } else {
        Alert.alert('Verification Failed', response.message || 'Invalid OTP');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Verification error';
      Alert.alert('Error', msg);
    }
  };

  const handleChangeMobile = () => {
    if (cameFromRegister) {
      router.back();
      return;
    }

    setOtp('');
    setTimer(60);
    setStep(1);
  };

  const handleOtpBack = () => {
    if (cameFromRegister) {
      router.back();
      return;
    }

    handleChangeMobile();
  };

  useFocusEffect(
    useCallback(() => {
      const onHardwareBack = () => {
        if (step === 2) {
          handleOtpBack();
          return true;
        }

        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onHardwareBack,
      );

      return () => subscription.remove();
    }, [cameFromRegister, step]),
  );

  const formattedTimer = `00:${timer.toString().padStart(2, '0')}`;

  return (
    <View className='flex-1 bg-white'>
      <StatusBar barStyle='dark-content' backgroundColor='#F7F6FC' />

      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName='flex-grow'
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          <View className='relative mx-4 my-5 min-h-[750px] rounded-2xl px-7 py-9'>
            {step === 2 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleOtpBack}
                className='absolute left-0 top-0 z-10 h-11 w-11 items-center justify-center rounded-full bg-[#F4EFF7]'
              >
                <MaterialIcons name='arrow-back' size={24} color='#351467' />
              </TouchableOpacity>
            )}

            <View className='items-center'>
              <SarasSvg />
            </View>

            {step === 1 && (
              <>
                <View className='mt-8 items-center'>
                  <Text className='text-center text-[30px] font-bold text-[#24113D]'>
                    Restaurant Queue
                  </Text>

                  <View className='mt-2 flex-row items-center'>
                    <View className='h-[1px] w-10 bg-[#B9B2C4]' />

                    <Text className='mx-3 text-[17px] font-medium text-[#6D6575]'>
                      Waiter App
                    </Text>

                    <View className='h-[1px] w-10 bg-[#B9B2C4]' />
                  </View>
                </View>

                <Text className='mt-2 text-center text-[14px] leading-6 text-[#777180]'>
                  Login using WhatsApp OTP{'\n'}
                  sent to your mobile number
                </Text>

                <Text className='mb-2 mt-4 text-[15px] font-semibold text-[#352B40]'>
                  Mobile Number
                </Text>

                <View className='h-[58px] flex-row items-center rounded-2xl border border-zinc-300'>
                  <TouchableOpacity
                    className='h-full flex-row items-center px-4'
                    onPress={() => setCountryPickerVisible(true)}
                  >
                    <CountryPicker
                      countryCode={countryCode}
                      withFilter
                      withFlag
                      withCallingCode
                      withEmoji
                      visible={countryPickerVisible}
                      onClose={() => setCountryPickerVisible(false)}
                      onSelect={(country: Country) => {
                        setCountryCode(country.cca2);
                        setCallingCode(country.callingCode[0]);
                        setCountryPickerVisible(false);
                        setMobile('');
                      }}
                    />

                    <Text className='ml-1 text-[16px] font-medium text-[#342A3D]'>
                      +{callingCode}
                    </Text>

                    <View className='ml-2'>
                      <AntDesign name='down' size={12} color='#342A3D' />
                    </View>
                  </TouchableOpacity>

                  <View className='h-[58px] w-[1px] bg-zinc-300' />

                  <TextInput
                    className='flex-1 px-3 text-[17px] text-[#29212F]'
                    placeholder='98765 43210'
                    placeholderTextColor='#9294A5'
                    keyboardType='phone-pad'
                    maxLength={10}
                    value={mobile}
                    onChangeText={text => {
                      const numbersOnly = text.replace(/\D/g, '');

                      setMobile(numbersOnly);
                    }}
                  />
                </View>

                <TouchableOpacity
                  className='mt-6 h-[58px] flex-row items-center justify-center rounded-2xl bg-[#6C2BD9]'
                  onPress={handleGetOTP}
                  activeOpacity={0.8}
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? (
                    <ActivityIndicator color='white' />
                  ) : (
                    <>
                      <FontAwesome5 name='whatsapp' size={24} color='white' />

                      <Text className='ml-3 text-[16px] font-bold tracking-wide text-white'>
                        GET WHATSAPP OTP
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <View className='mt-4 flex-row items-center justify-center'>
                  <Ionicons name='shield-checkmark' size={21} color='blue' />

                  <Text className='ml-2 text-[15px] font-medium text-[#777180]'>
                    Secure Login
                  </Text>
                </View>

                <View className='mt-2 flex-row items-center justify-center'>
                  <Text className='text-[14px] text-[#777180]'>
                    Don't have an account?
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      if (cameFromRegister) {
                        router.back();
                        return;
                      }

                      router.push('/register');
                    }}
                  >
                    <Text className='ml-1 text-[14px] font-bold text-[#351467]'>
                      Register
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className='relative mt-2 h-[260px] w-full items-center justify-center'>
                  <OnboardSvg />
                </View>
              </>
            )}

            {step === 2 && (
              <>
                {/* OTP Header */}
                <View className='mt-12 items-center'>
                  <Text className='text-[30px] font-bold text-[#24113D]'>
                    Verify Otp
                  </Text>

                  <Text className='mt-4 text-[16px] text-[#24113D]'>
                    OTP sent to your Whatsapp
                  </Text>

                  <View className='mt-3 flex-row items-center gap-3'>
                    <Text className='text-[18px] font-bold text-[#24113D]'>
                      +{callingCode} {mobile}
                    </Text>

                    <FontAwesome5 name='whatsapp' size={24} color='#25D366' />
                  </View>
                </View>

                <Text className='mt-12 text-center text-[16px] text-[#24113D]'>
                  Enter 6-digit OTP
                </Text>

                <View className='mt-4 flex-row justify-between'>
                  {Array.from({
                    length: 6,
                  }).map((_, index) => (
                    <TextInput
                      key={index}
                      ref={ref => {
                        if (ref) {
                          otpInputs.current[index] = ref;
                        }
                      }}
                      className='h-[52px] w-[45px] rounded-xl border border-zinc-300 text-center text-[20px] font-bold text-[#24113D]'
                      value={otp[index] || ''}
                      keyboardType='number-pad'
                      maxLength={1}
                      selectTextOnFocus
                      onChangeText={text => handleOtpChange(text, index)}
                      onKeyPress={event => handleOtpKeyPress(event, index)}
                      textContentType={index === 0 ? 'oneTimeCode' : 'none'}
                      autoComplete={index === 0 ? 'sms-otp' : 'off'}
                    />
                  ))}
                </View>

                {timer > 0 ? (
                  <Text className='mt-5 text-center text-[16px] text-[#24113D]'>
                    Resend OTP in {formattedTimer}
                  </Text>
                ) : (
                  <TouchableOpacity
                    className='mt-5 items-center'
                    onPress={handleResendOTP}
                    activeOpacity={0.7}
                  >
                    <Text className='text-[15px] font-bold text-[#6C2BD9]'>
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                )}

                <View className='mt-6 flex-row items-center rounded-2xl bg-zinc-100 px-4 py-4'>
                  <View className='mr-3 h-10 w-10 items-center justify-center rounded-full'>
                    <FontAwesome5 name='whatsapp' size={36} color='#25D366' />
                  </View>

                  <View className='flex-1'>
                    <Text className='text-[15px] leading-6 text-[#24113D]'>
                      We have sent the OTP to your WhatsApp number via{' '}
                      <Text className='text-[16px] font-bold'>
                        Saras Restaurant Queue
                      </Text>
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  className='mt-6 h-[58px] flex-row items-center justify-center rounded-2xl bg-[#6C2BD9]'
                  onPress={handleVerifyOTP}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name='lock-outline' size={24} color='white' />

                  <Text className='ml-2 text-[16px] font-bold tracking-wide text-white'>
                    VERIFY & LOGIN
                  </Text>
                </TouchableOpacity>

                <View className='mt-12 flex-row items-center'>
                  <View className='h-[2px] flex-1 bg-[#D8C6E5]' />

                  <View className='px-4'>
                    <Text className='text-[16px] font-medium text-[#777180]'>
                      OR
                    </Text>
                  </View>

                  <View className='h-[2px] flex-1 bg-[#D8C6E5]' />
                </View>

                <TouchableOpacity
                  className='mt-5 items-center'
                  onPress={handleChangeMobile}
                  activeOpacity={0.7}
                >
                  <Text className='text-[15px] font-semibold text-[#6C2BD9]'>
                    Change Mobile Number
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
