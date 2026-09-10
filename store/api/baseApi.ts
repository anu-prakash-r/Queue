import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/services/api';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Profile',
    'Queues',
    'Queue',
    'Tables',
    'Owners',
    'Staff',
    'StaffDetails',
    'Restaurants',
    'RestaurantDetails',
    'Customers',
  ],
  endpoints: () => ({}),
});
