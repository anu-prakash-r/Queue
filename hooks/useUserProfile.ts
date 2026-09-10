import { useGetProfileQuery } from '@/store/api/authApi';
import { useAuth } from '@/contexts/AuthContext';

type UserProfile = {
  name: string;
  restaurant: string;
};

export function useUserProfile(): UserProfile {
  const { token } = useAuth();

  const { data: response } = useGetProfileQuery(undefined, { skip: !token });

  const name = response?.data?.user?.name ?? '';
  const restaurant = response?.data?.restaurant?.name ?? '';

  return { name, restaurant };
}