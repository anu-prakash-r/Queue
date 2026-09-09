import { apiRequest } from '@/services/api';

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

export const createCustomer = async (
  token: string,
  payload: CreateCustomerPayload,
): Promise<CreateCustomerResponse> => {
  return apiRequest<CreateCustomerResponse>('/customers', {
    method: 'POST',
    body: payload,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
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

export const getCustomers = async (
  token: string,
): Promise<CustomerItem[]> => {
  const response = await apiRequest<GetCustomersResponse>('/customers', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return unwrapCustomers(response?.data);
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

export const updateCustomer = async (
  id: string | number,
  token: string,
  payload: UpdateCustomerPayload,
): Promise<UpdateCustomerResponse> => {
  return apiRequest<UpdateCustomerResponse>(`/customers/${id}`, {
    method: 'PUT',
    body: payload,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};