import { apiRequest } from '@/services/api';

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export type TableItem = {
  id: string;
  seats: number;
  area: string;
  floor: string;
  status: TableStatus;
};

/**
 * Get all tables
 */
export const getTables = async (): Promise<TableItem[]> => {
  return apiRequest<TableItem[]>('/tables', {
    method: 'GET',
  });
};
