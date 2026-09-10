import { apiRequest } from '@/services/api';

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

export const createStaff = async (
  token: string,
  payload: CreateStaffPayload,
): Promise<CreateStaffResponse> => {
  return apiRequest<CreateStaffResponse>('/staff', {
    method: 'POST',
    body: payload,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

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
};

export type GetCustomersResponse = {
  success?: boolean;
  message?: string;
  data?: CustomerItem[] | { customers?: CustomerItem[] };
};

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

  const data = response?.data;

  const customers: CustomerItem[] = Array.isArray(data)
    ? data
    : data && Array.isArray(data.customers)
      ? data.customers
      : [];

  return customers;
};

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