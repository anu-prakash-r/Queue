import React from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useGetProfileQuery } from '@/store/api/authApi';
import { useAuth } from '@/contexts/AuthContext';

type Profile = {
  name: string;
  email: string;
  mobile: string;
  restaurant: string;
  role: string;
};

export default function ProfileScreen() {
  const { logout, token } = useAuth();

  const { data: response, isLoading: loading } = useGetProfileQuery(undefined, {
    skip: !token,
  });

  const data = response?.data;

  const profile: Profile | null =
    response?.success && data
      ? {
          name: data.user.name,
          email: data.user.email,
          mobile: data.user.mobile_number,
          restaurant: data.restaurant?.name ?? '',
          role: data.user.role,
        }
      : null;

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit Profile clicked');
  };

  const handleCreateOwner = () => {
    router.push('/createowner');
  };

  const handleOwnerList = () => {
    router.push('/ownerlist');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/onboard');
          } catch (error) {
            console.log('LOGOUT ERROR:', error);

            Alert.alert('Error', 'Unable to logout.');
          }
        },
      },
    ]);
  };

  const firstLetter = profile?.name?.charAt(0)?.toUpperCase() ?? '';

  const isSuperAdmin = profile?.role?.toLowerCase() === 'superadmin';

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      className='flex-1 bg-white'
    >
      <ScrollView
        className='flex-1'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <View className='mb-5'>
          <Text className='text-[25px] font-bold text-[#442F52]'>Profile</Text>

          <Text className='mt-1 text-[13px] text-[#777180]'>
            Manage your account and restaurant
          </Text>
        </View>

        {loading ? (
          <View className='items-center justify-center py-20'>
            <ActivityIndicator size='large' color='#442F52' />

            <Text className='mt-3 text-[14px] text-[#777180]'>
              Loading profile...
            </Text>
          </View>
        ) : (
          <>
            <View className='mb-6 rounded-2xl bg-white p-5'>
              <View className='flex-row items-center'>
                <View className='h-[60px] w-[60px] items-center justify-center rounded-full bg-[#F1EAF5]'>
                  <Text className='text-[27px] font-bold text-[#442F52]'>
                    {firstLetter}
                  </Text>
                </View>

                <View className='ml-4 flex-1'>
                  <Text className='text-[19px] font-bold text-[#442F52]'>
                    {profile?.name ?? 'User'}
                  </Text>

                  {profile?.restaurant ? (
                    <Text className='mt-1 text-[12px] text-[#99929D]'>
                      {profile.restaurant}
                    </Text>
                  ) : null}
                </View>

                {isSuperAdmin ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleCreateOwner}
                    className='h-10 w-10 items-center justify-center rounded-xl bg-[#F1EAF5]'
                  >
                    <MaterialIcons name='add' size={20} color='#442F52' />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleEditProfile}
                    className='h-10 w-10 items-center justify-center rounded-xl bg-[#F1EAF5]'
                  >
                    <MaterialIcons name='edit' size={20} color='#442F52' />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text className='mb-3 ml-1 text-[12px] font-bold uppercase tracking-wide text-[#8D8791]'>
              Account Information
            </Text>

            <View className='mb-6 rounded-2xl bg-white'>
              <View className='flex-row items-center px-4 py-4'>
                <View className='h-11 w-11 items-center justify-center rounded-xl bg-[#F1EAF5]'>
                  <MaterialIcons name='email' size={21} color='#442F52' />
                </View>

                <View className='ml-4 flex-1'>
                  <Text className='text-[12px] text-[#99929D]'>
                    Email Address
                  </Text>

                  <Text className='mt-1 text-[14px] font-semibold text-[#442F52]'>
                    {profile?.email || 'Not available'}
                  </Text>
                </View>
              </View>

              <View className='ml-[72px] h-[1px] bg-[#F0EDF2]' />

              {profile?.mobile ? (
                <>
                  <View className='flex-row items-center px-4 py-4'>
                    <View className='h-11 w-11 items-center justify-center rounded-xl bg-[#F1EAF5]'>
                      <MaterialIcons name='phone' size={21} color='#442F52' />
                    </View>

                    <View className='ml-4 flex-1'>
                      <Text className='text-[12px] text-[#99929D]'>
                        Mobile Number
                      </Text>

                      <Text className='mt-1 text-[15px] font-semibold text-[#442F52]'>
                        {profile.mobile}
                      </Text>
                    </View>
                  </View>

                  <View className='ml-[72px] h-[1px] bg-[#F0EDF2]' />
                </>
              ) : null}

              {profile?.restaurant ? (
                <>
                  <View className='flex-row items-center px-4 py-4'>
                    <View className='h-11 w-11 items-center justify-center rounded-xl bg-[#F1EAF5]'>
                      <MaterialIcons
                        name='restaurant'
                        size={21}
                        color='#442F52'
                      />
                    </View>

                    <View className='ml-4 flex-1'>
                      <Text className='text-[12px] text-[#99929D]'>
                        Restaurant
                      </Text>

                      <Text className='mt-1 text-[15px] font-semibold text-[#442F52]'>
                        {profile.restaurant}
                      </Text>
                    </View>
                  </View>

                  <View className='ml-[72px] h-[1px] bg-[#F0EDF2]' />
                </>
              ) : null}

              <View className='flex-row items-center px-4 py-4'>
                <View className='h-11 w-11 items-center justify-center rounded-xl bg-[#F1EAF5]'>
                  <MaterialIcons
                    name='admin-panel-settings'
                    size={21}
                    color='#442F52'
                  />
                </View>

                <View className='ml-4 flex-1'>
                  <Text className='text-[12px] text-[#99929D]'>Role</Text>

                  <Text className='mt-1 text-[15px] font-semibold capitalize text-[#442F52]'>
                    {profile?.role || 'Not available'}
                  </Text>
                </View>
              </View>

              <View className='ml-[72px] h-[1px] bg-[#F0EDF2]' />

              {isSuperAdmin ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleOwnerList}
                  className='flex-row items-center px-4 py-4'
                >
                  <View className='h-11 w-11 items-center justify-center rounded-xl bg-[#F1EAF5]'>
                    <MaterialIcons
                      name='people-outline'
                      size={21}
                      color='#442F52'
                    />
                  </View>

                  <View className='ml-4 flex-1'>
                    <Text className='text-[12px] text-[#99929D]'>
                      Owner List
                    </Text>

                    <Text className='mt-1 text-[14px] font-semibold text-[#442F52]'>
                      Manage Owners
                    </Text>
                  </View>

                  <MaterialIcons
                    name='chevron-right'
                    size={22}
                    color='#99929D'
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>

      <View className='border-t border-[#F0EDF2] bg-white px-5 pb-3 pt-3'>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          className='flex-row items-center justify-center rounded-2xl bg-[#FFF3F2] py-4'
        >
          <MaterialIcons name='logout' size={21} color='#C0392B' />

          <Text className='ml-2 text-[15px] font-bold text-[#C0392B]'>
            Logout
          </Text>
        </TouchableOpacity>

        <Text className='mt-2 text-center text-[11px] text-[#AAA4AE]'>
          Queue App • Version 1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}
