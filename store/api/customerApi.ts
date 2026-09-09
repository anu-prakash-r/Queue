import { baseApi } from './baseApi';

export type CreateCustomerPayload = {
  name: string;
  mobile_number: string;
  email?: string;
  notes?: string;
};

export type CreateCustomerResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

export type CustomerItem = {
  id?: string | number;
  name?: string;
  mobile_number?: string;
  email?: string;
  notes?: string;
  is_active?: boolean;
  visit_count?: number;
  last_visit_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type GetCustomersResponse = {
  success?: boolean;
  message?: string;
  data?: CustomerItem[] | { customers?: CustomerItem[]; data?: CustomerItem[] };
};

export type UpdateCustomerPayload = {
  name?: string;
  mobile_number?: string;
  email?: string;
  notes?: string;
};

export type UpdateCustomerResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

function unwrapCustomers(data: GetCustomersResponse['data']): CustomerItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) {
      return data.data;
    }

    if (Array.isArray(data.customers)) {
      return data.customers;
    }
  }

  return [];
}

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<CustomerItem[], void>({
      query: () => '/customers',
      transformResponse: (response: GetCustomersResponse) =>
        unwrapCustomers(response?.data),
      providesTags: ['Customers'],
    }),

    createCustomer: builder.mutation<CreateCustomerResponse, CreateCustomerPayload>({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Customers'],
    }),

    updateCustomer: builder.mutation<
      UpdateCustomerResponse,
      { id: string | number; payload: UpdateCustomerPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Customers'],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} = customerApi;
