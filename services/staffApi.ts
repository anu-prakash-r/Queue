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

export const getStaff = async (token: string): Promise<StaffItem[]> => {
  const response = await apiRequest<GetStaffResponse>('/staff', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return unwrapStaff(response?.data);
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

export const getStaffDetails = async (
  id: string | number,
  token: string,
): Promise<StaffDetails | null> => {
  const response = await apiRequest<GetStaffDetailsResponse>(`/staff/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = response?.data;

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if ('staff' in data && data.staff) {
      return data.staff as StaffDetails;
    }

    return data as StaffDetails;
  }

  return null;
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

export const updateStaff = async (
  id: string | number,
  token: string,
  payload: UpdateStaffPayload,
): Promise<UpdateStaffResponse> => {
  return apiRequest<UpdateStaffResponse>(`/staff/${id}`, {
    method: 'PUT',
    body: payload,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export type ToggleStaffActiveResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

export const toggleStaffActive = async (
  id: string | number,
  token: string,
): Promise<ToggleStaffActiveResponse> => {
  return apiRequest<ToggleStaffActiveResponse>(`/staff/${id}/toggle-active`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export type DeleteStaffResponse = {
  success?: boolean;
  message?: string;
};

export const deleteStaff = async (
  id: string | number,
  token: string,
): Promise<DeleteStaffResponse> => {
  return apiRequest<DeleteStaffResponse>(`/staff/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};