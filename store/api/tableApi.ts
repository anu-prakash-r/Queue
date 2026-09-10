import { baseApi } from './baseApi';

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

export type UpdateTableStatusPayload = {
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
};

export type UpdateTableStatusResponse = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

export type DeleteTableResponse = {
  success?: boolean;
  message?: string;
};

export const tableApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTables: builder.query<TablesResult, void>({
      query: () => '/tables',
      transformResponse: (response: TablesApiResponse): TablesResult => {
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
      },
      providesTags: ['Tables'],
    }),

    updateTable: builder.mutation<
      UpdateTableResponse,
      { id: string; payload: UpdateTablePayload }
    >({
      query: ({ id, payload }) => ({
        url: `/tables/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Tables'],
    }),

    updateTableStatus: builder.mutation<
      UpdateTableStatusResponse,
      { id: string; status: 'available' | 'occupied' | 'reserved' | 'maintenance' }
    >({
      query: ({ id, status }) => ({
        url: `/tables/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Tables'],
    }),

    deleteTable: builder.mutation<DeleteTableResponse, string>({
      query: (id) => ({
        url: `/tables/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tables'],
    }),
  }),
});

export const {
  useGetTablesQuery,
  useUpdateTableMutation,
  useUpdateTableStatusMutation,
  useDeleteTableMutation,
} = tableApi;
