import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import 'react-native-reanimated';
import '../global.css';
import Toast from 'react-native-toast-message';

import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name='index' />
          <Stack.Screen name='splash' />
          <Stack.Screen name='login' />
          <Stack.Screen name='(app)' />
          <Stack.Screen name='addTable' />
          <Stack.Screen name='notification' />
          <Stack.Screen name='onboard' />
          <Stack.Screen name='register' />
          <Stack.Screen name='adminlogin' />
          <Stack.Screen name='createowner' />
        </Stack>
      </AuthProvider>

      <StatusBar style='dark' />
      <Toast />
    </GestureHandlerRootView>
  );
}
