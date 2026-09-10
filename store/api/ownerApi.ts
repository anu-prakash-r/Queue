import { baseApi } from './baseApi';

export type Owner = {
  id: number;
  name: string;
  mobile_number: string;
  role: string;
  is_active: boolean;
  created_at: string;
  max_restaurants: number;
  max_staff: number;
  max_tables: number;
  restaurants_used: number;
  staff_used: number;
  tables_used: number;
  restaurant_name?: string;
  city?: string;
  address?: string;
};

export type CreateOwnerPayload = {
  name: string;
  mobile_number: string;
  max_restaurants: number;
  max_staff: number;
  max_tables: number;
  restaurant_name: string;
  city: string;
  address: string;
};

export type CreateOwnerResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

export type GetOwnersResponse = {
  success?: boolean;
  data?: Owner[];
  message?: string;
};

export type EditOwnerPayload = {
  name?: string;
  mobile_number?: string;
  max_restaurants?: number;
  max_staff?: number;
  max_tables?: number;
  restaurant_name?: string;
  city?: string;
  address?: string;
};

export const ownerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOwners: builder.query<Owner[], void>({
      query: () => '/admin/owners',
      transformResponse: (response: GetOwnersResponse) => response?.data ?? [],
      providesTags: ['Owners'],
    }),

    createOwner: builder.mutation<CreateOwnerResponse, CreateOwnerPayload>({
      query: (body) => ({
        url: '/admin/owners',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Owners'],
    }),

    editOwner: builder.mutation<
      { success?: boolean; message?: string },
      { ownerId: number; payload: EditOwnerPayload }
    >({
      query: ({ ownerId, payload }) => ({
        url: `/admin/owners/${ownerId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Owners'],
    }),

    deleteOwner: builder.mutation<
      { success?: boolean; message?: string },
      number
    >({
      query: (ownerId) => ({
        url: `/admin/owners/${ownerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Owners'],
    }),

    toggleOwnerActive: builder.mutation<
      { success?: boolean; message?: string },
      number
    >({
      query: (ownerId) => ({
        url: `/admin/owners/${ownerId}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Owners'],
    }),
  }),
});

export const {
  useGetOwnersQuery,
  useCreateOwnerMutation,
  useEditOwnerMutation,
  useDeleteOwnerMutation,
  useToggleOwnerActiveMutation,
} = ownerApi;
