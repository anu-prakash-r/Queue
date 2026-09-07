import { apiRequest } from '@/services/api';

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
  data?: any; // adjust based on backend response structure
};

export async function createOwner(
  payload: CreateOwnerPayload,
  token: string,
): Promise<CreateOwnerResponse> {
  return apiRequest<CreateOwnerResponse>('/admin/owners', {
    method: 'POST',
    body: payload,
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Existing imports and createOwner stay unchanged

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

  // Additional fields for edit view
  restaurant_name?: string;
  city?: string;
  address?: string;
};

export async function getOwners(token: string): Promise<{
  success?: boolean;
  data?: Owner[];
  message?: string;
}> {
  return apiRequest<{
    success?: boolean;
    data?: Owner[];
    message?: string;
  }>('/admin/owners', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}
export async function deleteOwner(
  ownerId: number,
  token: string,
): Promise<{ success?: boolean; message?: string }> {
  return apiRequest<{ success?: boolean; message?: string }>(
    `/admin/owners/${ownerId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

export async function toggleOwnerActive(
  ownerId: number,
  token: string,
): Promise<{ success?: boolean; message?: string }> {
  return apiRequest<{ success?: boolean; message?: string }>(
    `/admin/owners/${ownerId}/toggle-active`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
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

export async function editOwner(
  ownerId: number,
  payload: EditOwnerPayload,
  token: string,
): Promise<{ success?: boolean; message?: string }> {
  return apiRequest<{ success?: boolean; message?: string }>(
    `/admin/owners/${ownerId}`,
    {
      method: 'PUT',
      body: payload,
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}
