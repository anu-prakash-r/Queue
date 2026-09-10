import { apiRequest } from '@/services/api';

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export type TableItem = {
  id: string;
  seats: number;
  area: string;
  floor: string;
  status: TableStatus;
  table_number: string;
  seating_capacity: number;
  table_name?: string;
  table_type?: string;
  description?: string;
  remarks?: string;
  is_active?: boolean;
};

export type TablesSummary = {
  total_tables: number;
  available: number;
  occupied: number;
  reserved: number;
};

type TablesApiResponse = {
  success: boolean;
  message?: string;

  data?: {
    summary?: {
      available?: number;
      occupied?: number;
      reserved?: number;
      total_tables?: number;
    };

    tables?: TableItem[];
  };
};

export type TablesResult = {
  tables: TableItem[];
  summary: TablesSummary;
};

export const getTables = async (): Promise<TablesResult> => {
  const response = await apiRequest<TablesApiResponse>('/tables', {
    method: 'GET',
  });

  const tables = Array.isArray(response?.data?.tables)
    ? response.data.tables
    : [];

  const summary = response?.data?.summary;

  return {
    tables,
    summary: {
      total_tables: summary?.total_tables ?? tables.length,
      available: summary?.available ?? 0,
      occupied: summary?.occupied ?? 0,
      reserved: summary?.reserved ?? 0,
    },
  };
};

export type UpdateTablePayload = {
  table_number: string;
  table_name: string;
  seating_capacity: number;
  area: string;
  floor: string;
  table_type: string;
  status: string;
  is_active: boolean;
  description?: string;
  remarks?: string;
};

export type UpdateTableResponse = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

export const updateTable = async (
  id: string,
  payload: UpdateTablePayload,
  token: string,
): Promise<UpdateTableResponse> => {
  const response = await apiRequest<UpdateTableResponse>(`/tables/${id}`, {
    method: 'PUT',
    body: payload,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response;
};

export type UpdateTableStatusPayload = {
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
};

export type UpdateTableStatusResponse = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

export const updateTableStatus = async (
  id: string,
  status: 'available' | 'occupied' | 'reserved' | 'maintenance',
  token: string,
): Promise<UpdateTableStatusResponse> => {
  const response = await apiRequest<UpdateTableStatusResponse>(
    `/tables/${id}/status`,
    {
      method: 'PATCH',

      body: {
        status,
      },

      headers: {
        Accept: 'application/json',

        Authorization: `Bearer ${token}`,

        'Content-Type': 'application/json',
      },
    },
  );

  return response;
};

export type DeleteTableResponse = {
  success?: boolean;
  message?: string;
};

export const deleteTable = async (
  id: string,
  token: string,
): Promise<DeleteTableResponse> => {
  return apiRequest<DeleteTableResponse>(`/tables/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};
