import { baseApi } from './baseApi';

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

export type DeleteRestaurantResponse = {
  success?: boolean;
  message?: string;
};

export type SwitchRestaurantStatusResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
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

export const restaurantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRestaurants: builder.query<RestaurantItem[], void>({
      query: () => '/restaurants',
      transformResponse: (response: GetRestaurantsResponse) =>
        unwrapRestaurants(response?.data),
      providesTags: ['Restaurants'],
    }),

    getRestaurantDetails: builder.query<RestaurantDetails | null, string | number>({
      query: (id) => `/restaurants/${id}`,
      transformResponse: (
        response: GetRestaurantDetailsResponse,
      ): RestaurantDetails | null => {
        const data = response?.data;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if ('restaurant' in data && data.restaurant) {
            return data.restaurant as RestaurantDetails;
          }

          return data as RestaurantDetails;
        }

        return null;
      },
      providesTags: (_result, _error, id) => [{ type: 'RestaurantDetails', id }],
    }),

    createRestaurant: builder.mutation<
      CreateRestaurantResponse,
      CreateRestaurantPayload
    >({
      query: (body) => ({
        url: '/restaurants',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Restaurants'],
    }),

    updateRestaurant: builder.mutation<
      UpdateRestaurantResponse,
      { id: string | number; payload: UpdateRestaurantPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/restaurants/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Restaurants',
        { type: 'RestaurantDetails', id },
      ],
    }),

    deleteRestaurant: builder.mutation<DeleteRestaurantResponse, string | number>({
      query: (id) => ({
        url: `/restaurants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Restaurants'],
    }),

    switchRestaurantStatus: builder.mutation<
      SwitchRestaurantStatusResponse,
      string | number
    >({
      query: (id) => ({
        url: `/restaurants/${id}/switch`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Restaurants'],
    }),
  }),
});

export const {
  useGetRestaurantsQuery,
  useLazyGetRestaurantsQuery,
  useGetRestaurantDetailsQuery,
  useLazyGetRestaurantDetailsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useSwitchRestaurantStatusMutation,
} = restaurantApi;
