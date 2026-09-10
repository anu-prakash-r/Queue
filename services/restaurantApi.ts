import { apiRequest } from '@/services/api';

export type CreateRestaurantPayload = {
  name: string;
  city: string;
  address: string;
  opening_time: string;
  closing_time: string;
};

export type CreateRestaurantResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

export type UpdateRestaurantPayload = CreateRestaurantPayload;

export type UpdateRestaurantResponse = CreateRestaurantResponse;

export const updateRestaurant = async (
  id: string | number,
  token: string,
  payload: UpdateRestaurantPayload,
): Promise<UpdateRestaurantResponse> => {
  return apiRequest<UpdateRestaurantResponse>(`/restaurants/${id}`, {
    method: 'PUT',
    body: payload,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export type RestaurantItem = {
  id?: string | number;
  name?: string;
  city?: string;
  address?: string;
  opening_time?: string;
  closing_time?: string;
  is_active?: boolean;
};

export type RestaurantDetails = RestaurantItem & {
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type GetRestaurantDetailsResponse = {
  success?: boolean;
  message?: string;
  data?: RestaurantDetails | { restaurant?: RestaurantDetails };
};

export const getRestaurantDetails = async (
  id: string | number,
  token: string,
): Promise<RestaurantDetails | null> => {
  const response = await apiRequest<GetRestaurantDetailsResponse>(
    `/restaurants/${id}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = response?.data;

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if ('restaurant' in data && data.restaurant) {
      return data.restaurant as RestaurantDetails;
    }

    return data as RestaurantDetails;
  }

  return null;
};

export type GetRestaurantsResponse = {
  success?: boolean;
  message?: string;
  data?:
    | RestaurantItem[]
    | {
        restaurants?: RestaurantItem[];
        data?: RestaurantItem[];
      };
};

function unwrapRestaurants(
  data: GetRestaurantsResponse['data'],
): RestaurantItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) {
      return data.data;
    }

    if (Array.isArray(data.restaurants)) {
      return data.restaurants;
    }
  }

  return [];
}

export const getRestaurants = async (
  token: string,
): Promise<RestaurantItem[]> => {
  const response = await apiRequest<GetRestaurantsResponse>('/restaurants', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = response?.data;

  return unwrapRestaurants(data);
};

export type DeleteRestaurantResponse = {
  success?: boolean;
  message?: string;
};

export const deleteRestaurant = async (
  id: string | number,
  token: string,
): Promise<DeleteRestaurantResponse> => {
  return apiRequest<DeleteRestaurantResponse>(`/restaurants/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};

export type SwitchRestaurantStatusResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

export const switchRestaurantStatus = async (
  id: string | number,
  token: string,
): Promise<SwitchRestaurantStatusResponse> => {
  return apiRequest<SwitchRestaurantStatusResponse>(`/restaurants/${id}/switch`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const createRestaurant = async (
  token: string,
  payload: CreateRestaurantPayload,
): Promise<CreateRestaurantResponse> => {
  return apiRequest<CreateRestaurantResponse>('/restaurants', {
    method: 'POST',
    body: payload,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};