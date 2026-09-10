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

export type GetOwnerDetailsResponse = {
  success?: boolean;
  data?:
    | Owner
    | { owner?: Owner; data?: Owner; restaurant?: Partial<Owner> };
  message?: string;
};

function unwrapOwnerDetails(data: GetOwnerDetailsResponse['data']): Owner | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const candidate =
    (data as { owner?: Owner }).owner ??
    ((data as { data?: Owner }).data as Owner | null) ??
    ((data as { restaurant?: Partial<Owner> }).restaurant as Owner | null);

  if (candidate && typeof candidate === 'object') {
    return candidate as Owner;
  }

  return data as Owner;
}

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

    getOwnerDetails: builder.query<Owner | null, number>({
      query: (ownerId) => `/admin/owners/${ownerId}`,
      transformResponse: (response: GetOwnerDetailsResponse) =>
        unwrapOwnerDetails(response?.data),
      providesTags: (_result, _error, ownerId) => [
        { type: 'OwnerDetails', id: ownerId },
      ],
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
      invalidatesTags: (_result, _error, { ownerId }) => [
        'Owners',
        { type: 'OwnerDetails', id: ownerId },
      ],
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
  useGetOwnerDetailsQuery,
  useCreateOwnerMutation,
  useEditOwnerMutation,
  useDeleteOwnerMutation,
  useToggleOwnerActiveMutation,
} = ownerApi;
