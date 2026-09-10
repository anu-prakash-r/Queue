import { QueueItem as QueueApiItem } from '@/store/api/queueApi';

export function formatTime(createdAt?: string): string {
  if (!createdAt) {
    return '--';
  }

  const date = new Date(createdAt);

  if (isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatWaitingTime(item: QueueApiItem): string {
  const value = item.estimated_wait ?? item.waiting_time;

  if (value === undefined || value === null) {
    return '--';
  }

  if (typeof value === 'number') {
    return `${Math.round(value)}m`;
  }

  const parsed = Number(value);

  if (!isNaN(parsed)) {
    return `${Math.round(parsed)}m`;
  }

  return String(value);
}
