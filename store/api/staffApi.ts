import { baseApi } from './baseApi';

export type CreateStaffPayload = {
  name: string;
  mobile_number: string;
  role: string;
};

export type CreateStaffResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

export type StaffItem = {
  id?: string | number;
  name?: string;
  mobile_number?: string;
  role?: string;
  is_active?: boolean;
};

export type GetStaffResponse = {
  success?: boolean;
  message?: string;
  data?: StaffItem[] | { staff?: StaffItem[]; data?: StaffItem[] };
};

export type StaffDetails = StaffItem & {
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type GetStaffDetailsResponse = {
  success?: boolean;
  message?: string;
  data?: StaffDetails | { staff?: StaffDetails };
};

export type UpdateStaffPayload = {
  name?: string;
  mobile_number?: string;
  role?: string;
};

export type UpdateStaffResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

export type ToggleStaffActiveResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

export type DeleteStaffResponse = {
  success?: boolean;
  message?: string;
};

function unwrapStaff(data: GetStaffResponse['data']): StaffItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) {
      return data.data;
    }

    if (Array.isArray(data.staff)) {
      return data.staff;
    }
  }

  return [];
}

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query<StaffItem[], void>({
      query: () => '/staff',
      transformResponse: (response: GetStaffResponse) => unwrapStaff(response?.data),
      providesTags: ['Staff'],
    }),

    getStaffDetails: builder.query<StaffDetails | null, string | number>({
      query: (id) => `/staff/${id}`,
      transformResponse: (response: GetStaffDetailsResponse): StaffDetails | null => {
        const data = response?.data;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if ('staff' in data && data.staff) {
            return data.staff as StaffDetails;
          }

          return data as StaffDetails;
        }

        return null;
      },
      providesTags: (_result, _error, id) => [{ type: 'StaffDetails', id }],
    }),

    createStaff: builder.mutation<CreateStaffResponse, CreateStaffPayload>({
      query: (body) => ({
        url: '/staff',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Staff'],
    }),

    updateStaff: builder.mutation<
      UpdateStaffResponse,
      { id: string | number; payload: UpdateStaffPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/staff/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { id }) => ['Staff', { type: 'StaffDetails', id }],
    }),

    toggleStaffActive: builder.mutation<ToggleStaffActiveResponse, string | number>({
      query: (id) => ({
        url: `/staff/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Staff'],
    }),

    deleteStaff: builder.mutation<DeleteStaffResponse, string | number>({
      query: (id) => ({
        url: `/staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff'],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useLazyGetStaffQuery,
  useGetStaffDetailsQuery,
  useLazyGetStaffDetailsQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useToggleStaffActiveMutation,
  useDeleteStaffMutation,
} = staffApi;
