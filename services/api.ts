import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://restaurantqueue.sarasbillingpro.com/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
};

/**
 * Gets the most specific error message from the API.
 *
 * Example API response:
 *
 * {
 *   "success": false,
 *   "message": "Validation error",
 *   "errors": {
 *     "mobile_number": [
 *       "The mobile number has already been taken."
 *     ]
 *   }
 * }
 *
 * This function will return:
 *
 * "The mobile number has already been taken."
 */
function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;

    if (record.errors && typeof record.errors === 'object') {
      const errors = record.errors as Record<string, unknown>;

      const messages: string[] = [];

      Object.entries(errors).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'string' && item.trim()) {
              messages.push(item.trim());
            } else if (item && typeof item === 'object') {
              const errorObject = item as Record<string, unknown>;

              if (
                typeof errorObject.message === 'string' &&
                errorObject.message.trim()
              ) {
                messages.push(errorObject.message.trim());
              } else if (
                typeof errorObject.error === 'string' &&
                errorObject.error.trim()
              ) {
                messages.push(errorObject.error.trim());
              }
            }
          });
        } else if (typeof value === 'string' && value.trim()) {
          messages.push(value.trim());
        } else if (value && typeof value === 'object') {
          const errorObject = value as Record<string, unknown>;

          if (
            typeof errorObject.message === 'string' &&
            errorObject.message.trim()
          ) {
            messages.push(errorObject.message.trim());
          } else if (
            typeof errorObject.error === 'string' &&
            errorObject.error.trim()
          ) {
            messages.push(errorObject.error.trim());
          }
        }
      });

      if (messages.length > 0) {
        return messages.join('\n');
      }
    }

    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message.trim();
    }

    if (typeof record.error === 'string' && record.error.trim()) {
      return record.error.trim();
    }

    if (typeof record.detail === 'string' && record.detail.trim()) {
      return record.detail.trim();
    }
  }

  return fallback;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const token = await SecureStore.getItemAsync('accessToken');

  const authHeaders: Record<string, string> = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const combinedHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...authHeaders,
    ...headers,
  };

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: combinedHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed',
      0,
    );
  }

  const text = await response.text();

  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new ApiError(
          getErrorMessage(text, `Request failed (${response.status})`),
          response.status,
          text,
        );
      }

      throw new ApiError('Invalid JSON response', response.status, text);
    }
  }

  if (!response.ok) {
    const message = getErrorMessage(
      data,
      `Request failed (${response.status})`,
    );

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
