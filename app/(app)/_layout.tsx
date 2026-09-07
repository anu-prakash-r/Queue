import AppDrawerContent from '@/components/Drawer/AppDrawerContent';
import { Drawer } from 'expo-router/drawer';

export default function AppDrawerLayout() {
  return (
    <Drawer
      drawerContent={props => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          width: '78%',
        },
      }}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
