import { baseApi } from './baseApi';

export type QueueItem = {
  id?: string | number;
  customer_name?: string;
  name?: string;
  mobile_number?: string;
  people?: number;
  party_size?: number;
  guests?: number;
  status?: string;
  token_number?: string;
  queue_number?: string;
  position?: number;
  created_at?: string;
  waiting_time?: number | string;
  estimated_wait?: number | string;
  customer?: {
    name?: string;
    mobile_number?: string;
  };
};

export type GetQueuesResponse = {
  success?: boolean;
  message?: string;
  data?:
    | QueueItem[]
    | { data?: QueueItem[]; queues?: QueueItem[] }
    | { data?: { data?: QueueItem[]; queues?: QueueItem[] } };
};

export type CreateQueuePayload = {
  customer_name?: string;
  mobile_number?: string;
  party_size?: number;
  notes?: string;
};

export type CreateQueueResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

export type UpdateQueuePayload = {
  customer_name?: string;
  mobile_number?: string;
  party_size?: number;
  notes?: string;
};

export type UpdateQueueResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

export type GetQueueResponse = {
  success?: boolean;
  message?: string;
  data?: QueueItem | { data?: QueueItem };
};

export type CancelQueueResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

export type SeatQueuePayload = {
  table_id: string | number;
};

export type SeatQueueResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};

function unwrapQueues(data: GetQueuesResponse['data']): QueueItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    if (Array.isArray((data as { data?: unknown }).data)) {
      return (data as { data: QueueItem[] }).data;
    }

    if (Array.isArray((data as { queues?: unknown }).queues)) {
      return (data as { queues: QueueItem[] }).queues;
    }

    const nestedData = data as { data?: { data?: unknown; queues?: unknown } };

    if (nestedData.data && typeof nestedData.data === 'object') {
      if (Array.isArray(nestedData.data.data)) {
        return nestedData.data.data;
      }

      if (Array.isArray(nestedData.data.queues)) {
        return nestedData.data.queues;
      }
    }
  }

  return [];
}

function unwrapQueue(data: GetQueueResponse['data']): QueueItem | null {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const nested = data as { data?: QueueItem };

    if (nested.data && typeof nested.data === 'object') {
      return nested.data;
    }

    return data as QueueItem;
  }

  return null;
}

export const queueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQueues: builder.query<QueueItem[], string>({
      query: (status = 'waiting') => `/queues?status=${encodeURIComponent(status)}`,
      transformResponse: (response: GetQueuesResponse) => unwrapQueues(response?.data),
      providesTags: ['Queues'],
    }),

    getQueue: builder.query<QueueItem | null, string | number>({
      query: (queueId) => `/queues/${queueId}`,
      transformResponse: (response: GetQueueResponse) => unwrapQueue(response?.data),
      providesTags: (_result, _error, queueId) => [{ type: 'Queue', id: queueId }],
    }),

    createQueue: builder.mutation<CreateQueueResponse, CreateQueuePayload>({
      query: (body) => ({
        url: '/queues',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Queues'],
    }),

    updateQueue: builder.mutation<
      UpdateQueueResponse,
      { queueId: string | number; payload: UpdateQueuePayload }
    >({
      query: ({ queueId, payload }) => ({
        url: `/queues/${queueId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { queueId }) => [
        'Queues',
        { type: 'Queue', id: queueId },
      ],
    }),

    cancelQueue: builder.mutation<CancelQueueResponse, string | number>({
      query: (queueId) => ({
        url: `/queues/${queueId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Queues'],
    }),

    seatQueue: builder.mutation<
      SeatQueueResponse,
      { queueId: string | number; payload: SeatQueuePayload }
    >({
      query: ({ queueId, payload }) => ({
        url: `/queues/${queueId}/seat`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Queues'],
    }),
  }),
});

export const {
  useGetQueuesQuery,
  useLazyGetQueuesQuery,
  useGetQueueQuery,
  useLazyGetQueueQuery,
  useCreateQueueMutation,
  useUpdateQueueMutation,
  useCancelQueueMutation,
  useSeatQueueMutation,
} = queueApi;
