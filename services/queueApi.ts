import { apiRequest } from '@/services/api';

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

export const getQueues = async (
  token: string,
  status: string = 'waiting',
): Promise<QueueItem[]> => {
  const response = await apiRequest<GetQueuesResponse>(
    `/queues?status=${encodeURIComponent(status)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return unwrapQueues(response?.data);
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

export const createQueue = async (
  token: string,
  payload: CreateQueuePayload,
): Promise<CreateQueueResponse> => {
  return apiRequest<CreateQueueResponse>('/queues', {
    method: 'POST',
    body: payload,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export type CancelQueueResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

export const cancelQueue = async (
  token: string,
  queueId: string | number,
): Promise<CancelQueueResponse> => {
  return apiRequest<CancelQueueResponse>(`/queues/${queueId}/cancel`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
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

export const updateQueue = async (
  token: string,
  queueId: string | number,
  payload: UpdateQueuePayload,
): Promise<UpdateQueueResponse> => {
  return apiRequest<UpdateQueueResponse>(`/queues/${queueId}`, {
    method: 'PUT',
    body: payload,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export type GetQueueResponse = {
  success?: boolean;
  message?: string;
  data?: QueueItem | { data?: QueueItem };
};

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

export const getQueue = async (
  token: string,
  queueId: string | number,
): Promise<QueueItem | null> => {
  const response = await apiRequest<GetQueueResponse>(`/queues/${queueId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return unwrapQueue(response?.data);
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

export const seatQueue = async (
  token: string,
  queueId: string | number,
  payload: SeatQueuePayload,
): Promise<SeatQueueResponse> => {
  return apiRequest<SeatQueueResponse>(`/queues/${queueId}/seat`, {
    method: 'POST',
    body: payload,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};