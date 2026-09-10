import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getProfile } from '@/services/authApi';
import { useAuth } from '@/contexts/AuthContext';

type UserProfile = {
  name: string;
  restaurant: string;
};

export function useUserProfile(): UserProfile {
  const { token } = useAuth();

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    restaurant: '',
  });

  const loadProfile = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await getProfile(token);

      if (response.success && response.data) {
        setProfile({
          name: response.data.user.name,
          restaurant: response.data.restaurant?.name ?? '',
        });
      }
    } catch {
      // Keep previous/empty profile values on failure
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return profile;
}